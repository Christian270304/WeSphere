import { ChatMember, Message, User, Image, Chat } from "./models.js";


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
    const messages = await Message.findAll({
        include: [
          {
            model: Chat,
            include: [
              {
                model: ChatMember,
                attributes: ['user_id'],
                where: {}, // sin filtro aquí
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
                  }
                ]
              }
            ],
            where: {
              '$chat_members.user_id$': user_id, // filtras aquí que el usuario esté en el chat
            },
          },
        ],
        order: [['created_at', 'DESC']],
      });

      return messages;
      // Agrupar los mensajes por chat_id y seleccionar el último mensaje
      const chats = messages.map(msg => {
        const members = msg.chat?.chat_members || [];
        const other = members.find(m => m.user_id !== user_id);
        return {
          lastMessage: msg.content,
          chat_id: msg.chat_id,
          otherUser: other?.user,
        };
      });
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
  
  export const getUsers = async () => {
    try {
      return await User.findAll();
    } catch (err) {
      throw new Error(err);
    }
  }