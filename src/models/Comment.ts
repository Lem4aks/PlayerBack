import mongoose, { Schema, Document } from 'mongoose';
import {IComment} from '@src/models/common/types';

export interface ICommentDocument extends Omit<IComment, '_id'>, Document {}

const CommentSchema = new Schema<ICommentDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
  },
  parentCommentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  like: {
    type: Number,
    default: 0,
    min: 0,
  },
  replies: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  }],
}, {
  timestamps: true,
});

export const Comment = mongoose.model<ICommentDocument>('Comment', CommentSchema);