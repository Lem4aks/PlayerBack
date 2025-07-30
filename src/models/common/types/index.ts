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
  src: string;
  comments: mongoose.Types.ObjectId[];
  like: number;
  views: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IComment {
  _id?: string;
  userId: mongoose.Types.ObjectId;
  postId?: mongoose.Types.ObjectId;
  parentCommentId?: mongoose.Types.ObjectId;
  content: string;
  like: number;
  replies: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string,
    username: string,
  };
}