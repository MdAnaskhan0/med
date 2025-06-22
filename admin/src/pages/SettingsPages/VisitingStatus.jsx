import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaEdit, FaTrash, FaSave, FaPlus, FaSearch } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Sidebar from '../../components/Sidebar/Sidebar';

const VisitingStatus = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [newStatus, setNewStatus] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const API_URL = `${baseUrl}/visitingstatus`; 

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/');
    toast.info('Logged out successfully');
  };

  const fetchStatuses = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL);
      if (Array.isArray(response.data)) {
        setStatuses(response.data);
      } else {
        setStatuses([]);
        toast.error('Invalid data format from server');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to fetch visiting statuses');
      setStatuses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newStatus.trim()) {
      toast.warning('Please enter a status name');
      return;
    }

    try {
      await axios.post(API_URL, { visitingstatusname: newStatus });
      setNewStatus('');
      toast.success('Status added successfully');
      fetchStatuses();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving status');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      toast.success('Status deleted successfully');
      fetchStatuses();
    } catch (err) {
      console.error('Error deleting status', err);
      toast.error('Failed to delete status');
    }
  };

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleUpdate = async (id) => {
    if (!editingName.trim()) {
      toast.warning('Please enter a valid status name');
      return;
    }

    try {
      await axios.put(`${API_URL}/${id}`, { visitingstatusname: editingName });
      setEditingId(null);
      setEditingName('');
      toast.success('Status updated successfully');
      fetchStatuses();
    } catch (err) {
      console.error('Error updating status', err);
      toast.error('Failed to update status');
    }
  };

  const filteredStatuses = statuses.filter(status =>
    status.visitingstatusname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchStatuses();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} handleLogout={handleLogout} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className="flex flex-col flex-1 w-full">
        <header className="flex items-center justify-between bg-white shadow-sm p-4 border-b">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 focus:outline-none md:hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Visiting Status Management</h1>
          <div className="w-5"></div> {/* Spacer for alignment */}
        </header>

        <main className="flex-grow overflow-auto p-6">
          <ToastContainer position="top-right" autoClose={3000} />
          
          <div className="max-w-4xl mx-auto">
            {/* Header and Search */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Visiting Statuses</h2>
              <div className="relative w-full md:w-64">
                {/* <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search statuses..."
                /> */}
              </div>
            </div>

            {/* Add New Status */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Add New Status</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new visiting status"
                  onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                />
                <button
                  onClick={handleAdd}
                  className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 cursor-pointer"
                >
                  <FaPlus /> Add Status
                </button>
              </div>
            </div>

            {/* Status List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-600 flex justify-between">
                <h3 className="text-lg font-medium text-white">No</h3>
                <h3 className="text-lg font-medium text-white">Status List</h3>
                <h3 className='text-lg font-medium text-white pr-4'>Action</h3>
              </div>
              
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-3 text-gray-600">Loading statuses...</p>
                </div>
              ) : filteredStatuses.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {filteredStatuses.map((status, index) => (
                    <li key={status.visitingstatusID} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                      {editingId === status.visitingstatusID ? (
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                            onKeyPress={(e) => e.key === 'Enter' && handleUpdate(status.visitingstatusID)}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdate(status.visitingstatusID)}
                              className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50 transition-colors duration-200 cursor-pointer"
                              title="Save"
                            >
                              <FaSave />
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditingName('');
                              }}
                              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                              title="Cancel"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className='text-gray-800'>{index+1}</span>
                          <span className="text-gray-800">{status.visitingstatusname}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(status.visitingstatusID, status.visitingstatusname)}
                              className="text-blue-800 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this status?')) {
                                  handleDelete(status.visitingstatusID);
                                }
                              }}
                              className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors duration-200 cursor-pointer"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">
                    {searchTerm ? 'No matching statuses found' : 'No statuses available'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VisitingStatus;