import { Post, User, Media, Follower, Like, Comment, SavedPosts, Notificacion } from './models.js';
import dontenv from 'dotenv';
import crypto from 'crypto';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { Op , sequelize } from "../config/db.js";
import { io } from '../server.js'

dontenv.config();

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_API_SECRET 
});


export const createPost = async (postData) => {
    return await Post.create(postData);
};


// Función para obtener posts recomendados
export const getRecommendedPosts = async (type = 'recomendado', user_id, limit = 10, offset = 0) => {
    try {
        const followedUsers = await Follower.findAll({
            where: { follower_id: user_id },
            attributes: ['following_id']
        });
        const followedIds = followedUsers.map(follow => follow.following_id);

        if (type === 'recomendado') {
            const recommendedPosts = await getPostsForRecommended(followedIds, user_id, limit, offset);
            const newContentPosts = await getNewContentPosts(user_id, limit, offset);
            const combinedPosts = [...recommendedPosts, ...newContentPosts];
            const shuffledPosts = combinedPosts.sort(() => Math.random() - 0.5);
            return shuffledPosts.slice(0, limit); 
        } else if (type === 'explorar') {
            return await getPostsForExplore(followedIds, user_id, limit, offset);
        }
    } catch (error) {
        console.error('Error en getRecommendedPosts:', error);
        return error;
    }
};

const getPostsForRecommended = async (followedIds, user_id, limit, offset) => {
    const posts = await Post.findAll({
        include: [
            { model: Like, as: "likes", attributes: ['user_id'] },
            {
                model: User,
                as: "user",
                attributes: ['username'],
                include: { model: Media, as: 'profileImage', attributes: ['url'] }
            },
            { model: Media, as: "media", attributes: ['url', 'type'] },
            { model: SavedPosts, as: "savedByUsers", attributes: ['user_id'], where: { user_id }, required: false }
        ],
        attributes: [
            'id',
            'user_id',
            'description',
            'likes_count',
            'comments_count',
            'created_at',
            'allow_comments',
            'allow_likes',
            'allow_saving',
            [sequelize.literal(`
                (likes_count * 2) + 
                (comments_count * 3) - 
                TIMESTAMPDIFF(DAY, created_at, NOW())
            `), 'score']
        ],
        where: {
            ...(followedIds.length > 0
                ? { user_id: { [Op.notIn]: followedIds } }
                : {}),
            created_at: { [Op.gte]: sequelize.literal('NOW() - INTERVAL 6 MONTH') }
        },
        order: [
            [sequelize.literal('score'), 'DESC'],
            [sequelize.literal('RAND()')]
        ],
        limit, 
        offset
    });

    return formatPosts(posts, user_id);
};

const getPostsForExplore = async (followedIds, user_id, limit, offset) => {
    const posts = await Post.findAll({
        include: [
            { model: Like, as: "likes", attributes: ['user_id'] },
            {
                model: User,
                as: "user",
                attributes: ['username'],
                include: { model: Media, as: 'profileImage', attributes: ['url'] }
            },
            { model: Media, as: "media", attributes: ['url', 'type'] },
            { model: SavedPosts, as: "savedByUsers", attributes: ['user_id'], where: { user_id }, required: false }
        ],
        attributes: [
            'id',
            'user_id',
            'description',
            'likes_count',
            'comments_count',
            'created_at',
            'allow_comments',
            'allow_likes',
            'allow_saving'
        ],
        where: {
            ...(followedIds.length > 0
                ? { user_id: { [Op.notIn]: followedIds } }
                : {}),
            created_at: { [Op.gte]: sequelize.literal('NOW() - INTERVAL 6 MONTH') }
        },
        order: [
            ['likes_count', 'DESC'],
            ['comments_count', 'DESC'],
            [sequelize.literal('RAND()')]
        ],
        limit,
        offset
    });

    return formatPosts(posts, user_id);
};

const getNewContentPosts = async (user_id, limit, offset) => {
    const posts = await Post.findAll({
        include: [
            { model: Like, as: "likes", attributes: ['user_id'] },
            {
                model: User,
                as: "user",
                attributes: ['username'],
                include: { model: Media, as: 'profileImage', attributes: ['url'] }
            },
            { model: Media, as: "media", attributes: ['url', 'type'] },
            { model: SavedPosts, as: "savedByUsers", attributes: ['user_id'], where: { user_id }, required: false }
        ],
        attributes: [
            'id',
            'user_id',
            'description',
            'likes_count',
            'comments_count',
            'created_at',
            'allow_comments',
            'allow_likes',
            'allow_saving'
        ],
        where: {
            likes_count: { [Op.lt]: 10 },
            comments_count: { [Op.lt]: 5 },
            created_at: { [Op.gte]: sequelize.literal('NOW() - INTERVAL 1 MONTH') }
        },
        order: [[sequelize.literal('RAND()')]],
        limit,
        offset
    });

    return formatPosts(posts, user_id);
};

export const getPostById = async (id) => {
    return await Post.findByPk(id);
};

export const getUserById = async (id) => {
    return await User.findByPk(id);
};

const formatPosts = (posts, user_id) => {
    return posts.map(post => {
        const liked = post.likes?.some(like => String(like.user_id) === String(user_id));
        const saved = post.savedByUsers ? post.savedByUsers.length > 0 : false;
        const postData = post.toJSON();
        delete postData.likes;
        delete postData.savedByUsers;
        return {
            ...postData,
            liked,
            saved
        };
    });
};


export const getComments = async (Id) => {
    try {
        const post = await Post.findByPk(Id, {
            include: [
                {
                    model: Comment,
                    as: 'comments',
                    separate: true,
                    order: [['created_at', 'DESC']],
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['username'],
                            include: { model: Media, as: 'profileImage', attributes: ['url'] }
                        }
                    ]
                },
                { model: User, as: "user", attributes: ['username'], include: { model: Media, as: 'profileImage', attributes: ['url'] } },
                { model: Media, as: "media", attributes: ['url', 'type'] }
            ],
            attributes: [
                'id',
                'user_id',
                'description',
                'comments_count',
                'created_at',
            ]
        });
        return post;
    } catch (error) {
        console.error('Error en getComments:', error);
        return error;
    }
}

export const findExistingLike = async (userId, postId) => {
    return await Like.findOne({ where: { user_id: userId, post_id: postId } });
  };
  
  export const createLike = async (userId, postId) => {
    await Like.create({ user_id: userId, post_id: postId });
    await Post.increment('likes_count', { where: { id: postId } });
  };
  
  export const deleteLike = async (userId, postId) => {
    const existingLike = await Like.findOne({ where: { user_id: userId, post_id: postId } });
    if (existingLike) {
      await existingLike.destroy();
      await Post.decrement('likes_count', { where: { id: postId } });
    }
  };
  
  export const getPostWithUser = async (postId) => {
    return await Post.findByPk(postId, { include: [{ model: User, as: 'user' }] });
  };
  
  export const findExistingNotification = async (userId, postId) => {
    return await Notificacion.findOne({
      where: {
        type: 'like',
        user_id: userId,
        reference_id: postId,
      },
    });
  };
  
  export const createNotification = async (userId, postId, content) => {
    return await Notificacion.create({
      user_id: userId,
      type: 'like',
      content,
      reference_id: postId,
      is_read: false,
      created_at: new Date(),
    });
  };
  
  export const getUpdatedPost = async (postId, userId) => {
    return await Post.findByPk(postId, {
      attributes: ['id', 'likes_count'],
      include: [
        {
          model: Like,
          as: 'likes',
          where: { user_id: userId },
          required: false,
        },
      ],
    });
  };

export const createComment = async (post_id, user_id, content) => {
    try {
        // Crear el comentario
        const comment = await Comment.create({ post_id, user_id, content });
    
        // Incrementar el contador de comentarios en el post
        await Post.increment('comments_count', { where: { id: post_id } });

        const post = await Post.findByPk(post_id, { include: [{ model: User, as: 'user' }] });
        const userId = post.user_id;
        const existingNotification = await Notificacion.findOne({
            where: {
                type: 'comment',
                user_id: userId,
                reference_id: post_id 
            }
        });

        if (!existingNotification) {
            const user = await User.findByPk(user_id);
            const notification = {
                type: 'comment',
                content: `L'usuari ${user.username} ha comentat en una de les teves publicacions.`,
            };
            const newNotification = await Notificacion.create({
                user_id: user.id,
                type: 'comment',
                content: `L'usuari ${user.username} ha comentat la teva publicació`,
                reference_id: post_id,
                is_read: false,
                created_at: new Date(),
            })
            io.to(`user:${userId}`).emit('receive_notification', { userId: user_id, notification });
        }

        return comment;
    } catch (error) {
        console.error('Error en createComment:', error);
        return error;
    }
}

