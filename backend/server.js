const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
// Load environment variables
dotenv.config();

const passport = require('passport');
require('./config/passport');

// Connect to Database
connectDB();

// CORS Configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
};

const app = express();
app.set('trust proxy', 1); // Trust Render's proxy to handle HTTPS correctly
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middleware
app.use(express.json());
app.use(passport.initialize());
app.use(cors(corsOptions));
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // Allow cross-origin images/resources
}));
app.use(morgan('dev'));

// Socket.io context
app.set('socketio', io);

// Socket.io logic
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join a room named after the user's ID
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their notification room`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Import Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/hotels', require('./routes/hotelRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/promotions', require('./routes/promotionRoutes'));

// Error Middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
