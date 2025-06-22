import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaUniversity } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import LogOutButton from '../../../../components/LogoutButton';
import { useAuth } from '../../../../auth/AuthContext';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [departmentName, setDepartmentName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const { user } = useAuth();

    const fetchDepartments = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${baseUrl}/departments`);
            setDepartments(response.data);
        } catch (error) {
            toast.error('Failed to fetch departments');
            console.error('Error fetching departments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editingId) {
                await axios.put(`${baseUrl}/departments/${editingId}`, {
                    departmentName,
                });
                toast.success('Department updated successfully');
            } else {
                await axios.post(`${baseUrl}/departments`, {
                    departmentName,
                });
                toast.success('Department added successfully');
            }
            setDepartmentName('');
            setEditingId(null);
            fetchDepartments();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving department');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (dept) => {
        setEditingId(dept.departmentID);
        setDepartmentName(dept.departmentName);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            setIsLoading(true);
            try {
                await axios.delete(`${baseUrl}/departments/${id}`);
                toast.success('Department deleted successfully');
                fetchDepartments();
            } catch (error) {
                toast.error('Failed to delete department');
                console.error('Error deleting department:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <LogOutButton />
            </div>
            <div className="max-w-4xl mx-auto min-h-screen">
                {/* Form Card */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <FaPlus className="mr-2 text-blue-800" />
                        {editingId ? 'Update Department' : 'Add New Department'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={departmentName}
                                onChange={(e) => setDepartmentName(e.target.value)}
                                placeholder="Enter department name"
                                className="px-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`flex items-center justify-center px-4 py-2 rounded-lg text-white ${editingId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-800 hover:bg-blue-900'} min-w-24 cursor-pointer`}
                            >
                                {isLoading ? (
                                    <span className="animate-spin">↻</span>
                                ) : editingId ? (
                                    <>
                                        <FaEdit className="mr-1" /> Update
                                    </>
                                ) : (
                                    <>
                                        <FaPlus className="mr-1" /> Add
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Departments List Card */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                    <div className="p-4 border-b border-gray-200 bg-gray-600">
                        <h2 className="text-lg font-semibold text-white flex items-center">
                            <FaUniversity className="mr-2 text-white" />
                            Departments List
                        </h2>
                    </div>

                    {isLoading && departments.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <div className="animate-spin text-blue-500 text-2xl mb-2">↻</div>
                            Loading departments...
                        </div>
                    ) : departments.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No departments found. Add your first department above.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            NO
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Department Name
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {departments.map((dept, index) => (
                                        <tr key={dept.departmentID} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {dept.departmentName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(dept)}
                                                    className="text-blue-800 hover:text-blue-900 mr-4"
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                                {
                                                    user.role === 'admin' && (
                                                        <button
                                                            onClick={() => handleDelete(dept.departmentID)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Delete"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Departments;
