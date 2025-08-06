import {IPostDocument, Post} from '@src/models/Post';
import {IPost} from '@src/models/common/types';
import {Comment} from '@src/models/Comment';
import mongoose from 'mongoose';

export class PostService {
  async createPost(postData: IPost): Promise<IPostDocument> {
    const post = new Post(postData);
    return await post.save();
  }

  async getPostById(id: string): Promise<IPostDocument | null> {
    return await Post.findById(id)
        .populate('userId', 'username name')
        .populate({
          path: 'comments',
          populate: {
            path: 'userId',
            select: 'username name',
          },
        });
  }

  async getAllPosts(page = 1, limit = 10): Promise<IPostDocument[]> {
    const skip = (page - 1) * limit;
    return await Post.find()
        .populate('userId', 'username name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
  }

  async getPostsByUserId(userId: string, page = 1, limit = 10): Promise<IPostDocument[]> {
    const skip = (page - 1) * limit;
    return await Post.find({ userId })
        .populate('userId', 'username name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
  }

  async updatePost(id: string, updateData: Partial<IPost>): Promise<IPostDocument | null> {
    return await Post.findByIdAndUpdate(id, updateData, { new: true })
        .populate('userId', 'username name');
  }

  async deletePost(id: string): Promise<boolean> {
    await Comment.deleteMany({ postId: id });
    const result = await Post.findByIdAndDelete(id);
    return !!result;
  }

  async incrementViews(id: string, userId?: string): Promise<IPostDocument | null> {
    if (!userId) {
      return await Post.findById(id);
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    return await Post.findByIdAndUpdate(
        id,
        { $addToSet: { views: userObjectId } },
        { new: true }
    );
  }

  async toggleLike(id: string, userId: string, isLiking: boolean): Promise<IPostDocument | null> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const updateOperation = isLiking
        ? { $addToSet: { likes: userObjectId } }
        : { $pull: { likes: userObjectId } };

    return await Post.findByIdAndUpdate(
        id,
        updateOperation,
        { new: true }
    );
  }

  async hasUserLiked(postId: string, userId: string): Promise<boolean> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const post = await Post.findById(postId).select('likes');

    if (!post) return false;

    return post.likes.some(like => like.equals(userObjectId));
  }

  async hasUserViewed(postId: string, userId: string): Promise<boolean> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const post = await Post.findById(postId).select('views');

    if (!post) return false;

    return post.views.some(view => view.equals(userObjectId));
  }

  async getLikeCount(postId: string): Promise<number> {
    const post = await Post.findById(postId).select('likes');
    return post ? post.likes.length : 0;
  }

  async getViewCount(postId: string): Promise<number> {
    const post = await Post.findById(postId).select('views');
    return post ? post.views.length : 0;
  }
}