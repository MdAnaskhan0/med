import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserPlus, FaIdCard, FaUserTie, FaBuilding, FaPhone, FaEnvelope, FaBars, FaTimes, FaLock, FaUserCircle } from 'react-icons/fa';
import { MdDepartureBoard, MdCancel, MdCheckCircle } from 'react-icons/md';
import Sidebar from '../components/Sidebar/Sidebar';
import { SiGoogletasks } from "react-icons/si";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateUser = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [roles, setRoles] = useState([]);
    const [designation, setDesignation] = useState([]);
    const [department, setDepartment] = useState([]);
    const [company, setCompany] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        eid: '',
        name: '',
        designation: '',
        department: '',
        company: '',
        phone: '',
        email: '',
        role: ''
    });
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [touchedFields, setTouchedFields] = useState({});
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    // Fetch all data
    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [rolesRes, designationsRes, departmentsRes, companiesRes] = await Promise.all([
                axios.get(`${baseUrl}/roles`),
                axios.get(`${baseUrl}/designations`),
                axios.get(`${baseUrl}/departments`),
                axios.get(`${baseUrl}/companynames`)
            ]);
            
            setRoles(rolesRes.data);
            setDesignation(designationsRes.data);
            setDepartment(departmentsRes.data);
            setCompany(companiesRes.data.data || companiesRes.data);
        } catch (err) {
            setError('Failed to fetch data');
            toast.error('Failed to load required data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        navigate('/');
    };

    const handleCancel = () => {
        navigate('/dashboard');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Mark field as touched
        setTouchedFields(prev => ({
            ...prev,
            [name]: true
        }));

        // Calculate password strength
        if (name === 'password') {
            calculatePasswordStrength(value);
        }
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length > 5) strength += 1;
        if (password.length > 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        setPasswordStrength(strength);
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouchedFields(prev => ({
            ...prev,
            [name]: true
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${baseUrl}/users`, formData);

            if (response.data.status === 'ok') {
                toast.success('User created successfully!', {
                    icon: <MdCheckCircle className="text-green-500 text-xl" />
                });
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            } else {
                toast.error(`Error: ${response.data.message}`);
            }
        } catch (err) {
            console.error("Create user error", err);
            if (err.response) {
                toast.error(`Error: ${err.response.data.message || 'Failed to create user'}`);
            } else {
                toast.error('Network error. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength === 0) return 'bg-gray-200';
        if (passwordStrength <= 2) return 'bg-red-500';
        if (passwordStrength === 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength === 0) return '';
        if (passwordStrength <= 2) return 'Weak';
        if (passwordStrength === 3) return 'Moderate';
        return 'Strong';
    };

    const isFieldValid = (fieldName) => {
        if (!touchedFields[fieldName]) return true;
        return !!formData[fieldName];
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            {/* Sidebar */}
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
                <header className="flex items-center justify-between bg-white shadow-sm p-4">
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-gray-600 focus:outline-none md:hidden"
                        aria-label="Toggle sidebar"
                    >
                        {sidebarOpen ? (
                            <FaTimes className="h-6 w-6" />
                        ) : (
                            <FaBars className="h-6 w-6" />
                        )}
                    </button>
                    <div className="w-6"></div> {/* Spacer for alignment */}
                </header>

                {/* Content */}
                <main className="flex-grow overflow-auto p-4 md:p-6 bg-white">
                    <div className="max-w-5xl mx-auto">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                            <div className="bg-gradient-to-r from-blue-700 to-blue-800 p-5 text-white">
                                <div className="flex items-center">
                                    <FaUserPlus className="text-2xl mr-3" />
                                    <div>
                                        <h1 className="text-2xl font-bold">Create New User</h1>
                                        <p className="text-blue-100">Fill in all required fields to register a new user</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Username Field */}
                                    <div className="space-y-2">
                                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 flex items-center">
                                            <FaUserCircle className="mr-2 text-blue-600" />
                                            Username <span className='text-red-500 ml-1'>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-4 py-2.5 border ${isFieldValid('username') ? 'border-gray-300' : 'border-red-400'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                                            placeholder="e.g., johndoe"
                                            required
                                        />
                                        {!isFieldValid('username') && (
                                            <p className="text-red-500 text-xs mt-1">Username is required</p>
                                        )}
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-2">
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 flex items-center">
                                            <FaLock className="mr-2 text-blue-600" />
                                            Password <span className='text-red-500 ml-1'>*</span>
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-4 py-2.5 border ${isFieldValid('password') ? 'border-gray-300' : 'border-red-400'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                                            placeholder="Enter secure password"
                                            required
                                        />
                                        {formData.password && (
                                            <div className="mt-2">
                                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                    <span>Password Strength: {getPasswordStrengthText()}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div 
                                                        className={`h-1.5 rounded-full ${getPasswordStrengthColor()}`} 
                                                        style={{ width: `${passwordStrength * 20}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Employee ID Field */}
                                    <div className="space-y-2">
                                        <label htmlFor="eid" className="block text-sm font-medium text-gray-700 flex items-center">
                                            <FaIdCard className="mr-2 text-blue-600" />
                                            Employee ID <span className='text-red-500 ml-1'>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="eid"
                                            name="eid"
                                            value={formData.eid}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-4 py-2.5 border ${isFieldValid('eid') ? 'border-gray-300' : 'border-red-400'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                                            placeholder="e.g., EMP12345"
                                            required
                                        />
                                    </div>

                                    {/* Full Name Field */}
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 flex items-center">
                                            <FaUserTie className="mr-2 text-blue-600" />
                                            Full Name <span className='text-red-500 ml-1'>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-4 py-2.5 border ${isFieldValid('name') ? 'border-gray-300' : 'border-red-400'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                                            placeholder="e.g., John Doe"
                                            required
                                        />
                                    </div>

                                    {/* Department Dropdown */}
                                    <div className="space-y-2">
                                        <label htmlFor="department" className="block text-sm font-medium text-gray-700 flex items-center">
                                            <MdDepartureBoard className="mr-2 text-blue-600" />
                                            Department <span className='text-red-500 ml-1'>*</span>
                                        </label>
                                        <select
                                            id="department"
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-4 py-2.5 border ${isFieldValid('department') ? 'border-gray-300' : 'border-red-400'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white`}
                                            required
                                        >
                                            <option value="">Select Department</option>
                                            {department.map((departmentItem) => (
                                                <option key={departmentItem.departmentID} value={departmentItem.departmentName}>
                                                    {departmentItem.departmentName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Designation Dropdown */}
                                    <div className="space-y-2">
                                        <label htmlFor="designation" className="block text-sm font-medium text-gray-700 flex items-center">
                                            <FaUserTie className="mr-2 text-blue-600" />
                                            Designation <span className='text-red-500 ml-1'>*</span>
                                        </label>
                                        <select
                                            id="designation"
                                            name="designation"
                                            value={formData.designation}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-4 py-2.5 border ${isFieldValid('designation') ? 'border-gray-300' : 'border-red-400'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white`}
                                            required
                                        >
                                            <option value="">Select Designation</option>
                                            {designation.map((designationItem) => (
                                                <option key={designationItem.designationID} value={designationItem.designationName}>
                                                    {designationItem.designationName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Company Dropdown */}
                                    <div className="space-y-2">
                                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 flex items-center">
                                            <FaBuilding className="mr-2 text-blue-600" />
                                            Company <span className='text-red-500 ml-1'>*</span>
                                        </label>
                                        <select
                                            id="company"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-4 py-2.5 border ${isFieldValid('company') ? 'border-gray-300' : 'border-red-400'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white`}
                                            required
                                        >
                                            <option value="">Select Company</option>
                                            {company.map((companyItem) => (
                                                <option key={companyItem.companynameID} value={companyItem.companyname}>
                                                    {companyItem.companyname}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Phone Number Field */}
                                    <div className="space-y-2">
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 flex items-center">
                                            <FaPhone className="mr-2 text-blue-600" />
                                            Phone Number <span className='text-red-500 ml-1'>*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-4 py-2.5 border ${isFieldValid('phone') ? 'border-gray-300' : 'border-red-400'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                                            placeholder="e.g., +1 234 567 890"
                                            required
                                        />
                                    </div>

                                    {/* Email Field */}
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 flex items-center">
                                            <FaEnvelope className="mr-2 text-blue-600" />
                                            Email <span className='text-red-500 ml-1'>*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-4 py-2.5 border ${isFieldValid('email') ? 'border-gray-300' : 'border-red-400'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                                            placeholder="e.g., john.doe@company.com"
                                            required
                                        />
                                    </div>

                                    {/* Role Dropdown */}
                                    <div className="space-y-2">
                                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 flex items-center">
                                            <SiGoogletasks className="mr-2 text-blue-600" />
                                            Role <span className='text-red-500 ml-1'>*</span>
                                        </label>
                                        <select
                                            id="role"
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full px-4 py-2.5 border ${isFieldValid('role') ? 'border-gray-300' : 'border-red-400'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white`}
                                            required
                                        >
                                            <option value="">Select Role</option>
                                            {roles.map((role) => (
                                                <option key={role.roleID} value={role.rolename} className='capitalize'>
                                                    {role.rolename}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
                                    <button
                                        onClick={handleCancel}
                                        type="button"
                                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                                        disabled={loading}
                                    >
                                        <MdCancel className="mr-2" />
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center disabled:opacity-70"
                                        disabled={loading}
                                    >
                                        <FaUserPlus className="mr-2" />
                                        {loading ? 'Creating User...' : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CreateUser;