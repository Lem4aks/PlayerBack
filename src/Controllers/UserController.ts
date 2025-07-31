import { Request, Response } from 'express';
import {AuthRequest} from '@src/models/common/types';
import {UserService} from '@src/services/UserService';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, name, password, email } = req.body;

      if (!username || !name || !password || !email) {
        res.status(400).json({ message: 'All fields are required' });
        return;
      }

      const user = await this.userService.createUser({ username, name, password, email });
      const { token } = await this.userService.loginUser(email, password);
      res.status(201).json({ message: 'User created successfully', user, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }

      const { user, token } = await this.userService.loginUser(email, password);
      res.json({ message: 'Login successful', user, token });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  };

  getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await this.userService.getUserById(req.user!.userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getUserByUsername = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username } = req.params;
      const user = await this.userService.getUserByUsername(username);

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, email } = req.body;
      const user = await this.userService.updateUser(req.user!.userId, { name, email });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json({ message: 'Profile updated successfully', user });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  deleteProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const deleted = await this.userService.deleteUser(req.user!.userId);

      if (!deleted) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json({ message: 'Profile deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}