import {Comment, ICommentDocument} from '@src/models/Comment';
import {IComment} from '@src/models/common/types';
import {Post} from '@src/models/Post';

export class CommentService {
  async createComment(commentData: IComment): Promise<ICommentDocument> {
    const comment = new Comment(commentData);
    const savedComment = await comment.save();

    if (commentData.postId) {
      await Post.findByIdAndUpdate(
        commentData.postId,
        { $push: { comments: savedComment._id } },
      );
    }
    return savedComment;
  }

  async getCommentById(id: string): Promise<ICommentDocument | null> {
    return await Comment.findById(id)
      .populate('userId', 'username name');
  }

  async getCommentsByPostId(postId: string): Promise<ICommentDocument[]> {
    return await Comment.find({ postId, parentCommentId: null })
      .populate('userId', 'username name')
      .sort({ createdAt: -1 });
  }

  async getRepliesByParentId(parentCommentId: string): Promise<ICommentDocument[]> {
    return await Comment.find({ parentCommentId })
      .populate('userId', 'username name')
      .sort({ createdAt: 1 });
  }

  async updateComment(id: string, updateData: Partial<IComment>): Promise<ICommentDocument | null> {
    return await Comment.findByIdAndUpdate(id, updateData, { new: true })
      .populate('userId', 'username name');
  }

  async deleteComment(id: string): Promise<boolean> {
    const comment = await Comment.findById(id);
    if (!comment) return false;

    if (comment.postId) {
      await Post.findByIdAndUpdate(
        comment.postId,
        { $pull: { comments: id } },
      );
    }



    await Comment.deleteMany({ parentCommentId: id });

    const result = await Comment.findByIdAndDelete(id);
    return !!result;
  }

  async toggleLike(id: string, increment: boolean): Promise<ICommentDocument | null> {
    return await Comment.findByIdAndUpdate(
      id,
      { $inc: { like: increment ? 1 : -1 } },
      { new: true },
    );
  }
}