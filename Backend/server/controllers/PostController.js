import { Post, Media, User, Like, SavedPosts, Notificacion } from '../models/models.js';
import { getRecommendedPosts, getComments, createComment, getPostSaved, savePost } from '../models/PostQueries.js';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import streamifier from 'streamifier';
import dontenv from 'dotenv';
import crypto from 'crypto';
import { io } from '../server.js'
import { type } from 'os';

dontenv.config();

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_API_SECRET 
});



export class PostController {
    static async createPost(req, res) {
        try {
        const { id: user_id } = req.user;    
        const { description = '', likes_count = 0, comments_count = 0, allow_comments = true, allow_likes = true, allow_save = true, created_at = new Date() } = req.body || {};
        const videoFile = req.files?.video?.[0];
        const imageFile = req.files?.image?.[0];

        if (!videoFile && !imageFile) {
          return res.status(400).json({ error: 'No se ha enviado ningún archivo.' });
        }

        const fileBuffer = videoFile ? videoFile.buffer : imageFile.buffer;
        const fileType = videoFile ? videoFile.mimetype : imageFile.mimetype;

        let mediaId = null;

        if (fileBuffer && fileType) {
            if (fileType.startsWith('image/')) {
              mediaId = await PostController.uploadImage(fileBuffer);
            } else if (fileType.startsWith('video/')) {
              mediaId = await PostController.uploadVideo(fileBuffer);
            } else {
                return res.status(400).json({ error: 'El archivo debe ser una imagen o un video.' });
            }
        }
        
        const newPost = await Post.create({ user_id, description, mediaId, likes_count, comments_count, allow_comments, allow_likes, allow_save, created_at });
        
        res.json({ msg: "Post creado", post: newPost });
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    }
    
    static async getPosts(req, res) {
        try {
          const { id } = req.user;
          const { type } = req.params;
          const limit = parseInt(req.query.limit) || 20;
          const offset = parseInt(req.query.offset) || 0;
          const posts = await getRecommendedPosts(type, id, limit, offset);
      
          res.json({ posts });
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    }
    
    static async getPost(req, res) {
        try {
        const { id } = req.params;
        const post = await Post.findByPk(id);
    
        if (!post) return res.status(404).json({ msg: "Post no encontrado" });
    
        res.json({ post });
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    }

    static async getComments(req, res) {
      try {
        const { post_id } = req.params;
        const Post = await getComments(post_id);
        if (!Post) return res.status(404).json({ msg: "Post no encontrado" });
        res.json({ Post });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    }
    
    static async updatePost(req, res) {
        try {
        const { id } = req.params;
        const { title, content, image } = req.body;
        const post = await Post.findByPk(id);
    
        if (!post) return res.status(404).json({ msg: "Post no encontrado" });
    
        post.title = title;
        post.content = content;
        post.image = image;
        await post.save();
    
        res.json({ msg: "Post actualizado", post });
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    }
    
    static async deletePost(req, res) {
        try {
        const { id } = req.params;
        const post = await Post.findByPk(id);
    
        if (!post) return res.status(404).json({ msg: "Post no encontrado" });
    
        await post.destroy();
    
        res.json({ msg: "Post eliminado" });
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    }

    static async uploadImage(imageBuffer, folder = 'posts') {
        try {
            // 1️⃣ Generar hash de la imagen
            const imageHash = await getImageHash(imageBuffer);
        
            // 2️⃣ Buscar si ya existe en la base de datos
            const existingImage = await Media.findOne({ where: { hash: imageHash } });
        
            if (existingImage) {
              console.log("📌 Imagen ya existente, usando cache.");
              return existingImage.id; // 🔁 Retorna el ID de la imagen ya guardada
            }
        
            // 3️⃣ Optimizar imagen con Sharp
            const optimizedImage = await sharp(imageBuffer)
              .resize({ width: 600 })
              .webp({ quality: 70 })
              .toBuffer();
        
            // 4️⃣ Subir imagen a Cloudinary
            return new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { folder: `uploads/${folder}`, format: 'webp' },
                async (error, result) => {
                  if (error) {
                    console.error("❌ Error al subir a Cloudinary:", error);
                    return reject(error);
                  }
                  try {
                    const image = await Media.create({ hash: imageHash, url: result.secure_url, type: 'image' });
                            
                    resolve(image.id);
                  } catch (error) {
                    console.error("❌ Error al guardar en la base de datos:", error);
                    reject(error);
                  }
                  
                }
              );
        
              streamifier.createReadStream(optimizedImage).pipe(uploadStream);
            }); 

        } catch (err) {
            console.error("❌ Error en `uploadImageAndGetId`:", err);
           
        }
    }

    static async uploadVideo(videoBuffer, folder = 'posts') {
      try {
          const videoHash = await getVideoHash(videoBuffer);
  
          // 2️⃣ Buscar si ya existe en la base de datos
          const existingVideo = await Media.findOne({ attributes: ['id', 'hash', 'url'], where: { hash: videoHash } });
  
          if (existingVideo) {
              console.log("📌 Video ya existente, usando cache.");
              return existingVideo.id; // 🔁 Retorna el ID del video ya guardado
          }
  
          // 3️⃣ Subir video a Cloudinary
          return new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                  { folder: `uploads/${folder}`, resource_type: 'video' }, // Especifica que es un video
                  async (error, result) => {
                      if (error) {
                          console.error("❌ Error al subir a Cloudinary:", error);
                          return reject(error);
                      }
                      try {
                          // 4️⃣ Guardar el video en la base de datos
                          const video = await Media.create({ hash: videoHash, url: result.secure_url, type: 'video' });
                          resolve(video.id);
                      } catch (error) {
                          console.error("❌ Error al guardar en la base de datos:", error);
                          reject(error);
                      }
                  }
              );
  
              streamifier.createReadStream(videoBuffer).pipe(uploadStream);
          });
      } catch (err) {
          console.error("❌ Error en `uploadVideo`:", err);
          throw err;
      }
  }

