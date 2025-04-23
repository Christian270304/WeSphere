import { ChatMember, Message, User, Image, Chat, Follower } from "./models.js";
import { Op, sequelize } from "../config/db.js";


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
                model: Image,
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
          { model: Image, as: 'profileImage', attributes: ['url'], required: false },
          { model: Image, as: 'bannerImage', attributes: ['url'], required: false }
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
          { model: Image, as: 'profileImage', attributes: ['url'], required: false },
          { model: Image, as: 'bannerImage', attributes: ['url'], required: false }
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
          model: Image,
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