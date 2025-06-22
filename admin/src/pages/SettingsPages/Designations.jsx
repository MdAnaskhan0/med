import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaTrash, FaEdit, FaPlus, FaSave } from 'react-icons/fa';
import {CgIfDesign} from "react-icons/cg";
import { FiRefreshCw } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import axios from 'axios';

const Designations = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [designations, setDesignations] = useState([]);
  const [newDesignation, setNewDesignation] = useState('');
  const [editID, setEditID] = useState(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/');
  };

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
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} handleLogout={handleLogout} />
      <ToastContainer position="top-right" autoClose={3000} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      <div className="flex flex-col flex-1 w-full">
        <header className="flex items-center justify-between bg-white shadow p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-800 focus:outline-none md:hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Designation Management</h1>
          <button
            onClick={fetchDesignations}
            className="flex items-center text-blue-600 hover:text-blue-800"
            disabled={loading}
          >
            <FiRefreshCw className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </header>

        <main className="flex-grow overflow-auto p-6 bg-gray-50">
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
              <div className="p-6 text-center text-gray-500">
                Loading designations...
              </div>
            ) : designations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"> {index + 1} </td>
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
                            <button
                              onClick={() => handleDelete(item.designationID)}
                              className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition cursor-pointer"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Designations;