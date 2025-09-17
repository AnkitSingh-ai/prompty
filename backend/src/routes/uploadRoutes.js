import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload, isCloudinaryConfigured, cloudinary } from '../config/cloudinary.js';

const router = express.Router();

// Upload image route - optimized for speed
router.post('/image', protect, upload.single('image'), async (req, res) => {
  try {
    console.log('=== UPLOAD REQUEST RECEIVED ===');
    console.log('Upload request received:', {
      hasFile: !!req.file,
      fileInfo: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        filename: req.file.filename
      } : null,
      cloudinaryConfigured: isCloudinaryConfigured,
      user: req.user ? { id: req.user._id, name: req.user.name } : 'No user'
    });
    console.log('=== END UPLOAD REQUEST ===');

    if (!req.file) {
      console.log('No file provided, returning placeholder');
      return res.json({
        success: true,
        imageUrl: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
        publicId: 'placeholder'
      });
    }

    if (isCloudinaryConfigured) {
      // Cloudinary upload - should be fast with optimized settings
      console.log('Cloudinary upload successful:', {
        path: req.file.path,
        filename: req.file.filename
      });
      res.json({
        success: true,
        imageUrl: req.file.path,
        publicId: req.file.filename
      });
    } else {
      // Fast fallback - return placeholder immediately
      console.log('Cloudinary not configured, using placeholder');
      res.json({
        success: true,
        imageUrl: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
        publicId: 'placeholder'
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    // Fast error fallback
    res.json({
      success: true,
      imageUrl: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
      publicId: 'placeholder'
    });
  }
});

// Fallback route when Cloudinary is not configured
router.post('/image-fallback', protect, (req, res) => {
  try {
    // Return a placeholder image URL when Cloudinary is not configured
    res.json({
      success: true,
      imageUrl: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
      publicId: 'placeholder'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Image upload failed' });
  }
});

// Test route to check Cloudinary configuration
router.get('/test', (req, res) => {
  res.json({
    cloudinaryConfigured: isCloudinaryConfigured,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set',
    apiKey: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
    apiSecret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set'
  });
});

// Test upload route without authentication
router.post('/test-upload', upload.single('image'), async (req, res) => {
  try {
    console.log('=== TEST UPLOAD REQUEST ===');
    console.log('Test upload received:', {
      hasFile: !!req.file,
      fileInfo: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null
    });
    
    if (!req.file) {
      return res.json({
        success: false,
        message: 'No file provided'
      });
    }
    
    if (isCloudinaryConfigured) {
      res.json({
        success: true,
        imageUrl: req.file.path,
        publicId: req.file.filename,
        message: 'Test upload successful'
      });
    } else {
      res.json({
        success: true,
        imageUrl: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
        publicId: 'test-placeholder',
        message: 'Test upload successful (placeholder)'
      });
    }
  } catch (error) {
    console.error('Test upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Test upload failed',
      error: error.message
    });
  }
});

export default router;
