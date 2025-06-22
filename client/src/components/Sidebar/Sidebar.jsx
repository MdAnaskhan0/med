import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
    FiMenu, FiX, FiChevronDown, FiChevronRight,
    FiHome, FiUser, FiUpload, FiFileText, FiActivity,
    FiUserPlus, FiUsers, FiMessageSquare, FiBriefcase,
    FiLayers, FiMapPin, FiAward, FiFlag, FiSettings,
} from 'react-icons/fi';
import axios from 'axios';
import { FaAccusoft, FaTeamspeak } from 'react-icons/fa';

// Define all possible menu items with their paths
const allMenuItems = {
    dashboard: {
        name: 'Dashboard',
        path: '/dashboard',
        icon: <FiHome size={18} />
    },
    profile: {
        name: 'Profile',
        path: '/user/profile',
        icon: <FiUser size={18} />
    },
    // Users Submenu 
    users: {
        name: 'Users',
        icon: <FiUsers size={18} />,
        submenu: {
            createUser: {
                name: 'Create User',
                path: '/admin/create-user',
                icon: <FiUserPlus size={18} />
            },
            usersList: {
                name: 'All Users',
                path: '/admin/Users',
                icon: <FiUsers size={18} />
            }
        }
    },
    // Movement Submenu
    movement: {
        name: 'Movement Report',
        icon: <FaAccusoft size={18} />,
        submenu: {
            uploadReport: {
                name: 'Movement Status',
                path: '/user/upload-report',
                icon: <FiUpload size={18} />
            },
            userReport: {
                name: 'My Reports',
                path: '/user/UserReport',
                icon: <FiFileText size={18} />
            },
            movementReports: {
                name: 'All Movement Reports',
                path: '/admin/movement-reports',
                icon: <FiActivity size={18} />
            },
        }
    },
    // Teams Submenu
    teams: {
        name: 'Teams',
        icon: <FaTeamspeak size={18} />,
        submenu: {
            createTeam: {
                name: 'Create Team',
                path: '/admin/teams/create-team',
                icon: <FiUserPlus size={18} />
            },
            teamInformation: {
                name: "Team Information",
                path: "/team/manage-team",
                icon: <FaTeamspeak size={18} />
            },
            teamReport: {
                name: "Team Report",
                path: "/team/team-report",
                icon: <FaTeamspeak size={18} />
            },
            teamMassage: {
                name: 'Team Messages',
                path: '/user/team-massage',
                icon: <FiMessageSquare size={18} />
            },
            teamsList: {
                name: 'Teams List',
                path: '/admin/teams',
                icon: <FiUsers size={18} />
            },
        }
    },
    // Settings Submenu
    settings: {
        name: 'Settings',
        icon: <FiSettings size={18} />,
        submenu: {
            companies: {
                name: 'Companies',
                path: '/admin/companynames',
                icon: <FiBriefcase size={18} />
            },
            departments: {
                name: 'Departments',
                path: '/admin/departments',
                icon: <FiLayers size={18} />
            },
            designations: {
                name: 'Designations',
                path: '/admin/designations',
                icon: <FiAward size={18} />
            },
            branchs: {
                name: 'Branchs',
                path: '/admin/branchs',
                icon: <FiMapPin size={18} />
            },
            parties: {
                name: 'Parties',
                path: '/admin/parties',
                icon: <FiUsers size={18} />
            },
            visitingStatus: {
                name: 'Visiting Status',
                path: '/admin/visitingstatus',
                icon: <FiFlag size={18} />
            },
        }
    }
};

