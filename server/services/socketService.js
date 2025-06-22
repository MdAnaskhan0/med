const { Server } = require('socket.io');
const db = require('../config/db');

let io;

const init = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://192.168.111.140:5173',
        'http://192.168.111.140:5174',
        'https://employe-movement-management-system.vercel.app',
      ],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('joinTeam', (teamId) => {
      socket.join(`team_${teamId}`);
    });

    socket.on('sendMessage', (data) => {
      const { team_id, sender_name, message } = data;

      // Save message to DB
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

            // 🔥 Use team_id here, not undefined teamId
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