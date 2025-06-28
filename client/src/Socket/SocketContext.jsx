import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [socketId, setSocketId] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const socketOptions = {
      transports: ['websocket'], // Force WebSocket only
      withCredentials: true,
      secure: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: true,
      forceNew: true, // Create new manager instance
      timeout: 20000
    };

    socketRef.current = io('https://med-7bj4.onrender.com', socketOptions);

    // Connection events
    socketRef.current.on('connect', () => {
      setConnectionStatus('connected');
      setSocketId(socketRef.current.id);
      setConnectionError(null);
      console.log('WebSocket connected:', socketRef.current.id);
    });

    socketRef.current.on('disconnect', (reason) => {
      setConnectionStatus('disconnected');
      setSocketId(null);
      console.log('WebSocket disconnected:', reason);
      
      if (reason === 'io server disconnect') {
        // Server intentionally disconnected - try to reconnect
        setTimeout(() => socketRef.current.connect(), 1000);
      }
    });

    socketRef.current.on('connect_error', (err) => {
      setConnectionStatus('error');
      setConnectionError(err.message);
      console.error('WebSocket connection error:', err.message);
      
      // For debugging purposes
      console.log('Connection details:', {
        url: 'https://med-7bj4.onrender.com',
        options: socketOptions,
        error: err
      });
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const value = {
    socket: socketRef.current,
    status: connectionStatus,
    socketId,
    error: connectionError
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
