import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUsers, FaUserPlus, FaUserMinus, FaTrash, FaChevronLeft } from 'react-icons/fa';
import LogoutButton from '../../../../components/LogoutButton';
import { useAuth } from '../../../../auth/AuthContext';

const TeamDetails = () => {
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
    const { user } = useAuth();

    const navigate = useNavigate();
    const { teamID } = useParams();

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

    const handleDeleteTeam = async () => {
        if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;

        try {
            await axios.delete(`${baseUrl}/teams/teams/${teamID}`);
            toast.success('Team deleted successfully');
            navigate('/dashboard/allteam');
        } catch (err) {
            toast.error('Failed to delete team');
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
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <FaChevronLeft className="mr-2" />
                        Back to Teams
                    </button>
                    <LogoutButton />
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                ) : teamData && (
                    <div className="space-y-6">
                        <div className="bg-white shadow overflow-hidden rounded-lg">
                            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                                <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                                    <FaUsers className="mr-3 text-blue-600" />
                                    Team Information
                                </h2>
                            </div>
                            <div className="px-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-700 mb-2">Details</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Team Name</p>
                                                <p className="mt-1 text-sm text-gray-900">{teamData.team_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Team Leader</p>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {teamData.team_leader?.name || 'Not assigned'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-700 mb-2">Members ({teamData.team_members.length})</h3>
                                        <div className="bg-gray-50 rounded-md p-3 max-h-48 overflow-y-auto">
                                            {teamData.team_members.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {teamData.team_members.map(member => (
                                                        <li key={member.userID} className="flex items-center justify-between p-2 hover:bg-gray-100 rounded">
                                                            <span className="text-sm text-gray-800">{member.name}</span>
                                                            {member.userID === teamData.team_leader?.userID && (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    Leader
                                                                </span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">No members in this team</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={handleAddMemberClick}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <FaUserPlus className="mr-2" /> Add Member
                            </button>
                            <button
                                onClick={handleRemoveMemberClick}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                            >
                                <FaUserMinus className="mr-2" /> Remove Member
                            </button>
                            {
                                user.role === 'admin' && (
                                    <button
                                        onClick={handleDeleteTeam}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        <FaTrash className="mr-2" /> Delete Team
                                    </button>
                                )
                            }
                        </div>
                    </div>
                )}

                {/* Add Member Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Add Member to Team</h3>
                            </div>
                            <div className="px-6 py-4 max-h-96 overflow-y-auto">
                                {usersToAdd.length > 0 ? (
                                    <ul className="divide-y divide-gray-200">
                                        {usersToAdd.map(user => (
                                            <li
                                                key={user.userID}
                                                onClick={() => setSelectedUser(user)}
                                                className={`px-4 py-3 cursor-pointer ${selectedUser?.userID === user.userID ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{user.Name}</p>
                                                        <p className="text-xs text-gray-500">{user.email || 'No email provided'}</p>
                                                    </div>
                                                    {selectedUser?.userID === user.userID && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                            Selected
                                                        </span>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No available users to add</p>
                                )}
                            </div>
                            <div className="px-6 py-3 border-t border-gray-200 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmAddMember}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Add Member
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Remove Member Modal */}
                {showRemoveModal && (
                    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Remove Member from Team</h3>
                            </div>
                            <div className="px-6 py-4 max-h-96 overflow-y-auto">
                                {membersToRemove.length > 0 ? (
                                    <ul className="divide-y divide-gray-200">
                                        {membersToRemove.map(member => (
                                            <li
                                                key={member.userID}
                                                onClick={() => setSelectedMember(member)}
                                                className={`px-4 py-3 cursor-pointer ${selectedMember?.userID === member.userID ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                                        {member.userID === teamData?.team_leader?.userID && (
                                                            <p className="text-xs text-blue-600">Team Leader</p>
                                                        )}
                                                    </div>
                                                    {selectedMember?.userID === member.userID && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                            Selected
                                                        </span>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No members available to remove</p>
                                )}
                            </div>
                            <div className="px-6 py-3 border-t border-gray-200 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowRemoveModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmRemoveMember}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    disabled={!selectedMember || selectedMember?.userID === teamData?.team_leader?.userID}
                                >
                                    Remove Member
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamDetails;