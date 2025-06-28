import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext'; // Make sure this path is correct
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPaperPlane, FaUser, FaSmile } from 'react-icons/fa';
import { format } from 'date-fns';
import { TailSpin } from 'react-loader-spinner';
import EmojiPicker from 'emoji-picker-react';

const TeamChat = ({ selectedTeam, user, updateUnreadCount }) => {
  const { socket, isConnected, joinTeam, sendMessage: socketSendMessage } = useSocket();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!selectedTeam || !isConnected) return;

    // Join the team room
    joinTeam(selectedTeam.team_id);

    // Load initial messages
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${baseUrl}/messages/${selectedTeam.team_id}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to load messages:', err);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Cleanup on unmount
    return () => {
      // No need to leave room - handled by socket service
    };
  }, [selectedTeam, isConnected]);

  // Handle incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.team_id === selectedTeam?.team_id) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      } else {
        updateUnreadCount(message.team_id, prev => prev + 1);
      }
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, selectedTeam]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (!messageText.trim()) {
      toast.warning('Message cannot be empty');
      return;
    }

    if (!selectedTeam || !user) return;

    const messageData = {
      team_id: selectedTeam.team_id,
      sender_id: user.id, // Make sure user object has id
      sender_name: user.name,
      message: messageText.trim()
    };

    socketSendMessage(messageData);
    setMessageText('');
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const onEmojiClick = (emojiData) => {
    setMessageText(prev => prev + emojiData.emoji);
  };

  const isValidDate = (dateStr) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  const renderMessage = (msg, index) => {
    const validTimestamp = isValidDate(msg.created_at);
    const messageDate = validTimestamp ? new Date(msg.created_at) : new Date();

    const showDateSeparator = index === 0 || (
      isValidDate(messages[index - 1]?.created_at) &&
      format(messageDate, 'yyyy-MM-dd') !== format(new Date(messages[index - 1].created_at), 'yyyy-MM-dd')
    );

    return (
      <React.Fragment key={msg.id || index}>
        {showDateSeparator && (
          <div className="flex justify-center my-4">
            <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
              {format(messageDate, 'MMMM d, yyyy')}
            </div>
          </div>
        )}

        <div className={`mb-4 flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
          {msg.sender_id !== user.id && (
            <div className="mr-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <FaUser className="text-blue-600 text-sm" />
              </div>
            </div>
          )}

          <div
            className={`max-w-xs md:max-w-md rounded-xl px-4 py-2 ${msg.sender_id === user.id
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-white border border-gray-200 rounded-bl-none shadow-xs'}`}
          >
            {msg.sender_id !== user.id && (
              <div className="flex items-center mb-1">
                <span className="font-semibold text-xs text-gray-700">
                  {msg.sender_name}
                </span>
              </div>
            )}
            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
            <div className={`mt-1 ${msg.sender_id === user.id ? 'text-right text-blue-100' : 'text-left text-gray-400'}`}>
              <span className="text-xs">
                {validTimestamp ? format(messageDate, 'h:mm a') : 'Invalid time'}
              </span>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-140px)]">
      {/* Messages Area */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <TailSpin color="#3B82F6" height={40} width={40} />
        </div>
      ) : (
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
      )}

      {/* Message Input Area */}
      <div className="border-t border-gray-200 p-3 bg-white relative">
        {showEmojiPicker && (
          <div className="absolute bottom-16 right-4 z-10">
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              width={300}
              height={350}
            />
          </div>
        )}

        <div className="flex items-center">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 mr-2"
          >
            <FaSmile className="text-xl" />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message here..."
              rows="1"
              className="w-full border border-gray-300 rounded-lg py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={!messageText.trim()}
            className={`ml-2 p-3 rounded-lg transition ${messageText.trim()
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamChat;
