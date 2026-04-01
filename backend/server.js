const dotenv = require('dotenv');
// Load environment variables FIRST
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const session = require('express-session');
const passport = require('./config/passport');
const connectDB = require('./config/db');

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIO(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their personal room`);
  });

  // --- WebRTC Signaling ---
  socket.on('call-user', ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit('incoming-call', { signal: signalData, from, name });
  });

  socket.on('answer-call', (data) => {
    io.to(data.to).emit('call-accepted', data.signal);
  });

  socket.on('ice-candidate', (data) => {
    io.to(data.to).emit('ice-candidate', data.candidate);
  });

  // --- Live Tracking ---
  socket.on('update-location', ({ bookingId, coords }) => {
    // Broadcast location to all users in the booking room
    io.to(bookingId).emit('location-ping', { coords, timestamp: new Date() });
    console.log(`Location update for booking ${bookingId}:`, coords);
  });

  socket.on('joinBooking', (bookingId) => {
    socket.join(bookingId);
    console.log(`Joined booking room: ${bookingId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Make io accessible to routes
app.set('io', io);

// CORS Middleware - BEFORE routes
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files Middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// API Routes - ALL TOGETHER HERE
console.log('📍 Loading API routes...');

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin-setup', require('./routes/adminCreationRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/worker', require('./routes/workerRoutes'));
app.use('/api/worker/earnings', require('./routes/workerEarningsRoutes')); // ✅ ADD HERE
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/availability', require('./routes/availabilityRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/cart', require('./routes/cartRoutes')); // Added cartRoutes
app.use('/api/ai', require('./routes/aiRoutes')); // Added AI routes (Gemini)

console.log('✅ All routes loaded successfully\n');

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'Service Booking API Running',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
