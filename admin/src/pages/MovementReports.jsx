import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSearch, FaFilter, FaCalendarAlt, FaSort, FaPrint, FaFileDownload, FaMapMarkerAlt } from 'react-icons/fa';
import { MdFirstPage, MdLastPage, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/Sidebar/Sidebar';
import axios from 'axios';

const MovementReports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [movementReports, setMovementReports] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [users, setUsers] = useState([]);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'dateTime', direction: 'desc' });
  const [showMapModal, setShowMapModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lng: 0 });

  const fetchMovementReports = async () => {
    setIsLoading(true);
    try {
      const [movementResponse, usersResponse] = await Promise.all([
        axios.get(`${baseUrl}/movements/get_all_movement`),
        axios.get(`${baseUrl}/users`)
      ]);

      setUsers(usersResponse.data.data.filter(user => user.userStatus === 'active'));
      setMovementReports(movementResponse.data);
      setFilteredData([]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch movement reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovementReports();
  }, []);

  const applyFilters = () => {
    if (!selectedUser && statusFilter === 'all' && !dateRange.start && !dateRange.end) {
      setFilteredData([]);
      setFiltersApplied(false);
      return;
    }

    let result = [...movementReports];

    if (selectedUser) {
      result = result.filter(item =>
        item.username.toLowerCase() === selectedUser.toLowerCase()
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(item => item.punchTime === statusFilter);
    }

    if (dateRange.start || dateRange.end) {
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;

      result = result.filter(item => {
        const itemDate = new Date(item.dateTime);
        const itemDateOnly = new Date(
          itemDate.getFullYear(),
          itemDate.getMonth(),
          itemDate.getDate()
        );

        if (startDate && endDate) {
          const startDateOnly = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate()
          );
          const endDateOnly = new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate()
          );
          return itemDateOnly >= startDateOnly && itemDateOnly <= endDateOnly;
        } else if (startDate) {
          const startDateOnly = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate()
          );
          return itemDateOnly >= startDateOnly;
        } else if (endDate) {
          const endDateOnly = new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate()
          );
          return itemDateOnly <= endDateOnly;
        }
        return true;
      });
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredData(result);
    setFiltersApplied(true);
    setCurrentPage(1);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/');
    toast.info('You have been logged out');
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return new Date(dateTime).toLocaleDateString('en-US', options);
  };

  const formatTime12Hour = (timeString) => {
    if (!timeString) return 'N/A';
    const [hours, minutes, seconds] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), parseInt(seconds || 0, 10));
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    if (filtersApplied) applyFilters();
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getStatusBadge = (punchTime) => {
    const statusClasses = {
      'Punch In': 'bg-green-100 text-green-800',
      'Punch Out': 'bg-red-100 text-red-800',
      'PENDING': 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs ${statusClasses[punchTime] || 'bg-gray-100 text-gray-800'}`}>
        {punchTime}
      </span>
    );
  };

  const viewLocationOnMap = (lat, lng) => {
    if (!lat || !lng) {
      toast.warning('No location data available for this record');
      return;
    }
    setCurrentLocation({ lat: parseFloat(lat), lng: parseFloat(lng) });
    setShowMapModal(true);
  };

  const downloadCSV = () => {
    if (filteredData.length === 0) {
      toast.warning('No data to download');
      return;
    }

    const headers = [
      'User',
      'Date',
      'Submitted Time',
      'Punch Time',
      'Punch Status',
      'Place',
      'Party',
      'Purpose'
    ];

    const rows = filteredData.map(report => [
      report.username,
      formatDateTime(report.dateTime),
      formatTime12Hour(report.punchingTime),
      report.punchTime,
      report.visitingStatus,
      report.placeName || 'N/A',
      report.partyName || 'N/A',
      report.purpose || 'Not specified',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(item => `"${item}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `movement_reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('CSV download started');
  };

  const PrintFile = () => {
    if (filteredData.length === 0) {
      toast.warning('No data to print');
      return;
    }

    const userInfo = selectedUser
      ? users.find(user => user.username.toLowerCase() === selectedUser.toLowerCase())
      : null;

    const formattedRows = currentRows.map(report => `
      <tr>
        <td class="py-1">${report.username}</td>
        <td class="py-1">${formatDateTime(report.dateTime)}</td>
        <td class="py-1">${formatTime12Hour(report.punchingTime)}</td>
        <td class="py-1">${report.punchTime}</td>
        <td class="py-1"><span class="status-badge status-${report.visitingStatus}">${report.visitingStatus}</span></td>
        <td class="py-1">${report.placeName || 'N/A'}</td>
        <td class="py-1">${report.partyName || 'N/A'}</td>
        <td class="py-1">${report.purpose || 'Not specified'}</td>
        <td class="py-1">${report.latitude || 'N/A'}</td>
        <td class="py-1">${report.longitude || 'N/A'}</td>
      </tr>
    `).join('');

    const printWindow = window.open('', '_blank');
    printWindow.document.open();

    const currentDateTime = new Date().toLocaleString();

    printWindow.document.write(`
      <html>
        <head>
          <title>Movement Report ${userInfo ? `- ${userInfo.username}` : ''}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 10px; }
            .header { text-align: center; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #e0e0e0; }
            .header h1 { margin: 0 0 5px 0; font-size: 18px; color: #2c3e50; }
            .report-info { margin-bottom: 10px; padding: 8px; background-color: #f8f9fa; border-radius: 3px; }
            table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 11px; }
            th { background-color: #3498db; color: white; padding: 4px; text-align: left; }
            td { padding: 4px; border-bottom: 1px solid #e0e0e0; }
            tr:nth-child(even) { background-color: #f8f9fa; }
            .footer { text-align: center; font-size: 10px; color: #7f8c8d; }
            .status-badge { display: inline-block; padding: 1px 4px; border-radius: 8px; font-size: 10px; }
            .status-IN { background-color: #d1fae5; color: #065f46; }
            .status-OUT { background-color: #fee2e2; color: #b91c1c; }
            .status-PENDING { background-color: #fef3c7; color: #92400e; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Movement Report of ${userInfo ? userInfo.Name : 'User'}</h1>
          </div>
          ${userInfo ? `
          <div class="report-info">
            <div><strong>Employee:</strong> ${userInfo.Name || 'N/A'}</div>
            <div><strong>ID:</strong> ${userInfo.E_ID || 'N/A'}</div>
            <div><strong>Company:</strong> ${userInfo.Company_name || 'N/A'}</div>
            <div><strong>Department:</strong> ${userInfo.Department || 'N/A'}</div>
            <div><strong>Designation:</strong> ${userInfo.Designation || 'N/A'}</div>
          </div>
          ` : ''}
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Submitted Date/Time</th>
                <th>Punch Time</th>
                <th>Punch Status</th>
                <th>Visit Status</th>
                <th>Place</th>
                <th>Party</th>
                <th>Purpose</th>
                <th>Latitude</th>
                <th>Longitude</th>
              </tr>
            </thead>
            <tbody>
              ${formattedRows}
            </tbody>
          </table>
          <div class="footer">
            <p>Generated on: ${currentDateTime}</p>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 200);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const clearFilters = () => {
    setSelectedUser('');
    setStatusFilter('all');
    setDateRange({ start: '', end: '' });
    setFilteredData([]);
    setFiltersApplied(false);
    setCurrentPage(1);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />
      <Sidebar sidebarOpen={sidebarOpen} handleLogout={handleLogout} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      <div className="flex flex-col flex-1 w-full">
        <header className="flex items-center justify-between bg-white shadow-sm p-4 border-b">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-800 focus:outline-none md:hidden mr-4"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <FaTimes className="h-5 w-5" />
              ) : (
                <FaBars className="h-5 w-5" />
              )}
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Movement Reports</h1>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={downloadCSV}
              disabled={!filtersApplied || filteredData.length === 0}
              className={`flex items-center px-3 py-1.5 text-xs rounded-md transition-all ${filtersApplied && filteredData.length > 0
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            >
              <FaFileDownload className="mr-1.5" />
              Export CSV
            </button>

            <button
              onClick={PrintFile}
              disabled={!filtersApplied || filteredData.length === 0}
              className={`flex items-center px-3 py-1.5 text-xs rounded-md transition-all ${filtersApplied && filteredData.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            >
              <FaPrint className="mr-1.5" />
              Print
            </button>
          </div>
        </header>

        <div className="bg-white shadow-sm p-3 border-b">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 text-xs" />
              </div>
              <select
                className="pl-8 pr-3 py-1.5 w-full border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user.username} value={user.username}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400 text-xs" />
              </div>
              <select
                className="pl-8 pr-3 py-1.5 w-full border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Punch In">Punch In</option>
                <option value="Punch Out">Punch Out</option>
              </select>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <FaCalendarAlt className="text-gray-400 text-xs" />
              </div>
              <input
                type="date"
                className="pl-8 pr-3 py-1.5 w-full border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <FaCalendarAlt className="text-gray-400 text-xs" />
              </div>
              <input
                type="date"
                className="pl-8 pr-3 py-1.5 w-full border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>

            <div className="flex space-x-1.5">
              <button
                onClick={applyFilters}
                className="w-full px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="w-full px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-md hover:bg-gray-300 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <main className="flex-grow overflow-auto p-3 bg-gray-50">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : !filtersApplied ? (
            <div className="bg-white rounded-md shadow-sm p-4 text-center">
              <p className="text-gray-500 text-sm">Apply filters to view movement reports</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="bg-white rounded-md shadow-sm p-4 text-center">
              <p className="text-gray-500 text-sm">No records found for the selected criteria</p>
              <button
                onClick={clearFilters}
                className="mt-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-md shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('username')}
                      >
                        <div className="flex items-center">
                          User
                          <FaSort className="ml-1 text-gray-400 text-xs" />
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('dateTime')}
                      >
                        <div className="flex items-center">
                          Date/Time
                          <FaSort className="ml-1 text-gray-400 text-xs" />
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Punch Time
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('punchTime')}
                      >
                        <div className="flex items-center">
                          Status
                          <FaSort className="ml-1 text-gray-400 text-xs" />
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('visitingStatus')}
                      >
                        <div className="flex items-center">
                          Visit
                          <FaSort className="ml-1 text-gray-400 text-xs" />
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Place
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Party
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purpose
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentRows.map((report) => (
                      <tr key={report.movementID} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">
                          {report.username}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                          {formatDateTime(report.dateTime)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                          {formatTime12Hour(report.punchingTime)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {getStatusBadge(report.punchTime)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                          {(report.visitingStatus)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                          {report.placeName || 'N/A'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                          {report.partyName || 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-500">
                          {report.purpose || 'Not specified'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                          {report.latitude && report.longitude ? (
                            <button
                              onClick={() => viewLocationOnMap(report.latitude, report.longitude)}
                              className="text-blue-600 hover:text-blue-800 flex items-center"
                              title="View on map"
                            >
                              <FaMapMarkerAlt className="mr-1" />
                              View
                            </button>
                          ) : (
                            'N/A'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Map Modal */}
              {showMapModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-gray-200">
                    <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-800 p-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Location Details</h3>
                        <p className="text-xs text-blue-100 mt-1">
                          {currentLocation.lat}, {currentLocation.lng}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowMapModal(false)}
                        className="text-white hover:text-blue-200 transition-colors p-1 rounded-full hover:bg-white/10"
                        aria-label="Close modal"
                      >
                        <FaTimes className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
                      {/* Map Section */}
                      <div className="w-full md:w-2/3 h-64 md:h-full relative">
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                          <div className="animate-pulse text-gray-400">
                            <FaMapMarkerAlt className="h-8 w-8" />
                            <p className="text-sm mt-2">Loading map...</p>
                          </div>
                        </div>
                        <iframe
                          width="100%"
                          height="100%"
                          className="absolute inset-0"
                          frameBorder="0"
                          style={{ border: 0 }}
                          src={`https://maps.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}&z=16&output=embed&hl=en`}
                          allowFullScreen
                          loading="lazy"
                        ></iframe>

                        {/* Map Controls */}
                        <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${currentLocation.lat},${currentLocation.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white p-2 rounded-full shadow-md hover:bg-blue-50 transition-colors"
                            title="Get directions"
                          >
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                            </svg>
                          </a>
                          <a
                            href={`https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white p-2 rounded-full shadow-md hover:bg-blue-50 transition-colors"
                            title="Open in Google Maps"
                          >
                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                          </a>
                        </div>
                      </div>

                      {/* Details Section */}
                      <div className="w-full md:w-1/3 h-full bg-gray-50 p-4 overflow-y-auto border-t md:border-t-0 md:border-l border-gray-200">
                        <div className="space-y-4">
                          <div className="bg-white rounded-lg shadow-sm p-4">
                            <h4 className="font-medium text-gray-900 flex items-center">
                              <FaMapMarkerAlt className="text-blue-500 mr-2" />
                              Coordinates
                            </h4>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs text-gray-500">Latitude</p>
                                <p className="text-sm font-mono bg-gray-100 p-1 rounded">{currentLocation.lat}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Longitude</p>
                                <p className="text-sm font-mono bg-gray-100 p-1 rounded">{currentLocation.lng}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-lg shadow-sm p-4">
                            <h4 className="font-medium text-gray-900 flex items-center">
                              <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              Map Links
                            </h4>
                            <div className="mt-2 space-y-2">
                              <a
                                href={`https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-2 bg-blue-50 rounded hover:bg-blue-100 text-blue-700 text-sm transition-colors"
                              >
                                <span>Google Maps</span>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                              </a>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg shadow-sm p-4">
                            <h4 className="font-medium text-gray-900 flex items-center">
                              <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                              </svg>
                              Actions
                            </h4>
                            <div className="mt-2 space-y-2">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(`${currentLocation.lat}, ${currentLocation.lng}`);
                                  toast.success('Coordinates copied to clipboard');
                                }}
                                className="w-full flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 text-gray-700 text-sm transition-colors"
                              >
                                <span>Copy Coordinates</span>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  const link = `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`;
                                  navigator.clipboard.writeText(link);
                                  toast.success('Map link copied to clipboard');
                                }}
                                className="w-full flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 text-gray-700 text-sm transition-colors"
                              >
                                <span>Copy Map Link</span>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 p-4 flex justify-end bg-white">
                      <button
                        onClick={() => setShowMapModal(false)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white px-3 py-2 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-2 relative inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstRow + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(indexOfLastRow, filteredData.length)}</span> of{' '}
                      <span className="font-medium">{filteredData.length}</span> records
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <span className="text-xs text-gray-700 mr-1">Rows:</span>
                      <select
                        className="border rounded-md px-1.5 py-1 text-xs"
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                      >
                        {[5, 10, 25, 50, 100, 200, 500, 1000].map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => paginate(1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-1.5 py-1 rounded-l-md border border-gray-300 bg-white text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <MdFirstPage className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-1.5 py-1 border border-gray-300 bg-white text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <MdChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => paginate(pageNum)}
                            className={`relative inline-flex items-center px-2.5 py-1 border text-xs ${currentPage === pageNum
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-1.5 py-1 border border-gray-300 bg-white text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <MdChevronRight className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => paginate(totalPages)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-1.5 py-1 rounded-r-md border border-gray-300 bg-white text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <MdLastPage className="h-3.5 w-3.5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MovementReports;