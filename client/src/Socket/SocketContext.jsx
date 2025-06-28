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
      transports: ['websocket'],
      withCredentials: true,
      secure: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      autoConnect: true
    });

    // Connection events
    socketRef.current.on('connect', () => {
      setConnectionStatus('connected');
      setSocketId(socketRef.current.id);
      console.log('Connected with ID:', socketRef.current.id);
    });

    socketRef.current.on('disconnect', (reason) => {
      setConnectionStatus('disconnected');
      setSocketId(null);
      console.log('Disconnected:', reason);
    });

    socketRef.current.on('connect_error', (err) => {
      setConnectionStatus('error');
      console.error('Connection error:', err.message);
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
