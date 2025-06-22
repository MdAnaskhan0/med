import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiHome, FiUser, FiUpload, FiFileText, FiActivity, FiUserPlus,
  FiUsers, FiMessageSquare, FiBriefcase, FiLayers, FiMapPin,
  FiAward, FiFlag
} from 'react-icons/fi';
import { IoIosArrowForward } from 'react-icons/io';

// Menu items with meta
const allDashboardMenuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: <FiHome size={20} />, color: 'bg-blue-500' },
  { name: 'Profile', path: '/user/profile', icon: <FiUser size={20} />, color: 'bg-purple-500' },
  { name: 'Movement Status', path: '/user/upload-report', icon: <FiUpload size={20} />, color: 'bg-green-500' },
  { name: 'My Reports', path: '/user/UserReport', icon: <FiFileText size={20} />, color: 'bg-yellow-500' },
  { name: 'Movement Reports', path: '/admin/movement-reports', icon: <FiActivity size={20} />, color: 'bg-red-500' },
  { name: 'Create User', path: '/admin/create-user', icon: <FiUserPlus size={20} />, color: 'bg-indigo-500' },
  { name: 'Users', path: '/admin/Users', icon: <FiUsers size={20} />, color: 'bg-pink-500' },
  { name: 'Teams', path: '/admin/teams', icon: <FiUsers size={20} />, color: 'bg-teal-500' },
  { name: 'Team Messages', path: '/user/team-massage', icon: <FiMessageSquare size={20} />, color: 'bg-orange-500' },
  { name: 'Companies', path: '/admin/companynames', icon: <FiBriefcase size={20} />, color: 'bg-cyan-500' },
  { name: 'Departments', path: '/admin/departments', icon: <FiLayers size={20} />, color: 'bg-amber-500' },
  { name: 'Branchs', path: '/admin/branchs', icon: <FiMapPin size={20} />, color: 'bg-emerald-500' },
  { name: 'Designations', path: '/admin/designations', icon: <FiAward size={20} />, color: 'bg-violet-500' },
  { name: 'Visiting Status', path: '/admin/visitingstatus', icon: <FiFlag size={20} />, color: 'bg-rose-500' },
  { name: 'Parties', path: '/admin/parties', icon: <FiUsers size={20} />, color: 'bg-fuchsia-500' }
];

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [permissionPage, setPermissionPage] = useState({});
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const handleLogout = async () => {
    try {
      await axios.post(`${baseUrl}/logout`, {
        username: user.username,
        role: user.role
      });
    } catch (error) {
      console.error('Logout logging failed:', error);
    }
    logout();
    navigate('/');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${baseUrl}/permissions/users/${user.userID}/permissions`);
        setPermissionPage(res.data.data || {});
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [user.userID]);

  const actionCards = allDashboardMenuItems
    .filter(item => permissionPage[item.path] === 1)
    .map(item => ({
      ...item,
      action: () => navigate(item.path),
      title: item.name
    }));

  return (
    <div className="min-h-screen">
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Hey, {user?.name} 👋</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </header>

      <main className="px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {actionCards.map((card, index) => (
            <div 
              key={index}
              onClick={card.action}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <div className={`${card.color} p-3 rounded-lg text-white`}>
                  {card.icon}
                </div>
                <div className='flex items-center'>
                  <p className='text-sm text-gray-500'>View details</p>
                  <IoIosArrowForward className="ml-1 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800">{card.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;