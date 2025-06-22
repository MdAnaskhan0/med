import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../auth/AuthContext';
import { toast } from 'react-toastify';
import { 
  FiUser, FiLock, FiBriefcase, FiHome, 
  FiChevronRight, FiMail, FiPhone 
} from 'react-icons/fi';
import { Skeleton } from '@mui/material';
import LogoutButton from '../../../components/LogoutButton';
import ProfileAvatar from '../../../components/Profile/ProfileAvatar';

const Profile = () => {
    const { user } = useAuth();
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [fileInputKey, setFileInputKey] = useState(Date.now());
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    
    const [isChanging, setIsChanging] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [profileComplete, setProfileComplete] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !user.userID) return;
            setIsLoading(true);
            try {
                const userRes = await axios.get(`${baseUrl}/users/${user.userID}`);
                setUserData(userRes.data.data);
                calculateProfileCompleteness(userRes.data.data);
            } catch (err) {
                console.error('Error fetching user data:', err);
                toast.error('Failed to load user data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const calculateProfileCompleteness = (data) => {
        let complete = 0;
        const fields = ['Name', 'Designation', 'Department', 'Company_name', 'Email', 'Phone'];
        
        fields.forEach(field => {
            if (data[field]) complete += (100 / fields.length);
        });
        
        setProfileComplete(Math.round(complete));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleChangePassword = async () => {
        if (!passwordData.newPassword || !passwordData.confirmPassword) {
            toast.error('Please fill out all password fields.');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        setIsChanging(true);
        try {
            await axios.put(`${baseUrl}/users/change-password/${user.userID}`, {
                newPassword: passwordData.newPassword
            });

            toast.success('Password changed successfully!');
            setPasswordData({
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            console.error('Password change error:', err);
            toast.error(err.response?.data?.message || 'Failed to change password. Try again.');
        } finally {
            setIsChanging(false);
        }
    };

    if (isLoading || !userData) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <Skeleton variant="rectangular" width="100%" height={400} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-end items-start md:items-center mb-8">
                    <div className="mt-4 md:mt-0">
                        <LogoutButton className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium shadow-xs hover:shadow-sm transition-all" />
                    </div>
                </div>
                
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Sidebar - Profile Card */}
                    <div className="w-full lg:w-80 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                            <div className="p-6">
                                <ProfileAvatar 
                                    user={userData} 
                                    userId={user.userID}
                                    baseUrl={baseUrl}
                                    onUpload={() => setFileInputKey(Date.now())}
                                />
                                
                                <div className="mt-4 text-center">
                                    <h2 className="text-xl font-semibold text-gray-900">{userData.Name}</h2>
                                    <p className="text-gray-500 text-sm mt-1">{userData.Designation}</p>
                                    <p className="text-gray-400 text-xs mt-2">Employee ID: {userData.E_ID}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Navigation */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                            <div className="p-4">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">Navigation</h3>
                                <nav className="space-y-1">
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <div className="flex items-center">
                                            <div className={`p-1.5 mr-3 rounded-md ${activeTab === 'profile' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                                <FiUser className="w-4 h-4" />
                                            </div>
                                            <span>Profile Information</span>
                                        </div>
                                        <FiChevronRight className="w-4 h-4 text-gray-400" />
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('password')}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === 'password' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <div className="flex items-center">
                                            <div className={`p-1.5 mr-3 rounded-md ${activeTab === 'password' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                                <FiLock className="w-4 h-4" />
                                            </div>
                                            <span>Password & Security</span>
                                        </div>
                                        <FiChevronRight className="w-4 h-4 text-gray-400" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {activeTab === 'profile' ? (
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                                <div className="border-b border-gray-100 px-6 py-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                                    <p className="text-sm text-gray-500">Your personal details</p>
                                </div>

                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Basic Information */}
                                        <div className="space-y-5">
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Basic Information</h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                                        <div className="px-3.5 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
                                                            <p className="text-gray-900 text-sm">{userData.Name || 'Not provided'}</p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                                                        <div className="px-3.5 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
                                                            <p className="text-gray-900 text-sm">{userData.E_ID || 'Not provided'}</p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                        <div className="px-3.5 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
                                                            <p className="text-gray-900 text-sm">{userData.email || 'Not provided'}</p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                                        <div className="px-3.5 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
                                                            <p className="text-gray-900 text-sm uppercase">{userData.Role || 'Not provided'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Company Information */}
                                        <div className="space-y-5">
                                            <div>
                                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Company Information</h3>
                                                <div className="space-y-4">
                                                    

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                                        <div className="px-3.5 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
                                                            <p className="text-gray-900 text-sm">{userData.Department || 'Not provided'}</p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                                                        <div className="px-3.5 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
                                                            <p className="text-gray-900 text-sm">{userData.Designation || 'Not provided'}</p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                                        <div className="px-3.5 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
                                                            <p className="text-gray-900 text-sm">{userData.Company_name || 'Not provided'}</p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                                        <div className="px-3.5 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
                                                            <p className="text-gray-900 text-sm">{userData.Phone || 'Not provided'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                                <div className="border-b border-gray-100 px-6 py-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Password & Security</h2>
                                    <p className="text-sm text-gray-500">Change your password</p>
                                </div>

                                <div className="p-6">
                                    <div className="max-w-lg space-y-5">
                                        <div>
                                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                            <div className="relative">
                                                <input
                                                    id="newPassword"
                                                    name="newPassword"
                                                    type="password"
                                                    placeholder="Enter new password"
                                                    value={passwordData.newPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                            <div className="relative">
                                                <input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type="password"
                                                    placeholder="Confirm new password"
                                                    value={passwordData.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                onClick={handleChangePassword}
                                                disabled={isChanging}
                                                className={`w-full flex items-center justify-center px-4 py-3 rounded-lg text-white text-sm font-medium ${isChanging ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
                                            >
                                                {isChanging ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Updating Password...
                                                    </>
                                                ) : 'Update Password'}
                                            </button>
                                        </div>

                                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                            <h3 className="text-sm font-medium text-blue-800 mb-2">Password Requirements</h3>
                                            <ul className="text-xs text-blue-600 space-y-1.5">
                                                <li className="flex items-start">
                                                    <svg className="flex-shrink-0 w-3.5 h-3.5 mr-2 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                    Minimum 6 characters (the longer, the better)
                                                </li>
                                                <li className="flex items-start">
                                                    <svg className="flex-shrink-0 w-3.5 h-3.5 mr-2 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                    At least one number or symbol
                                                </li>
                                                <li className="flex items-start">
                                                    <svg className="flex-shrink-0 w-3.5 h-3.5 mr-2 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                    Avoid common passwords or personal information
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;