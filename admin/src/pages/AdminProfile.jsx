import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import axios from 'axios';
import { FaBars, FaTimes, FaChartLine, FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdPassword, MdOutlineSecurity } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminProfile = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const adminID = localStorage.getItem('adminID');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      toast.error('Please fill in all fields', { position: 'top-right' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match', { position: 'top-right' });
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters', { position: 'top-right' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/admin/change-password`, {
        adminID,
        oldPassword,
        newPassword,
        confirmNewPassword,
      });

      toast.success(response.data.message || 'Password changed successfully', {
        position: 'top-right',
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Something went wrong';
      toast.error(errorMessage, { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <ToastContainer autoClose={3000} hideProgressBar={true} />

      {/* Sidebar for desktop and mobile */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleLogout={handleLogout}
        className="fixed md:relative z-20"
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="flex items-center justify-between bg-white shadow-sm p-4 border-b border-gray-200">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-blue-600 focus:outline-none md:hidden transition-colors duration-200"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <FaTimes className="h-6 w-6" />
            ) : (
              <FaBars className="h-6 w-6" />
            )}
          </button>

          <div className="flex items-center justify-between w-full md:space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MdOutlineSecurity className="text-blue-600 text-xl" />
              </div>
              <h1 className="text-xl font-semibold text-gray-800">Super Admin Profile</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-gradient-to-br from-blue-50 to-gray-50">
          <div className="max-w-4xl mx-auto">
            {/* Profile Overview Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FaUser className="text-blue-600 text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Super Admin Account</h2>
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <MdPassword className="text-blue-600 text-2xl" />
                  <h2 className="text-xl font-semibold text-gray-800">Change Password</h2>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  Ensure your account is using a strong password
                </p>
              </div>

              <div className="p-6 space-y-4">
                {/* Old Password */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <FaLock className="mr-2 text-blue-500" />
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    />
                    <button
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-blue-600"
                    >
                      {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <FaLock className="mr-2 text-blue-500" />
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    />
                    <button
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-blue-600"
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <FaLock className="mr-2 text-blue-500" />
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    />
                    <button
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-blue-600"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className={`w-full flex justify-center items-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all ${loading ? 'opacity-80 cursor-not-allowed' : 'hover:shadow-md'
                      }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminProfile;