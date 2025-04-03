import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { User } from '../models/models.js';
import { getUser } from '../models/UserQueries.js';

dotenv.config();

const DEFAULT_PROFILE_IMAGE_ID = 1;
const DEFAULT_PROFILE_BANNER_ID = 2;

export class AuthController {
  static async register(req, res) {
    try {
      const { username, email, password, profile_picture = null, banner = null, bio = null, is_private = false, created_at = new Date() } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      if (!profile_picture) profile_picture = DEFAULT_PROFILE_IMAGE_ID;
      if (!banner) banner = DEFAULT_PROFILE_BANNER_ID;
      const newUser = await User.create({ username, email, password: hashedPassword, profile_picture, banner, bio, is_private, created_at });
      
      res.json({ msg: "Usuario registrado", user: newUser });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;
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
      res.json({ user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getUser(req, res) {
    try {
      const { id } = req.params;
      const user = await getUser(id);

      if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

      res.json({ user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async check(req, res) {
    const token = req.cookies.auth_token; // Accede a la cookie desde el backend
    console.log(token);
    if (!token) {
      return res.status(401).json({ authenticated: false });
    }

    try {
      // Verifica el token (por ejemplo, usando JWT)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return res.status(200).json({ authenticated: true, user: decoded });
    } catch (err) {
      return res.status(401).json({ authenticated: false });
    }
  }

  static async logout(req, res) {
    try {
      console.log("Dentro de logout");
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
}
