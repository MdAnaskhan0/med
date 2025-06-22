import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaEdit, FaTrash, FaSave, FaPlus } from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import { MdPeople } from "react-icons/md";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import axios from 'axios';

const PartyNames = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const [partyname, setPartyname] = useState('');
  const [partyaddress, setPartyaddress] = useState('');
  const [partyList, setPartyList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const apiUrl = `${baseUrl}/partynames`;

  // Fetch all parties
  const fetchParties = async () => {
    setLoading(true);
    try {
      const res = await axios.get(apiUrl);
      setPartyList(res.data);
    } catch (err) {
      console.error('Error fetching parties:', err);
      toast.error('Failed to load parties');
    } finally {
      setLoading(false);
    }
  };

  // Create new party
  const handleCreate = async () => {
    try {
      await axios.post(apiUrl, { partyname, partyaddress });
      setPartyname('');
      setPartyaddress('');
      fetchParties();
      toast.success('Party created successfully');
    } catch (err) {
      if (err.response) {
        toast.error(err.response?.data?.message || 'Error saving party');
      } else {
        toast.error('Network error. Please try again.');
      }
    }
  };

  // Update existing party
  const handleUpdate = async () => {
    try {
      await axios.put(`${apiUrl}/${editId}`, { partyname, partyaddress });
      setPartyname('');
      setPartyaddress('');
      setEditId(null);
      fetchParties();
      toast.success('Party updated successfully');
    } catch (err) {
      toast.error('Error updating party', err);
    }
  };

  // Delete party
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this party?')) return;
    try {
      await axios.delete(`${apiUrl}/${id}`);
      fetchParties();
      toast.success('Party deleted successfully');
    } catch (err) {
      console.error('Error deleting party:', err);
      toast.error('Failed to delete party');
    }
  };

  // Start editing a party
  const handleEdit = (party) => {
    setPartyname(party.partyname);
    setPartyaddress(party.partyaddress);
    setEditId(party.partynameID);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch parties once on component mount
  useEffect(() => {
    fetchParties();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} handleLogout={handleLogout} />
      <ToastContainer position="top-right" autoClose={3000} />

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
        <header className="flex items-center justify-between bg-white shadow p-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-800 focus:outline-none md:hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <FaTimes className="h-6 w-6" />
            ) : (
              <FaBars className="h-6 w-6" />
            )}
          </button>

          <h1 className="text-xl font-semibold text-gray-800">Party Management</h1>

          <button
            onClick={fetchParties}
            className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 transition"
            disabled={loading}
          >
            <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </header>

        {/* Content */}
        <main className="flex-grow overflow-auto p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            {/* Form Card */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                {editId ? 'Update Party' : 'Add New Party'}
              </h2>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  editId ? handleUpdate() : handleCreate();
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Party Name</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={partyname}
                      onChange={e => setPartyname(e.target.value)}
                      required
                      placeholder="Enter party name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Party Address</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={partyaddress}
                      onChange={e => setPartyaddress(e.target.value)}
                      required
                      placeholder="Enter party address"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                  >
                    {editId ? (
                      <>
                        <FaSave /> Update
                      </>
                    ) : (
                      <>
                        <FaPlus /> Create
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Party List Card */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-gray-600 px-4 py-3 rounded-t-lg -mx-6 -mt-6 mb-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white flex items-center"><MdPeople className='mr-2' /> Party List</h2>
                  <span className="text-sm text-white">
                    Total: {partyList.length} {partyList.length === 1 ? 'Party' : 'Parties'}
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <FiRefreshCw className="animate-spin text-blue-500 text-2xl" />
                </div>
              ) : partyList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No parties found. Create one to get started.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          No.
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Party Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Address
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {partyList.map((party, index) => (
                        <tr key={party.partynameID} className="hover:bg-gray-50">
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            <div className='font-medium text-gray-900'>{index + 1}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{party.partyname}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-500">{party.partyaddress}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEdit(party)}
                              className="text-blue-800 hover:text-blue-900 mr-4 cursor-pointer"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(party.partynameID)}
                              className="text-red-600 hover:text-red-900 cursor-pointer"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PartyNames;