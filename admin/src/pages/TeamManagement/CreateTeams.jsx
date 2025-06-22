import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUsers, FaUserShield, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { MdGroupAdd } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Sidebar from '../../components/Sidebar/Sidebar';

const CreateTeams = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const [teamName, setTeamName] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [selectedTeamLeader, setSelectedTeamLeader] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchAllUsers = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`${baseUrl}/users`);
                const users = res.data.data.map(user => ({
                    ...user,
                    Role: user.Role?.toLowerCase() || ''
                }));
                setAllUsers(users);
            } catch (err) {
                toast.error('Failed to fetch users');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllUsers();
    }, []);

    const handleTeamLeaderChange = (userId) => {
        // First remove from members if currently selected
        const newMembers = selectedMembers.filter(memberId => memberId !== userId);
        setSelectedMembers(newMembers);

        // Then set as leader
        setSelectedTeamLeader(userId);
    };

    const toggleMember = (userId) => {
        // Double-check that we're not adding the team leader
        if (userId === selectedTeamLeader) {
            toast.warning('Team leader cannot be a member');
            return;
        }

        setSelectedMembers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    // Get filtered members (excluding team leader and already selected members)
    const getFilteredMembers = () => {
        return allUsers.filter(user =>
        (user.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.Email.toLowerCase().includes(searchTerm.toLowerCase())
        )).filter(user =>
            user.userID !== selectedTeamLeader
        );
    };

    // Get available leaders (excluding selected members)
    const getAvailableLeaders = () => {
        return allUsers.filter(user =>
            !selectedMembers.includes(user.userID)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!teamName.trim()) {
            toast.warning('Please enter a team name');
            return;
        }

        if (!selectedTeamLeader) {
            toast.warning('Please select a team leader');
            return;
        }

        if (selectedMembers.length === 0) {
            toast.warning('Please select at least one team member');
            return;
        }

        // Final validation - ensure team leader isn't in members
        if (selectedMembers.includes(selectedTeamLeader)) {
            toast.error('Team leader cannot be a member');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${baseUrl}/teams/assign-team`, {
                team_name: teamName,
                team_leader_id: selectedTeamLeader,
                team_member_ids: selectedMembers,
            });

            if (response.data.status === 'ok') {
                toast.success('Team created successfully!');
                setTeamName('');
                setSelectedTeamLeader('');
                setSelectedMembers([]);
                setSearchTerm('');
            } else {
                toast.error(response.data.message || 'Failed to create team');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
            toast.error(`Error: ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <ToastContainer position="top-right" autoClose={5000} />
            <Sidebar sidebarOpen={sidebarOpen} handleLogout={handleLogout} />

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                ></div>
            )}

            <div className="flex flex-col flex-1 w-full">
                <header className="flex items-center justify-between bg-white shadow-sm p-4 border-b">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-gray-600 focus:outline-none md:hidden"
                            aria-label="Toggle sidebar"
                        >
                            {sidebarOpen ? (
                                <FaTimes className="h-5 w-5" />
                            ) : (
                                <FaBars className="h-5 w-5" />
                            )}
                        </button>
                        <h1 className="text-xl font-semibold text-gray-800 flex items-center">
                            <MdGroupAdd className="mr-2 text-blue-800" />
                            Team Management
                        </h1>
                    </div>
                </header>

                <main className="flex-grow overflow-auto p-4 md:p-6 bg-gray-50">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    <FaUsers className="mr-2 text-blue-800" />
                                    Create New Team
                                </h2>
                                <button
                                    onClick={() => {
                                        setTeamName('');
                                        setSelectedTeamLeader('');
                                        setSelectedMembers([]);
                                        setSearchTerm('');
                                    }}
                                    className="flex items-center text-sm text-gray-600 hover:text-blue-600"
                                >
                                    <FaArrowLeft className="mr-1" />
                                    Reset
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block mb-2 font-medium text-gray-700">Team Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter Team Name"
                                            value={teamName}
                                            onChange={(e) => setTeamName(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 font-medium text-gray-700 flex items-center">
                                            <FaUserShield className="mr-2 text-blue-800" />
                                            Team Leader
                                        </label>
                                        <select
                                            value={selectedTeamLeader}
                                            onChange={(e) => handleTeamLeaderChange(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
                                            required
                                        >
                                            <option value="">Select Team Leader</option>
                                            {getAvailableLeaders().filter(
                                                (leader) => leader.userStatus === 'active'
                                            ).map((leader) => (
                                                <option key={leader.userID} value={leader.userID}>
                                                    {leader.Name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 font-medium text-gray-700 flex items-center">
                                            <FaUsers className="mr-2 text-blue-800" />
                                            Search Members
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Search team members..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block mb-2 font-medium text-gray-700">
                                        Selected Members: {selectedMembers.length}
                                    </label>
                                    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                                        {getFilteredMembers().length > 0 ? (
                                            <div className="max-h-60 overflow-y-auto p-2">
                                                {getFilteredMembers().filter(
                                                    (user) => user.userStatus === 'active'
                                                ).map((user) => (
                                                    <div
                                                        key={user.userID}
                                                        className={`flex items-center justify-between p-3 rounded-lg mb-2 cursor-pointer ${selectedMembers.includes(user.userID)
                                                            ? 'bg-blue-50 border border-blue-200'
                                                            : 'hover:bg-gray-50'
                                                            }`}
                                                        onClick={() => toggleMember(user.userID)}
                                                    >
                                                        <div>
                                                            <p className="font-medium text-gray-800">{user.Name}</p>
                                                            <p className="text-sm text-gray-500">{user.Email}</p>
                                                        </div>
                                                        {selectedMembers.includes(user.userID) ? (
                                                            <span className="bg-blue-500 text-white rounded-full p-1">
                                                                <FaPlus className="transform rotate-45" />
                                                            </span>
                                                        ) : (
                                                            <span className="border border-gray-300 rounded-full p-1">
                                                                <FaPlus />
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-4 text-center text-gray-500">
                                                {searchTerm ? 'No matching members found' : 'No members available'}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`px-6 py-2.5 rounded-lg font-medium flex items-center ${isLoading
                                            ? 'bg-blue-400 cursor-not-allowed'
                                            : 'bg-blue-800 hover:bg-blue-900'
                                            } text-white transition cursor-pointer`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <MdGroupAdd className="mr-2" />
                                                Create Team
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {selectedTeamLeader && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                                    <FaUserShield className="mr-2 text-blue-500" />
                                    Selected Team Leader
                                </h3>
                                {allUsers
                                    .filter(leader => leader.userID == selectedTeamLeader)
                                    .map(leader => (
                                        <div key={leader.userID} className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                                    {leader.Name.charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{leader.Name}</p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}

                        {selectedMembers.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                                    <FaUsers className="mr-2 text-blue-500" />
                                    Selected Team Members ({selectedMembers.length})
                                </h3>
                                <div className="space-y-3">
                                    {allUsers
                                        .filter(user => selectedMembers.includes(user.userID))
                                        .map(user => (
                                            <div key={user.userID} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                                                        {user.Name.charAt(0)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{user.Name}</p>
                                                    <p className="text-sm text-gray-500">{user.Email}</p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CreateTeams;