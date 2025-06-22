require('dotenv').config();
const http = require('http');
const app = require('./app');
const socketService = require('./services/socketService');

const port = process.env.PORT;
const server = http.createServer(app);

// Initialize Socket.io
socketService.init(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
