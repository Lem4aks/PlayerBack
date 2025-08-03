import jwt from 'jsonwebtoken';
import {IUser} from '@src/models/common/types';
import {IUserDocument, User} from '@src/models/User';
import ENV from '@src/common/constants/ENV';

export class UserService {
  async createUser(userData: IUser): Promise<IUserDocument> {
    const existingUser = await User.findOne({
      $or: [{ email: userData.email }, { username: userData.username }],
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    const user = new User(userData);
    return await user.save();
  }

  async loginUser(email: string, password: string): Promise<{ user: IUserDocument, token: string }> {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      ENV.Jwt,
      { expiresIn: '1h' },
    );

    return { user, token };
  }

  async getUserById(id: string): Promise<IUserDocument | null> {
    return await User.findById(id);
  }

  async getUserByUsername(username: string): Promise<IUserDocument | null> {
    return await User.findOne({ username });
  }

  async updateUser(id: string, updateData: Partial<IUser>): Promise<IUserDocument | null> {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }
}