import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import LogOutButton from '../../../components/LogoutButton';
import {
    FaUserPlus,
    FaUserTie,
    FaIdCard,
    FaBuilding,
    FaPhone,
    FaEnvelope,
    FaLock,
    FaUserCircle
} from 'react-icons/fa';
import { MdDepartureBoard, MdCancel, MdCheckCircle } from 'react-icons/md';
import { SiGoogletasks } from 'react-icons/si';

const CreateUser = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        eid: '',
        name: '',
        department: '',
        designation: '',
        company: '',
        phone: '',
        email: '',
        role: ''
    });

    const [department, setDepartment] = useState([]);
    const [designation, setDesignation] = useState([]);
    const [company, setCompany] = useState([]);
    const [roles, setRoles] = useState([]);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [touchedFields, setTouchedFields] = useState({});

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [deptRes, desigRes, compRes, rolesRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/departments`),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/designations`),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/companynames`),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/roles`)
                ]);

                setCompany(compRes.data.data || compRes.data);
                setDepartment(deptRes.data.data || deptRes.data);
                setDesignation(desigRes.data.data || desigRes.data);
                setRoles(rolesRes.data.data || rolesRes.data);
            } catch (err) {
                console.error("Error fetching dropdown data:", err);
                toast.error('Failed to load dropdown data');
            }
        };

        fetchDropdownData();
    }, []);

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

    const handleCancel = () => {
        navigate(-1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/users`,
                formData
            );

            if (response.data.status === 'ok') {
                toast.success('User created successfully!', {
                    icon: <MdCheckCircle className="text-green-500 text-xl" />
                });
                setTimeout(() => {
                    navigate('/admin/users');
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
        <div className="min-h-screen bg-white p-4 md:p-6">
            <div className='flex items-center justify-end mb-6'>
                <LogOutButton className="bg-gray-100 hover:bg-gray-200" />
            </div>
            
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-5 text-white">
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
        </div>
    );
};

export default CreateUser;