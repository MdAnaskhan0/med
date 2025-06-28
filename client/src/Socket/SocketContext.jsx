import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState('N/A');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('https://med-7bj4.onrender.com', {
      transports: ['websocket'], // Force WebSocket only
      withCredentials: true,
      secure: true, // Required for HTTPS
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: true,
      forceNew: true, // Prevent connection sharing
      timeout: 20000
    });

    // Connection events
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      setTransport(socketRef.current.io.engine.transport.name);
      setError(null);
      console.log('WebSocket connected:', socketRef.current.id);
    });

    socketRef.current.on('disconnect', (reason) => {
      setIsConnected(false);
      setTransport('N/A');
      console.log('WebSocket disconnected:', reason);
      
      if (reason === 'io server disconnect') {
        // Server-initiated disconnect - try to reconnect
        setTimeout(() => socketRef.current.connect(), 1000);
      }
    });

    socketRef.current.on('connect_error', (err) => {
      setIsConnected(false);
      setError(err.message);
      console.error('Connection error:', err.message);
      
      // Diagnostic logging
      console.log('Connection details:', {
        url: 'https://med-7bj4.onrender.com',
        options: socketRef.current.io.opts,
        error: err
      });
    });

    socketRef.current.on('transport-upgrade', (transport) => {
      console.log('Transport upgraded to:', transport.name);
      setTransport(transport.name);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Context value
  const value = {
    socket: socketRef.current,
    isConnected,
    transport,
    error,
    reconnect: () => {
      if (socketRef.current && !socketRef.current.connected) {
        socketRef.current.connect();
      }
    }
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
