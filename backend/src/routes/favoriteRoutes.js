import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  addToFavorites,
  removeFromFavorites,
  checkFavoriteStatus,
  getFavorites,
  getFavoriteStatuses
} from '../controllers/favoriteController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Favorite management routes
router.post('/:promptId', addToFavorites);
router.delete('/:promptId', removeFromFavorites);
router.get('/:promptId/status', checkFavoriteStatus);

// Get user's favorites
router.get('/', getFavorites);

// Get multiple favorite statuses
router.post('/statuses', getFavoriteStatuses);

export default router;
