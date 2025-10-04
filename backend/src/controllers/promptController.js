import Prompt from '../models/Prompt.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

// @desc    Create a new prompt
// @route   POST /api/prompts
// @access  Private
export const createPrompt = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      prompt,
      category,
      tags,
      price,
      isPublic,
      image,
      aiModel,
      isPremium
    } = req.body;

    // Debug: Log what we're receiving
    console.log('Received prompt data:', {
      title,
      description,
      prompt,
      category,
      tags,
      price,
      isPublic,
      image,
      imageType: typeof image,
      aiModel,
      isPremium
    });

    // Get user with follower count
    const user = await User.findById(req.user.id);
    const isAdmin = user.role === 'admin';

    // Check if user can create paid prompts (500 follower requirement)
    if (price > 0 && !isAdmin) {
      if (user.followersCount < 500) {
        return res.status(403).json({
          message: 'You need at least 500 followers to create paid prompts',
          currentFollowers: user.followersCount,
          required: 500,
          remaining: 500 - user.followersCount
        });
      }
    }

    // Only admin can create premium content
    if (isPremium && !isAdmin) {
      return res.status(403).json({
        message: 'Only admins can create premium content'
      });
    }

    // Create prompt
    const newPrompt = await Prompt.create({
      title,
      description,
      prompt,
      category,
      tags: tags || [],
      price: price || 0,
      isPublic: isPublic !== undefined ? isPublic : true,
      isPremium: isPremium || false,
      author: req.user.id,
      image: image || null,
      aiModel: aiModel || null
    });

    // Populate author information
    await newPrompt.populate('author', 'name email avatar');

    res.status(201).json(newPrompt);
  } catch (error) {
    console.error('Create prompt error:', error);
    res.status(500).json({ message: 'Server error during prompt creation' });
  }
};

// @desc    Get all prompts for a user
// @route   GET /api/prompts/my-prompts
// @access  Private
export const getMyPrompts = async (req, res) => {
  try {
    // Always use real MongoDB - no more mock data

    const prompts = await Prompt.find({ author: req.user.id })
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(prompts);
  } catch (error) {
    console.error('Get my prompts error:', error);
    res.status(500).json({ message: 'Server error while fetching prompts' });
  }
};

// @desc    Get all public prompts
// @route   GET /api/prompts
// @access  Public
export const getPublicPrompts = async (req, res) => {
  try {
    const { category, tags, page = 1, limit = 10, sort = 'createdAt' } = req.query;
    
    // Build query - show all public prompts (both active and pending)
    const query = { isPublic: true };
    
    if (category) {
      query.category = category;
    }
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Always use real MongoDB - no more mock data

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get prompts with pagination
    const prompts = await Prompt.find(query)
      .populate('author', 'name email avatar')
      .sort({ [sort]: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalPrompts = await Prompt.countDocuments(query);
    const totalPages = Math.ceil(totalPrompts / limit);

    res.json({
      prompts,
      totalPages,
      currentPage: parseInt(page),
      totalPrompts
    });
  } catch (error) {
    console.error('Get public prompts error:', error);
    res.status(500).json({ message: 'Server error while fetching prompts' });
  }
};

// @desc    Get a single prompt by ID
// @route   GET /api/prompts/:id
// @access  Public
export const getPromptById = async (req, res) => {
  try {
    const { id } = req.params;

    // Always use real MongoDB - no more mock data

    const prompt = await Prompt.findById(id)
      .populate('author', 'name email avatar')
      .populate('reviews.user', 'name avatar');

    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    // Check if user can view this prompt
    if (!prompt.isPublic && prompt.author._id.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(prompt);
  } catch (error) {
    console.error('Get prompt by ID error:', error);
    res.status(500).json({ message: 'Server error while fetching prompt' });
  }
};

// @desc    Update a prompt
// @route   PUT /api/prompts/:id
// @access  Private
export const updatePrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if MongoDB is connected
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI === 'mongodb+srv://username:password@cluster.mongodb.net/prompty?retryWrites=true&w=majority') {
      // Mock update for development
      const mockPrompt = {
        _id: id,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      return res.json(mockPrompt);
    }

    const prompt = await Prompt.findById(id);

    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    // Check if user owns this prompt
    if (prompt.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update prompt
    const updatedPrompt = await Prompt.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('author', 'name email avatar');

    res.json(updatedPrompt);
  } catch (error) {
    console.error('Update prompt error:', error);
    res.status(500).json({ message: 'Server error during prompt update' });
  }
};

// @desc    Delete a prompt
// @route   DELETE /api/prompts/:id
// @access  Private
export const deletePrompt = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if MongoDB is connected
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI === 'mongodb+srv://username:password@cluster.mongodb.net/prompty?retryWrites=true&w=majority') {
      // Mock deletion for development
      return res.json({ message: 'Prompt deleted successfully' });
    }

    const prompt = await Prompt.findById(id);

    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    // Check if user owns this prompt
    if (prompt.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Prompt.findByIdAndDelete(id);

    res.json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    console.error('Delete prompt error:', error);
    res.status(500).json({ message: 'Server error during prompt deletion' });
  }
};


// @desc    Increment view count
// @route   POST /api/prompts/:id/view
// @access  Public
export const incrementViewCount = async (req, res) => {
  try {
    const { id } = req.params;
    
    const prompt = await Prompt.findByIdAndUpdate(
      id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    );

    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    res.json({ viewsCount: prompt.viewsCount });
  } catch (error) {
    console.error('Increment view count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add or update rating
// @route   POST /api/prompts/:id/rate
// @access  Private
export const ratePrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const prompt = await Prompt.findById(id);
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    // Check if user already rated this prompt
    const existingReviewIndex = prompt.reviews.findIndex(
      review => review.user.toString() === req.user.id
    );

    if (existingReviewIndex !== -1) {
      // Update existing review
      prompt.reviews[existingReviewIndex].rating = rating;
      prompt.reviews[existingReviewIndex].comment = comment || '';
    } else {
      // Add new review
      prompt.reviews.push({
        user: req.user.id,
        rating,
        comment: comment || ''
      });
    }

    // Calculate average rating
    const totalRating = prompt.reviews.reduce((sum, review) => sum + review.rating, 0);
    prompt.rating = Math.round((totalRating / prompt.reviews.length) * 10) / 10;

    await prompt.save();
    await prompt.populate('reviews.user', 'name profileImage');

    res.json({
      message: 'Rating submitted successfully',
      rating: prompt.rating,
      reviews: prompt.reviews
    });
  } catch (error) {
    console.error('Rate prompt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get prompt ratings
// @route   GET /api/prompts/:id/ratings
// @access  Public
export const getPromptRatings = async (req, res) => {
  try {
    const { id } = req.params;
    
    const prompt = await Prompt.findById(id)
      .populate('reviews.user', 'name profileImage');

    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    res.json({
      rating: prompt.rating,
      totalReviews: prompt.reviews.length,
      reviews: prompt.reviews
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check if user can create paid prompts
// @route   GET /api/prompts/check-eligibility
// @access  Private
export const checkEligibility = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const isAdmin = user.role === 'admin';
    const canEarnMoney = isAdmin || user.followersCount >= 500;

    res.json({
      canEarnMoney,
      isAdmin,
      followersCount: user.followersCount,
      required: 500,
      remaining: Math.max(0, 500 - user.followersCount)
    });
  } catch (error) {
    console.error('Check eligibility error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
