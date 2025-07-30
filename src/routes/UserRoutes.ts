import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {UserController} from "@src/Controllers/UserController";

const router = Router();
const userController = new UserController();

router.post('/register', userController.register);
router.post('/login', userController.login);
    router.get('/profile', authMiddleware, userController.getProfile);
router.get('/:username', userController.getUserByUsername);
router.put('/profile', authMiddleware, userController.updateProfile);
router.delete('/profile', authMiddleware, userController.deleteProfile);

export { router as userRoutes };