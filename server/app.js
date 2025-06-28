const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Route imports
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const profileImageRoutes = require('./routes/profileImageRoutes');
const userAssignmentRoutes = require('./routes/userAssignmentRoutes');
const userActivityRoutes = require('./routes/userActivityRoutes');
const movementRoutes = require('./routes/movementRoutes');
const movementLogRoutes = require('./routes/movementLogRoutes');
const companyRoutes = require('./routes/companyRoutes');
const partyRoutes = require('./routes/partyRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const branchRoutes = require('./routes/branchRoutes');
const designationRoutes = require('./routes/designationRoutes');
const visitingStatusRoutes = require('./routes/visitingStatusRoutes');
const roleRoutes = require('./routes/roleRoutes');
const teamRoutes = require('./routes/teamRoutes');
const permissionRoutes = require('./routes/permissionRoutes');

const app = express();

// Configure allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://192.168.111.140:5173',
  'http://192.168.111.140:5174',
  'https://movement-med.vercel.app', // Fixed potential typo in "movement"
  'https://med-admin-khaki.vercel.app',
  'https://med-7bj4.onrender.com'
];

// Enhanced CORS middleware - must come before routes
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Socket-ID');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Expose-Headers', 'X-Socket-ID');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Additional CORS config
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Socket-ID']
}));

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Routes
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/messages', messageRoutes);
app.use('/profile-image', profileImageRoutes);
app.use('/unassigned', userAssignmentRoutes);
app.use('/user-activities', userActivityRoutes);
app.use('/movements', movementRoutes);
app.use('/movement-logs', movementLogRoutes);
app.use('/companynames', companyRoutes);
app.use('/partynames', partyRoutes);
app.use('/departments', departmentRoutes);
app.use('/branchnames', branchRoutes);
app.use('/designations', designationRoutes);
app.use('/visitingstatus', visitingStatusRoutes);
app.use('/roles', roleRoutes);
app.use('/teams', teamRoutes);
app.use('/permissions', permissionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message
  });
});

module.exports = app;
