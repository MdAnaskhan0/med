import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect socket with CORS and websocket transport
    socketRef.current = io('http://localhost:5137', {
      transports: ['websocket'],
      withCredentials: true,
    });

    socketRef.current.on('connect', () => {
      setConnected(true);
      console.log('Socket connected:', socketRef.current.id);
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
      console.log('Socket disconnected');
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
