require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(helmet());
const allowedOrigins = [
  'http://127.0.0.1:5501',
  'http://localhost:5501',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      // Temporarily allow all origins if they are having CORS issues
      callback(null, true);
    }
  },
  credentials: true
}));
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/', apiLimiter);

app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultSecret',
  resave: false,
  saveUninitialized: false, // better for production
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  }
}));

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Auth Routes
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

// Static Files
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/admin', (req, res, next) => {
  if (req.session.isAdmin) {
    next();
  } else {
    res.redirect('/login.html');
  }
});
app.use('/admin', express.static(path.join(__dirname, '../frontend/admin')));

// All API routes
app.use('/api/featured-categories', require('./routes/featuredCategories'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/popular-restaurants', require('./routes/popularRestaurants'));
app.use('/api/hot-deals', require('./routes/hotDeals'));
app.use('/api/team-members', require('./routes/teamMembers'));
app.use('/api/blog-posts', require('./routes/blogPosts'));
app.use('/api/food-items', require('./routes/foodItems'));
app.use('/api/admins', require('./routes/admins'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/deals', require('./routes/deals'));

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
