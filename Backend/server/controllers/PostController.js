import { Post } from '../models/models.js';
import { getRecommendedPosts } from '../models/PostQueries.js';
import { Image, User } from '../models/models.js';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import streamifier from 'streamifier';
import dontenv from 'dotenv';
import crypto from 'crypto';

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
            console.log(req.body);
            console.log(req.file)
        const { user_id, title = '', description = '', likes_count = 0, comments_count = 0, allow_comments = true, allow_likes = true, allow_save = true, created_at = new Date() } = req.body || {};
        const imageBuffer = req.file?.buffer;

        let imageId = null;
        if (imageBuffer) {
            imageId = await PostController.uploadImage(imageBuffer);
        }
        console.log(imageId);
        const newPost = await Post.create({ user_id, title, description, imageId, likes_count, comments_count, allow_comments, allow_likes, allow_save, created_at });
        
        res.json({ msg: "Post creado", post: newPost });
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    }
    
    static async getPosts(req, res) {
        try {
        const posts = await getRecommendedPosts(req.params.id);
    
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

    static async uploadImage(imageBuffer) {
        try {
            // 1️⃣ Generar hash de la imagen
            const imageHash = await getImageHash(imageBuffer);
        
            // 2️⃣ Buscar si ya existe en la base de datos
            const existingImage = await Image.findOne({ where: { hash: imageHash } });
        
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
                { folder: 'uploads/posts', format: 'webp' },
                async (error, result) => {
                  if (error) {
                    console.error("❌ Error al subir a Cloudinary:", error);
                    return reject(error);
                  }
                  try {
                    const image = await Image.create({ hash: imageHash, url: result.secure_url });
                            
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

    static async getPostsByUser(req, res) {
        try {
        const posts = await Post.findAll({ 
          include: [
            { model: User, as: "user", attributes: ['username'], include: { model: Image, as: 'profileImage', attributes: ['url'] } },
            { model: Image, as: "image", attributes: ['url'] }
          ],
          where: { user_id: req.params.id } });
    
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