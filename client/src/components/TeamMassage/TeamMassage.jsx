import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import axios from 'axios';
import TeamChat from './TeamChat';
import { toast } from 'react-toastify';
import { FaUsers, FaUserShield, FaListUl, FaEllipsisV, FaSearch, FaChevronLeft, FaTimes } from 'react-icons/fa';
import { TailSpin } from 'react-loader-spinner';
import LogoutButton from '../LogoutButton';

const TeamMassage = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [showTeamDetails, setShowTeamDetails] = useState(false);
  const [showTeamList, setShowTeamList] = useState(true); // Default true for mobile
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowTeamList(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${baseUrl}/teams/teams`);
        const allTeams = res.data.data;

        // Lowercase + trim for consistent comparison
        const userName = user.name.trim().toLowerCase();

        const filteredTeams = allTeams.filter(team => {
          const leaderMatch = team.team_leader_name?.trim().toLowerCase() === userName;

          const memberMatch = team.team_members
            ?.split(',')
            .map(name => name.trim().toLowerCase())
            .includes(userName);

          return leaderMatch || memberMatch;
        });

        setTeams(filteredTeams);

        const counts = {};
        filteredTeams.forEach(team => {
          counts[team.team_id] = 0;
        });
        setUnreadCounts(counts);

      } catch (error) {
        console.error('Error fetching teams:', error);
        toast.error('Failed to load teams. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [baseUrl, user.name]);


  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setShowTeamDetails(false);
    if (isMobile) {
      setShowTeamList(false);
    }

    setUnreadCounts(prev => ({
      ...prev,
      [team.team_id]: 0
    }));
  };

  const updateUnreadCount = (teamId, count) => {
    if (!selectedTeam || selectedTeam.team_id !== teamId) {
      setUnreadCounts(prev => ({
        ...prev,
        [teamId]: count
      }));
    }
  };

  const toggleTeamDetails = () => {
    setShowTeamDetails(!showTeamDetails);
  };

  const toggleTeamList = () => {
    setShowTeamList(!showTeamList);
  };

  const filteredTeams = teams.filter(team =>
    team.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.team_leader_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <TailSpin color="#3B82F6" height={50} width={50} />
    </div>
  );

  if (teams.length === 0) return (
    <div className='min-h-screen flex justify-center items-center'>
      <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg text-center">
        <div className="bg-blue-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
          <FaUsers className="text-3xl text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">No Teams Found</h3>
        <p className="text-gray-500 mt-2">You are not assigned to any teams yet.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header */}
      <div className="hidden md:flex justify-between items-center p-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Team Chat</h1>
        <div className="flex items-center space-x-4">
          <LogoutButton />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center p-3 bg-white shadow-sm sticky top-0 z-10">
        {!showTeamList && selectedTeam ? (
          <>
            <button
              onClick={() => setShowTeamList(true)}
              className="text-blue-600 p-2 rounded-lg"
            >
              <FaChevronLeft className="text-xl" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800 truncate max-w-xs">
              {selectedTeam.team_name}
            </h1>
            <button
              onClick={toggleTeamDetails}
              className="text-gray-600 p-2 rounded-lg"
            >
              <FaEllipsisV />
            </button>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-gray-800">Teams</h1>
            <LogoutButton mobile />
          </>
        )}
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row h-[calc(100vh-64px)] md:h-[calc(100vh-72px)]">
        {/* Team List Sidebar - Mobile */}
        {isMobile && showTeamList && (
          <div className="w-full bg-white h-full overflow-hidden flex flex-col">
            <div className="p-3 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search teams..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <button
                  onClick={() => setSearchTerm('')}
                  className={`absolute right-3 top-3 text-gray-400 ${!searchTerm ? 'hidden' : ''}`}
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                  Your Teams ({filteredTeams.length})
                </h3>
                <div className="space-y-1">
                  {filteredTeams.map(team => (
                    <div
                      key={team.team_id}
                      onClick={() => handleTeamSelect(team)}
                      className={`p-3 rounded-lg cursor-pointer transition-all flex justify-between items-center
                        ${selectedTeam?.team_id === team.team_id
                          ? 'bg-blue-50 border-l-4 border-blue-500'
                          : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <FaUsers className="text-blue-600" />
                        </div>
                        <div className="truncate">
                          <h4 className="font-medium text-gray-800 truncate">{team.team_name}</h4>
                          <p className="text-xs text-gray-500 truncate">{team.team_leader_name}</p>
                        </div>
                      </div>
                      {unreadCounts[team.team_id] > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCounts[team.team_id]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team List Sidebar - Desktop */}
        <div className={`hidden md:block w-80 bg-white rounded-xl shadow-sm overflow-hidden h-full`}>
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <input
                type="text"
                placeholder="Search teams..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div className="p-2 h-[calc(100%-72px)] overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
              Your Teams ({filteredTeams.length})
            </h3>
            <div className="space-y-1">
              {filteredTeams.map(team => (
                <div
                  key={team.team_id}
                  onClick={() => handleTeamSelect(team)}
                  className={`p-3 rounded-lg cursor-pointer transition-all flex justify-between items-center
                    ${selectedTeam?.team_id === team.team_id
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <FaUsers className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{team.team_name}</h4>
                      <p className="text-xs text-gray-500">{team.team_leader_name}</p>
                    </div>
                  </div>
                  {unreadCounts[team.team_id] > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCounts[team.team_id]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        {(!isMobile || !showTeamList) && (
          <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
            {selectedTeam ? (
              <>
                {/* Desktop Team Header */}
                <div className="hidden md:flex justify-between items-center p-4 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <FaUsers className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{selectedTeam.team_name}</h3>
                      <p className="text-xs text-gray-500">
                        {selectedTeam.team_members.split(',').length} members
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleTeamDetails}
                    className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100"
                  >
                    <FaEllipsisV />
                  </button>
                </div>

                {/* Team Details Panel */}
                {showTeamDetails && (
                  <div className="bg-blue-50 p-4 border-b border-blue-100">
                    <div className="flex flex-col gap-4 items-start w-full">
                      <div className="bg-white p-3 rounded-lg shadow-xs w-full md:w-auto">
                        <div className="flex items-center mb-2">
                          <FaUserShield className="text-blue-500 mr-2" />
                          <h4 className="font-medium text-gray-700">Team Leader</h4>
                        </div>
                        <p className="text-sm text-gray-600">{selectedTeam.team_leader_name}</p>
                      </div>

                      <div className="bg-white p-3 rounded-lg shadow-xs w-full">
                        <div className="flex items-center mb-2">
                          <FaListUl className="text-blue-500 mr-2" />
                          <h4 className="font-medium text-gray-700">Members</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedTeam.team_members.split(',').map((member, index) => (
                            <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                              {member.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <TeamChat
                  selectedTeam={selectedTeam}
                  user={user}
                  updateUnreadCount={updateUnreadCount}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                <div className="bg-blue-100 p-6 rounded-full mb-4">
                  <FaUsers className="text-4xl text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-1">
                  {isMobile ? 'Select a team to chat' : 'No Team Selected'}
                </h3>
                <p className="text-sm text-center">
                  {isMobile ? 'Choose from your team list' : 'Select a team from the sidebar to start chatting'}
                </p>
                {isMobile && (
                  <button
                    onClick={() => setShowTeamList(true)}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Browse Teams
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMassage;