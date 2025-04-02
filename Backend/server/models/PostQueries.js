import { Post, User, Image, Follower, Like, Comment } from '../models/models.js';
import { Op , sequelize } from "../config/db.js";

// Función para obtener posts recomendados
export const getRecommendedPosts = async (user_id) => {
    try {
        // Obtener los IDs de los usuarios que sigue el usuario actual
        const followedUsers = await Follower.findAll({
            where: { follower_id: user_id },
            attributes: ['following_id']
        });
  
        const followedIds = followedUsers.map(follow => follow.following_id);
  
        // Buscar posts recomendados usando los criterios definidos
        const posts = await Post.findAll({
            include: [
                { model: Like, as: "likes", attributes: ['user_id'] },
                { model: User, as: "user", attributes: ['username'], include: { model: Image, as: 'profileImage', attributes: ['url'] } },
                { model: Image, as: "image", attributes: ['url'] }
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
            ],
            where: {
                created_at: { [Op.gte]: sequelize.literal('NOW() - INTERVAL 6 MONTH') } 
            },
            order: [
                [sequelize.literal(`CASE WHEN "user_id" IN (${followedIds.join(',') || 0}) THEN 1 ELSE 2 END`), 'ASC'], 
                ['likes_count', 'DESC'],  
                ['comments_count', 'DESC'], 
                [sequelize.literal('RAND()')] 
            ],
            limit: 20
        });
        
        return posts.map(post => ({
            ...post.toJSON(),
            liked: post.likes.some(like => like.user_id === user_id)
          }));
    } catch (error) {
        console.error('Error en getRecommendedPosts:', error);
        return error;
    }
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
                            include: { model: Image, as: 'profileImage', attributes: ['url'] }
                        }
                    ]
                },
                { model: User, as: "user", attributes: ['username'], include: { model: Image, as: 'profileImage', attributes: ['url'] } },
                { model: Image, as: "image", attributes: ['url'] }
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

  export const createComment = async (post_id, user_id, content) => {
    try {
        // Crear el comentario
        const comment = await Comment.create({ post_id, user_id, content });
    
        // Incrementar el contador de comentarios en el post
        await Post.increment('comments_count', { where: { id: post_id } });
        
        return comment;
    } catch (error) {
        console.error('Error en createComment:', error);
        return error;
    }
  }