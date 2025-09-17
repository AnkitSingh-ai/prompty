import User from '../models/User.js';
import Prompt from '../models/Prompt.js';
import Purchase from '../models/Purchase.js';
import Follow from '../models/Follow.js';

// Get user profile data
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Get user data
    const user = await User.findById(userId).select('-password -__v');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user's prompts (public only)
    const userPrompts = await Prompt.find({ 
      author: userId, 
      isPublic: true 
    })
    .populate('author', 'name avatar profileImage')
    .sort({ createdAt: -1 })
    .limit(20);

    // Get user's purchased prompts
    const purchasedPrompts = await Purchase.find({ user: userId })
      .populate({
        path: 'prompt',
        populate: {
          path: 'author',
          select: 'name avatar profileImage'
        }
      })
      .sort({ createdAt: -1 })
      .limit(20);

    // Filter out null prompts (in case some were deleted)
    const validPurchasedPrompts = purchasedPrompts.filter(p => p.prompt);

    // Get follow status
    const followStatus = await Follow.findOne({
      follower: currentUserId,
      following: userId
    });

    // Get follower and following counts
    const followersCount = await Follow.countDocuments({ following: userId });
    const followingCount = await Follow.countDocuments({ follower: userId });

    // Get user's prompt stats
    const totalPrompts = await Prompt.countDocuments({ author: userId, isPublic: true });
    const totalSales = await Prompt.aggregate([
      { $match: { author: userId } },
      { $group: { _id: null, totalSales: { $sum: '$sales' } } }
    ]);

    const totalEarnings = await Prompt.aggregate([
      { $match: { author: userId } },
      { $group: { _id: null, totalEarnings: { $sum: '$earnings' } } }
    ]);

    res.json({
      success: true,
      profile: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          profileImage: user.profileImage,
          bio: user.bio,
          role: user.role,
          createdAt: user.createdAt
        },
        stats: {
          followersCount,
          followingCount,
          totalPrompts,
          totalSales: totalSales[0]?.totalSales || 0,
          totalEarnings: totalEarnings[0]?.totalEarnings || 0
        },
        isFollowing: !!followStatus,
        prompts: userPrompts.map(prompt => ({
          id: prompt._id,
          title: prompt.title,
          description: prompt.description,
          category: prompt.category,
          price: prompt.price,
          image: prompt.image,
          likesCount: prompt.likesCount,
          commentsCount: prompt.commentsCount,
          sales: prompt.sales,
          earnings: prompt.earnings,
          createdAt: prompt.createdAt,
          author: {
            id: prompt.author._id,
            name: prompt.author.name,
            avatar: prompt.author.avatar,
            profileImage: prompt.author.profileImage
          }
        })),
        purchasedPrompts: validPurchasedPrompts.map(purchase => ({
          id: purchase.prompt._id,
          title: purchase.prompt.title,
          description: purchase.prompt.description,
          category: purchase.prompt.category,
          price: purchase.prompt.price,
          image: purchase.prompt.image,
          purchasedAt: purchase.createdAt,
          author: {
            id: purchase.prompt.author._id,
            name: purchase.prompt.author.name,
            avatar: purchase.prompt.author.avatar,
            profileImage: purchase.prompt.author.profileImage
          }
        }))
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
};

// Get user's followers
export const getUserFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const followers = await Follow.find({ following: userId })
      .populate('follower', 'name avatar profileImage bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalFollowers = await Follow.countDocuments({ following: userId });

    res.json({
      success: true,
      followers: followers.map(follow => ({
        id: follow.follower._id,
        name: follow.follower.name,
        avatar: follow.follower.avatar,
        profileImage: follow.follower.profileImage,
        bio: follow.follower.bio,
        followedAt: follow.createdAt
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalFollowers / limit),
        totalFollowers,
        hasNext: page < Math.ceil(totalFollowers / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get user followers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch followers'
    });
  }
};

// Get user's following
export const getUserFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const following = await Follow.find({ follower: userId })
      .populate('following', 'name avatar profileImage bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalFollowing = await Follow.countDocuments({ follower: userId });

    res.json({
      success: true,
      following: following.map(follow => ({
        id: follow.following._id,
        name: follow.following.name,
        avatar: follow.following.avatar,
        profileImage: follow.following.profileImage,
        bio: follow.following.bio,
        followedAt: follow.createdAt
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalFollowing / limit),
        totalFollowing,
        hasNext: page < Math.ceil(totalFollowing / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get user following error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch following'
    });
  }
};
