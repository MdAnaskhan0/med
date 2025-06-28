import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState({});

  useEffect(() => {
    // Initialize connection
    socketRef.current = io('https://med-7bj4.onrender.com', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    // Connection events
    socketRef.current.on('connect', () => {
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    // Message handling
    socketRef.current.on('messageHistory', (history) => {
      if (history?.length > 0) {
        const teamId = history[0].team_id;
        setMessages(prev => ({ ...prev, [teamId]: history }));
      }
    });

    socketRef.current.on('newMessage', (message) => {
      setMessages(prev => ({
        ...prev,
        [message.team_id]: [...(prev[message.team_id] || []), message]
      }));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const joinTeam = (teamId) => {
    if (isConnected) {
      socketRef.current.emit('joinTeam', teamId);
    }
  };

  const sendMessage = (messageData) => {
    if (isConnected) {
      // Basic validation
      if (!messageData.team_id || !messageData.message) {
        console.error('Missing required fields');
        return false;
      }
      
      socketRef.current.emit('sendMessage', {
        ...messageData,
        sender_name: messageData.sender_name || 'Anonymous'
      });
      return true;
    }
    return false;
  };

  const getTeamMessages = (teamId) => {
    return messages[teamId] || [];
  };

  return (
    <SocketContext.Provider value={{
      isConnected,
      joinTeam,
      sendMessage,
      getTeamMessages
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
