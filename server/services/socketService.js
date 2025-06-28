const { Server } = require('socket.io');
const db = require('../config/db');

let io;

const init = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://192.168.111.140:5173',
        'http://192.168.111.140:5174',
        'https://med-movement.vercel.app',
        'https://med-admin-khaki.vercel.app/',
        'https://med-7bj4.onrender.com'
      ],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('joinTeam', (teamId) => {
      socket.join(`team_${teamId}`);
    });

    socket.on('sendMessage', (data) => {
      const { team_id, sender_name, message } = data;

      db.query(
        'INSERT INTO team_messages (team_id, sender_name, message) VALUES (?, ?, ?)',
        [team_id, sender_name, message],
        (err, result) => {
          if (!err) {
            const newMessage = {
              id: result.insertId,
              team_id,
              sender_name,
              message,
              created_at: new Date()
            };

            io.to(`team_${team_id}`).emit('receiveMessage', newMessage);
          }
        }
      );
    });

    socket.on('disconnect', () => {
      // Handle disconnect if needed
    });
  });
};

module.exports = {
  init,
  getIO: () => io
};
