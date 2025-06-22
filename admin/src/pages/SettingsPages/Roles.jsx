import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBars, FaTimes, FaEdit, FaTrash, FaSave, FaPlus, FaSearch } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../components/Sidebar/Sidebar';

const Roles = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // Roles state
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  // Form state
  const [rolename, setRolename] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  // For editing
  const [editRoleID, setEditRoleID] = useState(null);
  // Loading & error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/');
  };

  // Fetch all roles
  const fetchRoles = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${baseUrl}/roles`); 
      setRoles(res.data);
      setFilteredRoles(res.data);
    } catch (err) {
      setError('Failed to fetch roles');
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Filter roles based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRoles(roles);
    } else {
      const filtered = roles.filter(role =>
        role.rolename.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRoles(filtered);
    }
  }, [searchTerm, roles]);

  // Capitalize the first letter for display
  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Handle form submit for add or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedRolename = rolename.trim();
    if (!trimmedRolename) {
      setError('Role name cannot be empty');
      toast.warning('Please enter a role name');
      return;
    }
    
    setError('');
    try {
      const roleData = { rolename: trimmedRolename.toLowerCase() };
      
      if (editRoleID) {
        await axios.put(`${baseUrl}/roles/${editRoleID}`, roleData);
        setRoles((prev) =>
          prev.map((role) =>
            role.roleID === editRoleID ? { ...role, rolename: trimmedRolename.toLowerCase() } : role
          )
        );
        toast.success('Role updated successfully');
      } else {
        const res = await axios.post(`${baseUrl}/roles`, roleData);
        setRoles((prev) => [...prev, res.data]);
        toast.success('Role added successfully');
      }
      setRolename('');
      setEditRoleID(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving role');
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  // Handle delete
  const handleDelete = async (roleID) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await axios.delete(`${baseUrl}/roles/${roleID}`);
      setRoles((prev) => prev.filter((role) => role.roleID !== roleID));
      toast.success('Role deleted successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete role';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  // Start editing a role
  const startEdit = (role) => {
    setRolename(capitalize(role.rolename));
    setEditRoleID(role.roleID);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel editing
  const cancelEdit = () => {
    setRolename('');
    setEditRoleID(null);
    setError('');
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
        />
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

          <h1 className="text-xl font-semibold text-gray-800">Role Management</h1>
        </header>

        {/* Content */}
        <main className="flex-grow overflow-auto p-6 bg-gray-50">
          <section className="max-w-4xl mx-auto">
            {/* Role form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {editRoleID ? 'Update Role' : 'Add New Role'}
              </h2>
              
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="flex-grow">
                  <label htmlFor="rolename" className="block text-sm font-medium text-gray-700 mb-1">
                    Role Name
                  </label>
                  <input
                    type="text"
                    id="rolename"
                    placeholder="Enter role name"
                    value={rolename}
                    onChange={(e) => setRolename(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-800 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-900 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                  >
                    {editRoleID ? (
                      <>
                        <FaSave /> Update Role
                      </>
                    ) : (
                      <>
                        <FaPlus /> Add Role
                      </>
                    )}
                  </button>

                  {editRoleID && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Search and roles table */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4 bg-gray-600 px-4 py-3 rounded-t-lg">
                <h2 className="text-lg font-semibold text-white">All Roles</h2>
                {/* <div className="relative w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div> */}
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredRoles.length === 0 ? (
                <div className="text-center py-8">
                  {searchTerm ? (
                    <p className="text-gray-500">No roles found matching your search.</p>
                  ) : (
                    <p className="text-gray-500">No roles available. Add your first role above.</p>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          No
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRoles.map((role, index) => (
                        <tr key={role.roleID} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index+1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {capitalize(role.rolename)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => startEdit(role)}
                                className="text-blue-800 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition cursor-pointer"
                                aria-label="Edit role"
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete(role.roleID)}
                                className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition cursor-pointer"
                                aria-label="Delete role"
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
          </section>
        </main>
      </div>
    </div>
  );
};

export default Roles;