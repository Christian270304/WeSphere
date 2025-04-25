import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { User, Message, Follower, Media } from '../models/models.js';
import { getUser, getChatsModel, verifyUser, newMessageModel, getUserByUsername, getNotificationsModel, getSugerenciasModel } from '../models/AuthQueries.js';
import { io } from '../server.js'

dotenv.config();

const DEFAULT_PROFILE_IMAGE_ID = 1;
const DEFAULT_PROFILE_BANNER_ID = 2;

export class AuthController {
  static async register(req, res) {
    try {
      let { username, email, password, profile_picture = null, banner = null, bio = null, is_private = false, created_at = new Date() } = req.body;

      // Verificar si el usuario ya existe, no se puede registrar con el mismo username ni email
      const existUser = await verifyUser(username, email);
      if (existUser) return res.status(400).json({ msg: existUser });

      const hashedPassword = await bcrypt.hash(password, 10);
      if (!profile_picture) profile_picture = DEFAULT_PROFILE_IMAGE_ID;
      if (!banner) banner = DEFAULT_PROFILE_BANNER_ID;
      const newUser = await User.create({ username, email, password: hashedPassword, profile_picture, banner, bio, is_private, created_at });
      if (!newUser) return res.status(400).json({ msg: "Error al crear el usuario" });
      const user = await User.findOne({ where: { username } });
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 3600000,
      });
  
    return res.json({ user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;
      console.log("credenciales Login: ",username, password);

      const user = await User.findOne({ where: { username } });

      if (!user) return res.status(400).json({ msg: "Usuario no encontrado" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: "Contraseña incorrecta" });

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 3600000,
      });
    
      return res.json({ user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
      res.status(500).json({ error: err.message });
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
    const token = req.cookies.auth_token; 

    if (!token) {
      return res.status(401).json({ authenticated: false });
    }

    try {
      // Verifica el token (por ejemplo, usando JWT)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return res.status(200).json({ authenticated: true, user: decoded.id });
    } catch (err) {
      return res.status(401).json({ authenticated: false });
    }
  }

  static async logout(req, res) {
    try {
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: true, // true en producción
        sameSite: 'none', // 'none' para producción
      });
      res.json({ msg: "Sesión cerrada" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getMessages(req, res) {
      try {
        const { chat_id } = req.params;
        const messages = await Message.findAll({
          where: { chat_id: chat_id },
          order: [['created_at', 'ASC']], 
      });
    
        if (!messages) return res.status(404).json({ msg: "Mensajes no encontrados" });
    
        res.json({ messages });
      } catch (err) {
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

      // console.log("Nuevo mensaje: ", newMessage);

      io.to(`chat:${chat_id}`).emit('receive_message', newMessage);

      return res.status(200).json({ newMessage });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async googleCallback(req, res) {

    if (!req.user) {
      return res.status(401).json({ msg: "Error al autenticar con Google" });
    }

    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    
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
            window.opener.postMessage({ success: true }, "https://wesphere.vercel.app/");
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

    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    
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
            window.opener.postMessage({ success: true }, "https://wesphere.vercel.app/");
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

    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    
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
            window.opener.postMessage({ success: true }, "https://wesphere.vercel.app/");
            window.close();
          </script>
        </body>
      </html>
    `);
  }

  static async toggleFollow(req, res) {
    try {
      const { id: follower_id } = req.user; // ID del usuario actual
      const { user_id: following_id } = req.params; // ID del usuario a seguir/dejar de seguir
  
      // Verificar si ya sigue al usuario
      const existingFollow = await Follower.findOne({
        where: { follower_id, following_id }
      });
  
      if (existingFollow) {
        // Si ya lo sigue, eliminar la relación
        await existingFollow.destroy();
        return res.json({ following: false });
      } else {
        // Si no lo sigue, crear la relación
        await Follower.create({ follower_id, following_id });
        return res.json({ following: true });
      }
    } catch (error) {
      console.error('Error en toggleFollow:', error);
      res.status(500).json({ error: 'Error al gestionar el seguimiento' });
    }
  }

  static async getFollowStatus(req, res) {
    try {
      const { id: follower_id } = req.user; // ID del usuario actual
      const { user_id: following_id } = req.params; // ID del usuario del perfil
  
      const isFollowing = await Follower.findOne({
        where: { follower_id, following_id }
      });
  
      res.json({ isFollowing: !!isFollowing });
    } catch (error) {
      console.error('Error en getFollowStatus:', error);
      res.status(500).json({ error: 'Error al obtener el estado de seguimiento' });
    }
  }

  static async getFriends(req, res) {
    try {
      const { id: follower_id } = req.user; 
  
      const followingRecords = await Follower.findAll({
        where: { follower_id },
        attributes: ['following_id']
      });
  
      const followingIds = followingRecords.map(record => record.following_id);
  
      if (followingIds.length === 0) {
        return res.json({ friends: [] }); 
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


}
