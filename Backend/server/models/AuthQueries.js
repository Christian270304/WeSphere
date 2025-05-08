import { ChatMember, Message, User, Media, Chat, Follower, Notificacion, AuthProvider } from "./models.js";
import { Op, sequelize } from "../config/db.js";
import { io } from '../server.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { uploadImage } from '../models/PostQueries.js';


export const verifyUser = async (username, email) => {
  try {
    let message = "";
    const existingEmail = await User.findOne({ where: { email } });
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) message = "El nom d'usuari ja està en ús";
    if (existingEmail) message += (message ? " i " : "") + "El correu electrònic ja està en ús";
    return message;
  } catch (err) {
    throw new Error(err);
  }
}

export const verifyUserCredentials = async (username, password) => {
  const user = await User.findOne({ where: { username } });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Contraseña incorrecta');
  }

  return user;
};

export const verifyAuthToken = (token) => {
  try {
    if (!token) {
      return { authenticated: false };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { authenticated: true, userId: decoded.id };
  } catch (err) {
    console.error('Error al verificar el token:', err.message);
    return { authenticated: false };
  }
};

export const generateAuthToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

export const createUser = async (userData) => {
  return await User.create(userData);
};


export const getChatsModel = async (user_id) => {
  const userChats = await ChatMember.findAll({
    attributes: ['chat_id'],
    where: {
      user_id: user_id, 
    },
  });
  
  const chatIds = userChats.map(chat => chat.chat_id);
  
  const lastMessages = await Message.findAll({
    attributes: ['chat_id', 'content', 'sender_id', 'created_at'],
    where: {
      chat_id: { [Op.in]: chatIds },  
    },
    order: [['created_at', 'DESC']],  
  });
  
  const chats = [];
  
  for (const chatId of chatIds) {
    const lastMessage = lastMessages.find(msg => msg.chat_id === chatId);
  
    if (lastMessage) {
      const otherMembers = await ChatMember.findAll({
        attributes: ['user_id'],
        where: {
          chat_id: chatId,
          user_id: { [Op.ne]: user_id },  
        },
        include: [
          {
            model: User,
            attributes: ['id', 'username'],  
            include: [
              {
                model: Media,
                as: 'profileImage',  
                attributes: ['url'],
              },
            ],
          },
        ],
      });
  

        const otherUserDetails = otherMembers.map(member => {
        const user = member.user;  
        
        if (!user) {
          console.log('User not found for member ID:', member.user_id);
        }
  
        const profileImage = user && user.profileImage ? user.profileImage.url : null;
  
        return {
          user_id: member.user_id,
          username: user ? user.username : null,
          profile_image: profileImage,
        };
      });
  
      chats.push({
        chat_id: chatId,
        last_message: lastMessage.content,
        other_users: otherUserDetails,  
      });
    }
  }
  
  return chats;
}

export const getUser = async (id) => {
    try {
      const user = await User.findOne({
        where: { id },
        include: [
          { model: Media, as: 'profileImage', attributes: ['url'], required: false },
          { model: Media, as: 'bannerImage', attributes: ['url'], required: false }
        ]
      });
      return user;
    } catch (err) {
      throw new Error(err);
    }
  }

  export const getUserByUsername = async (username) => {
    try {
      const user = await User.findOne({
        where: { username },
        include: [
          { model: Media, as: 'profileImage', attributes: ['url'], required: false },
          { model: Media, as: 'bannerImage', attributes: ['url'], required: false }
        ]
      });
      return user;
    } catch (err) {
      throw new Error(err);
    }
  }
  
  export const getUsers = async () => {
    try {
      return await User.findAll();
    } catch (err) {
      throw new Error(err);
    }
  }

  export const getNotificationsModel = async (user_id) => {
    try {
      const user = await User.findOne({ where: { id: user_id } });

      if (!user) return null; 
  
      const notifications = await user.getNotifications(); 
      
      return notifications;
    } catch (err) {
      throw new Error(err);
    }
  }

  export const newMessageModel = async (user_id, chat_id, content) => {
    try {
      const message = await Message.create({
        chat_id,
        sender_id: user_id,
        content,
        created_at: new Date(),
      });

      if (!message) {
        throw new Error('Error al crear el missatge');
      }

      io.to(`chat:${chat_id}`).emit('receive_message', message);
      
      return message;
    } catch (err) {
      throw new Error(err);
    }
  }

  export const getSugerenciasModel = async (user_id) => {
    try {
      const followingRecords = await Follower.findAll({
        where: { follower_id: user_id },
        attributes: ['following_id']
      });
  
      const followingIds = followingRecords.map(record => record.following_id);
  
      const suggestions = await User.findAll({
        where: {
          id: {
            [Op.notIn]: [...followingIds, user_id] 
          }
        },
        attributes: ['id', 'username'], 
        include: {
          model: Media,
          as: 'profileImage',
          attributes: ['url'] 
        },
        order: sequelize.literal('RAND()'),
        limit: 3 
      });

      return suggestions;
    } catch (err) {
      throw new Error(err);
    }
  }

  export const getProfileStatusQuery = async (user_id) => {
    try {
      const user = await User.findOne({
        where: { id: user_id },
        attributes: ['id', 'is_private']
      });
      
      console.log("User: ", user);
      return user;
    } catch (err) {
      throw new Error(err);
    }
  }

  export const saveNotificationModel = async (user_id, reference_id, notificacion) => {
    try {
      const { type, content } = notificacion;
      if (content === null) {
        content = "No hi ha contingut";
      }
      console.log("notificacion", type, content);
      const notification = await Notificacion.create({
        user_id,
        type,
        content,
        reference_id,
        is_read: false,
        created_at: new Date(),
      });
  
      return notification;
    } catch (err) {
      throw new Error(err);
    }
  }

  export const toggleFollowQuery = async (follower_id, following_id) => {
    try {
      const existingFollow = await Follower.findOne({
        where: { follower_id, following_id }
      });
  
      if (existingFollow) {
        await existingFollow.destroy();
        return { following: false };
      } else {
        await Follower.create({ follower_id, following_id });

        const user = await User.findOne({ where: { id: follower_id } });

        const notification = { type: 'follow', content: 't\'ha seguit', user };
        io.to(`user:${following_id}`).emit('receive_notification', { follower_id, notification });
  
        return { following: true };
      }
    } catch (error) {
      console.error('Error en toggleFollowQuery:', error);
      throw error;
    }
  };

  export const getFollowStatusQuery = async (follower_id, following_id) => {
    try {
      const isFollowing = await Follower.findOne({
        where: { follower_id, following_id }
      });
      return !!isFollowing; 
    } catch (error) {
      console.error('Error en getFollowStatusQuery:', error);
      throw error;
    }
  };

  export const getMessagesQuery = async (chat_id) => {
    try {
      const messages = await Message.findAll({
        where: { chat_id },
        order: [['created_at', 'ASC']]
      });
  
      return messages;
    } catch (error) {
      console.error('Error en getMessagesQuery:', error);
      throw error;
    }
  };

  export const getFriendsQuery = async (follower_id) => {
    try {
      const followingRecords = await Follower.findAll({
        where: { follower_id },
        attributes: ['following_id']
      });
  
      const followingIds = followingRecords.map(record => record.following_id);
  
      if (followingIds.length === 0) {
        return [];
      }
  
      const friends = await User.findAll({
        where: { id: followingIds },
        attributes: ['id', 'username'],
        include: {
          model: Media,
          as: 'profileImage',
          attributes: ['url']
        }
      });
  
      return friends;
    } catch (error) {
      console.error('Error en getFriendsQuery:', error);
      throw error;
    }
  };

  export const findExistingChat = async (userId, otherUserId) => {
    const chatsWithBothUsers = await Chat.findAll({
      include: [
        {
          model: ChatMember,
          where: {
            user_id: [userId, otherUserId]
          },
          required: true
        }
      ]
    });
  
    const existingChat = chatsWithBothUsers.find(chat =>
      chat.chat_members.length === 2 &&
      chat.chat_members.some(cm => cm.user_id === userId) &&
      chat.chat_members.some(cm => cm.user_id === otherUserId)
    );
  
    return existingChat;
  };
  
  export const createNewChat = async (userId, otherUserId) => {
    const newChat = await Chat.create({
      is_group: false,
      created_at: new Date()
    });
  
    await ChatMember.create({ chat_id: newChat.id, user_id: userId });
    await ChatMember.create({ chat_id: newChat.id, user_id: otherUserId });
  
    return newChat;
  };
  
  export const getLastMessage = async (chatId) => {
    return await Message.findOne({
      where: { chat_id: chatId },
      order: [['created_at', 'DESC']],
      attributes: ['content']
    });
  };
  
  export const getUserInfo = async (userId) => {
    return await User.findOne({
      where: { id: userId },
      attributes: ['id', 'username'],
      include: {
        model: Media,
        as: 'profileImage',
        attributes: ['url']
      }
    });
  };

  export const checkExistingUsername = async (username, userId) => {
    return await User.findOne({
      where: { username, id: { [Op.ne]: userId } }
    });
  };

  export const deleteUserById = async (userId) => {
    try {
      const result = await User.destroy({
        where: { id: userId } 
      });

      const authProviders = await AuthProvider.findAll({ where: { user_id: userId } });

      if (authProviders.length > 0) {
        await AuthProvider.destroy({ where: { user_id: userId } });
      }
  
      return result; 
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      throw error;
    }
  };
  
  export const getUserById = async (userId) => {
    return await User.findOne({ where: { id: userId } });
  };
  
  export const updateUserProfile = async (userId, updateData) => {
    return await User.update(updateData, { where: { id: userId } });
  };

  export const uploadImageModel = async (imageBuffer, folder) => {
    const imageHash = await getHash(imageBuffer);
    const existingImage = await Media.findOne({ where: { hash: imageHash } });
  
    if (existingImage) {
      return existingImage.id;
    } else {
      return await uploadImage(imageBuffer, folder);
    }
  };
  
  export const getHash = (buffer) => {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      hash.update(buffer);
      resolve(hash.digest('hex'));
    });
  };