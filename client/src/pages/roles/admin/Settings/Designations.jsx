import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaPlus, FaSave, FaTimes, FaTrash } from 'react-icons/fa';
import { CgIfDesign } from 'react-icons/cg';
import LogOutButton from '../../../../components/LogoutButton';
import { useAuth } from '../../../../auth/AuthContext';

const Designations = () => {
    const [designations, setDesignations] = useState([]);
    const [newDesignation, setNewDesignation] = useState('');
    const [editID, setEditID] = useState(null);
    const [editName, setEditName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const { user } = useAuth();

    // Fetch designations on load
    useEffect(() => {
        fetchDesignations();
    }, []);

    const fetchDesignations = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${baseUrl}/designations`);
            setDesignations(res.data);
        } catch (error) {
            console.error('Error fetching designations:', error);
            toast.error('Failed to load designations');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newDesignation.trim()) {
            toast.warning('Please enter a designation name');
            return;
        }

        try {
            await axios.post(`${baseUrl}/designations`, {
                designationName: newDesignation
            });
            setNewDesignation('');
            fetchDesignations();
            toast.success('Designation added successfully');
        } catch (error) {
            console.error('Error adding designation:', error);
            toast.error('Failed to add designation');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this designation?')) {
            try {
                await axios.delete(`${baseUrl}/designations/${id}`);
                fetchDesignations();
                toast.success('Designation deleted successfully');
            } catch (error) {
                console.error('Error deleting designation:', error);
                toast.error('Failed to delete designation');
            }
        }
    };

    const handleEdit = (id, name) => {
        setEditID(id);
        setEditName(name);
    };

    const handleUpdate = async () => {
        if (!editName.trim()) {
            toast.warning('Please enter a designation name');
            return;
        }

        try {
            await axios.put(`${baseUrl}/designations/${editID}`, {
                designationName: editName
            });
            setEditID(null);
            setEditName('');
            fetchDesignations();
            toast.success('Designation updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error saving designation');
        }
    };

    const cancelEdit = () => {
        setEditID(null);
        setEditName('');
    };

    return (
        <div className='min-h-screen p-4'>
            <div className="flex justify-end mb-4">
                <LogOutButton />
            </div>
            {/* Add New Designation Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Designation</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Enter designation name"
                        className="flex-grow border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        value={newDesignation}
                        onChange={(e) => setNewDesignation(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <button
                        onClick={handleAdd}
                        className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center justify-center transition duration-200 cursor-pointer"
                    >
                        <FaPlus className="mr-2" />
                        Add Designation
                    </button>
                </div>
            </div>

            {/* Designations List Card */}
            <div className="bg-gray-600 rounded-lg shadow-md overflow-hidden border border-gray-100">
                <div className="p-4 border-b border-gray-200 flex items-center">
                    <CgIfDesign className="text-white mr-2" />
                    <h2 className="text-lg font-semibold text-white">Designation List</h2>
                </div>

                {loading && designations.length === 0 ? (
                    <div className="p-6 text-center text-gray-100">
                        Loading designations...
                    </div>
                ) : designations.length === 0 ? (
                    <div className="p-6 text-center text-gray-100">
                        No designations found. Add one to get started.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NO</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {designations.map((item, index) => (
                                    <tr key={item.designationID} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {editID === item.designationID ? (
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="border border-gray-300 p-1 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                    autoFocus
                                                />
                                            ) : (
                                                item.designationName
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex space-x-2">
                                                {editID === item.designationID ? (
                                                    <>
                                                        <button
                                                            onClick={handleUpdate}
                                                            className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50 transition cursor-pointer"
                                                            title="Save"
                                                        >
                                                            <FaSave />
                                                        </button>
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-50 transition cursor-pointer"
                                                            title="Cancel"
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => handleEdit(item.designationID, item.designationName)}
                                                        className="text-blue-800 hover:text-blue-900 p-1 rounded-full hover:bg-yellow-50 transition cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                )}
                                                {user.role === 'admin' && (
                                                    <button
                                                        onClick={() => handleDelete(item.designationID)}
                                                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition cursor-pointer"
                                                        title="Delete"
                                                    >
                                                        <FaTrash />
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
    );
};

export default Designations;
