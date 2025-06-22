import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserTie, FaSort, FaSortUp, FaSortDown, FaEye } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import LogOutButton from '../../../../components/LogoutButton';

const Teams = () => {
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'team_id', direction: 'asc' });

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    console.log(baseUrl);

    useEffect(() => {
        const fetchTeams = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${baseUrl}/teams/teams`);
                if (response.data.status === 'ok') {
                    setTeams(response.data.data);
                } else {
                    setError('Failed to load team data');
                    toast.error('Failed to load team data');
                }
            } catch (err) {
                setError('Error fetching data');
                toast.error('Error fetching team data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTeams();
    }, [baseUrl]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <FaSort className="ml-1 opacity-30" />;
        return sortConfig.direction === 'asc' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />;
    };

    const sortedTeams = React.useMemo(() => {
        let sortableTeams = [...teams];
        if (sortConfig !== null) {
            sortableTeams.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableTeams;
    }, [teams, sortConfig]);

    return (

        <div>
            <div className='flex items-center justify-end mb-4'>
                <LogOutButton />
            </div>
            <div className='min-h-screen bg-white p-4'>
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 flex items-center">
                            <FaUserTie className="mr-2 text-blue-800" /> Team Details
                        </h2>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                            <p>{error}</p>
                        </div>
                    ) : teams.length === 0 ? (
                        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
                            <p>No teams found. Please create a new team.</p>
                        </div>
                    ) : (
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => requestSort('team_name')}
                                            >
                                                <div className="flex items-center">
                                                    Team Name {getSortIcon('team_name')}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => requestSort('team_leader_name')}
                                            >
                                                <div className="flex items-center">
                                                    Team Leader {getSortIcon('team_leader_name')}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => requestSort('team_members')}
                                            >
                                                <div className="flex items-center">
                                                    Members {getSortIcon('team_members')}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {sortedTeams.map((team) => (
                                            <tr key={team.team_id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    <div className="flex items-center">
                                                        <FaUserTie className="mr-2 text-blue-800" />
                                                        {team.team_name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {team.team_leader_name}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    <div className="flex flex-wrap gap-1">
                                                        {team.team_members.split(',').map((member, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                            >
                                                                {member.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => navigate(`/team/${team.team_id}`)}
                                                        className="text-blue-800 hover:text-blue-900 flex items-center gap-1"
                                                        title="View"
                                                    >
                                                        <FaEye />
                                                        <span className="hidden md:inline">View</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Teams;
