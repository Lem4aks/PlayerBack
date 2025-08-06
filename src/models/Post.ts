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
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  views: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});


export const Post = mongoose.model<IPostDocument>('Post', PostSchema);