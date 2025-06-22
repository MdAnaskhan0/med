import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LogoutButton from '../../../components/LogoutButton';
import {
  FaUserCircle, FaUserTie, FaPhone, FaEnvelope,
  FaIdBadge, FaBuilding, FaUsers, FaUserShield,
  FaLock, FaEye, FaEyeSlash, FaTrash, FaUserEdit,
  FaSave, FaTimesCircle, FaUpload, FaCheck, FaTimes
} from 'react-icons/fa';

const UserProfile = () => {
  const { user } = useAuth();
  const { userID } = useParams();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  // State management
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Dropdown data
  const [company, setCompany] = useState([]);
  const [department, setDepartment] = useState([]);
  const [designation, setDesignation] = useState([]);
  const [role, setRole] = useState([]);

  // Password change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      setFormData(userRes.data.data);

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

  // Fetch dropdown data
  const fetchDropdownData = useCallback(async () => {
    try {
      const [resCompany, resDepartment, resDesignation, resRole] = await Promise.all([
        axios.get(`${baseUrl}/companynames`),
        axios.get(`${baseUrl}/departments`),
        axios.get(`${baseUrl}/designations`),
        axios.get(`${baseUrl}/roles`)
      ]);

      setCompany(resCompany.data.data);
      setDepartment(resDepartment.data);
      setDesignation(resDesignation.data);
      setRole(resRole.data);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      toast.error('Failed to load dropdown options');
    }
  }, [baseUrl]);

  useEffect(() => {
    fetchUserData();
    fetchDropdownData();
  }, [fetchUserData, fetchDropdownData]);

  // Image handling
  const resizeImage = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas is empty'));
              return;
            }
            if (blob.size > 1024 * 1024) {
              reject(new Error('File size exceeds 1MB after resizing'));
              return;
            }
            resolve(blob);
          },
          'image/jpeg',
          0.9
        );
      };

      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      toast.error('Please select an image file (JPEG, PNG)');
      return;
    }

    setIsUploading(true);
    try {
      const resizedBlob = await resizeImage(file);

      const formData = new FormData();
      formData.append('image', resizedBlob, file.name);

      const res = await axios.post(`${baseUrl}/profile-image/${userID}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const imageUrl = URL.createObjectURL(resizedBlob);
      setPreview(imageUrl);
      toast.success(res.data.message || 'Profile image updated successfully');
    } catch (err) {
      toast.error(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    toast.info(
      <div className="p-4">
        <div className="text-lg font-semibold mb-2">Delete Profile Picture</div>
        <p className="mb-4">Are you sure you want to delete your profile picture?</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => toast.dismiss()}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss();
              try {
                await axios.delete(`${baseUrl}/profile-image/${userID}`);
                setPreview(null);
                toast.success('Profile image deleted successfully');
              } catch (err) {
                toast.error('Failed to delete profile image');
              }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
      }
    );
  };

  // Form handling
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateUser = async () => {
    try {
      const res = await axios.put(`${baseUrl}/users/${userID}`, formData);
      toast.success(res.data.message || 'User updated successfully');
      setUserData(formData);
      setEditMode(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed. Please try again.');
    }
  };

  const handleDeleteUser = async () => {
    toast.warning(
      <div className="p-4">
        <div className="text-lg font-semibold mb-2">Delete User Account</div>
        <p className="mb-1">This action cannot be undone.</p>
        <p className="mb-4">All user data will be permanently removed.</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => toast.dismiss()}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss();
              try {
                await axios.delete(`${baseUrl}/users/${userID}`);
                toast.success('User deleted successfully');
                navigate('/users');
              } catch (err) {
                toast.error('Failed to delete user');
              }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete Account
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
      }
    );
  };

  // Password change
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setPasswordError('Both fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setPasswordError('');
    setIsChangingPassword(true);

    try {
      const response = await axios.put(`${baseUrl}/users/change-password/${userID}`, {
        newPassword
      });

      if (response.data.success) {
        setNewPassword('');
        setConfirmPassword('');
        toast.success('Password changed successfully');
      } else {
        throw new Error(response.data.message || 'Failed to change password');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

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
                <div className="relative mb-4 md:mb-0 md:mr-8 group">
                  {preview ? (
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Profile"
                        className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-105"
                      />
                      {isUploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-blue-100 border-4 border-white flex items-center justify-center shadow-lg">
                      <FaUserCircle className="text-blue-400 text-7xl" />
                    </div>
                  )}
                  <label
                    htmlFor="profile-upload"
                    className={`absolute bottom-0 right-0 bg-white text-blue-600 rounded-full p-2 shadow-md cursor-pointer hover:bg-blue-50 transition-all duration-200 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Upload new photo"
                  >
                    {isUploading ? (
                      <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-blue-600 rounded-full"></div>
                    ) : (
                      <FaUpload />
                    )}
                    <input
                      id="profile-upload"
                      type="file"
                      onChange={handleUpload}
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-bold mb-1">{userData?.Name}</h2>
                  <p className="text-blue-100 text-lg mb-1">{userData?.Designation}</p>
                  <p className="text-blue-100">{userData?.Company_name}</p>
                  {preview && (
                    <button
                      onClick={handleDelete}
                      className={`mt-3 text-sm flex items-center justify-center md:justify-start bg-gray-600 px-4 py-2 rounded-2xl text-blue-100 hover:text-white transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isUploading}
                    >
                      <FaTrash className="mr-1" /> Remove Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6 md:p-8">
              {/* Personal Information Section */}
              <div className="pb-6 mb-6">
                <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                  <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center text-blue-800 hover:text-blue-900 transition-colors"
                    >
                      <FaUserEdit className="mr-2" /> Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setEditMode(false)}
                        className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        <FaTimes className="mr-2" /> Cancel
                      </button>
                      <button
                        onClick={handleUpdateUser}
                        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <FaSave className="mr-2" /> Save
                      </button>
                    </div>
                  )}
                </div>

                {editMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Username</label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username || ''}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Role</label>
                        <select
                          name="Role"
                          value={formData.Role || ''}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Role</option>
                          {role.map((r) => (
                            <option key={r.roleID} value={r.rolename}>
                              {r.rolename}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Name</label>
                        <input
                          type="text"
                          name="Name"
                          value={formData.Name || ''}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Phone</label>
                        <input
                          type="text"
                          name="Phone"
                          value={formData.Phone || ''}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email || ''}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Employee ID</label>
                        <input
                          type="text"
                          name="E_ID"
                          value={formData.E_ID || ''}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Company</label>
                        <select
                          name="Company_name"
                          value={formData.Company_name || ''}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Company</option>
                          {company.map((c) => (
                            <option key={c.companynameID} value={c.companyname}>
                              {c.companyname}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Department</label>
                        <select
                          name="Department"
                          value={formData.Department || ''}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Department</option>
                          {department.map((d) => (
                            <option key={d.departmentID} value={d.departmentName}>
                              {d.departmentName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Designation</label>
                        <select
                          name="Designation"
                          value={formData.Designation || ''}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Designation</option>
                          {designation.map((des) => (
                            <option key={des.designationID} value={des.designationName}>
                              {des.designationName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* <div className='mb-4'>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Account Status</label>
                        <select
                          name="userStatus"
                          value={formData.userStatus || ''}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Account Status</option>
                          <option value="active">Active</option>
                          <option value="deactive">Deactive</option>
                        </select>
                      </div> */}
                    </div>
                  </div>
                ) : (
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
                      {renderInfoItem(<FaUserShield className="text-indigo-500" />, "Account Status", userData?.userStatus)}
                    </div>
                  </div>
                )}
              </div>

              {/* Password Change Section */}
              {!editMode && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <FaLock className="text-indigo-500 mr-2" /> Change Password
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="relative">
                      <label className="block text-gray-700 text-sm font-medium mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-gray-700 text-sm font-medium mb-2">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {passwordError && (
                    <div className="text-red-500 text-sm mb-4 flex items-center">
                      <FaTimes className="mr-2" /> {passwordError}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <button
                      onClick={handleChangePassword}
                      disabled={isChangingPassword || !newPassword || !confirmPassword}
                      className={`px-6 py-2 rounded-lg flex items-center ${isChangingPassword || !newPassword || !confirmPassword ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-800 hover:bg-blue-900'} text-white transition-colors duration-200`}
                    >
                      {isChangingPassword ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Changing...
                        </>
                      ) : (
                        <>
                          <FaCheck className="mr-2" /> Change Password
                        </>
                      )}
                    </button>

                    {
                      user.role === 'admin' && (
                        <button
                          onClick={handleDeleteUser}
                          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center transition-colors duration-200"
                        >
                          <FaTrash className="mr-2" /> Delete Account
                        </button>
                      )
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;