const { Server } = require('socket.io');
const db = require('../config/db');

let io;

const init = (server) => {
  const allowedOrigins = [
    'https://med-movement.vercel.app',
    'https://med-admin-khaki.vercel.app',
    'https://med-7bj4.onrender.com',
    ];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    },
    // Recommended settings for production
    transports: ['websocket', 'polling'], // Allow both with fallback
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    cookie: {
      name: 'io',
      path: '/',
      httpOnly: true,
      sameSite: 'none',
      secure: true
    }
  });

  // Enhanced headers for CORS
  io.engine.on('headers', (headers, req) => {
    if (allowedOrigins.includes(req.headers.origin)) {
      headers['Access-Control-Allow-Origin'] = req.headers.origin;
      headers['Access-Control-Allow-Credentials'] = 'true';
      headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    }
  });

  // Connection error handling
  io.engine.on('connection_error', (err) => {
    console.error('Socket.IO connection error:', err);
  });

  io.on('connection', (socket) => {
    console.log(`New WebSocket connection: ${socket.id} from ${socket.handshake.headers.origin || 'unknown origin'}`);

    // Team room management
    socket.on('joinTeam', (teamId) => {
      try {
        if (!teamId) {
          throw new Error('Team ID is required');
        }
        socket.join(`team_${teamId}`);
        console.log(`Socket ${socket.id} joined team ${teamId}`);
      } catch (err) {
        console.error('Join team error:', err);
        socket.emit('joinError', { error: err.message });
      }
    });

    // Message handling
    socket.on('sendMessage', async (data) => {
      try {
        const { team_id, sender_name, message } = data;
        
        if (!team_id || !sender_name || !message) {
          throw new Error('Missing required fields');
        }

        const [result] = await db.promise().query(
          'INSERT INTO team_messages (team_id, sender_name, message) VALUES (?, ?, ?)',
          [team_id, sender_name, message]
        );

        const newMessage = {
          id: result.insertId,
          team_id,
          sender_name,
          message,
          created_at: new Date().toISOString()
        };

        io.to(`team_${team_id}`).emit('newMessage', newMessage);
      } catch (err) {
        console.error('Message send error:', err);
        socket.emit('messageError', {
          error: 'Failed to send message',
          details: err.message
        });
      }
    });

    // Disconnection handling
    socket.on('disconnect', (reason) => {
      console.log(`WebSocket disconnected: ${socket.id}`, reason);
    });

    // Error handling
    socket.on('error', (err) => {
      console.error(`WebSocket error (${socket.id}):`, err);
    });
  });

  console.log('Socket.IO server initialized with enhanced configuration');
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call init() first.');
  }
  return io;
};

module.exports = {
  init,
  getIO
};
