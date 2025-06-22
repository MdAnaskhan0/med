import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FaBars,
    FaTimes,
    FaUserEdit,
    FaTrash,
    FaSave,
    FaTimesCircle,
    FaUpload,
    FaUserCircle,
    FaBuilding,
    FaPhone,
    FaEnvelope,
    FaIdBadge,
    FaUserTie,
    FaUsers,
    FaUserShield,
    FaLock,
    FaEye,
    FaEyeSlash
} from 'react-icons/fa';
import { TbLockAccess } from "react-icons/tb";
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar/Sidebar';
import axios from 'axios';

const UserProfile = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [formData, setFormData] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [company, setCompany] = useState([]);
    const [department, setDepartment] = useState([]);
    const [designation, setDesignation] = useState([]);
    const [role, setRole] = useState([]);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const { userID } = useParams();

    useEffect(() => {
        const fetchData = async () => {
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
        };
        fetchData();
    }, [userID, baseUrl]);

    useEffect(() => {
        const fetchDropdownData = async () => {
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
        };
        fetchDropdownData();
    }, [baseUrl]);

    const resizeImage = (file) => {
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
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            toast.error('Please select an image file');
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
        if (!window.confirm('Are you sure you want to delete your profile picture?')) return;

        try {
            await axios.delete(`${baseUrl}/profile-image/${userID}`);
            setPreview(null);
            toast.success('Profile image deleted successfully');
        } catch (err) {
            toast.error('Failed to delete profile image');
        }
    };

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
            <div>
                <p className="font-bold mb-2">Are you sure you want to delete this user?</p>
                <p className="text-sm mb-3">This action cannot be undone.</p>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={() => toast.dismiss()}
                        className="px-3 py-1 bg-gray-300 rounded"
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
                        className="px-3 py-1 bg-red-500 text-white rounded"
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

    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        navigate('/');
        toast.info('You have been logged out');
    };

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

    const renderInfoItem = (icon, label, value) => (
        <div className="flex items-start mb-4">
            <div className="text-blue-800 mr-3 mt-1">{icon}</div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="font-medium">{value || '-'}</p>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} handleLogout={handleLogout} />
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div className="flex flex-col flex-1 w-full overflow-hidden">
                <header className="flex items-center justify-between bg-white shadow-sm p-4 border-b">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-gray-600 hover:text-gray-900 focus:outline-none md:hidden"
                        aria-label="Toggle sidebar"
                    >
                        {sidebarOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800 ml-4">User Profile</h1>
                    <div className="w-6" />
                </header>

                <main className="flex-grow overflow-auto p-4 md:p-6 bg-gray-100">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto text-center">
                            <div className="text-red-500 mb-4">
                                <FaTimesCircle className="inline-block text-4xl" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Error Loading Profile</h2>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                {/* Profile Header */}
                                <div className="bg-gradient-to-r from-gray-600 to-gray-500 p-6 text-white">
                                    <div className="flex flex-col md:flex-row items-center">
                                        <div className="relative mb-4 md:mb-0 md:mr-6">
                                            {preview ? (
                                                <img
                                                    src={preview}
                                                    alt="Profile"
                                                    className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-md"
                                                />
                                            ) : (
                                                <div className="w-32 h-32 rounded-full bg-blue-100 border-4 border-white flex items-center justify-center shadow-md">
                                                    <FaUserCircle className="text-blue-400 text-6xl" />
                                                </div>
                                            )}
                                            <label
                                                htmlFor="profile-upload"
                                                className="absolute bottom-0 right-0 bg-white text-blue-600 rounded-full p-2 shadow-md cursor-pointer hover:bg-blue-50 transition"
                                                title="Upload new photo"
                                            >
                                                <FaUpload />
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
                                            <h2 className="text-2xl font-bold">{userData?.Name}</h2>
                                            <p className="text-blue-100">{userData?.Designation}</p>
                                            <p className="text-blue-100">{userData?.Company_name}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Content */}
                                <div className="p-6">
                                    {preview && (
                                        <div className="flex justify-end mb-4">
                                            <button
                                                onClick={handleDelete}
                                                className="text-red-500 hover:text-red-700 text-sm flex items-center cursor-pointer"
                                                disabled={isUploading}
                                            >
                                                <FaTrash className="mr-1" /> Remove Photo
                                            </button>
                                        </div>
                                    )}

                                    <div className="border-b pb-4 mb-6">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
                                            <div className='flex'>
                                                {!editMode && (
                                                    <button
                                                        onClick={() => setEditMode(true)}
                                                        className="text-blue-800 hover:text-blue-900 flex items-center cursor-pointer"
                                                    >
                                                        <FaUserEdit className="mr-1" /> Edit Profile
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => navigate(`/dashboard/profile-access/${userID}`)}
                                                    className="text-green-800 hover:text-green-900 ml-4 flex items-center cursor-pointer">
                                                    <TbLockAccess className="mr-1" />
                                                    Access
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {editMode ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-medium mb-1">Username</label>
                                                    <input
                                                        type="text"
                                                        name="username"
                                                        value={formData.username || ''}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-medium mb-1">Role</label>
                                                    <select
                                                        name="Role"
                                                        value={formData.Role || ''}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                                    <label className="block text-gray-700 text-sm font-medium mb-1">Name</label>
                                                    <input
                                                        type="text"
                                                        name="Name"
                                                        value={formData.Name || ''}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-medium mb-1">Phone</label>
                                                    <input
                                                        type="text"
                                                        name="Phone"
                                                        value={formData.Phone || ''}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email || ''}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>



                                            <div>
                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-medium mb-1">EID</label>
                                                    <input
                                                        type="text"
                                                        name="E_ID"
                                                        value={formData.E_ID || ''}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-medium mb-1">Department</label>
                                                    <select
                                                        name="Department"
                                                        value={formData.Department || ''}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                                    <label className="block text-gray-700 text-sm font-medium mb-1">Designation</label>
                                                    <select
                                                        name="Designation"
                                                        value={formData.Designation || ''}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="">Select Designation</option>
                                                        {designation.map((des) => (
                                                            <option key={des.designationID} value={des.designationName}>
                                                                {des.designationName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="mb-4">
                                                    <label className="block text-gray-700 text-sm font-medium mb-1">Company</label>
                                                    <select
                                                        name="Company_name"
                                                        value={formData.Company_name || ''}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                                    <label className="block text-gray-700 text-sm font-medium mb-1">Status</label>
                                                    <select
                                                        name="userStatus"
                                                        value={formData.userStatus || ''}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="active">Active</option>
                                                        <option value="deactive">Deactive</option>
                                                    </select>
                                                </div>


                                            </div>

                                            <div className="md:col-span-2 flex justify-end space-x-3">
                                                <button
                                                    onClick={() => setEditMode(false)}
                                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
                                                >
                                                    <FaTimesCircle className="mr-2" /> Cancel
                                                </button>
                                                <button
                                                    onClick={handleUpdateUser}
                                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                                                >
                                                    <FaSave className="mr-2" /> Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                {renderInfoItem(<FaUserCircle />, "Username", userData?.username)}
                                                {renderInfoItem(<FaUserTie />, "Role", userData?.Role)}
                                                {renderInfoItem(<FaUserTie />, "Name", userData?.Name)}
                                                {renderInfoItem(<FaPhone />, "Phone", userData?.Phone)}
                                                {renderInfoItem(<FaEnvelope />, "Email", userData?.email)}
                                            </div>
                                            <div>
                                                {renderInfoItem(<FaIdBadge />, "EID", userData?.E_ID)}
                                                {renderInfoItem(<FaBuilding />, "Company", userData?.Company_name)}
                                                {renderInfoItem(<FaUsers />, "Department", userData?.Department)}
                                                {renderInfoItem(<FaUserShield />, "Designation", userData?.Designation)}
                                                {renderInfoItem(<FaUserShield />, "Account Status", userData?.userStatus)}
                                            </div>
                                        </div>
                                    )}

                                    {!editMode && (
                                        <div className="mt-8 pt-6 border-t">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                                <FaLock className="mr-2" /> Change Password
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div className="relative">
                                                    <label className="block text-gray-700 text-sm font-medium mb-1">New Password</label>
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        placeholder="Enter new password"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                    </button>
                                                </div>
                                                <div className="relative">
                                                    <label className="block text-gray-700 text-sm font-medium mb-1">Confirm Password</label>
                                                    <input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        placeholder="Confirm new password"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                                    </button>
                                                </div>
                                            </div>

                                            {passwordError && (
                                                <div className="text-red-500 text-sm mb-4">{passwordError}</div>
                                            )}

                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <button
                                                        onClick={handleChangePassword}
                                                        disabled={isChangingPassword}
                                                        className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center ${isChangingPassword ? 'opacity-70 cursor-not-allowed' : ''}`}
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
                                                            <>Change Password</>
                                                        )}
                                                    </button>
                                                </div>
                                                <div>
                                                    <button
                                                        onClick={handleDeleteUser}
                                                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center"
                                                    >
                                                        <FaTrash className="mr-2" /> Delete Account
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default UserProfile;