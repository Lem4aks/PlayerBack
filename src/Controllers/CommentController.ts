import {Response } from 'express';
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
        likes: [],
      });

      res.status(201).json({ message: 'Comment created successfully', comment });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const comment = await this.commentService.getCommentById(id);

      if (!comment) {
        res.status(404).json({ message: 'Comment not found' });
        return;
      }

      const [childCount, userInteraction] = await Promise.all([
        this.commentService.getChildCommentCount(id),
        userId ? {
          isLiked: await this.commentService.hasUserLiked(id, userId),
        } : {},
      ]);

      const responseData: any = {
        comment: {
          ...comment.toObject(),
          counts: {
            likes: await this.commentService.getLikeCount(id),
            children: childCount,
          },
          ...(userId && { userInteraction }),
        },
      };

      res.json(responseData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getPostComments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { postId } = req.params;
      const { page = '1', limit = '10' } = req.query;
      const userId = req.user?.userId;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        res.status(400).json({ message: 'Invalid pagination parameters' });
        return;
      }

      const result = await this.commentService.getCommentsByPostId(postId, pageNum, limitNum);

      const commentsWithCounts = await Promise.all(
        result.comments.map(async (comment) => {
          const [counts, userInteraction] = await Promise.all([
            {
              likes: await this.commentService.getLikeCount(comment._id.toString()),
              children: await this.commentService.getChildCommentCount(comment._id.toString()),
            },
            userId ? {
              isLiked: await this.commentService.hasUserLiked(comment._id.toString(), userId),
            } : {},
          ]);

          return {
            ...comment.toObject(),
            counts,
            ...(userId && { userInteraction }),
          };
        }),
      );

      res.json({
        ...result,
        comments: commentsWithCounts,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getReplies = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { parentCommentId } = req.params;
      const { page = '1', limit = '10' } = req.query;
      const userId = req.user?.userId;

      if (!parentCommentId) {
        res.status(400).json({ message: 'Parent comment ID is required' });
        return;
      }

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        res.status(400).json({ message: 'Invalid pagination parameters' });
        return;
      }

      const result = await this.commentService.getRepliesByParentId(parentCommentId, pageNum, limitNum);

      const repliesWithCounts = await Promise.all(
        result.replies.map(async (reply) => {
          const [counts, userInteraction] = await Promise.all([
            {
              likes: await this.commentService.getLikeCount(reply._id.toString()),
            },
            userId ? {
              isLiked: await this.commentService.hasUserLiked(reply._id.toString(), userId),
            } : {},
          ]);

          return {
            ...reply.toObject(),
            counts,
            ...(userId && { userInteraction }),
          };
        }),
      );

      res.json({
        ...result,
        replies: repliesWithCounts,
      });
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
      const { isLiking } = req.body;
      const userId = req.user!.userId;

      if (typeof isLiking !== 'boolean') {
        res.status(400).json({ message: 'isLiking must be a boolean value' });
        return;
      }

      const comment = await this.commentService.toggleLike(id, userId, isLiking);

      if (!comment) {
        res.status(404).json({ message: 'Comment not found' });
        return;
      }

      const likesCount = await this.commentService.getLikeCount(id);
      const hasLiked = await this.commentService.hasUserLiked(id, userId);

      res.json({
        message: `Comment ${isLiking ? 'liked' : 'unliked'} successfully`,
        comment,
        likesCount,
        hasLiked,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}