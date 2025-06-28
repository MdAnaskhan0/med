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
  'https://med-movement.vercel.app', // Your frontend
  'https://med-admin-khaki.vercel.app',
  'https://med-7bj4.onrender.com'
];

// Add this middleware FIRST
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    origins: allowedOrigins
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
