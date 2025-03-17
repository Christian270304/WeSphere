import express from 'express';
import { PostController } from '../controllers/PostController.js';

const router = express.Router();

router.get('/:id', PostController.getPosts);
router.post('/create', PostController.createPost);
// router.get('/:id', PostController.getPost);   
// router.put('/:id', PostController.updatePost);
// router.delete('/:id', PostController.deletePost);

export default router;