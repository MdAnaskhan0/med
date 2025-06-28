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
    'https://med-admin-khaki.vercel.app',
    'https://med-7bj4.onrender.com'
  ];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    transports: ['websocket', 'polling'] // Add fallback transports
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinTeam', (teamId) => {
      socket.join(`team_${teamId}`);
      console.log(`Client joined team ${teamId}`);
    });

    socket.on('sendMessage', (data) => {
      const { team_id, sender_name, message } = data;
      
      db.query(
        'INSERT INTO team_messages (team_id, sender_name, message) VALUES (?, ?, ?)',
        [team_id, sender_name, message],
        (err, result) => {
          if (err) {
            console.error('Database error:', err);
            return;
          }
          
          const newMessage = {
            id: result.insertId,
            team_id,
            sender_name,
            message,
            created_at: new Date()
          };
          
          io.to(`team_${team_id}`).emit('receiveMessage', newMessage);
        }
      );
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};

module.exports = {
  init,
  getIO: () => io
};
