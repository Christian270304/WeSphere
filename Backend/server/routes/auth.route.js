import express from "express";
import passport from "../config/passport-google.js";
import { AuthController } from "../controllers/AuthController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/check' ,AuthController.check);
router.get("/user", authMiddleware,  AuthController.getUser);
router.get("/user/:user_id", authMiddleware,  AuthController.getUserById);
router.get('/messages/:chat_id', authMiddleware, AuthController.getMessages);
router.get('/chats', authMiddleware,  AuthController.getChats);

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post('/logout', authMiddleware,  AuthController.logout);
router.post('/newMessage', authMiddleware, AuthController.newMessage);

// Rutas google
router.get('/google',
    passport.authenticate('google', {
      scope: ['profile', 'email'],
    })
  );

  router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    AuthController.googleCallback
  );

export default router;