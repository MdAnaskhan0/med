import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LogoutButton from '../../../components/LogoutButton';
import {
  FaUserCircle, FaUserTie, FaPhone, FaEnvelope,
  FaIdBadge, FaBuilding, FaUsers, FaUserShield
} from 'react-icons/fa';

const UserProfile = () => {
  const { userID } = useParams();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  // State management
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [userRes, imageRes] = await Promise.all([
        axios.get(`${baseUrl}/users/${userID}`),
        axios.get(`${baseUrl}/profile-image/${userID}`, {
          responseType: 'blob',
        }).catch(err => {
          if (err.response?.status === 404) return null;
          throw err;
        })
      ]);

      setUserData(userRes.data.data);

      if (imageRes) {
        const imageUrl = URL.createObjectURL(imageRes.data);
        setPreview(imageUrl);
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  }, [userID, baseUrl]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Helper function to render info items
  const renderInfoItem = (icon, label, value) => (
    <div className="flex items-start mb-4">
      <div className="text-blue-600 mr-3 mt-1">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-gray-800">{value || 'Not specified'}</p>
      </div>
    </div>
  );

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 mb-4 text-5xl">
            <FaTimesCircle className="inline-block" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Error Loading Profile</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='flex items-center justify-end mb-4'>
        <LogoutButton />
      </div>
      <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white">
              <div className="flex flex-col md:flex-row items-center">
                <div className="relative mb-4 md:mb-0 md:mr-8">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Profile"
                      className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-blue-100 border-4 border-white flex items-center justify-center shadow-lg">
                      <FaUserCircle className="text-blue-400 text-7xl" />
                    </div>
                  )}
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-bold mb-1">{userData?.Name}</h2>
                  <p className="text-blue-100 text-lg mb-1">{userData?.Designation}</p>
                  <p className="text-blue-100">{userData?.Company_name}</p>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6 md:p-8">
              {/* Personal Information Section */}
              <div className="pb-6 mb-6">
                <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                  <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {renderInfoItem(<FaUserCircle className="text-indigo-500" />, "Username", userData?.username)}
                    {renderInfoItem(<FaUserTie className="text-indigo-500" />, "Role", userData?.Role)}
                    {renderInfoItem(<FaUserTie className="text-indigo-500" />, "Name", userData?.Name)}
                    {renderInfoItem(<FaPhone className="text-indigo-500" />, "Phone", userData?.Phone)}
                    {renderInfoItem(<FaEnvelope className="text-indigo-500" />, "Email", userData?.email)}
                  </div>
                  <div>
                    {renderInfoItem(<FaIdBadge className="text-indigo-500" />, "Employee ID", userData?.E_ID)}
                    {renderInfoItem(<FaBuilding className="text-indigo-500" />, "Company", userData?.Company_name)}
                    {renderInfoItem(<FaUsers className="text-indigo-500" />, "Department", userData?.Department)}
                    {renderInfoItem(<FaUserShield className="text-indigo-500" />, "Designation", userData?.Designation)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;