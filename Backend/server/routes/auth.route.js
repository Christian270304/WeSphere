import express from "express";
// import passport from "../config/passport-google.js"; 
// import passport from "../config/passport-discord.js"; 
import passport from "../config/passport-reddit.js";
import "../config/passport-discord.js";
import "../config/passport-google.js";
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({
    storage
});

import { AuthController } from "../controllers/AuthController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/', authMiddleware, AuthController.getNotifications);
router.get('/check' ,AuthController.check);
router.get("/user", authMiddleware,  AuthController.getUser);
router.get("/user/:user_id", authMiddleware,  AuthController.getUserById);
router.get("/profile/:username", authMiddleware,  AuthController.getUserByUsername);
router.get('/messages/:chat_id', authMiddleware, AuthController.getMessages);
router.get('/chats', authMiddleware,  AuthController.getChats);
router.get('/users/:user_id/follow-status', authMiddleware, AuthController.getFollowStatus);
router.get('/friends', authMiddleware, AuthController.getFriends);
router.get('/sugerencias', authMiddleware, AuthController.getSugerencias);
router.get('/status/profile', authMiddleware, AuthController.getProfileStatus);
router.get('/follow/:userId', authMiddleware, AuthController.getFollowStatusById);


router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post('/logout', authMiddleware,  AuthController.logout);
router.post('/newMessage', authMiddleware, AuthController.newMessage);
router.post('/users/:user_id/follow', authMiddleware, AuthController.toggleFollow);
router.post('/chat/create', authMiddleware, AuthController.createChat);
router.post('/status/profile', authMiddleware, AuthController.updateProfileStatus);

router.delete('/user/delete', authMiddleware, AuthController.deleteAccount);

router.put('/user/edit', upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 }
]), authMiddleware, AuthController.updateUser);

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

// Rutas Reddit
router.get('/reddit', 
  passport.authenticate('reddit')
);

router.get('/reddit/callback',
  passport.authenticate('reddit', { failureRedirect: '/' }),
  AuthController.redditCallback
);

// Rutas Discord
router.get('/discord', 
  passport.authenticate('discord')
);

router.get('/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/' }),
  AuthController.discordCallback
);

export default router;