import {Comment, ICommentDocument} from '@src/models/Comment';
import {IComment} from '@src/models/common/types';
import {Post} from '@src/models/Post';
import mongoose from 'mongoose';

export class CommentService {
  async createComment(commentData: IComment): Promise<ICommentDocument> {
    const comment = new Comment(commentData);
    const savedComment = await comment.save();
    const populatedComment = await Comment.findById(savedComment._id)
        .populate('userId', 'username name');
    
    if (!populatedComment) {
      throw new Error('Failed to create comment');
    }
    
    return populatedComment;
  }

  async getCommentById(id: string): Promise<ICommentDocument | null> {
    return await Comment.findById(id)
        .populate('userId', 'username name');
  }

  async getCommentsByPostId(
      postId: string,
      page: number = 1,
      limit: number = 10
  ): Promise<{ comments: ICommentDocument[], totalCount: number, totalPages: number }> {
    const skip = (page - 1) * limit;

    const totalCount = await Comment.countDocuments({ postId, parentCommentId: null });
    const totalPages = Math.ceil(totalCount / limit);

    const comments = await Comment.find({ postId, parentCommentId: null })
        .populate('userId', 'username name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return {
      comments,
      totalCount,
      totalPages
    };
  }

  async getRepliesByParentId(parentCommentId: string, page: number = 1, limit: number = 10): Promise<{ replies: ICommentDocument[], totalCount: number, totalPages: number }> {
    const skip = (page - 1) * limit;

    const totalCount = await Comment.countDocuments({ parentCommentId });
    const totalPages = Math.ceil(totalCount / limit);

    const replies = await Comment.find({ parentCommentId })
        .populate('userId', 'username name')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit);

    return {
      replies,
      totalCount,
      totalPages
    };
  }

  async updateComment(id: string, updateData: Partial<IComment>): Promise<ICommentDocument | null> {
    return await Comment.findByIdAndUpdate(id, updateData, { new: true })
        .populate('userId', 'username name');
  }

  async deleteComment(id: string): Promise<boolean> {
    const comment = await Comment.findById(id);
    if (!comment) return false;

    await Comment.deleteMany({ parentCommentId: id });

    const result = await Comment.findByIdAndDelete(id);
    return !!result;
  }

  async toggleLike(id: string, userId: string, isLiking: boolean): Promise<ICommentDocument | null> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const updateOperation = isLiking
        ? { $addToSet: { likes: userObjectId } }
        : { $pull: { likes: userObjectId } };

    return await Comment.findByIdAndUpdate(
        id,
        updateOperation,
        { new: true }
    );
  }

  async hasUserLiked(commentId: string, userId: string): Promise<boolean> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const comment = await Comment.findById(commentId).select('likes');

    if (!comment) return false;

    return comment.likes.some(like => like.equals(userObjectId));
  }

  async getLikeCount(commentId: string): Promise<number> {
    const comment = await Comment.findById(commentId).select('likes');
    return comment ? comment.likes.length : 0;
  }

  async getChildCommentCount(parentCommentId: string): Promise<number> {
    return await Comment.countDocuments({ parentCommentId });
  }
}