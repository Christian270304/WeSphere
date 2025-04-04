import express from 'express';
import { PostController } from '../controllers/PostController.js';
import multer from 'multer';

// Moverlo a app.js
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.get('/:id', PostController.getPosts);
router.get('/user/:id', PostController.getPostsByUser);
router.get('/comments/:post_id', PostController.getComments);
router.get('/messages/:chat_id', PostController.getMessages);

router.post('/create', upload.single('image'), PostController.createPost);
router.post('/like/:post_id', PostController.likePost);
router.post('/comment/:post_id', PostController.postComment);

// router.post('/upload-image', upload.single('image'), PostController.subirImagens);
// router.get('/:id', PostController.getPost);   
// router.put('/:id', PostController.updatePost);
// router.delete('/:id', PostController.deletePost);

export default router;