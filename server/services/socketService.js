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
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.engine.on('headers', (headers, req) => {
    if (allowedOrigins.includes(req.headers.origin)) {
      headers['Access-Control-Allow-Origin'] = req.headers.origin;
      headers['Access-Control-Allow-Credentials'] = 'true';
      headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    }
  });

  io.engine.on('connection_error', (err) => {
    console.error('Socket.IO connection error:', err);
  });

  io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    // Join team room and send message history
    socket.on('joinTeam', async (teamId) => {
      try {
        if (!teamId) throw new Error('Team ID required');
        
        socket.join(`team_${teamId}`);
        console.log(`${socket.id} joined team ${teamId}`);

        // Load and send message history
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
        console.log('Received message data:', data);
        
        // Validate required fields
        const requiredFields = ['team_id', 'sender_id', 'sender_name', 'message'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        const { team_id, sender_id, sender_name, message } = data;

        const [result] = await db.promise().query(
          'INSERT INTO team_messages (team_id, sender_id, sender_name, message) VALUES (?, ?, ?, ?)',
          [team_id, sender_id, sender_name, message]
        );

        const newMessage = {
          id: result.insertId,
          team_id,
          sender_id,
          sender_name,
          message,
          created_at: new Date().toISOString()
        };

        console.log('Broadcasting new message:', newMessage);
        io.to(`team_${team_id}`).emit('newMessage', newMessage);
      } catch (err) {
        console.error('Send message error:', err.message);
        socket.emit('messageError', { 
          error: 'Failed to send message',
          details: err.message,
          receivedData: data
        });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`Disconnected: ${socket.id}`, reason);
    });

    socket.on('error', (err) => {
      console.error(`Socket error (${socket.id}):`, err);
    });
  });

  console.log('Socket.IO server initialized');
};

const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

module.exports = { init, getIO };
