import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaTimes,
  FaSearch,
  FaUsers,
  FaClock
} from 'react-icons/fa';
import { BsThreeDotsVertical, BsFilter } from 'react-icons/bs';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Sidebar from '../../components/Sidebar/Sidebar';

const TeamChat = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messages, setMessages] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamDetails, setTeamDetails] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showTeamsList, setShowTeamsList] = useState(false);
  const messagesEndRef = useRef(null);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/');
    toast.info('You have been logged out');
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch all team details upfront
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get(`${baseUrl}/teams/teams`);
        const detailsMap = {};
        res.data.data.forEach(team => {
          detailsMap[team.team_id] = team;
        });
        setTeamDetails(detailsMap);
      } catch (err) {
        toast.error('Failed to load team details');
      }
    };

    fetchTeams();
  }, []);

  // Fetch messages and build teams list
  useEffect(() => {
    axios.get(`${baseUrl}/messages`)
      .then(res => {
        setMessages(res.data);

        const uniqueTeams = [...new Set(res.data.map(msg => msg.team_id))]
          .map(teamId => {
            const teamMessages = res.data.filter(msg => msg.team_id === teamId);
            return {
              id: teamId,
              lastMessage: teamMessages[teamMessages.length - 1]?.message,
              lastMessageTime: teamMessages[teamMessages.length - 1]?.created_at
            };
          })
          .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

        setTeams(uniqueTeams);

        if (uniqueTeams.length > 0 && !selectedTeam) {
          setSelectedTeam(uniqueTeams[0].id);
        }

        setLoadingMessages(false);
      })
      .catch(err => {
        setLoadingMessages(false);
        toast.error('Failed to load messages');
      });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedTeam]);

  const filteredMessages = selectedTeam
    ? messages.filter(msg => msg.team_id === selectedTeam)
    : [];

  const filteredTeams = teams
    .filter(team => (
      teamDetails[team.id]?.team_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.id.toString().includes(searchQuery)
    ))
    .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));


  const selectedTeamName = teamDetails[selectedTeam]?.team_name || `Team #${selectedTeam}`;
  const selectedTeamMembers = teamDetails[selectedTeam]?.members || [];

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString();
  };

  // Simple avatar component
  const Avatar = ({ name, size = 40 }) => {
    const initials = name
      ? name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2)
      : 'TE';

    return (
      <div
        className={`flex items-center justify-center bg-blue-800 text-white font-medium rounded-full`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          fontSize: `${size * 0.4}px`
        }}
      >
        {initials}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Sidebar sidebarOpen={sidebarOpen} handleLogout={handleLogout} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      <div className="flex flex-1 w-full overflow-hidden">
        {/* Teams List Sidebar - Hidden on mobile when chat is open */}
        <div className={`${showTeamsList ? 'flex' : 'hidden'} md:flex w-full md:w-80 bg-white border-r border-gray-200 flex-col absolute md:relative z-10 h-full`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Team Chats</h2>
              <div className="flex items-center space-x-2">
                <button className="text-gray-500 hover:text-gray-700">
                  <BsFilter size={18} />
                </button>
                <button
                  className="md:hidden text-gray-500 hover:text-gray-700"
                  onClick={() => setShowTeamsList(false)}
                >
                  <FaTimes size={18} />
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search teams..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          <div className="flex-grow overflow-y-auto">
            {loadingMessages ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-800"></div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredTeams.map(team => (
                  <li
                    key={team.id}
                    className={`p-4 cursor-pointer transition-colors duration-200 ${selectedTeam === team.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    onClick={() => {
                      setSelectedTeam(team.id);
                      setShowTeamsList(false);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <Avatar
                          name={teamDetails[team.id]?.team_name || `Team ${team.id}`}
                        />
                        <div>
                          <span className={`font-medium block ${selectedTeam === team.id ? 'text-blue-600' : 'text-gray-800'}`}>
                            {teamDetails[team.id]?.team_name || `Team #${team.id}`}
                          </span>
                          {team.lastMessage && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {team.lastMessage.length > 25
                                ? `${team.lastMessage.substring(0, 25)}...`
                                : team.lastMessage}
                            </p>
                          )}
                        </div>
                      </div>
                      {team.lastMessageTime && (
                        <time className="text-xs text-gray-500">
                          {formatTime(team.lastMessageTime)}
                        </time>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {selectedTeam ? (
            <>
              <header className="flex items-center justify-between bg-white shadow-sm p-3 md:p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2 md:space-x-4">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-gray-600 focus:outline-none md:hidden"
                    aria-label="Toggle sidebar"
                  >
                    {sidebarOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
                  </button>
                  <button
                    className="md:hidden text-gray-600"
                    onClick={() => setShowTeamsList(true)}
                  >
                    <FaUsers className="h-5 w-5" />
                  </button>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <Avatar
                      name={selectedTeamName}
                      size={36}
                    />
                    <div>
                      <h1 className="text-md md:text-lg font-semibold text-gray-800 truncate max-w-[150px] md:max-w-none">
                        {selectedTeamName}
                      </h1>
                      <div className="flex items-center text-xs text-gray-500">
                        <FaUsers className="mr-1" />
                        {/* <span>{selectedTeamMembers.length} members</span> */}
                      </div>
                    </div>
                  </div>
                </div>
                <button className="text-gray-500 hover:text-gray-700">
                  <BsThreeDotsVertical size={18} />
                </button>
              </header>

              <main className="flex-grow overflow-auto p-2 md:p-4 bg-gray-100">
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-800"></div>
                  </div>
                ) : filteredMessages.length > 0 ? (
                  <div className="space-y-3 md:space-y-4 max-w-4xl mx-auto px-2 md:px-0">
                    {filteredMessages.map((msg, index) => {
                      // Group messages by date
                      const showDate = index === 0 ||
                        formatDate(filteredMessages[index - 1].created_at) !== formatDate(msg.created_at);

                      return (
                        <React.Fragment key={msg.id}>
                          {showDate && (
                            <div className="flex justify-center my-3 md:my-4">
                              <div className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                                {formatDate(msg.created_at)}
                              </div>
                            </div>
                          )}
                          <div
                            className={`flex ${msg.sender_name === 'Admin' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] md:max-w-md lg:max-w-lg rounded-lg p-3 ${msg.sender_name === 'Admin'
                                ? 'bg-blue-500 text-white rounded-br-none'
                                : 'bg-white text-gray-800 rounded-bl-none shadow'}`}
                            >
                              {msg.sender_name !== 'Admin' && (
                                <div className="font-semibold text-sm mb-1">
                                  {msg.sender_name}
                                </div>
                              )}
                              <p className="break-words">{msg.message}</p>
                              <div className={`text-xs mt-1 flex items-center ${msg.sender_name === 'Admin' ? 'text-blue-100' : 'text-gray-500'}`}>
                                <FaClock className="mr-1" />
                                {formatTime(msg.created_at)}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm text-center max-w-md mx-4">
                      <FaUsers className="mx-auto text-4xl text-blue-800 mb-3" />
                      <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                      <p className="text-sm">This team hasn't started chatting yet</p>
                    </div>
                  </div>
                )}
              </main>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-gray-50">
              <div className="text-center p-4 md:p-6 max-w-md">
                <FaUsers className="mx-auto text-5xl text-blue-500 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Select a Team</h2>
                <p className="text-gray-600 mb-6">Choose a team from the sidebar to view messages</p>
                <button
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  onClick={() => setShowTeamsList(true)}
                >
                  Open Teams List
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamChat;