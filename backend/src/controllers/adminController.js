import User from '../models/User.js';
import Prompt from '../models/Prompt.js';
import Purchase from '../models/Purchase.js';
import Follow from '../models/Follow.js';

// Get admin dashboard statistics
export const getAdminStats = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      });
    }

    // Get total users count
    const totalUsers = await User.countDocuments();

    // Get users from last month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const usersLastMonth = await User.countDocuments({
      createdAt: { $lt: lastMonth }
    });

    // Calculate user growth percentage
    const userGrowth = usersLastMonth > 0
      ? (((totalUsers - usersLastMonth) / usersLastMonth) * 100).toFixed(1)
      : 0;

    // Get total active prompts
    const activePrompts = await Prompt.countDocuments({ isPublic: true });

    // Get prompts from last month
    const promptsLastMonth = await Prompt.countDocuments({
      isPublic: true,
      createdAt: { $lt: lastMonth }
    });

    // Calculate prompt growth
    const promptGrowth = promptsLastMonth > 0
      ? (((activePrompts - promptsLastMonth) / promptsLastMonth) * 100).toFixed(1)
      : 0;

    // Get total revenue
    const revenueResult = await Purchase.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Get revenue from last month
    const revenueLastMonthResult = await Purchase.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          purchaseDate: { $lt: lastMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const revenueLastMonth = revenueLastMonthResult.length > 0 ? revenueLastMonthResult[0].total : 0;

    // Calculate revenue growth
    const revenueGrowth = revenueLastMonth > 0
      ? (((totalRevenue - revenueLastMonth) / revenueLastMonth) * 100).toFixed(1)
      : 0;

    // Get pending prompts for review
    const pendingReviews = await Prompt.countDocuments({
      status: 'pending'
    });

    res.json({
      success: true,
      stats: {
        totalUsers: {
          value: totalUsers,
          change: `+${userGrowth}%`,
          color: 'text-blue-400'
        },
        activePrompts: {
          value: activePrompts,
          change: `+${promptGrowth}%`,
          color: 'text-green-400'
        },
        monthlyRevenue: {
          value: `$${totalRevenue.toFixed(2)}`,
          change: `+${revenueGrowth}%`,
          color: 'text-purple-400'
        },
        pendingReviews: {
          value: pendingReviews,
          change: pendingReviews > 0 ? '+0%' : '0%',
          color: 'text-yellow-400'
        }
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin statistics'
    });
  }
};

// Get recent users
export const getRecentUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      });
    }

    const limit = parseInt(req.query.limit) || 10;

    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name email createdAt role');

    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      joinDate: getTimeAgo(user.createdAt),
      status: 'active',
      role: user.role
    }));

    res.json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Get recent users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent users'
    });
  }
};

// Get pending prompts for review
export const getPendingPrompts = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      });
    }

    const limit = parseInt(req.query.limit) || 10;

    const prompts = await Prompt.find({ status: 'pending' })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);

    const formattedPrompts = prompts.map(prompt => ({
      id: prompt._id,
      title: prompt.title,
      author: prompt.author?.name || 'Unknown',
      category: prompt.category,
      submittedAt: getTimeAgo(prompt.createdAt),
      status: prompt.status
    }));

    res.json({
      success: true,
      prompts: formattedPrompts
    });
  } catch (error) {
    console.error('Get pending prompts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending prompts'
    });
  }
};

// Approve prompt
export const approvePrompt = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      });
    }

    const { promptId } = req.params;

    const prompt = await Prompt.findByIdAndUpdate(
      promptId,
      { status: 'approved', isPublic: true },
      { new: true }
    );

    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: 'Prompt not found'
      });
    }

    res.json({
      success: true,
      message: 'Prompt approved successfully',
      prompt
    });
  } catch (error) {
    console.error('Approve prompt error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve prompt'
    });
  }
};

// Reject prompt
export const rejectPrompt = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      });
    }

    const { promptId } = req.params;
    const { reason } = req.body;

    const prompt = await Prompt.findByIdAndUpdate(
      promptId,
      {
        status: 'rejected',
        isPublic: false,
        rejectionReason: reason
      },
      { new: true }
    );

    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: 'Prompt not found'
      });
    }

    res.json({
      success: true,
      message: 'Prompt rejected',
      prompt
    });
  } catch (error) {
    console.error('Reject prompt error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject prompt'
    });
  }
};

// Get all users with pagination
export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('name email createdAt role');

    res.json({
      success: true,
      users,
      pagination: {
        total: totalUsers,
        page,
        pages: Math.ceil(totalUsers / limit),
        limit
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};

// Get revenue analytics
export const getRevenueAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      });
    }

    // Get total revenue
    const totalRevenueResult = await Purchase.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    // Get revenue by month (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const revenueByMonth = await Purchase.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          purchaseDate: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$purchaseDate' },
            month: { $month: '$purchaseDate' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get top selling prompts
    const topPrompts = await Purchase.aggregate([
      { $match: { paymentStatus: 'completed' } },
      {
        $group: {
          _id: '$prompt',
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$amount' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    // Populate prompt details
    await Prompt.populate(topPrompts, { path: '_id', select: 'title category' });

    res.json({
      success: true,
      analytics: {
        totalRevenue,
        revenueByMonth,
        topPrompts: topPrompts.map(item => ({
          promptId: item._id?._id,
          title: item._id?.title || 'Unknown',
          category: item._id?.category || 'Unknown',
          sales: item.totalSales,
          revenue: item.totalRevenue
        }))
      }
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch revenue analytics'
    });
  }
};

// Helper function to format time ago
const getTimeAgo = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString();
  }
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};
