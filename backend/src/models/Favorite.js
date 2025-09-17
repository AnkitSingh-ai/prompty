import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prompt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prompt',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index to ensure unique favorite relationships
favoriteSchema.index({ user: 1, prompt: 1 }, { unique: true });

// Add virtual for favorite ID
favoriteSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
favoriteSchema.set('toJSON', {
  virtuals: true
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

export default Favorite;
