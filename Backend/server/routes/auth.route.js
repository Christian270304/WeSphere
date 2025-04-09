import express from "express";
import { AuthController } from "../controllers/AuthController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/check' ,AuthController.check);
router.get("/user", authMiddleware,  AuthController.getUser);
router.get('/messages/:chat_id', authMiddleware, AuthController.getMessages);
router.get('/chats', authMiddleware,  AuthController.getChats);

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post('/logout', authMiddleware,  AuthController.logout);

export default router;