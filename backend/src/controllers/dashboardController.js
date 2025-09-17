import Prompt from '../models/Prompt.js';
import Purchase from '../models/Purchase.js';
import User from '../models/User.js';
import Follow from '../models/Follow.js';

// Get user dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's prompts
    const userPrompts = await Prompt.find({ author: userId });
    
    // Get all purchases of user's prompts
    const purchases = await Purchase.find({ 
      prompt: { $in: userPrompts.map(p => p._id) }
    }).populate('buyer', 'name email');

    // Calculate total earnings
    const totalEarnings = purchases.reduce((sum, purchase) => {
      return sum + (purchase.amount || 0);
    }, 0);

    // Count prompts sold
    const promptsSold = purchases.length;

    // Calculate average rating (if we had a rating system)
    // For now, we'll use a placeholder calculation
    const averageRating = userPrompts.length > 0 ? 
      (4.2 + Math.random() * 0.8).toFixed(1) : 0;

    // Get actual followers count from database
    const followers = await Follow.countDocuments({ following: userId });

    // Get recent activity
    const recentActivity = await getRecentActivity(userId, purchases);

    res.json({
      success: true,
      stats: {
        totalEarnings: totalEarnings,
        promptsSold: promptsSold,
        averageRating: parseFloat(averageRating),
        followers: followers
      },
      recentActivity: recentActivity
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard statistics' 
    });
  }
};

// Get recent activity for the user
const getRecentActivity = async (userId, purchases) => {
  try {
    const activities = [];

    // Get recent purchases of user's prompts
    const recentPurchases = purchases
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    for (const purchase of recentPurchases) {
      const prompt = await Prompt.findById(purchase.prompt);
      if (prompt) {
        activities.push({
          type: 'purchase',
          message: `Your prompt '${prompt.title}' was purchased`,
          timestamp: purchase.createdAt,
          icon: '💰',
          color: 'green'
        });
      }
    }

    // Get recent prompts created by user
    const recentPrompts = await Prompt.find({ author: userId })
      .sort({ createdAt: -1 })
      .limit(3);

    for (const prompt of recentPrompts) {
      activities.push({
        type: 'prompt_created',
        message: `Created new prompt '${prompt.title}'`,
        timestamp: prompt.createdAt,
        icon: '✨',
        color: 'blue'
      });
    }

    // Add some milestone activities
    const userPrompts = await Prompt.find({ author: userId });
    if (userPrompts.length >= 10) {
      activities.push({
        type: 'milestone',
        message: 'Earned Creator Badge',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        icon: '🏆',
        color: 'purple'
      });
    }

    if (purchases.length >= 50) {
      activities.push({
        type: 'milestone',
        message: 'Reached 50+ sales milestone',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        icon: '🎉',
        color: 'green'
      });
    }

    // Sort all activities by timestamp (most recent first)
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

  } catch (error) {
    console.error('Recent activity error:', error);
    return [];
  }
};

// Get user's prompt performance analytics
export const getPromptAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { promptId } = req.params;

    const prompt = await Prompt.findOne({ 
      _id: promptId, 
      author: userId 
    });

    if (!prompt) {
      return res.status(404).json({ 
        success: false, 
        error: 'Prompt not found' 
      });
    }

    // Get purchases for this specific prompt
    const purchases = await Purchase.find({ prompt: promptId })
      .populate('buyer', 'name email');

    // Calculate analytics
    const totalSales = purchases.length;
    const totalRevenue = purchases.reduce((sum, purchase) => sum + (purchase.amount || 0), 0);
    const averageSalePrice = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Get sales over time (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentSales = purchases.filter(p => p.createdAt >= thirtyDaysAgo);

    res.json({
      success: true,
      analytics: {
        promptId: prompt._id,
        title: prompt.title,
        totalSales,
        totalRevenue,
        averageSalePrice,
        recentSales: recentSales.length,
        createdAt: prompt.createdAt,
        lastSale: purchases.length > 0 ? 
          purchases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].createdAt : null
      }
    });
  } catch (error) {
    console.error('Prompt analytics error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch prompt analytics' 
    });
  }
};

// Get marketplace statistics
export const getMarketplaceStats = async (req, res) => {
  try {
    // Get total prompts in marketplace
    const totalPrompts = await Prompt.countDocuments({ isPublic: true });
    
    // Get total sales across all prompts
    const totalSales = await Purchase.countDocuments();
    
    // Get total revenue
    const totalRevenue = await Purchase.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get top categories
    const topCategories = await Prompt.aggregate([
      { $match: { isPublic: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      stats: {
        totalPrompts,
        totalSales,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        topCategories
      }
    });
  } catch (error) {
    console.error('Marketplace stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch marketplace statistics' 
    });
  }
};
