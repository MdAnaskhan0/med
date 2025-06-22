import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaChartLine } from 'react-icons/fa';
import Sidebar from '../components/Sidebar/Sidebar';
import axios from 'axios';
import {
  FaUser,
  FaWalking,
  FaCodeBranch,
  FaUserCog,
  FaBuilding
} from 'react-icons/fa';
import { RiTeamFill } from "react-icons/ri";
import { MdDesignServices } from "react-icons/md";
import { TbHierarchy } from "react-icons/tb";
import { SiGooglecolab } from "react-icons/si";
import { IoIosArrowForward } from "react-icons/io";

const Dashboard = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    users: 0,
    movementReports: 0,
    teams: 0,
    companyNames: 0,
    branchNames: 0,
    designations: 0,
    departments: 0,
    roles: 0,
    partyNames: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;



  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/');
  };


  // Fetch all data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          usersRes,
          movementReportsRes,
          teamsRes,
          companyNamesRes,
          branchNamesRes,
          designationsRes,
          departmentsRes,
          rolesRes,
          partyNamesRes
        ] = await Promise.all([
          axios.get(`${baseUrl}/users`),
          axios.get(`${baseUrl}/movements/get_all_movement`),
          axios.get(`${baseUrl}/teams/teams`),
          axios.get(`${baseUrl}/companynames`),
          axios.get(`${baseUrl}/branchnames`),
          axios.get(`${baseUrl}/designations`),
          axios.get(`${baseUrl}/departments`),
          axios.get(`${baseUrl}/roles`),
          axios.get(`${baseUrl}/partynames`)
        ]);

        setStats({
          users: usersRes.data.data.length,
          movementReports: movementReportsRes.data.length,
          teams: teamsRes.data.data.length,
          companyNames: companyNamesRes.data.data.length,
          branchNames: branchNamesRes.data.length,
          designations: designationsRes.data.length,
          departments: departmentsRes.data.length,
          roles: rolesRes.data.length,
          partyNames: partyNamesRes.data.length
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);


  const statCards = [
    {
      title: 'Users',
      count: stats.users,
      icon: <FaUser className="text-2xl" />,
      color: 'bg-blue-600',
      path: '/dashboard/alluser'
    },
    {
      title: 'Movement Reports',
      count: stats.movementReports,
      icon: <FaWalking className="text-2xl" />,
      color: 'bg-green-600',
      path: '/dashboard/movementreports'
    },
    {
      title: 'Teams',
      count: stats.teams,
      icon: <RiTeamFill className="text-2xl" />,
      color: 'bg-purple-600',
      path: '/dashboard/allteam'
    },
    {
      title: 'Companies',
      count: stats.companyNames,
      icon: <FaBuilding className="text-2xl" />,
      color: 'bg-amber-600',
      path: '/dashboard/companynames'
    },
    {
      title: 'Branches',
      count: stats.branchNames,
      icon: <FaCodeBranch className="text-2xl" />,
      color: 'bg-red-600',
      path: '/dashboard/branchnames'
    },
    {
      title: 'Departments',
      count: stats.departments,
      icon: <TbHierarchy className="text-2xl" />,
      color: 'bg-indigo-600',
      path: '/dashboard/departments'
    },
    {
      title: 'Designations',
      count: stats.designations,
      icon: <MdDesignServices className="text-2xl" />,
      color: 'bg-pink-600',
      path: '/dashboard/designations'
    },
    {
      title: 'Party Names',
      count: stats.partyNames,
      icon: <SiGooglecolab className="text-2xl" />,
      color: 'bg-teal-600',
      path: '/dashboard/partynames'
    },
    {
      title: 'Roles',
      count: stats.roles,
      icon: <FaUserCog className="text-2xl" />,
      color: 'bg-cyan-600',
      path: '/dashboard/roles'
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} handleLogout={handleLogout} />

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full">
        {/* Header */}
        <header className="flex items-center justify-between bg-white shadow-sm p-4 border-b">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none md:hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <FaTimes className="h-6 w-6" />
            ) : (
              <FaBars className="h-6 w-6" />
            )}
          </button>

          <div className='flex items-center justify-between w-full'>
            <div className="flex items-center space-x-4">
              <FaChartLine className="text-blue-600 text-xl" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Welcome! 👋</h2>
            </div>
            <div className="p-3 bg-blue-100 rounded-full cursor-pointer" onClick={() => navigate('/dashboard/profile')}>
              <FaUser className="text-blue-600 text-xl" />
            </div>

          </div>
        </header>

        {/* Content */}
        <main className="flex-grow overflow-auto p-6">
          {children || (
            <>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
                      <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-8 w-1/2 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">Error loading dashboard data: {error}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {statCards.map((card, index) => (
                    <div
                      key={index}
                      onClick={() => navigate(card.path)}
                      className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group ease-in-out duration-300 hover:scale-105`}
                    >
                      <div className="flex justify-between items-start">
                        <div className={`${card.color} p-3 rounded-lg text-white`}>
                          {card.icon}
                        </div>
                        <div className='flex items-center'>
                          <p className='text-sm text-gray-500'>View details</p><IoIosArrowForward className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-md font-medium text-gray-500">{card.title}</p>
                        <p className="text-2xl font-semibold text-gray-800 mt-1">{card.count}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;