import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getPurchasedPrompts,
  purchasePrompt,
  downloadPrompt,
  checkPurchaseStatus
} from '../controllers/purchaseController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user's purchased prompts
router.get('/purchased', getPurchasedPrompts);

// Purchase a prompt
router.post('/:promptId', purchasePrompt);

// Download a purchased prompt
router.get('/download/:purchaseId', downloadPrompt);

// Check if user has purchased a specific prompt
router.get('/status/:promptId', checkPurchaseStatus);

export default router;
