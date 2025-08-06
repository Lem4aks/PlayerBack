import mongoose from 'mongoose';
import { Request } from 'express';

export interface IUser {
  _id?: string;
  username: string;
  name: string;
  password: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPost {
  _id?: string;
  userId: mongoose.Types.ObjectId;
  title: string;
  type: 'video' | 'image' | 'text';
  description?: string;
  src?: string;
  content?: string;
  comments: mongoose.Types.ObjectId[];
  likes: mongoose.Types.ObjectId[];
  views: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IComment {
  _id?: string;
  userId: mongoose.Types.ObjectId;
  postId?: mongoose.Types.ObjectId;
  parentCommentId?: mongoose.Types.ObjectId;
  content: string;
  likes: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string,
    username: string,
  };
}