export const getPostsByUserId = async (userId) => {
    try {
        const posts = await Post.findAll({
            include: [
                { model: User, as: "user", attributes: ['username'], include: { model: Media, as: 'profileImage', attributes: ['url'] } },
                { model: Media, as: "media", attributes: ['url', 'type'] }
            ],
            where: { user_id: userId }
        });
        return posts;
    } catch (error) {
        console.error('Error en getPostsByUserId:', error);
        throw error;
    }
};

export const getPostSaved = async (user_id) => {
    try {
        const saved = await SavedPosts.findAll({
            where: { user_id },
            attributes: ['post_id'],
        });

        const postIds = saved.map(savedPost => savedPost.post_id);

        if (postIds.length === 0) {
            return [];
        }

        const posts = await Post.findAll({
            where: { id: postIds },
            include: [
                { model: User, as: "user", attributes: ['username'], include: { model: Media, as: 'profileImage', attributes: ['url'] } },
                { model: Media, as: "media", attributes: ['url', 'type'] }
            ]
        });
    
        return posts;
    } catch (error) {
        console.error('Error en getPostSaved:', error);
        return error;
    }
};

export const findSavedPost = async (userId, postId) => {
    return await SavedPosts.findOne({ where: { user_id: userId, post_id: postId } });
  };
  
  // Guardar un post
  export const savePost = async (userId, postId) => {
    return await SavedPosts.create({ user_id: userId, post_id: postId });
  };
  
  // Eliminar un post guardado
  export const deleteSavedPost = async (userId, postId) => {
    const savedPost = await SavedPosts.findOne({ where: { user_id: userId, post_id: postId } });
    if (savedPost) {
      await savedPost.destroy();
      return true; // Indica que el post fue eliminado
    }
    return false; // Indica que no había un post guardado
  };

export const uploadImage = async (imageBuffer, folder = 'posts') => {
    const imageHash = await getFileHash(imageBuffer);
  
    // Verificar si la imagen ya existe
    const existingImage = await Media.findOne({ where: { hash: imageHash } });
    if (existingImage) {
      return existingImage.id;
    }
  
    // Optimizar la imagen con Sharp
    const optimizedImage = await sharp(imageBuffer)
      .resize({ width: 600 })
      .webp({ quality: 70 })
      .toBuffer();
  
    // Subir la imagen a Cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `uploads/${folder}`, format: 'webp' },
        async (error, result) => {
          if (error) {
            return reject(error);
          }
          try {
            const image = await Media.create({ hash: imageHash, url: result.secure_url, type: 'image' });
            resolve(image.id);
          } catch (err) {
            reject(err);
          }
        }
      );
      streamifier.createReadStream(optimizedImage).pipe(uploadStream);
    });
  };
  
  // Subir un video a Cloudinary
  export const uploadVideo = async (videoBuffer, folder = 'posts') => {
    const videoHash = await getFileHash(videoBuffer);
  
    // Verificar si el video ya existe
    const existingVideo = await Media.findOne({ where: { hash: videoHash } });
    if (existingVideo) {
      return existingVideo.id;
    }
  
    // Subir el video a Cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `uploads/${folder}`, resource_type: 'video' },
        async (error, result) => {
          if (error) {
            return reject(error);
          }
          try {
            const video = await Media.create({ hash: videoHash, url: result.secure_url, type: 'video' });
            resolve(video.id);
          } catch (err) {
            reject(err);
          }
        }
      );
      streamifier.createReadStream(videoBuffer).pipe(uploadStream);
    });
  };
  
  // Generar un hash para un archivo
  export const getFileHash = (buffer) => {
    return new Promise((resolve) => {
      const hash = crypto.createHash('sha256');
      hash.update(buffer);
      resolve(hash.digest('hex'));
    });
  };
