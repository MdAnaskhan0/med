import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../auth/AuthContext';
import { toast } from 'react-toastify';
import { FiFilter, FiCalendar, FiUsers, FiUser, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ReactPaginate from 'react-paginate';
import { FaDownload, FaFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const TeamReport = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [movementData, setMovementData] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const rowsPerPageOptions = [5, 10, 20, 50, 100, 200, 500, 1000];

  useEffect(() => {
    const fetchMovementData = async () => {
      try {
        const res = await axios.get(`${baseUrl}/movements/get_all_movement`);
        setMovementData(res.data);
      } catch (error) {
        toast.error('Failed to load movement data', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        console.error('Error fetching movement data:', error);
      }
    };
    fetchMovementData();
  }, [baseUrl]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${baseUrl}/teams/teams`);
        const userTeams = res.data.data.filter(
          team => team.team_leader_name === user.name
        );

        setTeams(userTeams.map(team => ({
          ...team,
          membersArray: typeof team.team_members === 'string'
            ? team.team_members.split(',').map(member => member.trim())
            : team.team_members,
          memberIDsArray: typeof team.team_member_ids === 'string'
            ? team.team_member_ids.split(',').map(id => Number(id.trim()))
            : team.team_member_ids
        })));
      } catch (error) {
        toast.error('Failed to load teams', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.name) fetchTeams();
  }, [user?.name, baseUrl]);

  const currentTeam = teams.find(team => team.team_name === selectedTeam);

  const filteredMovements = movementData.filter(movement => {
    if (selectedTeam === '') return false;
    if (selectedTeam === 'all') return true;

    const team = currentTeam;
    if (!team) return false;

    const memberIDs = team.memberIDsArray;
    const movementDate = new Date(movement.dateTime);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(new Date(toDate).setHours(23, 59, 59, 999)) : null;

    let matchesDate = true;
    if (from && movementDate < from) matchesDate = false;
    if (to && movementDate > to) matchesDate = false;

    if (selectedMember === 'all' || selectedMember === '') {
      return memberIDs.includes(movement.userID) && matchesDate;
    }

    const memberIndex = team.membersArray.findIndex(member => member === selectedMember);
    const selectedMemberID = team.memberIDsArray[memberIndex];
    return movement.userID === selectedMemberID && matchesDate;
  });

  // Pagination logic
  const pageCount = Math.ceil(filteredMovements.length / rowsPerPage);
  const offset = currentPage * rowsPerPage;
  const currentMovements = filteredMovements.slice(offset, offset + rowsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(0);
  };

  const handleCSVDownload = () => {
    // Prepare data for CSV
    const dataToExport = filteredMovements.map((item, index) => ({
      No: index + 1,
      Username: item.username,
      Date: item.dateTime?.slice(0, 10),
      'Punch Time': item.punchingTime,
      'Punch Status': item.punchTime,
      'Visit Status': item.visitingStatus,
      Place: item.placeName,
      Purpose: item.purpose,
      Remark: item.remark
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(dataToExport);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MovementReport");

    // Generate file name
    const fileName = `Team_Movement_Report_${selectedTeam || 'All'}_${selectedMember || 'All'}_${fromDate || 'Start'}_${toDate || 'End'}.xlsx`;

    // Download the file
    XLSX.writeFile(wb, fileName);
  }

const handlePrint = () => {
  // Create a printable HTML string with compact styling
  const printContent = `
    <html>
      <head>
        <title>Team Movement Report</title>
        <style>
          @page { size: auto; margin: 5mm 5mm 5mm 5mm; }
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 10px; 
            font-size: 12px;
            position: relative;
            min-height: 100vh;
          }
          .content {
            padding-bottom: 20px; /* Space for footer */
          }
          h1 { 
            color: #333; 
            text-align: center; 
            font-size: 16px;
            margin: 5px 0;
          }
          .filter-info {
            margin: 5px 0 10px 30px;
            font-size: 11px;
          }
          .filter-info p {
            margin: 2px 0;
          }
          table { 
            width: calc(100% - 60px); 
            border-collapse: collapse; 
            margin: 5px 30px;
            font-size: 11px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 4px; 
            text-align: left; 
          }
          th { 
            background-color: #f2f2f2; 
            font-weight: bold;
            padding: 4px;
          }
          .status-in { 
            background-color: #d4edda; 
            color: #155724; 
            padding: 2px 4px; 
            border-radius: 3px; 
            font-size: 10px;
          }
          .status-out { 
            background-color: #cce5ff; 
            color: #004085; 
            padding: 2px 4px; 
            border-radius: 3px; 
            font-size: 10px;
          }
          .status-completed { 
            background-color: #d4edda; 
            color: #155724; 
            padding: 2px 4px; 
            border-radius: 3px; 
            font-size: 10px;
          }
          .status-pending { 
            background-color: #fff3cd; 
            color: #856404; 
            padding: 2px 4px; 
            border-radius: 3px; 
            font-size: 10px;
          }
          .footer { 
            position: absolute;
            bottom: 10px;
            right: 10px;
            font-size: 10px; 
            color: #666; 
          }
        </style>
      </head>
      <body>
        <div class="content">
          <h1>Team Movement Report</h1>
          <div class="filter-info">
            <p><strong>Team:</strong> ${selectedTeam || 'All'}</p>
            <p><strong>Member:</strong> ${selectedMember || 'All'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Username</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Visit</th>
                <th>Place</th>
                <th>Purpose</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              ${currentMovements.map((item, index) => `
                <tr>
                  <td>${offset + index + 1}</td>
                  <td>${item.username}</td>
                  <td>${item.dateTime?.slice(0, 10)}</td>
                  <td>${item.punchingTime}</td>
                  <td><span class="${item.punchTime === 'In' ? 'status-in' : 'status-out'}">${item.punchTime}</span></td>
                  <td><span class="${item.visitingStatus === 'Completed' ? 'status-completed' : 'status-pending'}">${item.visitingStatus}</span></td>
                  <td>${item.placeName}</td>
                  <td>${item.purpose}</td>
                  <td>${item.remark}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="footer">
          Printed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        </div>
      </body>
    </html>
  `;

  // Open print window
  const printWindow = window.open('', '_blank');
  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();

  // Wait for content to load before printing
  printWindow.onload = function () {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 300);
  };
}

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Team Movement Reports</h1>

      <div className="space-y-4 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center text-gray-700 mb-4">
          <FiFilter className="mr-2" />
          <h2 className="text-lg font-semibold">Filter Options</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FiUsers className="mr-2" /> Select Team
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedTeam}
              onChange={(e) => {
                setSelectedTeam(e.target.value);
                setSelectedMember('');
                setCurrentPage(0);
              }}
            >
              <option value="">Select a team</option>
              {/* <option value="all">All teams</option> */}
              {teams.map((team, index) => (
                <option key={index} value={team.team_name}>
                  {team.team_name} {team.team_number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FiUser className="mr-2" /> Select Team Member
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedMember}
              onChange={(e) => {
                setSelectedMember(e.target.value);
                setCurrentPage(0);
              }}
              disabled={selectedTeam === ''}
            >
              <option value="">Select a team member</option>
              <option value="all">All team members</option>
              {selectedTeam !== 'all' && currentTeam?.membersArray?.map((member, index) => (
                <option key={index} value={member}>{member}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FiCalendar className="mr-2" /> From Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setCurrentPage(0);
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FiCalendar className="mr-2" /> To Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setCurrentPage(0);
              }}
            />
          </div>
        </div>
      </div>

      {filteredMovements.length > 0 ? (
        <div className="mt-8 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Movement Data</h2>
            <div className='flex items-center justify-between'>
              <div className="flex items-center mr-2">
                <button
                  onClick={handleCSVDownload}
                  className='bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded flex items-center gap-1'>
                  <FaFileExcel /> CSV
                </button>
                <button
                  onClick={handlePrint}
                  className='bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded ml-2 flex items-center gap-1'>
                  <FaDownload /> Print
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm font-medium text-gray-700">
                  <th className="px-6 py-3">No</th>
                  <th className="px-6 py-3">Username</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Punch Time</th>
                  <th className="px-6 py-3">Punch Status</th>
                  <th className="px-6 py-3">Visit Status</th>
                  <th className="px-6 py-3">Place</th>
                  <th className="px-6 py-3">Purpose</th>
                  <th className="px-6 py-3">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentMovements.map((item, index) => (
                  <tr key={index} className="text-sm text-gray-600 hover:bg-gray-50">
                    <td className="px-6 py-4">{offset + index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.username}</td>
                    <td className="px-6 py-4">{item.dateTime?.slice(0, 10)}</td>
                    <td className="px-6 py-4">{item.punchingTime}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${item.punchTime === 'In'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                        }`}>
                        {item.punchTime}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${item.visitingStatus === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : item.visitingStatus === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                        {item.visitingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">{item.placeName}</td>
                    <td className="px-6 py-4">{item.purpose}</td>
                    <td className="px-6 py-4">{item.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <label className="mr-2 text-sm text-gray-600">Rows per page:</label>
              <select
                className="border border-gray-300 rounded p-1 text-sm"
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
              >
                {rowsPerPageOptions.map(option => (
                  <option key={option} value={option} className='flex items-center'>{option} Rows</option>
                ))}
              </select>
            </div>
            <ReactPaginate
              previousLabel={<FiChevronLeft className="h-5 w-5" />}
              nextLabel={<FiChevronRight className="h-5 w-5" />}
              breakLabel={'...'}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={handlePageClick}
              containerClassName="flex items-center space-x-1"
              pageClassName="flex items-center justify-center h-8 w-8 rounded-full text-sm"
              pageLinkClassName="w-full h-full flex items-center justify-center"
              activeClassName="bg-blue-500 text-white"
              previousClassName="flex items-center justify-center h-8 w-8 rounded-full border border-gray-300"
              nextClassName="flex items-center justify-center h-8 w-8 rounded-full border border-gray-300"
              disabledClassName="opacity-50 cursor-not-allowed"
              breakClassName="flex items-center justify-center h-8 px-2"
              forcePage={currentPage}
            />
          </div>
        </div>
      ) : (
        <div className="mt-8 bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
          <p className="text-gray-500">
            {selectedTeam === ''
              ? 'Please select a team to view movement data'
              : 'No movement data found for the selected filters'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamReport;