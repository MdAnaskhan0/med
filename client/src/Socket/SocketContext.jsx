import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState('N/A');
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState({}); // { [teamId]: message[] }
  const [activeTeam, setActiveTeam] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('https://med-7bj4.onrender.com', {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      secure: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: true,
      forceNew: false,
      timeout: 20000
    });

    // Connection events
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      setTransport(socketRef.current.io.engine.transport.name);
      setError(null);
      console.log('Socket connected');
      
      // Rejoin active team if reconnected
      if (activeTeam) {
        joinTeam(activeTeam);
      }
    });

    socketRef.current.on('disconnect', (reason) => {
      setIsConnected(false);
      setTransport('N/A');
      console.log('Disconnected:', reason);
    });

    socketRef.current.on('connect_error', (err) => {
      setIsConnected(false);
      setError(err.message);
      console.error('Connection error:', err);
    });

    // Message handling
    socketRef.current.on('messageHistory', (history) => {
      if (history?.length > 0) {
        const teamId = history[0].team_id;
        setMessages(prev => ({ ...prev, [teamId]: history }));
      }
    });

    socketRef.current.on('newMessage', (message) => {
      setMessages(prev => {
        const teamId = message.team_id;
        const existing = prev[teamId] || [];
        return { ...prev, [teamId]: [...existing, message] };
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const joinTeam = (teamId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('joinTeam', teamId);
      setActiveTeam(teamId);
    }
  };

  const sendMessage = (messageData) => {
    if (socketRef.current?.connected) {
      // Validate required fields
      const requiredFields = ['team_id', 'sender_id', 'sender_name', 'message'];
      const missingFields = requiredFields.filter(field => !messageData[field]);
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        return false;
      }

      socketRef.current.emit('sendMessage', messageData);
      return true;
    }
    return false;
  };

  const getTeamMessages = (teamId) => {
    return messages[teamId] || [];
  };

  const value = {
    socket: socketRef.current,
    isConnected,
    transport,
    error,
    messages,
    joinTeam,
    sendMessage,
    getTeamMessages,
    reconnect: () => socketRef.current?.connect()
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};
