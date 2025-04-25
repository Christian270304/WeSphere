import express from 'express';
import { PostController } from '../controllers/PostController.js';
import { authMiddleware } from "../middlewares/authMiddleware.js";
import multer from 'multer';

// Moverlo a app.js
const storage = multer.memoryStorage();
const upload = multer({
    storage
});

const uploadMiddleware = upload.fields([
    { name: 'image', maxCount: 1 }, 
    { name: 'video', maxCount: 1 }, 
]);

const router = express.Router();

router.get('/', authMiddleware, PostController.getPosts);
router.get('/user/:id', authMiddleware, PostController.getPostsById);
router.get('/comments/:post_id', authMiddleware, PostController.getComments);
router.get('/savedposts', authMiddleware, PostController.getPostSaved);

router.post('/create', uploadMiddleware, authMiddleware, PostController.createPost);
router.post('/like/:post_id', authMiddleware, PostController.likePost);
router.post('/comment/:post_id', authMiddleware, PostController.postComment);
router.post('/save/:post_id', authMiddleware, PostController.savePost);

// router.post('/upload-image', upload.single('image'), PostController.subirImagens);
// router.get('/:id', PostController.getPost);   
// router.put('/:id', PostController.updatePost);
// router.delete('/:id', PostController.deletePost);

export default router;