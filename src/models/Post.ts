import mongoose, { Schema, Document } from 'mongoose';
import {IPost} from '@src/models/common/types';

export interface IPostDocument extends Omit<IPost, '_id'>, Document {}

const PostSchema = new Schema<IPostDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  src: {
    type: String,
    required: true,
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  like: {
    type: Number,
    default: 0,
    min: 0,
  },
  views: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
});

export const Post = mongoose.model<IPostDocument>('Post', PostSchema);