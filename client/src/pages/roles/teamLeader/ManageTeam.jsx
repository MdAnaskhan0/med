import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../auth/AuthContext';
import {
  FiUsers,
  FiUser,
  FiPlus,
  FiLoader,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LogoutButton from '../../../components/LogoutButton';

const ManageTeam = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTeams, setExpandedTeams] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${baseUrl}/teams/teams`);
        const userTeams = res.data.data.filter(
          team => team.team_leader_name === user.name || team.team_members.includes(user.name)
        );
        setTeams(
          userTeams.map((team, index) => ({
            ...team,
            membersArray:
              typeof team.team_members === 'string'
                ? team.team_members.split(',')
                : team.team_members
          }))
        );
      } catch (error) {
        toast.error('Failed to load teams');
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.name) fetchTeams();
  }, [user?.name, baseUrl]);

  const toggleExpand = (teamName) => {
    setExpandedTeams((prev) =>
      prev.includes(teamName)
        ? prev.filter((name) => name !== teamName)
        : [...prev, teamName]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-3 lg:px-6 py-6">
      <div className='flex items-center justify-end mb-6'>
        <LogoutButton className="hidden sm:block" />
      </div>
      <div className="flex flex-col space-y-8">
        <div className="flex justify-between items-center">
          {
            teams.length === 0 ? (
              <>
              </>
            ) : (
              <>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Team Management</h1>
                  <p className="mt-1 text-sm text-gray-500">View team details.</p>
                </div>
              </>
            )
          }
        </div >

        {
          loading ? (
            <div className="flex justify-center items-center h-64" >
              <FiLoader className="animate-spin text-2xl text-gray-400" />
            </div>
          ) : teams.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center max-w-8xl mx-auto">
              <h1 className='text-2xl font-bold text-gray-800'>You are not team leader</h1>
              <p className='text-sm text-gray-500'>Only team leader can view team details</p>
            </div>
          ) : (
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="col-span-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team Name
                </div>
                <div className="col-span-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leader
                </div>
                <div className="col-span-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member Count
                </div>
                <div className="col-span-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </div>
              </div>
              <ul className="divide-y divide-gray-200">
                {teams.map((team, index) => (
                  <React.Fragment key={team.team_name + index}>
                    <li className="hover:bg-gray-50">
                      <div className="grid grid-cols-12 px-6 py-4 items-center">
                        <div className="col-span-5 flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
                            <FiUsers className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{team.team_name}</div>
                          </div>
                        </div>
                        <div className="col-span-3 text-sm text-gray-500">
                          <div className="flex items-center">
                            <FiUser className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                            {team.team_leader_name}
                          </div>
                        </div>
                        <div className="col-span-2 text-sm text-gray-500">
                          {team.membersArray?.length || 0} members
                        </div>
                        <div className="col-span-2 flex items-center justify-end space-x-2">
                          <button
                            onClick={() => toggleExpand(team.team_name)}
                            className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100"
                          >
                            {expandedTeams.includes(team.team_name) ? (
                              <FiChevronUp className="h-4 w-4" />
                            ) : (
                              <FiChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </li>
                    {expandedTeams.includes(team.team_name) && (
                      <li className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <div className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Team Members
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {team.membersArray?.map((member, index) => (
                            <div
                              key={index}
                              className="bg-white px-3 py-2 rounded-md shadow-xs border border-gray-200 text-sm text-gray-700 flex items-center"
                            >
                              <FiUser className="mr-2 h-3 w-3 text-gray-400" />
                              {member.trim()}
                            </div>
                          ))}
                        </div>
                      </li>
                    )}
                  </React.Fragment>
                ))}
              </ul>
            </div>
          )}
      </div >
    </div >
  );
};

export default ManageTeam;
