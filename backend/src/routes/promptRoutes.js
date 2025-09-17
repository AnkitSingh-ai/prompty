import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import {
  createPrompt,
  getMyPrompts,
  getPublicPrompts,
  getPromptById,
  updatePrompt,
  deletePrompt
} from '../controllers/promptController.js';

const router = express.Router();

// Validation middleware
const promptValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  body('prompt')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Prompt content must be between 1 and 2000 characters'),
  body('category')
    .isIn([
      'Art & Design',
      'Photography',
      'Writing',
      'Marketing',
      'Business',
      'Education',
      'Entertainment',
      'Technology',
      'Other'
    ])
    .withMessage('Invalid category'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value')
];

// Public routes
router.get('/', getPublicPrompts); // Get all public prompts

// Protected routes (require authentication)
router.use(protect); // Apply authentication middleware to all routes below

router.post('/', promptValidation, createPrompt); // Create a new prompt
router.get('/my-prompts', getMyPrompts); // Get user's own prompts

// Parameterized routes (must come after specific routes)
router.get('/:id', getPromptById); // Get a single prompt by ID
router.put('/:id', promptValidation, updatePrompt); // Update a prompt
router.delete('/:id', deletePrompt); // Delete a prompt

export default router;

