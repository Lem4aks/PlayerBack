import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';
import {IUser} from '@src/models/common/types';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
}, {
  timestamps: true,
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(this.password, salt, 10000, 64, 'sha512').toString('hex');
  this.password = `${salt}:${hash}`;
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  const [salt, hash] = this.password.split(':');
  const compareHash = crypto.pbkdf2Sync(candidatePassword,  salt, 10000, 64, 'sha512').toString('hex');
  return hash === compareHash;
};

UserSchema.set('toJSON', {
  transform: function(doc, ret: Record<string, any>) {
    delete ret.password;
    return ret;
  },
});

export const User = mongoose.model<IUserDocument>('User', UserSchema);