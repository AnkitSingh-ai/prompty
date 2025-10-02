import express from 'express';
import {
  getAdminStats,
  getRecentUsers,
  getPendingPrompts,
  approvePrompt,
  rejectPrompt,
  getAllUsers,
  getRevenueAnalytics
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get admin dashboard statistics
router.get('/stats', getAdminStats);

// Get recent users
router.get('/users/recent', getRecentUsers);

// Get all users with pagination
router.get('/users', getAllUsers);

// Get pending prompts for review
router.get('/prompts/pending', getPendingPrompts);

// Approve a prompt
router.put('/prompts/:promptId/approve', approvePrompt);

// Reject a prompt
router.put('/prompts/:promptId/reject', rejectPrompt);

// Get revenue analytics
router.get('/revenue', getRevenueAnalytics);

export default router;
