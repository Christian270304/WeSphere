import { Post, User, Image, Follower, Like, Comment, SavedPosts } from './models.js';
import { Op , sequelize } from "../config/db.js";

// Función para obtener posts recomendados
export const getRecommendedPosts = async (type = 'recomendado', user_id) => {
    try {
        if (type == 'recomendado') {
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
      { 
        model: User, 
        as: "user", 
        attributes: ['username'], 
        include: { model: Image, as: 'profileImage', attributes: ['url'] } 
      },
      { model: Image, as: "image", attributes: ['url'] },
      { model: SavedPosts, as: "savedByUsers", attributes: ['user_id'], where: { user_id }, required: false } // Usar el alias correcto
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
  
  const FinalsPosts = posts.map(post => {
    const liked = post.likes.some(like => String(like.user_id) === String(user_id)); 
    const saved = post.savedByUsers ? post.savedByUsers.length > 0 : false; // Manejar undefined
    const postData = post.toJSON(); 
    delete postData.likes; 
    delete postData.savedByUsers; // Eliminar la relación para no enviarla al cliente
    return {
      ...postData,
      liked,
      saved // Agregar el campo saved
    };
  });
  
  return FinalsPosts;
        } else if (type === 'explorar') {
            // Obtener los posts de usuarios que no sigue el usuario actual
            const allUsers = await User.findAll({
                attributes: ['id'], // Obtener todos los IDs de los usuarios
              });
              
              const followedUsers = await Follower.findAll({
                where: { follower_id: user_id },
                attributes: ['following_id'], // Obtener los IDs de los usuarios que sigue
              });
              
              // Extraer los IDs de los usuarios que sigue
              const followedIds = followedUsers.map(follow => follow.following_id);
              
              // Filtrar los IDs de los usuarios que no sigue
              const notFollowedUsers = allUsers
                .map(user => user.id)
                .filter(userId => !followedIds.includes(userId));

                const posts = await Post.findAll({
                    include: [
                      { model: Like, as: "likes", attributes: ['user_id'] },
                      { 
                        model: User, 
                        as: "user", 
                        attributes: ['username'], 
                        include: { model: Image, as: 'profileImage', attributes: ['url'] } 
                      },
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
                      ...(followedIds.length > 0 
                        ? { user_id: { [Op.notIn]: followedIds } } // Filtrar usuarios que no sigue
                        : {}), // Si no sigue a nadie, no aplicar filtro
                      created_at: { [Op.gte]: sequelize.literal('NOW() - INTERVAL 6 MONTH') } // Posts de los últimos 6 meses
                    },
                    order: [
                      ['likes_count', 'DESC'],  // Ordenar por cantidad de likes
                      ['comments_count', 'DESC'], // Ordenar por cantidad de comentarios
                      [sequelize.literal('RAND()')] // Ordenar aleatoriamente
                    ],
                    limit: 20 // Limitar a 20 posts
                  });
                  return posts;
        }
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

  export const getPostSaved = async (user_id) => {
    try {
        const saved = await SavedPosts.findAll({
            where: { user_id },
            attributes: ['post_id'],
        });

        const postIds = saved.map(savedPost => savedPost.post_id);

        const posts = await Post.findAll({
            where: { id: postIds },
            include: [
                { model: User, as: "user", attributes: ['username'], include: { model: Image, as: 'profileImage', attributes: ['url'] } },
                { model: Image, as: "image", attributes: ['url'] }
            ]
        });
    
        return posts;
    } catch (error) {
        console.error('Error en getPostSaved:', error);
        return error;
    }
  }

  export const savePost = async (post_id, user_id, res) => {
    try {
        // Verificar si el post ya está guardado por el usuario
        const existingSavedPost = await SavedPosts.findOne({
            where: { post_id, user_id }
        });

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
        return error;
    }
  }
