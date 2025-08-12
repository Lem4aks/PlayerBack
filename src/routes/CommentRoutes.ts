import { Router } from 'express';
import {CommentController} from "@src/Controllers/CommentController";
import {authMiddleware, userAuthMiddleware} from "@src/middleware/auth";

const router = Router();
const commentController = new CommentController();

router.post('/', authMiddleware, commentController.createComment);
router.get('/:id', commentController.getComment);
router.get('/post/:postId', userAuthMiddleware, commentController.getPostComments);
router.get('/:parentCommentId/replies', commentController.getReplies);
router.put('/:id', authMiddleware, commentController.updateComment);
router.delete('/:id', authMiddleware, commentController.deleteComment);
router.patch('/:id/like', authMiddleware, commentController.likeComment);

export { router as commentRoutes };