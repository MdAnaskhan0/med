import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaPlus, FaSave, FaEdit, FaTrash, FaCodeBranch, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LogOutButton from '../../../../components/LogoutButton';
import { useAuth } from '../../../../auth/AuthContext';

const Branchs = () => {
    const [branches, setBranches] = useState([]);
    const [formData, setFormData] = useState({ branchname: '', address: '' });
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const API_URL = `${baseUrl}/branchnames`;
    const { user } = useAuth();

    // Fetch all branches
    const fetchBranches = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(API_URL);
            setBranches(res.data);
        } catch (err) {
            toast.error('Failed to fetch branches');
            console.error('Failed to fetch branches', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    // Handle form submit (create or update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`${API_URL}/${editingId}`, formData);
                toast.success('Branch updated successfully');
            } else {
                await axios.post(API_URL, formData);
                toast.success('Branch added successfully');
            }
            setFormData({ branchname: '', address: '' });
            setEditingId(null);
            fetchBranches();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error saving branch');
        }
    };

    // Edit branch
    const handleEdit = (branch) => {
        setFormData({ branchname: branch.branchname, address: branch.address });
        setEditingId(branch.branchnameID);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Delete branch
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this branch?')) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                toast.success('Branch deleted successfully');
                fetchBranches();
            } catch (err) {
                toast.error('Error deleting branch');
                console.error('Error deleting branch:', err);
            }
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({ branchname: '', address: '' });
        setEditingId(null);
    };

    return (
        <>
            <div className='min-h-screen'>
                <div className="flex justify-end mb-4">
                    <LogOutButton />
                </div>
                {/* Form Card */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">
                            {editingId ? 'Edit Branch' : 'Add New Branch'}
                        </h2>
                        {editingId && (
                            <button
                                onClick={resetForm}
                                className="text-gray-500 hover:text-gray-700"
                                title="Cancel"
                            >
                                <FaTimesCircle className="h-5 w-5" />
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                                <input
                                    type="text"
                                    name="branchname"
                                    value={formData.branchname}
                                    onChange={(e) => setFormData({ ...formData, branchname: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter branch name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter branch address"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-2">
                            <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 bg-blue-800 border border-transparent rounded-md font-semibold text-white hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                            >
                                {editingId ? (
                                    <>
                                        <FaSave className="mr-2" /> Update Branch
                                    </>
                                ) : (
                                    <>
                                        <FaPlus className="mr-2" /> Add Branch
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Branch List Card */}
                <div className="bg-gray-600 rounded-lg shadow-md overflow-hidden border border-gray-100">
                    <div className="p-4 border-b border-gray-200 flex items-center">
                        <FaCodeBranch className="text-white mr-2" />
                        <h2 className="text-lg font-semibold text-white">Branch List</h2>
                    </div>

                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                            <p className="mt-2 text-gray-100">Loading branches...</p>
                        </div>
                    ) : branches.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-100">No branches found. Add a new branch to get started.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NO</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {branches.map((branch, index) => (
                                        <tr key={branch.branchnameID} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{branch.branchname}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{branch.address}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(branch)}
                                                        className="text-blue-800 hover:text-blue-900 p-1 rounded hover:bg-blue-50 cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <FaEdit className="h-4 w-4" />
                                                    </button>
                                                    {user.role === 'admin' && (
                                                        <button
                                                            onClick={() => handleDelete(branch.branchnameID)}
                                                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 cursor-pointer"
                                                            title="Delete"
                                                        >
                                                            <FaTrash className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Branchs;
