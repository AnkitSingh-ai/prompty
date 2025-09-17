import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  addComment,
  getComments,
  deleteComment
} from '../controllers/commentController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Comment management routes
router.post('/:promptId', addComment);
router.get('/:promptId', getComments);
router.delete('/:commentId', deleteComment);

export default router;
