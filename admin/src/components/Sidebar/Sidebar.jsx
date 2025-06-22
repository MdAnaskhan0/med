import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome, FaUsers, FaChartBar, FaUserFriends,
  FaUserPlus, FaChevronDown, FaChevronRight,
  FaSignOutAlt, FaRegBuilding, FaCog
} from 'react-icons/fa';
import {
  HiUserAdd, HiOutlineUserGroup, HiOutlineDocumentReport
} from 'react-icons/hi';
import {
  TbGitBranch, TbUsers
} from 'react-icons/tb';
import {
  CgIfDesign, CgPerformance
} from 'react-icons/cg';
import {
  FaTransgender, FaUserShield
} from 'react-icons/fa6';
import {
  LiaUserFriendsSolid, LiaBusinessTimeSolid
} from 'react-icons/lia';
import {
  MdPeopleAlt, MdTaskAlt, MdEditOff, MdOutlineChat
} from 'react-icons/md';
import {
  LuSquareActivity, LuSettings2
} from 'react-icons/lu';
import {
  RiTeamLine
} from 'react-icons/ri';

const Sidebar = ({ sidebarOpen, handleLogout }) => {
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState('');
  const [expandedMenus, setExpandedMenus] = useState({
    users: false,
    reports: false,
    team: false,
    settings: false
  });

  // Auto-expand menu based on current route
  useEffect(() => {
    const path = location.pathname;
    const menus = { ...expandedMenus };

    if (path.includes('/dashboard/createuser') || path.includes('/dashboard/alluser') || path.includes('/dashboard/user-activity')) {
      menus.users = true;
    }
    if (path.includes('/dashboard/movementreports') || path.includes('/dashboard/log-report')) {
      menus.reports = true;
    }
    if (path.includes('/dashboard/createteam') || path.includes('/dashboard/allteam') || path.includes('/dashboard/all-team-chat')) {
      menus.team = true;
    }
    if (path.includes('/dashboard/companynames') || path.includes('/dashboard/branchnames') || path.includes('/dashboard/designations') ||
      path.includes('/dashboard/departments') || path.includes('/dashboard/partynames') || path.includes('/dashboard/visitingstatus') ||
      path.includes('/dashboard/roles')) {
      menus.settings = true;
    }

    setExpandedMenus(menus);
  }, [location.pathname]);

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white';
  };

  const isSubmenuActive = (path) => {
    return location.pathname.includes(path) ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white';
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex-shrink-0 transition-transform duration-300 ease-in-out
        flex flex-col border-r border-gray-700
      `}
      aria-label="Sidebar"
    >
      {/* Logo/Header */}
      <div className="flex items-center justify-center h-16 border-b border-gray-700 font-bold text-xl bg-gradient-to-r from-green-700 to-green-900 px-2">
        <span className="flex items-center">
          <FaUserShield className="mr-2" />
          Super Admin Panel
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {/* Dashboard */}
        <Link
          to="/dashboard"
          className={`flex items-center py-3 px-4 rounded hover:bg-gray-700 transition cursor-pointer ${isActive('/dashboard')}`}
          onMouseEnter={() => setActiveMenu('dashboard')}
          onMouseLeave={() => setActiveMenu('')}
        >
          <FaHome className="w-5 h-5 mr-3" />
          <span className="flex-1">Dashboard</span>
          {activeMenu === 'dashboard' && (
            <span className="text-xs bg-blue-500 px-2 py-1 rounded">Overview</span>
          )}
        </Link>

        {/* Users Menu */}
        <div className="space-y-1">
          <button
            onClick={() => toggleMenu('users')}
            className={`flex items-center justify-between w-full py-3 px-4 rounded hover:bg-gray-700 transition cursor-pointer ${isActive('/dashboard/createuser') || isActive('/dashboard/alluser') || isActive('/dashboard/user-activity') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white'}`}
          >
            <div className="flex items-center">
              <TbUsers className="w-5 h-5 mr-3" />
              <span>User Management</span>
            </div>
            {expandedMenus.users ? (
              <FaChevronDown className="text-sm" />
            ) : (
              <FaChevronRight className="text-sm" />
            )}
          </button>

          {expandedMenus.users && (
            <div className="space-y-1 pl-12">
              <Link
                to="/dashboard/createuser"
                className={`flex items-center py-2 px-4 rounded text-sm transition ${isSubmenuActive('/dashboard/createuser')}`}
              >
                <HiUserAdd className="mr-2" /> Create User
              </Link>
              <Link
                to="/dashboard/alluser"
                className={`flex items-center py-2 px-4 rounded text-sm transition ${isSubmenuActive('/dashboard/alluser')}`}
              >
                <FaUsers className="mr-2" /> All Users
              </Link>
              <Link
                to="/dashboard/user-activity"
                className={`flex items-center py-2 px-4 rounded text-sm transition ${isSubmenuActive('/dashboard/user-activity')}`}
              >
                <CgPerformance className="mr-2" /> User Activity
              </Link>
            </div>
          )}
        </div>

        {/* Reports Menu */}
        <div className="space-y-1">
          <button
            onClick={() => toggleMenu('reports')}
            className={`flex items-center justify-between w-full py-3 px-4 rounded hover:bg-gray-700 transition cursor-pointer ${isActive('/dashboard/movementreports') || isActive('/dashboard/log-report') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white'}`}
          >
            <div className="flex items-center">
              <HiOutlineDocumentReport className="w-5 h-5 mr-3" />
              <span>Reports</span>
            </div>
            {expandedMenus.reports ? (
              <FaChevronDown className="text-sm" />
            ) : (
              <FaChevronRight className="text-sm" />
            )}
          </button>

          {expandedMenus.reports && (
            <div className="space-y-1 pl-12">
              <Link
                to="/dashboard/movementreports"
                className={`flex items-center py-2 px-4 rounded text-sm transition ${isSubmenuActive('/dashboard/movementreports')}`}
              >
                <FaChartBar className="mr-2" /> Movement Reports
              </Link>
              <Link
                to="/dashboard/log-report"
                className={`flex items-center py-2 px-4 rounded text-sm transition ${isSubmenuActive('/dashboard/log-report')}`}
              >
                <MdEditOff className="mr-2" /> Log Reports
              </Link>
            </div>
          )}
        </div>

        {/* Team Management Menu */}
        <div className="space-y-1">
          <button
            onClick={() => toggleMenu('team')}
            className={`flex items-center justify-between w-full py-3 px-4 rounded hover:bg-gray-700 transition cursor-pointer ${isActive('/dashboard/createteam') || isActive('/dashboard/allteam') || isActive('/dashboard/all-team-chat') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white'}`}
          >
            <div className="flex items-center">
              <RiTeamLine className="w-5 h-5 mr-3" />
              <span>Team Management</span>
            </div>
            {expandedMenus.team ? (
              <FaChevronDown className="text-sm" />
            ) : (
              <FaChevronRight className="text-sm" />
            )}
          </button>

          {expandedMenus.team && (
            <div className="space-y-1 pl-12">
              <Link
                to="/dashboard/createteam"
                className={`flex items-center py-2 px-4 rounded text-sm transition ${isSubmenuActive('/dashboard/createteam')}`}
              >
                <FaUserPlus className="mr-2" /> Create Team
              </Link>
              <Link
                to="/dashboard/allteam"
                className={`flex items-center py-2 px-4 rounded text-sm transition ${isSubmenuActive('/dashboard/allteam')}`}
              >
                <HiOutlineUserGroup className="mr-2" /> Manage Team
              </Link>
              <Link
                to="/dashboard/all-team-chat"
                className={`flex items-center py-2 px-4 rounded text-sm transition ${isSubmenuActive('/dashboard/all-team-chat')}`}
              >
                <MdOutlineChat className="mr-2" /> Team Chat
              </Link>
            </div>
          )}
        </div>

        {/* Settings Menu */}
        <div className="space-y-1">
          <button
            onClick={() => toggleMenu('settings')}
            className={`flex items-center justify-between w-full py-3 px-4 rounded hover:bg-gray-700 transition cursor-pointer ${isActive('/dashboard/companynames') || isActive('/dashboard/branchnames') || isActive('/dashboard/designations') || isActive('/dashboard/departments') || isActive('/dashboard/partynames') || isActive('/dashboard/visitingstatus') || isActive('/dashboard/roles') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white'}`}
          >
            <div className="flex items-center">
              <LuSettings2 className="w-5 h-5 mr-3" />
              <span>System Settings</span>
            </div>
            {expandedMenus.settings ? (
              <FaChevronDown className="text-sm" />
            ) : (
              <FaChevronRight className="text-sm" />
            )}
          </button>

          {expandedMenus.settings && (
            <div className="grid grid-cols-1 gap-1 pl-12">
              <Link
                to="/dashboard/companynames"
                className={`flex items-center py-2 px-4 rounded text-sm transition ${isSubmenuActive('/dashboard/companynames')}`}
              >
                <FaRegBuilding className="mr-2" /> Company
              </Link>
              <Link
                to="/dashboard/branchnames"
                className={`flex items-center py-2 px-4 rounded text-sm transition ${isSubmenuActive('/dashboard/branchnames')}`}
              >
                <TbGitBranch className="mr-2" /> Branches
              </Link>
              <Link
                to="/dashboard/departments"
                className={`flex items-center py-2 px-4 rounded text-sm transition ${isSubmenuActive('/dashboard/departments')}`}
              >
                <FaTransgender className="mr-2" /> Departments
              </Link>
              <Link
                to="/dashboard/designations"
                className={`flex items-center py-2 px-4 rounded text-sm transition ${isSubmenuActive('/dashboard/designations')}`}
              >
                <CgIfDesign className="mr-2" /> Designations
              </Link>
              <Link
                to="/dashboard/partynames"
                className={`flex items-center py-2 px-4 rounded text-sm transition ${isSubmenuActive('/dashboard/partynames')}`}
              >
                <LiaBusinessTimeSolid className="mr-2" /> Parties
              </Link>
              <Link
                to="/dashboard/visitingstatus"
                className={`flex items-center py-2 px-4 rounded text-sm transition ${isSubmenuActive('/dashboard/visitingstatus')}`}
              >
                <MdPeopleAlt className="mr-2" /> Visit Status
              </Link>
              <Link
                to="/dashboard/roles"
                className={`flex items-center py-2 px-4 rounded text-sm transition ${isSubmenuActive('/dashboard/roles')}`}
              >
                <MdTaskAlt className="mr-2" /> Roles
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Footer/Logout */}
      <div className="border-t border-gray-700 p-4">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full py-2 px-4 rounded bg-gradient-to-r from-red-600 to-red-800 text-white hover:from-red-700 hover:to-red-900 transition cursor-pointer shadow-md hover:shadow-lg"
        >
          <FaSignOutAlt className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;