import { Post, User, Image, Follower } from '../models/models.js';
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
                { model: User, as: "user", attributes: ['username'], include: { model: Image, as: 'profileImage', attributes: ['url'] } },
                { model: Image, as: "image", attributes: ['url'] }
            ],
            where: {
                created_at: { [Op.gte]: sequelize.literal('NOW() - INTERVAL 7 DAY') } // Últimos 7 días
            },
            order: [
                [sequelize.literal(`CASE WHEN "user_id" IN (${followedIds.join(',') || 0}) THEN 1 ELSE 2 END`), 'ASC'], // Primero los seguidos
                ['likes_count', 'DESC'],  // Luego por likes
                ['comments_count', 'DESC'], // Luego por comentarios
                [sequelize.literal('RAND()')] // Aleatorizar un poco
            ],
            limit: 20
        });
        
        return posts;
    } catch (error) {
        console.error('Error en getRecommendedPosts:', error);
        return error;
    }
  };