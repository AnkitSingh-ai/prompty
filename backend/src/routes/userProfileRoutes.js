import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getUserProfile,
  getUserFollowers,
  getUserFollowing
} from '../controllers/userProfileController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// User profile routes
router.get('/:userId', getUserProfile);
router.get('/:userId/followers', getUserFollowers);
router.get('/:userId/following', getUserFollowing);

export default router;
