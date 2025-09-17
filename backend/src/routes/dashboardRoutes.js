import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getDashboardStats,
  getPromptAnalytics,
  getMarketplaceStats
} from '../controllers/dashboardController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Dashboard statistics
router.get('/stats', getDashboardStats);

// Prompt analytics
router.get('/analytics/prompt/:promptId', getPromptAnalytics);

// Marketplace statistics
router.get('/marketplace-stats', getMarketplaceStats);

export default router;
