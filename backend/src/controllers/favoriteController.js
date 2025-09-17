import Favorite from '../models/Favorite.js';
import Prompt from '../models/Prompt.js';

// Add prompt to favorites
export const addToFavorites = async (req, res) => {
  try {
    const { promptId } = req.params;
    const userId = req.user._id;

    // Check if prompt exists
    const prompt = await Prompt.findById(promptId);
    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: 'Prompt not found'
      });
    }

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({
      user: userId,
      prompt: promptId
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        error: 'Prompt already in favorites'
      });
    }

    // Add to favorites
    const favorite = new Favorite({
      user: userId,
      prompt: promptId
    });

    await favorite.save();

    res.json({
      success: true,
      message: 'Prompt added to favorites',
      favorite: {
        id: favorite._id,
        user: userId,
        prompt: promptId,
        createdAt: favorite.createdAt
      }
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add prompt to favorites'
    });
  }
};

// Remove prompt from favorites
export const removeFromFavorites = async (req, res) => {
  try {
    const { promptId } = req.params;
    const userId = req.user._id;

    const favorite = await Favorite.findOneAndDelete({
      user: userId,
      prompt: promptId
    });

    if (!favorite) {
      return res.status(400).json({
        success: false,
        error: 'Prompt not in favorites'
      });
    }

    res.json({
      success: true,
      message: 'Prompt removed from favorites'
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove prompt from favorites'
    });
  }
};

// Check if prompt is in favorites
export const checkFavoriteStatus = async (req, res) => {
  try {
    const { promptId } = req.params;
    const userId = req.user._id;

    const favorite = await Favorite.findOne({
      user: userId,
      prompt: promptId
    });

    res.json({
      success: true,
      isFavorite: !!favorite
    });
  } catch (error) {
    console.error('Check favorite status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check favorite status'
    });
  }
};

// Get user's favorite prompts
export const getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get favorites with prompt details
    const favorites = await Favorite.find({ user: userId })
      .populate({
        path: 'prompt',
        populate: {
          path: 'author',
          select: 'name avatar profileImage'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const totalFavorites = await Favorite.countDocuments({ user: userId });

    // Filter out favorites where prompt might be deleted
    const validFavorites = favorites.filter(fav => fav.prompt);

    res.json({
      success: true,
      favorites: validFavorites.map(favorite => ({
        id: favorite._id,
        prompt: {
          id: favorite.prompt._id,
          title: favorite.prompt.title,
          description: favorite.prompt.description,
          category: favorite.prompt.category,
          price: favorite.prompt.price,
          image: favorite.prompt.image,
          author: favorite.prompt.author,
          createdAt: favorite.prompt.createdAt
        },
        favoritedAt: favorite.createdAt
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalFavorites / limit),
        totalFavorites,
        hasNext: page < Math.ceil(totalFavorites / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch favorites'
    });
  }
};

// Get multiple favorite statuses for a list of prompts
export const getFavoriteStatuses = async (req, res) => {
  try {
    const { promptIds } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(promptIds)) {
      return res.status(400).json({
        success: false,
        error: 'promptIds must be an array'
      });
    }

    const favorites = await Favorite.find({
      user: userId,
      prompt: { $in: promptIds }
    });

    const favoriteMap = {};
    favorites.forEach(fav => {
      favoriteMap[fav.prompt.toString()] = true;
    });

    res.json({
      success: true,
      favoriteStatuses: favoriteMap
    });
  } catch (error) {
    console.error('Get favorite statuses error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch favorite statuses'
    });
  }
};
