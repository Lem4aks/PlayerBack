import { Request, Response } from 'express';
import {AuthRequest} from '@src/models/common/types';
import {CommentService} from '@src/services/CommentService';
import mongoose from 'mongoose';

export class CommentController {
  private commentService: CommentService;

  constructor() {
    this.commentService = new CommentService();
  }

  createComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { content, postId, parentCommentId } = req.body;

      if (!content) {
        res.status(400).json({ message: 'Content is required' });
        return;
      }

      if (!postId && !parentCommentId) {
        res.status(400).json({ message: 'Either postId or parentCommentId is required' });
        return;
      }

      const userId = new mongoose.Types.ObjectId(req.user!.userId);

      const comment = await this.commentService.createComment({
        userId: userId,
        content,
        postId,
        parentCommentId,
        like: 0,
      });

      res.status(201).json({ message: 'Comment created successfully', comment });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getComment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const comment = await this.commentService.getCommentById(id);

      if (!comment) {
        res.status(404).json({ message: 'Comment not found' });
        return;
      }

      res.json({ comment });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getPostComments = async (req: Request, res: Response): Promise<void> => {
    try {
      const { postId } = req.params;
      const comments = await this.commentService.getCommentsByPostId(postId);
      res.json({ comments });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getReplies = async (req: Request, res: Response): Promise<void> => {
    try {
      const { parentCommentId } = req.params;

      if (!parentCommentId) {
        res.status(400).json({ message: 'Parent comment ID is required' });
        return;
      }

      const replies = await this.commentService.getRepliesByParentId(parentCommentId);
      res.json({ replies });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  updateComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { content } = req.body;

      const comment = await this.commentService.updateComment(id, { content });

      if (!comment) {
        res.status(404).json({ message: 'Comment not found' });
        return;
      }

      res.json({ message: 'Comment updated successfully', comment });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.commentService.deleteComment(id);

      if (!deleted) {
        res.status(404).json({ message: 'Comment not found' });
        return;
      }

      res.json({ message: 'Comment deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  likeComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { increment } = req.body;

      const comment = await this.commentService.toggleLike(id, increment);

      if (!comment) {
        res.status(404).json({ message: 'Comment not found' });
        return;
      }

      res.json({ message: 'Comment like updated', comment });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}