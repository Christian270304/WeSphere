import express from "express";
import { AuthController } from "../controllers/AuthController.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const authMiddleware = (req, res, next) => {
    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).json({ message: "No autorizado" });
    }
  
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ message: "Token inválido" });
    }
  };

router.get('/check' ,AuthController.check);
router.get("/user/:id", authMiddleware,  AuthController.getUser);
router.get('/messages/:chat_id', AuthController.getMessages);

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post('/logout', authMiddleware,  AuthController.logout);

export default router;
