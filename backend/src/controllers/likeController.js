import Like from '../models/Like.js';
import Prompt from '../models/Prompt.js';

// Like a prompt
export const likePrompt = async (req, res) => {
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

    // Check if already liked
    const existingLike = await Like.findOne({
      user: userId,
      prompt: promptId
    });

    if (existingLike) {
      return res.status(400).json({
        success: false,
        error: 'Prompt already liked'
      });
    }

    // Create like
    const like = new Like({
      user: userId,
      prompt: promptId
    });

    await like.save();

    // Update prompt like count
    await Prompt.findByIdAndUpdate(promptId, {
      $inc: { likesCount: 1 }
    });

    res.json({
      success: true,
      message: 'Prompt liked successfully',
      like: {
        id: like._id,
        user: userId,
        prompt: promptId,
        createdAt: like.createdAt
      }
    });
  } catch (error) {
    console.error('Like prompt error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like prompt'
    });
  }
};

// Unlike a prompt
export const unlikePrompt = async (req, res) => {
  try {
    const { promptId } = req.params;
    const userId = req.user._id;

    const like = await Like.findOneAndDelete({
      user: userId,
      prompt: promptId
    });

    if (!like) {
      return res.status(400).json({
        success: false,
        error: 'Prompt not liked'
      });
    }

    // Update prompt like count
    await Prompt.findByIdAndUpdate(promptId, {
      $inc: { likesCount: -1 }
    });

    res.json({
      success: true,
      message: 'Prompt unliked successfully'
    });
  } catch (error) {
    console.error('Unlike prompt error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unlike prompt'
    });
  }
};

// Check if prompt is liked by user
export const checkLikeStatus = async (req, res) => {
  try {
    const { promptId } = req.params;
    const userId = req.user._id;

    const like = await Like.findOne({
      user: userId,
      prompt: promptId
    });

    res.json({
      success: true,
      isLiked: !!like
    });
  } catch (error) {
    console.error('Check like status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check like status'
    });
  }
};

// Get multiple like statuses for a list of prompts
export const getLikeStatuses = async (req, res) => {
  try {
    const { promptIds } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(promptIds)) {
      return res.status(400).json({
        success: false,
        error: 'promptIds must be an array'
      });
    }

    const likes = await Like.find({
      user: userId,
      prompt: { $in: promptIds }
    });

    const likeMap = {};
    likes.forEach(like => {
      likeMap[like.prompt.toString()] = true;
    });

    res.json({
      success: true,
      likeStatuses: likeMap
    });
  } catch (error) {
    console.error('Get like statuses error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch like statuses'
    });
  }
};
