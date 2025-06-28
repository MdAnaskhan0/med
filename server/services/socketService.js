const { Server } = require('socket.io');
const db = require('../config/db');

let io;

const init = (server) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://192.168.111.140:5173',
    'http://192.168.111.140:5174',
    'https://movement-med.vercel.app',
    'https://www.movement-med.vercel.app', // Added www variant
    'https://med-admin-khaki.vercel.app',
    'https://med-7bj4.onrender.com'
  ];

  io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        // Allow requests with no origin
        if (!origin) return callback(null, true);
        
        // Normalize origin
        const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
        
        if (allowedOrigins.some(allowed => {
          return normalizedOrigin === allowed || 
                 normalizedOrigin === allowed.replace('https://', 'https://www.');
        })) {
          return callback(null, true);
        }
        
        console.warn('Socket.IO CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
  });

  // Special handling for Engine.IO CORS
  io.engine.on('headers', (headers, req) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Credentials'] = 'true';
    }
  });

  io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

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
          created_at: new Date()
        };

        io.to(`team_${team_id}`).emit('receiveMessage', newMessage);
      } catch (err) {
        console.error('Message send error:', err);
        socket.emit('messageError', { error: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = {
  init,
  getIO: () => io
};
