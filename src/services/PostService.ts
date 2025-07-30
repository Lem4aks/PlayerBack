import {IPostDocument, Post} from "@src/models/Post";
import {IPost} from "@src/models/common/types";
import {Comment} from "@src/models/Comment";

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
                    select: 'username name'
                }
            });
    }

    async getAllPosts(page: number = 1, limit: number = 10): Promise<IPostDocument[]> {
        const skip = (page - 1) * limit;
        return await Post.find()
            .populate('userId', 'username name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }

    async getPostsByUserId(userId: string, page: number = 1, limit: number = 10): Promise<IPostDocument[]> {
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

    async incrementViews(id: string): Promise<IPostDocument | null> {
        return await Post.findByIdAndUpdate(
            id,
            { $inc: { views: 1 } },
            { new: true }
        );
    }

    async toggleLike(id: string, increment: boolean): Promise<IPostDocument | null> {
        return await Post.findByIdAndUpdate(
            id,
            { $inc: { like: increment ? 1 : -1 } },
            { new: true }
        );
    }
}