    static async likePost(req, res) {
      try {
        const { id } = req.user;
        const { post_id } = req.params;
    
        // Verificar si el usuario ya dio like al post
        const existingLike = await Like.findOne({ where: { user_id: id, post_id } });
    
        if (existingLike) {
          await existingLike.destroy();
          await Post.decrement('likes_count', { where: { id: post_id } });
        } else {
          await Like.create({ user_id: id, post_id });
          await Post.increment('likes_count', { where: { id: post_id } });

          const post = await Post.findByPk(post_id, { include: [{ model: User, as: 'user' }] });
          const userId = post.user_id;
          const existingNotification = await Notificacion.findOne({
            where: {
              type: 'like',
              user_id: userId,
              reference_id: post_id 
            }
          });

          if (!existingNotification) {
            // Buscar el usuario al que está dirigido el like
            const user = await User.findByPk(id);
            const notification = {type: 'like', content: `L'usuari ${user.username} ha donat m'agrada a la teva publicació`};
 
            const newNotification = await Notificacion.create({
              user_id: userId,
              type: 'like',
              content: `L'usuari ${user.username} ha donat m'agrada a la teva publicació`,
              reference_id: post_id,
              is_read: false,
              created_at: new Date(),
            })
            io.to(`user:${userId}`).emit('receive_notification', { userId, notification });
          }
        }
    
        // Obtener el estado actualizado del post
        const updatedPost = await Post.findByPk(post_id, {
          attributes: ['id', 'likes_count'],
          include: [
            {
              model: Like,
              as: 'likes',
              where: { user_id: id },
              required: false 
            }
          ]
        });
    
        res.json({
          id: updatedPost.id,
          likes_count: updatedPost.likes_count,
          liked: updatedPost.likes.length > 0 
        });
      } catch (error) {
        console.error('Error en likePost:', error);
        res.status(500).json({ error: 'Error al gestionar el like' });
      }
    }

