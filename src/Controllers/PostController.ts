import { Request, Response } from 'express';
import {AuthRequest} from "@src/models/common/types";
import {PostService} from "@src/services/PostService";
import mongoose from "mongoose";

export class PostController {
    private postService: PostService;

    constructor() {
        this.postService = new PostService();
    }

    createPost = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { src } = req.body;

            if (!src) {
                res.status(400).json({ message: 'Source is required' });
                return;
            }

            const userId = new mongoose.Types.ObjectId(req.user!.userId);

            const post = await this.postService.createPost({
                userId: userId,
                src,
                comments: [],
                like: 0,
                views: 0
            });

            res.status(201).json({ message: 'Post created successfully', post });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };

    getPost = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const post = await this.postService.getPostById(id);

            if (!post) {
                res.status(404).json({ message: 'Post not found' });
                return;
            }

            // Increment views
            await this.postService.incrementViews(id);

            res.json({ post });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    };

    getAllPosts = async (req: Request, res: Response): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const posts = await this.postService.getAllPosts(page, limit);
            res.json({ posts, page, limit });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    };

    getUserPosts = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const posts = await this.postService.getPostsByUserId(userId, page, limit);
            res.json({ posts, page, limit });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    };

    updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { src } = req.body;

            const post = await this.postService.updatePost(id, { src });

            if (!post) {
                res.status(404).json({ message: 'Post not found' });
                return;
            }

            res.json({ message: 'Post updated successfully', post });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    };

    deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const deleted = await this.postService.deletePost(id);

            if (!deleted) {
                res.status(404).json({ message: 'Post not found' });
                return;
            }

            res.json({ message: 'Post deleted successfully' });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    };

    likePost = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { increment } = req.body;

            const post = await this.postService.toggleLike(id, increment);

            if (!post) {
                res.status(404).json({ message: 'Post not found' });
                return;
            }

            res.json({ message: 'Post like updated', post });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    };
}