import React, { useState, useEffect } from 'react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import { FaBars, FaTimes, FaUserCog, FaSave, FaInfoCircle } from 'react-icons/fa';
import { HiOutlineShieldCheck } from 'react-icons/hi';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const menuItems = [
    {
        category: "User Management",
        icon: <FaUserCog className="mr-2" />,
        items: [
            { name: "Create User", path: "/admin/create-user" },
            { name: "All Users", path: "/admin/Users" },
            { name: "User Profile", path: "/admin/user-profile" },
        ]
    },
    {
        category: "Movement Report",
        icon: <HiOutlineShieldCheck className="mr-2" />,
        items: [
            { name: "Movement Status", path: "/user/upload-report" },
            { name: "Movement Report", path: "/user/UserReport" },
            { name: "All Movement Reports", path: "/admin/movement-reports" },
        ]
    },
    {
        category: "Team Management",
        icon: <FaUserCog className="mr-2" />,
        items: [
            { name: "Create Team", path: "/admin/teams/create-team" },
            { name: "User Team Report", path: "/team/team-report" },
            { name: "User Team Info", path: "/team/manage-team" },
            { name: "User Team Message", path: "/user/team-massage" },
            { name: "All Teams Info", path: "/admin/teams" },
            { name: "Team Manage", path: "/team"},
        ]
    },
    {
        category: "Settings",
        icon: <HiOutlineShieldCheck className="mr-2" />,
        items: [
            { name: "Company Names", path: "/admin/companynames" },
            { name: "Department Names", path: "/admin/departments" },
            { name: "Branch Names", path: "/admin/branchs" },
            { name: "Designation Names", path: "/admin/designations" },
            { name: "Visiting Status", path: "/admin/visitingstatus" },
            { name: "Parties Names", path: "/admin/parties" },
        ]
    }
];

const ProfileAccess = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [accessState, setAccessState] = useState({});
    const { userID } = useParams();
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const userRes = await axios.get(`${baseUrl}/users/${userID}`);
                setUser(userRes.data.data);

                const permRes = await axios.get(`${baseUrl}/permissions/users/${userID}/permissions`);

                const initialState = {};
                menuItems.forEach(category => {
                    category.items.forEach(item => {
                        initialState[item.path] = permRes.data.data[item.path] || false;
                    });
                });

                setAccessState(initialState);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load user data');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userID, baseUrl]);

    const handleToggle = (path) => {
        setAccessState(prev => ({
            ...prev,
            [path]: !prev[path],
        }));
    };

    const handleAccessSave = async () => {
        try {
            setSaving(true);
            await axios.put(`${baseUrl}/permissions/users/${userID}/permissions`, {
                permissions: accessState
            });
            toast.success('Permissions updated successfully!');
            setTimeout(() => {
                navigate(`/dashboard/userprofile/${userID}`);
            }, 1000);
        } catch (err) {
            console.error(err);
            toast.error('Failed to update permissions');
        } finally {
            setSaving(false);
        }
    };

    const handleSelectAll = (categoryIndex) => {
        const newAccessState = { ...accessState };
        menuItems[categoryIndex].items.forEach(item => {
            newAccessState[item.path] = true;
        });
        setAccessState(newAccessState);
    };

    const handleDeselectAll = (categoryIndex) => {
        const newAccessState = { ...accessState };
        menuItems[categoryIndex].items.forEach(item => {
            newAccessState[item.path] = false;
        });
        setAccessState(newAccessState);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <div className="m-auto flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-600">Loading user permissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex flex-col flex-1 w-full overflow-hidden">
                <header className="flex items-center justify-between bg-white shadow-sm p-4 border-b border-gray-200">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-gray-600 focus:outline-none md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        {sidebarOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
                    </button>
                    <div className="flex items-center space-x-2">
                        <HiOutlineShieldCheck className="h-6 w-6 text-blue-600" />
                        <h1 className="text-xl font-semibold text-gray-800">User Access Management</h1>
                    </div>
                    <div className="w-8"></div> {/* Spacer for alignment */}
                </header>

                <main className="flex-1 overflow-auto p-4 md:p-6">
                    {/* User Information Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-center mb-4">
                            <FaUserCog className="h-5 w-5 text-blue-600 mr-2" />
                            <h2 className="text-lg font-semibold text-gray-800">User Information</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs font-medium text-gray-500 uppercase">Employee ID</p>
                                <p className="font-medium text-gray-800">{user?.E_ID || 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs font-medium text-gray-500 uppercase">Name</p>
                                <p className="font-medium text-gray-800">{user?.Name || 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs font-medium text-gray-500 uppercase">User Role</p>
                                <p className="font-medium text-gray-800">{user?.Role || 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs font-medium text-gray-500 uppercase">Department</p>
                                <p className="font-medium text-gray-800">{user?.Department || 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs font-medium text-gray-500 uppercase">Designation</p>
                                <p className="font-medium text-gray-800">{user?.Designation || 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs font-medium text-gray-500 uppercase">Company</p>
                                <p className="font-medium text-gray-800">{user?.Company_name || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Permissions Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <HiOutlineShieldCheck className="h-5 w-5 text-blue-600 mr-2" />
                                <h2 className="text-lg font-semibold text-gray-800">Access Permissions</h2>
                            </div>
                            <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                <FaInfoCircle className="mr-1" />
                                <span>Toggle permissions as needed</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {menuItems.map((category, catIndex) => (
                                <div key={catIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                                        <div className="flex items-center">
                                            {category.icon}
                                            <h3 className="text-sm font-semibold text-gray-600 uppercase">{category.category}</h3>
                                        </div>
                                        <div className="flex space-x-1">
                                            <button 
                                                onClick={() => handleSelectAll(catIndex)}
                                                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                                            >
                                                All
                                            </button>
                                            <button 
                                                onClick={() => handleDeselectAll(catIndex)}
                                                className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                                            >
                                                None
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {category.items.map((item, itemIndex) => (
                                            <label 
                                                key={itemIndex} 
                                                className={`flex items-center cursor-pointer p-2 rounded-md transition ${accessState[item.path] ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                                            >
                                                <div className="relative inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={!!accessState[item.path]}
                                                        onChange={() => handleToggle(item.path)}
                                                    />
                                                    <div className={`w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer ${accessState[item.path] ? 'peer-checked:bg-blue-600' : ''} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all`}></div>
                                                </div>
                                                <span className="ml-3 text-sm font-medium text-gray-700">{item.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end mt-8 space-x-4">
                            <button
                                onClick={() => navigate(`/dashboard/userprofile/${userID}`)}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAccessSave}
                                disabled={saving}
                                className={`px-6 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md transition-all duration-200 flex items-center ${saving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {saving ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <FaSave className="mr-2" />
                                        Save Permissions
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProfileAccess;