import { getRecommendedPosts, getComments, createComment, getPostSaved, createPost, uploadImage, uploadVideo, getPostById, findExistingLike, findSavedPost, savePost, deleteSavedPost,
  createLike, getPostsByUserId, deleteLike, getPostWithUser, findExistingNotification, createNotification, getUpdatedPost, getUserById } from '../models/PostQueries.js';

import { io } from '../server.js'

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
          mediaId = await uploadImage(fileBuffer);
        } else if (fileType.startsWith('video/')) {
          mediaId = await uploadVideo(fileBuffer);
        } else {
          return res.status(400).json({ error: 'El archivo debe ser una imagen o un video.' });
        }
      }

      const newPost = await createPost({ user_id, description, mediaId, likes_count, comments_count, allow_comments, allow_likes, allow_save, created_at });

      res.json({ msg: 'Post creado', post: newPost });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
    
    static async getPosts(req, res) {
        try {
          const { id } = req.user;
          const { type } = req.params.type;
          
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
  
        const post = await getPostById(id);
  
        if (!post) {
          return res.status(404).json({ msg: 'Publicació no trobada' });
        }
  
        res.json({ post });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    }

    static async getComments(req, res) {
      try {
        const { post_id } = req.params;
        const Post = await getComments(post_id);
        if (!Post) return res.status(404).json({ msg: "Publicació no trobada" });
        res.json({ Post });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    }
    
    static async updatePost(req, res) {
        try {
        const { id } = req.params;
        const { title, content, image } = req.body;
        
        const post = await getPostById(id);
    
        if (!post) return res.status(404).json({ msg: "Publicació no trobada" });
    
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
        
        const post = await getPostById(id);
    
        if (!post) return res.status(404).json({ msg: "Publicació no trobada" });
    
        await post.destroy();
    
        res.json({ msg: "Publicació eliminada" });
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    }

    

    static async likePost(req, res) {
      try {
        const { id: userId } = req.user;
        const { post_id: postId } = req.params;
  
        const existingLike = await findExistingLike(userId, postId);
  
        if (existingLike) {
          await deleteLike(userId, postId);
        } else {
          await createLike(userId, postId);
  
          const post = await getPostWithUser(postId);
          const postOwnerId = post.user_id;
  
          const existingNotification = await findExistingNotification(postOwnerId, postId);
  
          if (!existingNotification) {
            const user = await getUserById(userId);
            const notificationContent = `L'usuari ${user.username} ha donat m'agrada a la teva publicació`;
  
            const newNotification = await createNotification(postOwnerId, postId, notificationContent);
  
            io.to(`user:${postOwnerId}`).emit('receive_notification', {
              userId: postOwnerId,
              notification: newNotification,
            });
          }
        }
  
        const updatedPost = await getUpdatedPost(postId, userId);
  
        res.json({
          id: updatedPost.id,
          likes_count: updatedPost.likes_count,
          liked: updatedPost.likes.length > 0,
        });
      } catch (error) {
        console.error('Error en likePost:', error);
        res.status(500).json({ error: 'Error al gestionar el like' });
      }
    }

    static async savePost(req, res) {
      try {
        const { id: userId } = req.user;
        const { post_id: postId } = req.params;
  
        const existingSavedPost = await findSavedPost(userId, postId);
  
        if (existingSavedPost) {
          await deleteSavedPost(userId, postId);
          return res.json({ saved: false });
        } else {
          await savePost(userId, postId);
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
        const posts = await getPostsByUserId(id);
        res.json({ posts });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
}
