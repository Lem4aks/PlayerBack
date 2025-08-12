import { Request, Response } from 'express';
import {AuthRequest} from '@src/models/common/types';
import {PostService} from '@src/services/PostService';
import mongoose from 'mongoose';

export class PostController {
  private postService: PostService;

  constructor() {
    this.postService = new PostService();
  }

  createPost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { title, type, description, src, content } = req.body;

      if (!title || !type) {
        res.status(400).json({ message: 'Title and type are required' });
        return;
      }

      if (!['video', 'image', 'text'].includes(type)) {
        res.status(400).json({ message: 'Type must be video, image, or text' });
        return;
      }

      if ((type === 'video' || type === 'image') && !src) {
        res.status(400).json({ message: 'Source is required for video and image posts' });
        return;
      }

      if (type === 'text' && !content) {
        res.status(400).json({ message: 'Content is required for text posts' });
        return;
      }

      const userId = new mongoose.Types.ObjectId(req.user!.userId);

      const post = await this.postService.createPost({
        userId: userId,
        title,
        type,
        description,
        src,
        content,
        likes: [],
        views: [],
      });

      const populatedPost = await this.postService.getPostById((post as any)._id.toString());

      res.status(201).json({ 
        message: 'Post created successfully', 
        post: populatedPost 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  recordView = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const post = await this.postService.getPostById(id);

      if (!post) {
        res.status(404).json({ message: 'Post not found' });
        return;
      }

      if (userId) {
        const alreadyViewed = await this.postService.hasUserViewed(id, userId);

        if (!alreadyViewed) {
          await this.postService.incrementViews(id, userId);

          const viewCount = await this.postService.getViewCount(id);

          res.json({
            message: 'View recorded successfully',
            viewCount,
            postId: id,
            success: true,
          });
        } else {
          const viewCount = await this.postService.getViewCount(id);
          res.json({
            message: 'Post already viewed by user',
            viewCount,
            postId: id,
            success: false,
          });
        }
      } else {
        const viewCount = await this.postService.getViewCount(id);
        res.json({
          message: 'View not recorded - user not authenticated',
          viewCount,
          postId: id,
          success: false,
        });
      }
    } catch (error: any) {
      console.error('Error recording view:', error);
      res.status(500).json({ message: error.message, success: false });
    }
  };

  getPost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const post = await this.postService.getPostById(id);

      if (!post) {
        res.status(404).json({ message: 'Post not found' });
        return;
      }

      if (userId) {
        await this.postService.incrementViews(id, userId);
      }

      const responseData: any = { post };
      if (userId) {
        responseData.userInteraction = {
          isLiked: await this.postService.hasUserLiked(id, userId),
          isViewed: await this.postService.hasUserViewed(id, userId),
        };
      }

      responseData.counts = {
        likes: await this.postService.getLikeCount(id),
        views: await this.postService.getViewCount(id),
        comments: await this.postService.getCommentCount(id),
      };

      res.json(responseData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getAllPosts = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 2;

      const posts = await this.postService.getAllPosts(page, limit);

      const postsWithCounts = await Promise.all(
        posts.map(async (post) => {
          const counts = {
            likes: await this.postService.getLikeCount(post._id.toString()),
            views: await this.postService.getViewCount(post._id.toString()),
            comments: await this.postService.getCommentCount(post._id.toString()),
          };
          
          return {
            ...post.toObject(),
            counts,
          };
        }),
      );

      res.json({ posts: postsWithCounts, page, limit });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getUserPosts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 2;

      const posts = await this.postService.getPostsByUserId(userId, page, limit);

      const postsWithCounts = await Promise.all(
        posts.map(async (post) => {
          const counts = {
            likes: await this.postService.getLikeCount(post._id.toString()),
            views: await this.postService.getViewCount(post._id.toString()),
            comments: await this.postService.getCommentCount(post._id.toString()),
          };
          
          return {
            ...post.toObject(),
            counts,
          };
        }),
      );

      res.json({ posts: postsWithCounts, page, limit });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, type, description, src, content } = req.body;

      if (type && !['video', 'image', 'text'].includes(type)) {
        res.status(400).json({ message: 'Type must be video, image, or text' });
        return;
      }

      if (type === 'text' && !content && !src) {
        res.status(400).json({ message: 'Content is required for text posts' });
        return;
      }

      if ((type === 'video' || type === 'image') && !src) {
        res.status(400).json({ message: 'Source is required for video and image posts' });
        return;
      }

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (type !== undefined) updateData.type = type;
      if (description !== undefined) updateData.description = description;
      if (src !== undefined) updateData.src = src;
      if (content !== undefined) updateData.content = content;

      const post = await this.postService.updatePost(id, updateData);

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
      const { isLiking } = req.body;
      const userId = req.user!.userId;

      if (typeof isLiking !== 'boolean') {
        res.status(400).json({ message: 'isLiking must be a boolean value' });
        return;
      }

      const post = await this.postService.toggleLike(id, userId, isLiking);

      if (!post) {
        res.status(404).json({ message: 'Post not found' });
        return;
      }

      const likesCount = await this.postService.getLikeCount(id);
      const hasLiked = await this.postService.hasUserLiked(id, userId);

      res.json({
        message: `Post ${isLiking ? 'liked' : 'unliked'} successfully`,
        post,
        likesCount,
        hasLiked,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}