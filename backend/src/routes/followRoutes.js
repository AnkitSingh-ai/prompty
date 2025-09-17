import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  followUser,
  unfollowUser,
  checkFollowStatus,
  getFollowers,
  getFollowing,
  getFollowSuggestions
} from '../controllers/followController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Follow/Unfollow routes
router.post('/:userId', followUser);
router.delete('/:userId', unfollowUser);
router.get('/:userId/status', checkFollowStatus);

// Get followers and following
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);

// Get follow suggestions
router.get('/suggestions', getFollowSuggestions);

export default router;
