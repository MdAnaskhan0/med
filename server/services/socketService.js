const { Server } = require('socket.io');
const db = require('../config/db');

let io;

const init = (server) => {
  const allowedOrigins = [
    'https://movement-med.vercel.app',
    'https://med-admin-khaki.vercel.app',
    'https://med-7bj4.onrender.com',
    'http://localhost:5173',
    'http://localhost:5174'
  ];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    },
    allowEIO3: true,
    transports: ['websocket'], // WebSocket only
    pingTimeout: 60000,
    pingInterval: 25000,
    cookie: false, // Disable cookies
    serveClient: false // Don't serve client files
  });

  // Force CORS headers for all responses
  io.engine.on('headers', (headers, req) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Credentials'] = 'true';
    }
  });

  io.on('connection', (socket) => {
    console.log(`New WebSocket connection: ${socket.id} from ${socket.handshake.headers.origin || 'unknown origin'}`);

    socket.on('joinTeam', (teamId) => {
      socket.join(`team_${teamId}`);
      console.log(`Socket ${socket.id} joined team ${teamId}`);
    });

    socket.on('sendMessage', async (data) => {
      try {
        const { team_id, sender_name, message } = data;
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

    socket.on('disconnect', (reason) => {
      console.log(`WebSocket disconnected: ${socket.id}`, reason);
    });

    socket.on('error', (err) => {
      console.error(`WebSocket error (${socket.id}):`, err);
    });
  });

  console.log('Socket.IO server running in WebSocket-only mode');
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
