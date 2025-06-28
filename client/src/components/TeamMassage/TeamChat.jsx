import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { FaPaperPlane, FaUser, FaSmile } from 'react-icons/fa';
import { format } from 'date-fns';
import { TailSpin } from 'react-loader-spinner';
import { toast } from 'react-toastify';

const TeamChat = ({ selectedTeam, user }) => {
  const { isConnected, joinTeam, sendMessage, getTeamMessages } = useSocket();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  // Get messages for current team
  const messages = getTeamMessages(selectedTeam?.team_id);

  useEffect(() => {
    if (selectedTeam && isConnected) {
      joinTeam(selectedTeam.team_id);
    }
  }, [selectedTeam, isConnected, joinTeam]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!messageText.trim()) {
      toast.warning('Message cannot be empty');
      return;
    }

    const success = sendMessage({
      team_id: selectedTeam.team_id,
      sender_name: user?.name,
      message: messageText.trim()
    });

    if (success) {
      setMessageText('');
    } else {
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessage = (msg, index) => {
    const isCurrentUser = msg.sender_name === user?.name;
    const messageDate = new Date(msg.created_at);

    return (
      <div 
        key={msg.id} 
        className={`mb-4 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
      >
        {!isCurrentUser && (
          <div className="mr-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <FaUser className="text-blue-600 text-sm" />
            </div>
          </div>
        )}

        <div className={`max-w-xs md:max-w-md rounded-xl px-4 py-2 ${
          isCurrentUser 
            ? 'bg-blue-600 text-white rounded-br-none' 
            : 'bg-white border border-gray-200 rounded-bl-none shadow-xs'
        }`}>
          {!isCurrentUser && (
            <div className="font-semibold text-xs text-gray-700 mb-1">
              {msg.sender_name}
            </div>
          )}
          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
          <div className={`text-xs mt-1 ${
            isCurrentUser ? 'text-blue-100 text-right' : 'text-gray-400'
          }`}>
            {format(messageDate, 'h:mm a')}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <FaUser className="text-2xl text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-700">No messages yet</h3>
            <p className="text-sm">Send your first message to start the conversation!</p>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-3 bg-white">
        <div className="flex items-center">
          <div className="flex-1 relative">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              rows="1"
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!messageText.trim()}
            className={`ml-2 p-3 rounded-lg ${
              messageText.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamChat;
