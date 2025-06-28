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
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    // Join team room and load history
    socket.on('joinTeam', async (teamId) => {
      try {
        if (!teamId) throw new Error('Team ID required');
        
        socket.join(`team_${teamId}`);
        console.log(`${socket.id} joined team ${teamId}`);

        // Load message history
        const [messages] = await db.promise().query(
          'SELECT * FROM team_messages WHERE team_id = ? ORDER BY created_at ASC',
          [teamId]
        );
        socket.emit('messageHistory', messages);
      } catch (err) {
        console.error('Join team error:', err);
        socket.emit('teamError', { error: err.message });
      }
    });

    // Handle new messages
    socket.on('sendMessage', async (data) => {
      try {
        // Validate required fields
        if (!data.team_id) throw new Error('Team ID is required');
        if (!data.message) throw new Error('Message is required');

        // Insert into database
        const [result] = await db.promise().query(
          'INSERT INTO team_messages (team_id, sender_name, message) VALUES (?, ?, ?)',
          [data.team_id, data.sender_name || 'Anonymous', data.message]
        );

        // Create response object
        const newMessage = {
          id: result.insertId,
          team_id: data.team_id,
          sender_name: data.sender_name || 'Anonymous',
          message: data.message,
          created_at: new Date().toISOString()
        };

        // Broadcast to team room
        io.to(`team_${data.team_id}`).emit('newMessage', newMessage);
      } catch (err) {
        console.error('Message send error:', err);
        socket.emit('messageError', { error: err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Disconnected: ${socket.id}`);
    });
  });

  console.log('Socket.IO server running');
};

const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

module.exports = { init, getIO };
