import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import connectDB from './config/database.js';
import passport from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import googleAuthRoutes from './routes/googleAuthRoutes.js';
import promptRoutes from './routes/promptRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import followRoutes from './routes/followRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import userProfileRoutes from './routes/userProfileRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Import models to ensure they are registered with Mongoose
import './models/User.js';
import './models/Prompt.js';
import './models/Purchase.js';
import './models/Follow.js';
import './models/Favorite.js';
import './models/Like.js';
import './models/Comment.js';

// Load environment variables
dotenv.config();

// Connect to database (optional for development)
if (process.env.MONGODB_URI && 
    process.env.MONGODB_URI !== 'mongodb+srv://username:password@cluster.mongodb.net/prompty?retryWrites=true&w=majority' &&
    !process.env.MONGODB_URI.includes('username:password')) {
  connectDB();
} else {
  console.log('⚠️  MongoDB connection skipped - using example URI. Please update MONGODB_URI in .env file');
}

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session middleware
app.use(session({
  secret: process.env.JWT_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/google', googleAuthRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/user-profile', userProfileRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Prompty Backend API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
