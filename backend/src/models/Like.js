import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
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

// Create compound index to ensure unique like relationships
likeSchema.index({ user: 1, prompt: 1 }, { unique: true });

// Add virtual for like ID
likeSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
likeSchema.set('toJSON', {
  virtuals: true
});

const Like = mongoose.model('Like', likeSchema);

export default Like;
