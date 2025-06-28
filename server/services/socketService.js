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
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    cookie: {
      name: "io",
      path: "/",
      httpOnly: true,
      sameSite: "none",
      secure: true
    }
  });

  // Force CORS headers for all Engine.IO responses
  io.engine.on('initial_headers', (headers, req) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Credentials'] = 'true';
      headers['Vary'] = 'Origin';
    }
  });

  io.engine.on('headers', (headers, req) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Credentials'] = 'true';
    }
  });

  io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id} from ${socket.handshake.headers.origin || 'unknown origin'}`);
    
    // Send connection confirmation
    socket.emit('connection-confirmation', { 
      status: 'connected',
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });

    socket.on('joinTeam', (teamId) => {
      socket.join(`team_${teamId}`);
      console.log(`Socket ${socket.id} joined team ${teamId}`);
      
      socket.emit('team-joined', {
        teamId,
        status: 'success',
        timestamp: new Date().toISOString()
      });
    });

    socket.on('sendMessage', async (data) => {
      try {
        const { team_id, sender_name, message } = data;
        
        // Validate input
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

        io.to(`team_${team_id}`).emit('new-message', newMessage);
      } catch (err) {
        console.error('Message send error:', err);
        socket.emit('message-error', { 
          error: 'Failed to send message',
          details: err.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id}`, reason);
    });

    socket.on('error', (err) => {
      console.error(`Socket error (${socket.id}):`, err);
    });
  });

  console.log('Socket.IO server initialized with CORS support');
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
