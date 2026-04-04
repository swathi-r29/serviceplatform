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

// ── /tracking namespace — real-time worker location ──────────────────────────
const trackingNS = io.of('/tracking');

// Debounce: only write coords to DB every 10th ping per booking
const pingCountMap = new Map(); // bookingId → count

trackingNS.on('connection', (socket) => {
  console.log('[tracking] socket connected:', socket.id);

  // ── WORKER: start broadcasting for a booking ─────────────────────────────
  socket.on('worker:start-tracking', ({ bookingId, workerId }) => {
    if (!bookingId) return;
    const room = `tracking:${bookingId}`;
    socket.join(room);
    socket.trackingBookingId = bookingId;
    socket.trackingWorkerId  = workerId;
    socket.emit('tracking:started', { bookingId });
    console.log(`[tracking] worker ${workerId} started on booking ${bookingId}`);
  });

  // ── WORKER: location ping ─────────────────────────────────────────────────
  socket.on('worker:location-update', async ({ bookingId, lat, lng, heading }) => {
    if (!bookingId || lat == null || lng == null) return;
    const room = `tracking:${bookingId}`;

    // Broadcast to all watchers in the room (including sender is fine)
    trackingNS.to(room).emit('location:updated', {
      lat, lng,
      heading: heading ?? null,
      timestamp: new Date().toISOString()
    });

    // Debounce: update DB every 10th ping
    const count = (pingCountMap.get(bookingId) || 0) + 1;
    pingCountMap.set(bookingId, count);

    if (count % 10 === 0) {
      try {
        const User = require('./models/User');
        const Booking = require('./models/Booking');
        const bk = await Booking.findById(bookingId).select('worker');
        if (bk?.worker) {
          await User.findByIdAndUpdate(bk.worker, {
            'coordinates.lat': lat,
            'coordinates.lng': lng
          });
        }
      } catch (err) {
        console.error('[tracking] DB coordinate update failed:', err.message);
      }
    }
  });

  // ── WORKER: stop broadcasting ─────────────────────────────────────────────
  socket.on('worker:stop-tracking', ({ bookingId }) => {
    if (!bookingId) return;
    const room = `tracking:${bookingId}`;
    trackingNS.to(room).emit('tracking:stopped', { bookingId });
    socket.leave(room);
    pingCountMap.delete(bookingId);
    console.log(`[tracking] worker stopped tracking booking ${bookingId}`);
  });

  // ── USER: subscribe to a booking's location feed ──────────────────────────
  socket.on('user:watch-booking', async ({ bookingId, userId }) => {
    if (!bookingId) return;
    try {
      const Booking = require('./models/Booking');
      const bk = await Booking.findById(bookingId)
        .select('user worker locationCoords')
        .populate('worker', 'coordinates');

      // Validate ownership
      if (!bk || bk.user.toString() !== userId) {
        socket.emit('tracking:error', { message: 'Not authorized to watch this booking' });
        return;
      }

      socket.join(`tracking:${bookingId}`);

      // Send last known position immediately if available
      const coords = bk.worker?.coordinates;
      if (coords?.lat && coords?.lng) {
        socket.emit('location:updated', {
          lat: coords.lat,
          lng: coords.lng,
          heading: null,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('[tracking] user:watch-booking error:', err.message);
    }
  });

  // ── Disconnect: notify rooms ──────────────────────────────────────────────
  socket.on('disconnect', () => {
    const bookingId = socket.trackingBookingId;
    if (bookingId) {
      trackingNS.to(`tracking:${bookingId}`)
        .emit('tracking:worker-disconnected', { bookingId });
      pingCountMap.delete(bookingId);
    }
    console.log('[tracking] socket disconnected:', socket.id);
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
app.use('/api/admin/analytics', require('./routes/adminAnalyticsRoutes'));
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
app.use('/api/cancellation', require('./routes/cancellationRoutes'));

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
