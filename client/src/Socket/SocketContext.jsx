import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect socket with comprehensive options
    socketRef.current = io('https://med-7bj4.onrender.com', {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      secure: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
      auth: {
        token: localStorage.getItem('token') || null
      }
    });

    socketRef.current.on('connect', () => {
      setConnected(true);
      console.log('Socket connected:', socketRef.current.id);
    });

    socketRef.current.on('disconnect', (reason) => {
      setConnected(false);
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // The server has forcefully disconnected the socket
        socketRef.current.connect();
      }
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
    });

    socketRef.current.on('connection-success', (data) => {
      console.log('Connection established with server:', data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
