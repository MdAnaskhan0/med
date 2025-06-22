import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaTimes,
  FaUniversity,
  FaSearch,
  FaFileExport,
  FaFilter,
  FaUser,
  FaCalendarAlt
} from 'react-icons/fa';
import { MdOutlineDataUsage } from 'react-icons/md';
import { FiRefreshCw } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/Sidebar/Sidebar';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import { format, parseISO } from 'date-fns';
import { utils, writeFile } from 'xlsx';

const LogReport = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [users, setUsers] = useState([]);
  const [userLogData, setUserLogData] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // Fields to display with their display names
  const displayFields = [
    { key: 'dateTime', label: 'Date Time' },
    { key: 'visitingStatus', label: 'Visiting Status' },
    { key: 'placeName', label: 'Place Name' },
    { key: 'partyName', label: 'Party Name' },
    { key: 'purpose', label: 'Purpose' },
    { key: 'remark', label: 'Remark' },
    { key: 'punchTime', label: 'Punch Time' },
    { key: 'punchingTime', label: 'Punching Time' }
  ];

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const pageCount = Math.ceil(filteredLogs.length / rowsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(0);
  };

  // Get current logs for pagination
  const currentLogs = filteredLogs.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [usersResponse, logsResponse] = await Promise.all([
          axios.get(`${baseUrl}/users`),
          axios.get(`${baseUrl}/movement-logs`)
        ]);

        setUsers(usersResponse.data.data || []);
        setUserLogData(logsResponse.data || []);
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error(`Failed to fetch data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = async () => {
    if (!selectedUser) {
      toast.warning("Please select a user");
      return;
    }
    if (!fromDate || !toDate) {
      toast.warning("Please select both date range");
      return;
    }

    try {
      setIsSearching(true);
      const filtered = userLogData.filter((log) => {
        if (log.userID !== Number(selectedUser)) return false;

        const logDate = new Date(log.editTime);
        const from = new Date(fromDate);
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);

        return logDate >= from && logDate <= to;
      });

      setFilteredLogs(filtered);
      setCurrentPage(0);

      if (filtered.length === 0) {
        toast.info("No logs found for the selected filters");
      } else {
        toast.success(`Found ${filtered.length} logs`);
      }
    } catch (error) {
      toast.error("Error filtering logs");
      console.error("Filter error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setSelectedUser('');
    setFromDate('');
    setToDate('');
    setFilteredLogs([]);
    setCurrentPage(0);
  };

  // Format date for display
  const formatDateDisplay = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'PPpp');
    } catch {
      return dateString;
    }
  };

  const exportToExcel = () => {
    if (filteredLogs.length === 0) {
      toast.warning("No data to export");
      return;
    }

    // Prepare the data with headers
    const data = [
      // First row - main headers
      [
        'No',
        'User',
        'Edit Time',
        'Original Data',
        '', '', '', '', '', '', '', // Placeholders for original data columns
        'Updated Data',
        '', '', '', '', '', '', ''  // Placeholders for updated data columns
      ],
      // Second row - field headers
      [
        '', '', '', // Empty for No, User, Edit Time
        // Original Data fields
        'Date Time', 'Visiting Status', 'Place Name', 'Party Name', 'Purpose', 'Remark', 'Punch Time', 'Punching Time',
        // Updated Data fields
        'Date Time', 'Visiting Status', 'Place Name', 'Party Name', 'Purpose', 'Remark', 'Punch Time', 'Punching Time'
      ],
      // Third row onwards - actual data
      ...filteredLogs.map((log, index) => {
        const user = users.find(u => u.userID === log.userID);
        const row = [
          index + 1,
          user ? user.username : 'Unknown',
          formatDateDisplay(log.editTime)
        ];

        try {
          const original = JSON.parse(log.originalData);
          const updated = JSON.parse(log.updatedData);

          // Add original data fields
          displayFields.forEach(field => {
            row.push(
              field.key.includes('Time') || field.key.includes('date')
                ? formatDateDisplay(original[field.key])
                : original[field.key] || '-'
            );
          });

          // Add updated data fields
          displayFields.forEach(field => {
            row.push(
              field.key.includes('Time') || field.key.includes('date')
                ? formatDateDisplay(updated[field.key])
                : updated[field.key] || '-'
            );
          });
        } catch (e) {
          console.error('Error parsing log data:', e);
          // Fill with empty values if there's an error
          row.push(...Array(displayFields.length * 2).fill('Error'));
        }

        return row;
      })
    ];

    // Create worksheet
    const ws = utils.aoa_to_sheet(data);

    // Create workbook
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Logs");

    // Calculate merge ranges for group headers
    const originalDataStartCol = 3; // Column D
    const originalDataEndCol = originalDataStartCol + displayFields.length - 1;
    const updatedDataStartCol = originalDataEndCol + 1;
    const updatedDataEndCol = updatedDataStartCol + displayFields.length - 1;

    // Add merged headers
    if (!ws['!merges']) ws['!merges'] = [];

    // Merge "Original Data" header (D1 to K1)
    ws['!merges'].push({
      s: { r: 0, c: originalDataStartCol },
      e: { r: 0, c: originalDataEndCol }
    });

    // Merge "Updated Data" header (L1 to S1)
    ws['!merges'].push({
      s: { r: 0, c: updatedDataStartCol },
      e: { r: 0, c: updatedDataEndCol }
    });

    // Style the headers
    const headerStyle = {
      font: { bold: true },
      alignment: { horizontal: 'center' }
    };

    // Apply style to group headers
    utils.sheet_add_aoa(ws, [['Original Data']], { origin: { r: 0, c: originalDataStartCol } });
    utils.sheet_add_aoa(ws, [['Updated Data']], { origin: { r: 0, c: updatedDataStartCol } });

    // Write the file
    writeFile(wb, `user-activity-logs-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const renderLogRow = (log, index) => {
    const user = users.find(u => u.userID === log.userID);

    try {
      const original = JSON.parse(log.originalData);
      const updated = JSON.parse(log.updatedData);

      return (
        <tr key={log.id} className="hover:bg-gray-50">
          <td className="sticky left-0 bg-white px-6 py-4 whitespace-nowrap text-sm text-gray-500 z-10">
            {index + 1}
          </td>
          <td className="sticky left-12 bg-white px-6 py-4 whitespace-nowrap text-sm text-gray-900 z-10">
            {user ? user.username : 'Unknown'}
          </td>
          <td className="sticky left-32 bg-white px-6 py-4 whitespace-nowrap text-sm text-gray-500 z-10">
            {formatDateDisplay(log.editTime)}
          </td>

          {/* Original Data Columns */}
          {displayFields.map(field => (
            <td
              key={`original_${field.key}`}
              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
            >
              {field.key.includes('Time') || field.key.includes('date')
                ? formatDateDisplay(original[field.key])
                : original[field.key] || '-'}
            </td>
          ))}
          {displayFields.map(field => (
            <td
              key={`updated_${field.key}`}
              className={`px-6 py-4 whitespace-nowrap text-sm ${original[field.key] !== updated[field.key] ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-500'
                }`}
            >
              {field.key.includes('Time') || field.key.includes('date')
                ? formatDateDisplay(updated[field.key])
                : updated[field.key] || '-'}
            </td>
          ))}
        </tr>
      );
    } catch (e) {
      console.error('Error rendering log row:', e);
      return (
        <tr key={log.id} className="hover:bg-gray-50">
          <td colSpan={3 + displayFields.length * 2} className="px-6 py-4 text-sm text-red-500">
            Error parsing log data
          </td>
        </tr>
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/');
    toast.info("Logged out successfully");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} handleLogout={handleLogout} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <header className="flex items-center justify-between bg-white shadow-sm p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 focus:outline-none md:hidden hover:text-gray-800"
          >
            {sidebarOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
          </button>
          <div className="flex items-center">
            <FaUniversity className="text-blue-800 mr-2 text-xl" />
            <h1 className="text-xl font-semibold text-gray-800">User Activity Logs</h1>
          </div>
        </header>

        <main className="flex-1 p-4 overflow-hidden">
          {/* Filter Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <FaFilter className="mr-2 text-blue-800" /> Filter Criteria
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={handleReset}
                  className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <FiRefreshCw className="mr-1" /> Reset
                </button>
                <button
                  onClick={handleSearch}
                  disabled={isLoading || isSearching}
                  className="flex items-center px-3 py-1.5 bg-blue-800 text-white rounded-md hover:bg-blue-900 disabled:bg-blue-400 cursor-pointer"
                >
                  <FaSearch className="mr-1" />
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <FaUser className="mr-2 text-blue-800" /> User
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                >
                  <option value="">Select User</option>
                  {users.filter(
                    (user) => user.userStatus === 'active'
                  ).map((user) => (
                    <option key={user.userID} value={user.userID} className='capitalize'>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <FaCalendarAlt className="mr-2 text-blue-800" /> From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <FaCalendarAlt className="mr-2 text-blue-800" /> To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                  min={fromDate}
                />
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center">
                <MdOutlineDataUsage className="mr-2 text-blue-800" />
                Activity Logs
                {filteredLogs.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({filteredLogs.length} records found)
                  </span>
                )}
              </h2>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <label className="mr-2 text-sm text-gray-600">Rows:</label>
                  <select
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                    className="border rounded px-2 py-1 text-sm"
                    disabled={filteredLogs.length === 0}
                  >
                    {[5, 10, 20, 50].map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                {filteredLogs.length > 0 && (
                  <button
                    onClick={exportToExcel}
                    className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    <FaFileExport className="mr-1" /> Export
                  </button>
                )}
              </div>
            </div>

            {isSearching ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {userLogData.length > 0 ? (
                  <p>No logs match your search criteria. Try adjusting your filters.</p>
                ) : (
                  <p>No log data available. Please check your connection.</p>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden border-b border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th rowSpan="2" className="sticky left-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider z-20">No.</th>
                            <th rowSpan="2" className="sticky left-12 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider z-20">User</th>
                            <th rowSpan="2" className="sticky left-32 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider z-20 border-r-2 border-gray-200">Edit Time</th>
                            <th colSpan={displayFields.length} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r-2 border-b-2 border-gray-200">Original Data</th>
                            <th colSpan={displayFields.length} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">Updated Data</th>
                          </tr>
                          <tr>
                            {/* Original Data Field Headers */}
                            {displayFields.map(field => (
                              <th
                                key={`original_header_${field.key}`}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r-2 border-gray-200"
                              >
                                {field.label}
                              </th>
                            ))}
                            {/* Updated Data Field Headers */}
                            {displayFields.map(field => (
                              <th
                                key={`updated_header_${field.key}`}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {field.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentLogs.map((log, index) => renderLogRow(log, index))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{currentPage * rowsPerPage + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min((currentPage + 1) * rowsPerPage, filteredLogs.length)}
                        </span>{' '}
                        of <span className="font-medium">{filteredLogs.length}</span> results
                      </p>
                    </div>
                    <ReactPaginate
                      previousLabel={'Previous'}
                      nextLabel={'Next'}
                      breakLabel={'...'}
                      pageCount={pageCount}
                      marginPagesDisplayed={2}
                      pageRangeDisplayed={5}
                      onPageChange={handlePageClick}
                      containerClassName={'flex items-center space-x-1'}
                      pageClassName={'px-3 py-1 rounded-md'}
                      pageLinkClassName={'text-sm'}
                      activeClassName={'bg-blue-600 text-white'}
                      previousClassName={'px-3 py-1 rounded-md border'}
                      nextClassName={'px-3 py-1 rounded-md border'}
                      disabledClassName={'opacity-50 cursor-not-allowed'}
                      forcePage={currentPage}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </main>

        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </div>
  );
};

export default LogReport;