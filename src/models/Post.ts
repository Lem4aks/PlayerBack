import mongoose, { Schema, Document } from 'mongoose';
import {IPost} from '@src/models/common/types';

export interface IPostDocument extends Omit<IPost, '_id'>, Document {}

const PostSchema = new Schema<IPostDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['video', 'image', 'text'],
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  src: {
    type: String,
    required: false,
  },
  content: {
    type: String,
    required: false,
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