import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  likePrompt,
  unlikePrompt,
  checkLikeStatus,
  getLikeStatuses
} from '../controllers/likeController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Like management routes
router.post('/:promptId', likePrompt);
router.delete('/:promptId', unlikePrompt);
router.get('/:promptId/status', checkLikeStatus);

// Get multiple like statuses
router.post('/statuses', getLikeStatuses);

export default router;
