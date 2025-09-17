# Prompty - AI Prompt Platform

A full-stack application for managing and sharing AI prompts, built with React (frontend) and Express.js with MongoDB Atlas (backend).

## Project Structure

```
prompty/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
├── backend/           # Express.js backend API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── config/
│   ├── package.json
│   └── server.js
└── README.md
```

## Features

- User authentication (register, login, logout)
- Google OAuth integration
- User profile management
- Admin panel
- Dashboard with various sections
- MongoDB Atlas integration
- JWT-based authentication
- Responsive design with Tailwind CSS

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- Google Cloud Console account (for OAuth)
- Git

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client IDs
5. Add authorized redirect URIs:
   - `http://localhost:5001/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
6. Copy the Client ID and Client Secret to your backend `.env` file

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```bash
   cp env.example .env
   ```

4. Update the `.env` file with your MongoDB Atlas connection string, JWT secret, and Google OAuth credentials:
   ```
   PORT=5001
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/prompty?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   FRONTEND_URL=http://localhost:5173
   BACKEND_URL=http://localhost:5001
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

The backend will be running on `http://localhost:5001`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```bash
   cp env.example .env
   ```

4. Update the `.env` file if needed:
   ```
   VITE_API_URL=http://localhost:5001/api
   ```

5. Start the frontend development server:
   ```bash
   npm run dev
   ```

The frontend will be running on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Health Check
- `GET /api/health` - Check API health

## Technologies Used

### Frontend
- React 18
- Vite
- React Router DOM
- Tailwind CSS
- Axios
- Lucide React (icons)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- CORS
- Express Validator

## Development

### Running Both Frontend and Backend

1. Open two terminal windows
2. In the first terminal, start the backend:
   ```bash
   cd backend && npm run dev
   ```
3. In the second terminal, start the frontend:
   ```bash
   cd frontend && npm run dev
   ```

### Building for Production

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run build
```

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

### Frontend (.env)
- `VITE_API_URL` - Backend API URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

This project is licensed under the ISC License.
