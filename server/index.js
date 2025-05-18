const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for development, enable for production
}));

// Use morgan only in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File upload middleware
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // Default limit: 50MB
  createParentPath: true,
  useTempFiles: true,
  tempFileDir: path.join(__dirname, 'tmp'),
  abortOnLimit: true,
  debug: process.env.NODE_ENV === 'development',
}));

// Static folders
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.send('Formulate API is running!');
});

// Import routes
const userRoutes = require('./routes/users');
const formRoutes = require('./routes/forms');
const responseRoutes = require('./routes/responses');
const fileRoutes = require('./routes/files');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/files', fileRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

// Connect to MongoDB with optimized settings
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://adhikaryarnab1998:AIeitaoLem2Qv1An@cluster0.tot0uwb.mongodb.net/formulate?retryWrites=true&w=majority';

// Optimized MongoDB connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: process.env.MONGODB_CONNECT_TIMEOUT || 5000,
  maxPoolSize: 10, // Increased pool size for better concurrency
  socketTimeoutMS: 45000, // Set socket timeout to 45 seconds
  family: 4, // Use IPv4, skip trying IPv6
  connectTimeoutMS: 10000, // Connection timeout
  heartbeatFrequencyMS: 10000, // Heartbeat to check connection
};

// Start server before connecting to MongoDB to prevent slow startup
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Connecting to MongoDB...');
  
  // Connect to MongoDB after server is started
  mongoose
    .connect(MONGODB_URI, mongooseOptions)
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((error) => {
      console.error('Error connecting to MongoDB:', error.message);
      // Keep server running even if MongoDB connection fails
      console.log('Server will continue running without database connection.');
    });
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
  console.log('Closing server and database connections...');
  server.close(() => {
    mongoose.connection.close().then(() => {
      console.log('Server and database connections closed.');
      process.exit(0);
    });
  });
}); 