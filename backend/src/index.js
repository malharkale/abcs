require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// CORS configuration
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || ['http://localhost:4200', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

// Middleware
app.use(cors());
app.use(express.json());

// Store active rooms and their users
const rooms = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'Server running',
    activeRooms: rooms.size,
    connectedUsers: io.engine.clientsCount,
    timestamp: new Date()
  });
});

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] New connection: ${socket.id}`);

  // User joins a room
  socket.on('join-room', (data) => {
    const { roomId, userId } = data;
    console.log(`[${new Date().toISOString()}] User ${userId} attempting to join room ${roomId}`);

    // Validate room ID
    if (!roomId || roomId.trim() === '') {
      socket.emit('room-error', { message: 'Invalid room ID' });
      return;
    }

    // Get or create room
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        users: [],
        createdAt: new Date()
      });
    }

    const room = rooms.get(roomId);

    // Check if room is full (max 2 users)
    if (room.users.length >= 2) {
      console.log(`[${new Date().toISOString()}] Room ${roomId} is full`);
      socket.emit('room-full', { message: 'Room is full. Only 2 users allowed.' });
      return;
    }

    // Add user to room
    room.users.push({
      socketId: socket.id,
      userId: userId,
      joinedAt: new Date()
    });

    socket.join(roomId);
    socket.roomId = roomId;
    socket.userId = userId;

    console.log(`[${new Date().toISOString()}] User ${userId} joined room ${roomId}. Room now has ${room.users.length} users`);

    // Notify the joining user
    socket.emit('room-joined', {
      roomId: roomId,
      usersInRoom: room.users.length,
      message: 'Successfully joined room'
    });

    // If this is the second user, notify the first user that a peer has joined
    if (room.users.length === 2) {
      const otherUser = room.users.find(u => u.socketId !== socket.id);
      io.to(otherUser.socketId).emit('peer-joined', {
        peerId: socket.id,
        message: 'Peer has joined the room'
      });
    }
  });

  // Handle WebRTC signaling - Offer
  socket.on('offer', (data) => {
    const { roomId, offer } = data;
    console.log(`[${new Date().toISOString()}] Offer received in room ${roomId}`);

    if (roomId && offer) {
      socket.to(roomId).emit('offer', offer);
    }
  });

  // Handle WebRTC signaling - Answer
  socket.on('answer', (data) => {
    const { roomId, answer } = data;
    console.log(`[${new Date().toISOString()}] Answer received in room ${roomId}`);

    if (roomId && answer) {
      socket.to(roomId).emit('answer', answer);
    }
  });

  // Handle ICE candidates
  socket.on('ice-candidate', (data) => {
    const { roomId, candidate } = data;

    if (roomId && candidate) {
      socket.to(roomId).emit('ice-candidate', candidate);
    }
  });

  // Peer ready to receive signaling
  socket.on('peer-ready', (data) => {
    const { roomId, userId } = data;
    console.log(`[${new Date().toISOString()}] Peer ${userId} ready in room ${roomId}`);

    if (roomId) {
      socket.to(roomId).emit('peer-ready', { userId: userId });
    }
  });

  // User leaves room
  socket.on('leave-room', (data) => {
    const { roomId, userId } = data;
    console.log(`[${new Date().toISOString()}] User ${userId} leaving room ${roomId}`);

    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        room.users = room.users.filter(u => u.socketId !== socket.id);

        // Notify other user that peer disconnected
        socket.to(roomId).emit('peer-disconnected', { message: 'Peer has left the call' });

        // Clean up empty rooms
        if (room.users.length === 0) {
          rooms.delete(roomId);
          console.log(`[${new Date().toISOString()}] Room ${roomId} cleaned up (empty)`);
        }
      }

      socket.leave(roomId);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const roomId = socket.roomId;
    const userId = socket.userId;

    console.log(`[${new Date().toISOString()}] User ${userId} disconnected from room ${roomId}`);

    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        room.users = room.users.filter(u => u.socketId !== socket.id);

        // Notify other user about disconnection
        io.to(roomId).emit('peer-disconnected', { message: 'Peer has disconnected' });

        // Clean up empty rooms
        if (room.users.length === 0) {
          rooms.delete(roomId);
          console.log(`[${new Date().toISOString()}] Room ${roomId} cleaned up after disconnect`);
        }
      }
    }
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`[${new Date().toISOString()}] Socket error for ${socket.id}:`, error);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 CallForFree Backend Server`);
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`✅ Ready to accept connections\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = server;
