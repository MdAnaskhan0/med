import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSearch, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { LuSquareActivity } from "react-icons/lu";
import { FiFilter, FiUser } from 'react-icons/fi';
import { MdDateRange } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/Sidebar/Sidebar';
import axios from 'axios';

const ActivitiesReport = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [userActivity, setUserActivity] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchClicked, setSearchClicked] = useState(false);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/');
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const responseUser = await axios.get(`${baseUrl}/users`);
        setUsers(responseUser.data.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = async () => {
    if (!selectedUser) {
      toast.error("Please select a user.");
      return;
    }

    try {
      setLoading(true);
      setSearchClicked(true);
      const url = `${baseUrl}/user-activities/${selectedUser}`;
      const response = await axios.get(url);
      const allActivities = response.data;

      const filteredActivities = allActivities.filter((activity) => {
        const activityDate = new Date(activity.timestamp);
        const from = fromDate ? new Date(fromDate + 'T00:00:00') : null;
        const to = toDate ? new Date(toDate + 'T23:59:59') : null;

        return (
          (!from || activityDate >= from) &&
          (!to || activityDate <= to)
        );
      });

      setUserActivity(filteredActivities);
      setCurrentPage(1); // Reset to first page on new search
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch activity.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (window.confirm('Are you sure you want to delete this activity record?')) {
      try {
        setLoading(true);
        await axios.delete(`${baseUrl}/user-activities/${activityId}`);
        toast.success('Activity deleted successfully');
        handleSearch();
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete activity');
      } finally {
        setLoading(false);
      }
    }
  };

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = userActivity.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(userActivity.length / rowsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
        <header className="flex items-center justify-between bg-white shadow-sm p-4 border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 focus:outline-none md:hidden hover:text-gray-800 transition-colors"
          >
            {sidebarOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
          </button>
          <div className="flex items-center space-x-2">
            <LuSquareActivity className="text-blue-600 text-xl" />
            <h1 className="text-lg font-semibold text-gray-800">User Activities Report</h1>
          </div>
          <div className="w-5"></div> {/* Spacer for alignment */}
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {/* Filter Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
            <h2 className="text-md font-medium text-gray-800 mb-4 flex items-center">
              <FiFilter className="mr-2 text-blue-600" /> Filter Activities
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* User Dropdown */}
              <div>
                <label htmlFor="user" className="block text-xs font-medium text-gray-600 mb-1 flex items-center">
                  <FiUser className="mr-2 text-blue-600" /> Select User
                </label>
                <select
                  id="user"
                  name="user"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select a user</option>
                  {users.filter(
                    (user) => user.userStatus === 'active'
                  ).map((user) => (
                    <option key={user.userID} value={user.username} className='capitalize'>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Inputs */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center">
                  <MdDateRange className="mr-2 text-blue-600" /> From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center">
                  <MdDateRange className="mr-2 text-blue-600" /> To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className={`mt-2 text-xs px-4 py-2 rounded flex items-center transition-colors ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            >
              <FaSearch className="mr-2" />
              {loading ? 'Searching...' : 'Search Activities'}
            </button>
          </div>

          {/* Activity Logs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-md font-medium text-gray-800">Activity Logs</h2>
              {userActivity.length > 0 && (
                <div className="flex items-center mt-2">
                  <span className="text-xs text-gray-500 mr-2">Show:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {[5, 10, 20, 50, 100, 200, 500, 1000].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-gray-500 ml-4">
                    Total: <span className="font-medium">{userActivity.length}</span> records
                  </span>
                </div>
              )}
            </div>

            {loading && !searchClicked ? (
              <div className="p-8 text-center text-gray-500 text-sm">Loading activities...</div>
            ) : userActivity.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentRows.map((activity, index) => (
                        <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                            {indexOfFirstRow + index + 1}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-800">
                            {activity.username}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                            <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {activity.action}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 font-mono">
                            {activity.ip_address}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                            <button
                              onClick={() => handleDeleteActivity(activity.id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
                              title="Delete"
                            >
                              <FaTrash className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs text-gray-600">
                          Showing <span className="font-medium">{indexOfFirstRow + 1}</span> to{' '}
                          <span className="font-medium">
                            {Math.min(indexOfLastRow, userActivity.length)}
                          </span>{' '}
                          of <span className="font-medium">{userActivity.length}</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => paginate(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <span className="sr-only">Previous</span>
                            <FaChevronLeft className="h-3 w-3" />
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                            <button
                              key={number}
                              onClick={() => paginate(number)}
                              className={`relative inline-flex items-center px-3 py-1 border text-xs font-medium ${
                                currentPage === number
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {number}
                            </button>
                          ))}
                          <button
                            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <span className="sr-only">Next</span>
                            <FaChevronRight className="h-3 w-3" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-sm text-gray-500">
                {searchClicked 
                  ? 'No activities found for the selected filters' 
                  : 'Select a user and date range, then click Search to view activities'}
              </div>
            )}
          </div>
        </main>

        <ToastContainer 
          position="bottom-right" 
          autoClose={3000} 
          toastClassName="text-sm"
          progressClassName="bg-blue-500"
        />
      </div>
    </div>
  );
};

export default ActivitiesReport;