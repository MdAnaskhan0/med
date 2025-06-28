import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [socketId, setSocketId] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('https://med-7bj4.onrender.com', {
      withCredentials: true,
      secure: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: true,
      extraHeaders: {
        'Origin': window.location.origin
      }
    });

    // Connection events
    socketRef.current.on('connect', () => {
      setConnectionStatus('connected');
      setSocketId(socketRef.current.id);
      console.log('Socket connected:', socketRef.current.id);
    });

    socketRef.current.on('connection-confirmation', (data) => {
      console.log('Server connection confirmation:', data);
    });

    socketRef.current.on('disconnect', (reason) => {
      setConnectionStatus('disconnected');
      setSocketId(null);
      console.log('Socket disconnected:', reason);
      
      if (reason === 'io server disconnect') {
        // The server has forcefully disconnected the socket
        setTimeout(() => {
          socketRef.current.connect();
        }, 1000);
      }
    });

    socketRef.current.on('connect_error', (err) => {
      setConnectionStatus('error');
      console.error('Connection error:', err.message);
      
      // Try forcing polling if websocket fails
      if (err.message.includes('websocket')) {
        socketRef.current.io.opts.transports = ['polling', 'websocket'];
      }
    });

    socketRef.current.on('error', (err) => {
      console.error('Socket error:', err);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Provide both socket and connection status
  const value = {
    socket: socketRef.current,
    status: connectionStatus,
    socketId
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
