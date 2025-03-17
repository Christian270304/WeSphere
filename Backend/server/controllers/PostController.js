import { Post, getRecommendedPosts } from '../models/PostModel.js';

export class PostController {
    static async createPost(req, res) {
        try {
        const { user_id, title,  description, image = null, likes_count = 0, comments_count = 0, allow_comments = true, allow_likes = true, allow_save = true, created_at = new Date() } = req.body;
        const newPost = await Post.create({ user_id, title, description, image, likes_count, comments_count, allow_comments, allow_likes, allow_save, created_at });
    
        res.json({ msg: "Post creado", post: newPost });
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    }
    
    static async getPosts(req, res) {
        try {
        const posts = await getRecommendedPosts(req.params.id);
    
        res.json({ posts });
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    }
    
    static async getPost(req, res) {
        try {
        const { id } = req.params;
        const post = await Post.findByPk(id);
    
        if (!post) return res.status(404).json({ msg: "Post no encontrado" });
    
        res.json({ post });
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    }
    
    static async updatePost(req, res) {
        try {
        const { id } = req.params;
        const { title, content, image } = req.body;
        const post = await Post.findByPk(id);
    
        if (!post) return res.status(404).json({ msg: "Post no encontrado" });
    
        post.title = title;
        post.content = content;
        post.image = image;
        await post.save();
    
        res.json({ msg: "Post actualizado", post });
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    }
    
    static async deletePost(req, res) {
        try {
        const { id } = req.params;
        const post = await Post.findByPk(id);
    
        if (!post) return res.status(404).json({ msg: "Post no encontrado" });
    
        await post.destroy();
    
        res.json({ msg: "Post eliminado" });
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    }
}