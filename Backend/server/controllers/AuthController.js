import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/UserModel.js';

export class AuthController {
  static async register(req, res) {
    try {
      const { username, email, password, profile_picture = null, banner = null, bio = null, is_private = false, created_at = new Date() } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
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

      res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
