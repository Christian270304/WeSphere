import dotenv from 'dotenv';

import { verifyUserCredentials, generateAuthToken, getUser, getChatsModel, verifyUser, newMessageModel, getUserByUsername, 
  getNotificationsModel, getSugerenciasModel, saveNotificationModel, toggleFollowQuery, createUser, verifyAuthToken,
  getFollowStatusQuery, getMessagesQuery, getFriendsQuery, findExistingChat, createNewChat, getProfileStatusQuery,
  getLastMessage, getUserInfo, checkExistingUsername, getUserById, updateUserProfile, uploadImageModel, deleteUserById
} from '../models/AuthQueries.js';

dotenv.config();

const DEFAULT_PROFILE_IMAGE_ID = 1;
const DEFAULT_PROFILE_BANNER_ID = 2;

export class AuthController {
  static async register(req, res) {
    try {
      let {username, email, password, profile_picture = null, banner = null, bio = null, is_private = false, created_at = new Date()} = req.body;

      const existUser = await verifyUser(username, email);
      if (existUser) {
        return res.status(400).json({ msg: existUser });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      if (!profile_picture) profile_picture = DEFAULT_PROFILE_IMAGE_ID;
      if (!banner) banner = DEFAULT_PROFILE_BANNER_ID;

      const newUser = await createUser({ username, email, password: hashedPassword, profile_picture, banner, bio, is_private, created_at });

      if (!newUser) {
        return res.status(400).json({ msg: 'Error al crear el usuario' });
      }

      const user = await getUserByUsername(username);

      const token = generateAuthToken(user.id);

      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 3600000
      });

      return res.json({ user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;

      const user = await verifyUserCredentials(username, password);

      const token = generateAuthToken(user.id);

      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 3600000,
      });

      return res.json({ user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
      console.error('Error en login:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  static async getUser(req, res) {
    try {
      const { id } = req.user;
      const user = await getUser(id);

      if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

      res.json({ user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getUserById(req, res) {
    try {
      const { user_id } = req.params;

      const user = await getUser(user_id);

      if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

      res.json({ user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getUserByUsername(req, res) {
    try {
      const { id } = req.user;
      const { username } = req.params;

      const user = await getUserByUsername(username);

      if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

      res.status(200).json({ current_user_id: id, user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getNotifications(req, res) {
    try {
      const { id } = req.user;

      const notifications = await getNotificationsModel(id); 
      
      if (!notifications) return res.status(404).json({ msg: "Notificaciones no encontradas" });

      res.json({ notifications });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async check(req, res) {
    try {
      const token = req.cookies.auth_token;

      const result = verifyAuthToken(token);

      if (!result.authenticated) {
        return res.status(401).json({ authenticated: false });
      }

      return res.status(200).json({ authenticated: true, user: result.userId });
    } catch (err) {
      console.error('Error en check:', err.message);
      return res.status(401).json({ authenticated: false });
    }
  }

  static async logout(req, res) {
    try {
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none', 
      });
      res.json({ msg: "Sesión cerrada" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getMessages(req, res) {
    try {
      const { chat_id } = req.params;

      const messages = await getMessagesQuery(chat_id);

      if (!messages || messages.length === 0) {
        return res.status(404).json({ msg: "Mensajes no encontrados" });
      }

      res.json({ messages });
    } catch (err) {
      console.error('Error en getMessages:', err);
      res.status(500).json({ error: err.message });
    }
  }

  static async getChats(req, res) {
    try {
      const { id } = req.user;

      const chats = await getChatsModel(id); 
      
      return res.status(200).json({ chats });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async newMessage(req, res) {
    try {
      const { id } = req.user;
      const { chat_id, content } = req.body;

      const newMessage = await newMessageModel(id, chat_id, content); 
      if (!newMessage) return res.status(404).json({ msg: "Mensaje no creado" });

      return res.status(200).json({ newMessage });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async googleCallback(req, res) {

    if (!req.user) {
      return res.status(401).json({ msg: "Error al autenticar con Google" });
    }
    const { id } = req.user;

    const token = generateAuthToken(id);
    
    // Enviar la cookie al cliente
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 3600000,
    });

    // res.status(200).json({ user: { id: req.user.id, username: req.user.username, email: req.user.email } });
    // res.redirect("http://localhost:4200/home"); 
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ success: true }, "http://localhost:4200");
            window.close();
          </script>
        </body>
      </html>
    `);
  }

  static async redditCallback(req, res) {
    if (!req.user) {
      return res.status(401).json({ msg: "Error al autenticar con Reddit" });
    }

    const { id } = req.user;
    
    const token = generateAuthToken(id);
    
    // Enviar la cookie al cliente
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 3600000,
    });

    // res.status(200).json({ user: { id: req.user.id, username: req.user.username, email: req.user.email } });
    // res.redirect("http://localhost:4200/home"); 
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ success: true }, "http://localhost:4200");
            window.close();
          </script>
        </body>
      </html>
    `);
  }

  static async discordCallback(req, res) {
    if (!req.user) {
      return res.status(401).json({ msg: "Error al autenticar con Discord" });
    }

    const { id } = req.user;
    
    const token = generateAuthToken(id);
    
    // Enviar la cookie al cliente
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 3600000,
    });

    // res.status(200).json({ user: { id: req.user.id, username: req.user.username, email: req.user.email } });
    // res.redirect("http://localhost:4200/home"); 
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ success: true }, "http://localhost:4200");
            window.close();
          </script>
        </body>
      </html>
    `);
  }

  static async toggleFollow(req, res) {
    try {
      const { id: follower_id } = req.user;
      const { user_id: following_id } = req.params;

      const result = await toggleFollowQuery(follower_id, following_id);

      return res.json(result);
    } catch (error) {
      console.error('Error en toggleFollow:', error);
      res.status(500).json({ error: 'Error al gestionar el seguimiento' });
    }
  }

  static async getFollowStatus(req, res) {
    try {
      const { id: follower_id } = req.user;
      const { user_id: following_id } = req.params;

      const isFollowing = await getFollowStatusQuery(follower_id, following_id);

      res.json({ isFollowing });
    } catch (error) {
      console.error('Error en getFollowStatus:', error);
      res.status(500).json({ error: 'Error al obtener el estado de seguimiento' });
    }
  }

  static async getFriends(req, res) {
    try {
      const { id: follower_id } = req.user;

      const friends = await getFriendsQuery(follower_id);

      res.json({ friends });
    } catch (error) {
      console.error('Error en getFriends:', error);
      res.status(500).json({ error: 'Error al obtener los amigos' });
    }
  }

  static async getSugerencias(req, res) {
    try {
      const { id: user_id } = req.user; 
  
      const sugerencias = await getSugerenciasModel(user_id);

      if (!sugerencias) return res.status(404).json({ msg: "Sugerencias no encontradas" });
  
      res.json({ sugerencias });
    } catch (error) {
      console.error('Error en getSugerencias:', error);
      res.status(500).json({ error: 'Error al obtener las sugerencias' });
    }
  }

  static async getProfileStatus(req, res) {
    try {
      const { id: user_id } = req.user; 
  
      const profileStatus = await getProfileStatusQuery(user_id);

      if (!profileStatus) return res.status(404).json({ msg: "Estado de perfil no encontrado" });
  
      res.json({ profileStatus });
    } catch (error) {
      console.error('Error en getProfileStatus:', error);
      res.status(500).json({ error: 'Error al obtener el estado de perfil' });
    }
  }

  static async getFollowStatusById(req, res) {
    try {
      const { id: follower_id } = req.user;
      const { userId } = req.params;

      const userAuthenticated = await getUserById(follower_id);
    
      if (userAuthenticated.id === parseInt(userId)) {
        return res.status(200).json({ 
          isFollowing: true 
        });
      }

      const user = await getUser(userId);

      if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

      const isFollowing = await getFollowStatusQuery(follower_id, user.id);

      res.json({ isFollowing });
    } catch (error) {
      console.error('Error en getFollowStatusByUsername:', error);
      res.status(500).json({ error: 'Error al obtener el estado de seguimiento' });
    }
  }

  static async createChat(req, res) {
    try {
      const { userId: otherUserId } = req.body;
      const { id: userId } = req.user;

      console.log("Crear chat: ", userId, otherUserId);

      const existingChat = await findExistingChat(userId, otherUserId);

      if (existingChat) {
        const lastMessage = await getLastMessage(existingChat.id);
        const otherUser = await getUserInfo(otherUserId);

        return res.json({
          chat_id: existingChat.id,
          last_message: lastMessage ? lastMessage.content : '',
          other_users: [
            {
              user_id: otherUserId,
              username: otherUser?.username,
              profile_image: otherUser?.profileImage?.url || null
            }
          ]
        });
      }

      const newChat = await createNewChat(userId, otherUserId);
      const otherUser = await getUserInfo(otherUserId);

      res.json({
        chat_id: newChat.id,
        last_message: '',
        other_users: [
          {
            user_id: otherUser.id,
            username: otherUser.username,
            profile_image: otherUser.profileImage ? otherUser.profileImage.url : null
          }
        ]
      });
    } catch (error) {
      console.error('Error al crear el chat:', error);
      res.status(500).json({ error: 'Error al crear el chat' });
    }
  }

  static async updateProfileStatus(req, res) {
    try {
      const { id: userId } = req.user;
      const { is_private } = req.body;

      const updatedStatus = await updateUserProfile(userId, { is_private });

      if (!updatedStatus) {
        return res.status(404).json({ msg: "Estado de perfil no encontrado" });
      }

      res.json({ msg: "Estado de perfil actualizado", updatedStatus });
    } catch (error) {
      console.error('Error al actualizar el estado de perfil:', error);
      res.status(500).json({ error: 'Error al actualizar el estado de perfil' });
    }
  }

  static async deleteAccount(req, res) {
    try {
      const { id: userId } = req.user;
  
      const result = await deleteUserById(userId);
  
      if (result > 0) {
        return res.status(200).json({ msg: 'Cuenta eliminada correctamente.' });
      } else {
        return res.status(400).json({ msg: 'No se pudo eliminar la cuenta.' });
      }
    } catch (error) {
      console.error('Error al eliminar la cuenta:', error);
      res.status(500).json({ error: 'Error al eliminar la cuenta.' });
    }
  }

  static async updateUser(req, res) {
    try {
      const { id: userId } = req.user;
      const { username, bio } = req.body;

      const existingUser = await checkExistingUsername(username, userId);
      if (existingUser) {
        return res.status(400).json({ error: 'El nombre de usuario ya existe.' });
      }

      const profileImage = req.files?.profileImage?.[0];
      const bannerImage = req.files?.bannerImage?.[0];

      const currentUser = await getUserById(userId);
      if (!currentUser) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      let profileImageId = currentUser.profile_picture;
      let bannerImageId = currentUser.banner;

      if (profileImage) {
        profileImageId = await uploadImageModel(profileImage.buffer, 'profile');
      }

      if (bannerImage) {
        bannerImageId = await uploadImageModel(bannerImage.buffer, 'profile');
      }

      const [rowsUpdated] = await updateUserProfile(userId, {
        username,
        bio,
        profile_picture: profileImageId,
        banner: bannerImageId
      });

      if (rowsUpdated === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      const updatedUser = await getUserById(userId);

      res.status(200).json({ message: 'Perfil actualizado correctamente.', user: updatedUser });
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      res.status(500).json({ error: 'Error al actualizar el perfil.' });
    }
  }

  static async saveNotification(userId, otherUserId, notification) {
    try {
  
      const newNotification = await saveNotificationModel( userId, otherUserId, notification)
  
      return newNotification;
    } catch (error) {
      console.error('Error al guardar la notificación:', error);
      throw error; 
    }
  }
}