    static async savePost(req, res) {
      try {
        const { id } = req.user;
        const { post_id } = req.params;

        // Verificar si el post ya está guardado por el usuario
        const existingSavedPost = await SavedPosts.findOne({ where: { user_id: id, post_id } });

        if (existingSavedPost) {
          // Si ya está guardado, eliminarlo
          await existingSavedPost.destroy();
          return res.json({ saved: false });
        } else {
          // Si no está guardado, agregarlo
          await SavedPosts.create({ user_id: id, post_id });
          return res.json({ saved: true });
        }
      } catch (error) {
        console.error('Error en savePost:', error);
        res.status(500).json({ error: 'Error al gestionar el guardado del post' });
      }
    }

    static async postComment(req, res) {
      try {
        const { id: user_id } = req.user;
        const { content } = req.body;
        const { post_id } = req.params;
    
        // Verificar si el contenido del comentario no está vacío
        if (!content || content.trim() === '') {
          return res.status(400).json({ error: 'El contenido del comentario no puede estar vacío' });
        }

        const comment = await createComment(post_id, user_id, content);

        res.json({ msg: "Comentario creado", comment });
      } catch (error) {
        console.error('Error en postComment:', error);
        res.status(500).json({ error: 'Error al gestionar el comentario' });
      }
    }

    static async getPostSaved(req, res) {
      try {
        const { id } = req.user;

        const posts = await getPostSaved(id);

         if (!posts) return res.status(200).json({ msg: "Encara no has desat cap publicació" });

        return res.json({ posts });
      } catch (error) {
        res.status(500).json({ error: 'Error al guardar el post' });
      }
    }

    


    // Funcion para hacer pruebas de subir imagenes a cloudinary
    // static async subirImagens(req, res) {
    //     try {
    //         console.log(req.file);
    //         if (!req.file) {
    //             return res.status(400).json({ msg: "No se ha subido ninguna imagen" });
    //         }
    
    //         // 1️⃣ Generar hash de la imagen
    //         const imageHash = await getImageHash(req.file.buffer);
    
    //         // 2️⃣ Buscar si ya existe en la base de datos
    //         const existingImage = await Image.findOne({ where: { hash: imageHash } });
    
    //         if (existingImage) {
    //         return res.status(200).json({ imageUrl: existingImage.url }); // 🔁 Devuelve la URL ya existente
    //         }
    
    //         const optimizedImage = await sharp(req.file.buffer)
    //         .resize({ width: 600 })
    //         .webp({ quality: 70 })
    //         .toBuffer();
    
    //         const uploadStream = cloudinary.uploader.upload_stream(   
    //             { folder: 'uploads/banner', format: 'webp' },
    //             async (error, result) => {
    //                 if (error) return res.status(500).json({ error });
    
    //                 await Image.create({ hash: imageHash, url: result.secure_url });
    
    //                 res.status(200).json({ imageUrl: result.secure_url });
    //             }
    //         );
    
    //         streamifier.createReadStream(optimizedImage).pipe(uploadStream);
    //     } catch (error) {
    //         console.error("❌ Error en `subirImagen`:", error);
    //         res.status(500).json({ error });
    //     }
    // }

    static async getPostsById(req, res) {
        try {
          const { id } = req.params;
        const posts = await Post.findAll({ 
          include: [
            { model: User, as: "user", attributes: ['username'], include: { model: Media, as: 'profileImage', attributes: ['url'] } },
            { model: Media, as: "media", attributes: ['url', 'type'] }
          ],
          where: { user_id: id } });
    
        res.json({ posts });
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    }
}



function getImageHash(buffer) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        hash.update(buffer);
        resolve(hash.digest('hex'));
    });
}

function getVideoHash(buffer) {
  return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      hash.update(buffer);
      resolve(hash.digest('hex'));
  });
}