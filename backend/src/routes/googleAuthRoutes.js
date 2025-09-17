import express from 'express';
import passport from '../config/passport.js';
import { googleCallback, getGoogleAuthUrl } from '../controllers/googleAuthController.js';

const router = express.Router();

// Get Google OAuth URL
router.get('/url', getGoogleAuthUrl);

// Google OAuth routes (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/auth', 
    passport.authenticate('google', { 
      scope: ['profile', 'email'] 
    })
  );

  router.get('/callback', 
    passport.authenticate('google', { 
      session: false,
      failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/error`
    }), 
    googleCallback
  );
} else {
  // Fallback routes when Google OAuth is not configured
  router.get('/auth', (req, res) => {
    res.status(400).json({ 
      message: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.' 
    });
  });

  router.get('/callback', (req, res) => {
    res.status(400).json({ 
      message: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.' 
    });
  });
}

export default router;
