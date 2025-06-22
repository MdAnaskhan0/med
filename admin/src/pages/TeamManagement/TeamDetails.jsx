import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaBars, FaTimes, FaTrash, FaUserPlus, FaUserMinus, FaUsers, FaUserShield, FaArrowLeft } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Sidebar from '../../components/Sidebar/Sidebar';

const TeamDetails = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [membersToRemove, setMembersToRemove] = useState([]);
  const [usersToAdd, setUsersToAdd] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const navigate = useNavigate();
  const { teamID } = useParams();

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/');
  };

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        const response = await axios.get(`${baseUrl}/teams/teams/${teamID}`);
        setTeamData(response.data.data);
      } catch (err) {
        setError('Failed to fetch team details');
        toast.error('Failed to load team details');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, [teamID]);

  const handleDeleteTeam = async () => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;

    try {
      await axios.delete(`${baseUrl}/teams/teams/${teamID}`);
      toast.success('Team deleted successfully');
      navigate('/dashboard/allteam');
    } catch (err) {
      toast.error('Failed to delete team');
    }
  };

  const handleAddMemberClick = async () => {
    try {
      // Fetch all users
      const allUsersResponse = await axios.get(`${baseUrl}/users`);
      const allUsers = allUsersResponse.data.data;

      // Filter out users already in the team (leader or members)
      const unassignedUsers = allUsers.filter(user => {
        const isLeader = teamData.team_leader.userID === user.userID;
        const isMember = teamData.team_members.some(member => member.userID === user.userID);
        return !isLeader && !isMember;
      });

      setUsersToAdd(unassignedUsers);
      setShowAddModal(true);

      if (unassignedUsers.length === 0) {
        toast.info("No available users to add to this team");
      }
    } catch (err) {
      toast.error('Failed to load users');
      console.error("Error fetching users:", err);
    }
  };

  const confirmAddMember = async () => {
    if (!selectedUser) {
      toast.warn("Please select a user to add");
      return;
    }

    try {
      await axios.patch(`${baseUrl}/teams/teams/${teamID}/add-member`, {
        member_id: selectedUser.userID
      });

      toast.success(`${selectedUser.Name} added successfully`);
      setShowAddModal(false);
      setSelectedUser(null);

      const updatedResponse = await axios.get(`${baseUrl}/teams/teams/${teamID}`);
      setTeamData(updatedResponse.data.data);
    } catch (err) {
      toast.error(`Failed to add member: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleRemoveMemberClick = async () => {
    try {
      const response = await axios.get(`${baseUrl}/teams/teams/${teamID}`);
      const teamMembers = response.data.data?.team_members;

      if (!teamMembers || teamMembers.length === 0) {
        toast.info("No team members found.");
        return;
      }

      setMembersToRemove(teamMembers);
      setShowRemoveModal(true);
    } catch (err) {
      toast.error("Failed to load team members");
    }
  };

  const confirmRemoveMember = async () => {
    if (!selectedMember) {
      toast.warn("Please select a member to remove");
      return;
    }

    try {
      await axios.patch(`${baseUrl}/teams/teams/${teamID}/remove-member`, {
        member_id: selectedMember.userID
      });

      toast.success(`${selectedMember.name} removed successfully`);
      setShowRemoveModal(false);
      setSelectedMember(null);

      const updatedResponse = await axios.get(`${baseUrl}/teams/teams/${teamID}`);
      setTeamData(updatedResponse.data.data);
    } catch (err) {
      toast.error(`Failed to remove member: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      <Sidebar sidebarOpen={sidebarOpen} handleLogout={handleLogout} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <header className="flex items-center justify-between bg-white shadow-sm p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 focus:outline-none md:hidden"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">Team Details</h1>
          <div className="w-8"></div>
        </header>

        <main className="flex-grow overflow-auto p-4 md:p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : teamData && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 mb-6">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FaUsers className="mr-2 text-blue-800" />
                    Team Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-700 mb-2">Basic Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <span className="text-gray-500 font-medium w-32">Team Name:</span>
                          <span className="text-gray-800">{teamData.team_name}</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-gray-500 font-medium w-32">Team Leader:</span>
                          <div className="flex items-center cursor-pointer" onClick={() => navigate(`/dashboard/userprofile/${teamData.team_leader.userID}`)}>
                            <FaUserShield className="text-green-500 mr-2" />
                            <span className="text-gray-800">{teamData.team_leader.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-700 mb-2">Team Members</h3>
                      {teamData.team_members && teamData.team_members.length > 0 ? (
                        <div className="bg-gray-50 rounded-md p-3 max-h-48 overflow-y-auto">
                          <ul className="divide-y divide-gray-200">
                            {teamData.team_members.map(member => (
                              <li key={member.userID} className="py-2 flex items-center cursor-pointer" onClick={() => navigate(`/dashboard/userprofile/${member.userID}`)}>
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-800 text-sm font-medium">
                                    {member.name.charAt(0)}
                                  </span>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-800">{member.name}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-md p-4 text-center">
                          <p className="text-gray-500">No members in this team</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-xl font-semibold text-gray-800">Team Actions</h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={handleAddMemberClick}
                      className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <FaUserPlus className="mr-2" />
                      Add Member
                    </button>

                    <button
                      onClick={handleRemoveMemberClick}
                      className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                    >
                      <FaUserMinus className="mr-2" />
                      Remove Member
                    </button>

                    <button
                      onClick={handleDeleteTeam}
                      className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      <FaTrash className="mr-2" />
                      Delete Team
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Team Member</h3>

              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {usersToAdd.map((user) => (
                  <div
                    key={user.userID}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${selectedUser?.userID === user.userID
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {user.Name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{user.Name}</p>
                        <p className="text-xs text-gray-500">
                          {user.role || 'Unassigned User'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmAddMember}
                  disabled={!selectedUser}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white ${selectedUser
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-green-300 cursor-not-allowed'
                    }`}
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Remove Team Member</h3>

              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {membersToRemove.map((member) => (
                  <div
                    key={member.userID}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${selectedMember?.userID === member.userID
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {member.name?.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">
                          {member.role || 'Team Member'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRemoveModal(false);
                    setSelectedMember(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmRemoveMember}
                  disabled={!selectedMember}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white ${selectedMember
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-red-300 cursor-not-allowed'
                    }`}
                >
                  Remove Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeamDetails;