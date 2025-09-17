import Comment from '../models/Comment.js';
import Prompt from '../models/Prompt.js';

// Add a comment to a prompt
export const addComment = async (req, res) => {
  try {
    const { promptId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    // Check if prompt exists
    const prompt = await Prompt.findById(promptId);
    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: 'Prompt not found'
      });
    }

    // Create comment
    const comment = new Comment({
      user: userId,
      prompt: promptId,
      content: content.trim()
    });

    await comment.save();

    // Populate user details
    await comment.populate('user', 'name avatar profileImage');

    // Update prompt comment count
    await Prompt.findByIdAndUpdate(promptId, {
      $inc: { commentsCount: 1 }
    });

    res.json({
      success: true,
      message: 'Comment added successfully',
      comment: {
        id: comment._id,
        content: comment.content,
        user: {
          id: comment.user._id,
          name: comment.user.name,
          avatar: comment.user.avatar,
          profileImage: comment.user.profileImage
        },
        createdAt: comment.createdAt
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add comment'
    });
  }
};

// Get comments for a prompt
export const getComments = async (req, res) => {
  try {
    const { promptId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get comments with user details
    const comments = await Comment.find({ prompt: promptId })
      .populate('user', 'name avatar profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const totalComments = await Comment.countDocuments({ prompt: promptId });

    res.json({
      success: true,
      comments: comments.map(comment => ({
        id: comment._id,
        content: comment.content,
        user: {
          id: comment.user._id,
          name: comment.user.name,
          avatar: comment.user.avatar,
          profileImage: comment.user.profileImage
        },
        createdAt: comment.createdAt
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalComments / limit),
        totalComments,
        hasNext: page < Math.ceil(totalComments / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comments'
    });
  }
};

// Delete a comment (only by the comment author)
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findOneAndDelete({
      _id: commentId,
      user: userId
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found or you are not authorized to delete it'
      });
    }

    // Update prompt comment count
    await Prompt.findByIdAndUpdate(comment.prompt, {
      $inc: { commentsCount: -1 }
    });

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete comment'
    });
  }
};
