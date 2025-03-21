import express from "express";
import { AuthController } from "../controllers/AuthController.js";

const router = express.Router();

router.get("/user/:id", AuthController.getUser);
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

export default router;
