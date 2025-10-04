import mongoose from 'mongoose';

const promptSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  prompt: {
    type: String,
    required: [true, 'Prompt content is required'],
    trim: true,
    maxlength: [2000, 'Prompt content cannot be more than 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Art & Design',
      'Photography',
      'Writing',
      'Marketing',
      'Business',
      'Education',
      'Entertainment',
      'Technology',
      'Other'
    ]
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Each tag cannot be more than 20 characters']
  }],
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'rejected', 'draft'],
    default: 'pending'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String, // URL to the preview image
    default: null
  },
  aiModel: {
    type: String,
    trim: true,
    maxlength: [50, 'AI model name cannot be more than 50 characters'],
    default: null
  },
  sales: {
    type: Number,
    default: 0,
    min: [0, 'Sales count cannot be negative']
  },
  earnings: {
    type: Number,
    default: 0,
    min: [0, 'Earnings cannot be negative']
  },
  likesCount: {
    type: Number,
    default: 0,
    min: [0, 'Likes count cannot be negative']
  },
  commentsCount: {
    type: Number,
    default: 0,
    min: [0, 'Comments count cannot be negative']
  },
  viewsCount: {
    type: Number,
    default: 0,
    min: [0, 'Views count cannot be negative']
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot be more than 5']
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Review comment cannot be more than 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt field before saving
promptSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
promptSchema.index({ author: 1, status: 1 });
promptSchema.index({ category: 1, status: 1 });
promptSchema.index({ tags: 1 });
promptSchema.index({ createdAt: -1 });

// Virtual for average rating calculation
promptSchema.virtual('averageRating').get(function() {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / this.reviews.length) * 10) / 10; // Round to 1 decimal place
});

// Ensure virtual fields are serialized
promptSchema.set('toJSON', { virtuals: true });

const Prompt = mongoose.model('Prompt', promptSchema);

export default Prompt;

