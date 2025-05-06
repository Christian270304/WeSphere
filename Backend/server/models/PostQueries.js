import { Post, User, Media, Follower, Like, Comment, SavedPosts, Notificacion } from './models.js';
import { Op , sequelize } from "../config/db.js";
import { io } from '../server.js'

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
                { model: User, as: "user", attributes: ['username'], include: { model: Media, as: 'profileImage', attributes: ['url'] } },
                { model: Media, as: "media", attributes: ['url', 'type'] }
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
