const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const meetingRoutes = require('./routes/meetings');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  },
  maxHttpBufferSize: 1e8 // 100 MB for large data transfers
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MeetSync server is running' });
});

// Store active rooms and participants
const rooms = new Map();
const socketToRoom = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join room
  socket.on('join-room', ({ roomId, userName, userId }) => {
    console.log(`User ${userName} (${socket.id}) joining room ${roomId}`);
    
    // Leave previous room if exists
    const previousRoom = socketToRoom.get(socket.id);
    if (previousRoom) {
      handleUserLeaving(socket, previousRoom);
    }

    // Join new room
    socket.join(roomId);
    socketToRoom.set(socket.id, roomId);

    // Initialize room if doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }

    const room = rooms.get(roomId);
    room.set(socket.id, {
      socketId: socket.id,
      userName,
      userId,
      audio: true,
      video: true
    });

    // Get all other users in the room
    const otherUsers = Array.from(room.values()).filter(
      user => user.socketId !== socket.id
    );

    // Send existing users to the new user
    socket.emit('existing-users', otherUsers);

    // Notify others about new user
    socket.to(roomId).emit('user-joined', {
      socketId: socket.id,
      userName,
      userId,
      audio: true,
      video: true
    });

    console.log(`Room ${roomId} now has ${room.size} participants`);
  });

  // WebRTC signaling - offer
  socket.on('offer', ({ offer, to }) => {
    console.log(`Sending offer from ${socket.id} to ${to}`);
    io.to(to).emit('offer', {
      offer,
      from: socket.id
    });
  });

  // WebRTC signaling - answer
  socket.on('answer', ({ answer, to }) => {
    console.log(`Sending answer from ${socket.id} to ${to}`);
    io.to(to).emit('answer', {
      answer,
      from: socket.id
    });
  });

  // WebRTC signaling - ICE candidate
  socket.on('ice-candidate', ({ candidate, to }) => {
    io.to(to).emit('ice-candidate', {
      candidate,
      from: socket.id
    });
  });

  // Toggle audio
  socket.on('toggle-audio', ({ roomId, audio }) => {
    const room = rooms.get(roomId);
    if (room && room.has(socket.id)) {
      const user = room.get(socket.id);
      user.audio = audio;
      socket.to(roomId).emit('user-audio-toggled', {
        socketId: socket.id,
        audio
      });
    }
  });

  // Toggle video
  socket.on('toggle-video', ({ roomId, video }) => {
    const room = rooms.get(roomId);
    if (room && room.has(socket.id)) {
      const user = room.get(socket.id);
      user.video = video;
      socket.to(roomId).emit('user-video-toggled', {
        socketId: socket.id,
        video
      });
    }
  });

  // Chat message
  socket.on('chat-message', ({ roomId, message, userName }) => {
    const timestamp = new Date().toISOString();
    io.to(roomId).emit('chat-message', {
      message,
      userName,
      userId: socket.id,
      timestamp
    });
  });

  // Screen sharing started
  socket.on('start-screen-share', ({ roomId }) => {
    socket.to(roomId).emit('user-started-screen-share', {
      socketId: socket.id
    });
  });

  // Screen sharing stopped
  socket.on('stop-screen-share', ({ roomId }) => {
    socket.to(roomId).emit('user-stopped-screen-share', {
      socketId: socket.id
    });
  });

  // Leave room
  socket.on('leave-room', () => {
    const roomId = socketToRoom.get(socket.id);
    if (roomId) {
      handleUserLeaving(socket, roomId);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    const roomId = socketToRoom.get(socket.id);
    if (roomId) {
      handleUserLeaving(socket, roomId);
    }
  });
});

// Helper function to handle user leaving
function handleUserLeaving(socket, roomId) {
  const room = rooms.get(roomId);
  if (room) {
    room.delete(socket.id);
    
    // Notify others
    socket.to(roomId).emit('user-left', {
      socketId: socket.id
    });

    // Clean up empty rooms
    if (room.size === 0) {
      rooms.delete(roomId);
      console.log(`Room ${roomId} deleted (empty)`);
    } else {
      console.log(`Room ${roomId} now has ${room.size} participants`);
    }
  }
  
  socket.leave(roomId);
  socketToRoom.delete(socket.id);
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    // Continue running even if MongoDB fails (for guest access)
  });

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`MeetSync server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
