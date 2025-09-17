import Follow from '../models/Follow.js';
import User from '../models/User.js';

// Follow a user
export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user._id;

    // Check if user is trying to follow themselves
    if (followerId.toString() === userId) {
      return res.status(400).json({
        success: false,
        error: 'You cannot follow yourself'
      });
    }

    // Check if user exists
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: userId
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        error: 'You are already following this user'
      });
    }

    // Create follow relationship
    const follow = new Follow({
      follower: followerId,
      following: userId
    });

    await follow.save();

    // Update follower counts
    await User.findByIdAndUpdate(followerId, {
      $inc: { followingCount: 1 }
    });

    await User.findByIdAndUpdate(userId, {
      $inc: { followersCount: 1 }
    });

    res.json({
      success: true,
      message: 'Successfully followed user',
      follow: {
        id: follow._id,
        follower: followerId,
        following: userId,
        createdAt: follow.createdAt
      }
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to follow user'
    });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user._id;

    // Find and delete the follow relationship
    const follow = await Follow.findOneAndDelete({
      follower: followerId,
      following: userId
    });

    if (!follow) {
      return res.status(400).json({
        success: false,
        error: 'You are not following this user'
      });
    }

    // Update follower counts
    await User.findByIdAndUpdate(followerId, {
      $inc: { followingCount: -1 }
    });

    await User.findByIdAndUpdate(userId, {
      $inc: { followersCount: -1 }
    });

    res.json({
      success: true,
      message: 'Successfully unfollowed user'
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unfollow user'
    });
  }
};

// Check if current user is following a specific user
export const checkFollowStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user._id;

    const follow = await Follow.findOne({
      follower: followerId,
      following: userId
    });

    res.json({
      success: true,
      isFollowing: !!follow
    });
  } catch (error) {
    console.error('Check follow status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check follow status'
    });
  }
};

// Get followers of a user
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get followers with user details
    const followers = await Follow.find({ following: userId })
      .populate('follower', 'name email avatar profileImage bio followersCount followingCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const totalFollowers = await Follow.countDocuments({ following: userId });

    res.json({
      success: true,
      followers: followers.map(follow => ({
        id: follow.follower._id,
        name: follow.follower.name,
        email: follow.follower.email,
        avatar: follow.follower.avatar,
        profileImage: follow.follower.profileImage,
        bio: follow.follower.bio,
        followersCount: follow.follower.followersCount,
        followingCount: follow.follower.followingCount,
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
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch followers'
    });
  }
};

// Get users that a user is following
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get following with user details
    const following = await Follow.find({ follower: userId })
      .populate('following', 'name email avatar profileImage bio followersCount followingCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const totalFollowing = await Follow.countDocuments({ follower: userId });

    res.json({
      success: true,
      following: following.map(follow => ({
        id: follow.following._id,
        name: follow.following.name,
        email: follow.following.email,
        avatar: follow.following.avatar,
        profileImage: follow.following.profileImage,
        bio: follow.following.bio,
        followersCount: follow.following.followersCount,
        followingCount: follow.following.followingCount,
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
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch following'
    });
  }
};

// Get follow suggestions (users not followed by current user)
export const getFollowSuggestions = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    // Get users that current user is already following
    const following = await Follow.find({ follower: currentUserId })
      .select('following');

    const followingIds = following.map(f => f.following);

    // Get suggested users (excluding current user and already followed users)
    const suggestions = await User.find({
      _id: { 
        $nin: [currentUserId, ...followingIds] 
      }
    })
    .select('name email avatar profileImage bio followersCount followingCount')
    .sort({ followersCount: -1, createdAt: -1 })
    .limit(limit);

    res.json({
      success: true,
      suggestions: suggestions.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        profileImage: user.profileImage,
        bio: user.bio,
        followersCount: user.followersCount,
        followingCount: user.followingCount
      }))
    });
  } catch (error) {
    console.error('Get follow suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch follow suggestions'
    });
  }
};
