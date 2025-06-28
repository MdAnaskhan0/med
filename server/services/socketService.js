const { Server } = require('socket.io');
const db = require('../config/db');

let io;

const init = (server) => {
  const allowedOrigins = [
    'https://med-movement.vercel.app', // Your frontend
    'https://med-admin-khaki.vercel.app',
    'https://med-7bj4.onrender.com'
  ];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true
    },
    transports: ['websocket'], // Force WebSocket only
    allowEIO3: true
  });

  io.engine.on('headers', (headers, req) => {
    if (allowedOrigins.includes(req.headers.origin)) {
      headers['Access-Control-Allow-Origin'] = req.headers.origin;
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
