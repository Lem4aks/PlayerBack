import { Router } from 'express';
import {PostController} from "@src/Controllers/PostController";
import {authMiddleware} from "@src/middleware/auth";

const router = Router();
const postController = new PostController();

router.post('/', authMiddleware, postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPost);
router.get('/user/:userId', postController.getUserPosts);
router.put('/:id', authMiddleware, postController.updatePost);
router.delete('/:id', authMiddleware, postController.deletePost);
router.patch('/:id/like', authMiddleware, postController.likePost);

export { router as postRoutes };