export default function Sidebar() {
    const { user } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const sidebarRef = useRef(null);
    const [profileImage, setProfileImage] = useState(null);
    const [permissions, setPermissions] = useState(null);
    const [openSubmenus, setOpenSubmenus] = useState({});
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const res = await axios.get(`${baseUrl}/permissions/users/${user.userID}/permissions`);
                setPermissions(res.data.data);
            } catch (error) {
                console.error('Error fetching permissions:', error);
            }
        };

        if (user?.userID) {
            fetchPermissions();
        }
    }, [user, baseUrl]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isMobile && isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobile, isOpen]);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsOpen(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (user?.id) {
            setProfileImage(`/profile-image/${user.id}`);
        }
    }, [user]);

    const toggleSubmenu = (menuKey) => {
        setOpenSubmenus(prev => ({
            ...prev,
            [menuKey]: !prev[menuKey]
        }));
    };

    const hasPermission = (path) => {
        if (!path) return false;
        // Always allow dashboard and profile
        if (['/dashboard', '/user/profile'].includes(path)) return true;
        return permissions && permissions[path] === 1;
    };

    const hasAnySubmenuPermission = (submenuItems) => {
        return Object.values(submenuItems).some(item => hasPermission(item.path));
    };

    const handleLinkClick = () => {
        if (isMobile) setIsOpen(false);
    };

    const renderMenuItem = (item, key) => {
        if (item.submenu) {
            if (!hasAnySubmenuPermission(item.submenu)) return null;

            return (
                <li key={key}>
                    <button
                        onClick={() => toggleSubmenu(key)}
                        className={`w-full flex justify-between items-center px-4 py-3 rounded-lg transition-colors ${openSubmenus[key] ? 'bg-gray-700' : 'hover:bg-gray-700'
                            }`}
                    >
                        <span className="flex items-center">
                            {item.icon && <span className="mr-3 text-indigo-400">{item.icon}</span>}
                            <span>{item.name}</span>
                        </span>
                        {openSubmenus[key] ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                    </button>
                    {openSubmenus[key] && (
                        <ul className="ml-8 mt-1 space-y-1">
                            {Object.entries(item.submenu).map(([subKey, subItem]) => (
                                hasPermission(subItem.path) && (
                                    <li key={subKey}>
                                        <Link
                                            to={subItem.path}
                                            onClick={handleLinkClick}
                                            className={`block px-4 py-2 rounded-lg transition-colors ${location.pathname === subItem.path
                                                    ? 'bg-indigo-600 text-white font-medium'
                                                    : 'text-gray-300 hover:bg-gray-700'
                                                }`}
                                        >
                                            <span className="flex items-center">
                                                {subItem.icon && <span className="mr-3 text-indigo-400">{subItem.icon}</span>}
                                                <span>{subItem.name}</span>
                                            </span>
                                        </Link>
                                    </li>
                                )
                            ))}
                        </ul>
                    )}
                </li>
            );
        } else {
            if (!hasPermission(item.path)) return null;

            return (
                <li key={key}>
                    <Link
                        to={item.path}
                        onClick={handleLinkClick}
                        className={`block px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path
                                ? 'bg-indigo-600 text-white font-medium'
                                : 'text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        <span className="flex items-center">
                            {item.icon && <span className="mr-3 text-indigo-400">{item.icon}</span>}
                            <span>{item.name}</span>
                        </span>
                    </Link>
                </li>
            );
        }
    };

    if (!user) return null;

    if (permissions === null) {
        return (
            <div className="fixed md:relative inset-y-0 left-0 z-50 w-72 bg-gray-800 p-4">
                <div className="animate-pulse flex flex-col space-y-4">
                    <div className="h-16 bg-gray-700 rounded"></div>
                    <div className="h-10 bg-gray-700 rounded"></div>
                    <div className="h-10 bg-gray-700 rounded"></div>
                    <div className="h-10 bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
                aria-label="Toggle menu"
            >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {isOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                ref={sidebarRef}
                className={`fixed md:relative inset-y-0 left-0 z-50 w-72 bg-gray-800 text-gray-100 p-4 shadow-xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Profile */}
                    <div className="px-3 py-4 mb-4 border-b border-gray-700 flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-600 flex items-center justify-center text-white font-bold">
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '';
                                    }}
                                />
                            ) : (
                                <span>{user.name?.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-100 truncate">{user.name}</h1>
                            <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                        </div>
                    </div>

                    {/* Menu items */}
                    <ul className="flex-1 space-y-1 overflow-y-auto">
                        {Object.entries(allMenuItems).map(([key, item]) => (
                            renderMenuItem(item, key)
                        ))}
                    </ul>
                </div>
            </aside>
        </>
    );
}