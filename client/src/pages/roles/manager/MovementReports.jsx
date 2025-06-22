import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiSearch, FiX, FiCalendar, FiUser, FiDownload, FiPrinter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactPaginate from 'react-paginate';
import { format, parseISO, isValid } from 'date-fns';
import LogOutButton from '../../../components/LogoutButton';

const MovementReports = () => {
    const [users, setUsers] = useState([]);
    const [movementReports, setMovementReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const printRef = useRef();

    const formatTime = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = parseISO(dateString);
            return isNaN(date) ? dateString : format(date, 'MM/dd/yyyy hh:mm a');
        } catch {
            return dateString;
        }
    };

    const formatDateOnly = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = parseISO(dateString);
            return isNaN(date) ? dateString : format(date, 'MM/dd/yyyy');
        } catch {
            return dateString;
        }
    };

    const formatTimeOnly = (input) => {
        if (!input) return '-';
        let date;
        if (/^\d{2}:\d{2}(:\d{2})?$/.test(input)) {
            date = new Date(`2000-01-01T${input}`);
        } else {
            date = new Date(input);
        }
        return isValid(date) ? format(date, 'hh:mm a') : '-';
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${baseUrl}/users`);
                setUsers(res.data.data);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load users');
            }
        };
        fetchUsers();
    }, []);

    const isDateInRange = (reportDate, startDate, endDate) => {
        try {
            const reportDateObj = parseISO(reportDate);
            const startDateObj = startDate ? new Date(startDate + 'T00:00:00') : null;
            const endDateObj = endDate ? new Date(endDate + 'T23:59:59') : null;

            if (!startDateObj && !endDateObj) return true;
            if (startDateObj && endDateObj) return reportDateObj >= startDateObj && reportDateObj <= endDateObj;
            if (startDateObj) return reportDateObj >= startDateObj;
            if (endDateObj) return reportDateObj <= endDateObj;
            return true;
        } catch {
            return false;
        }
    };

    const handleSearch = async () => {
        if (!selectedUser) {
            toast.warning('Please select a user');
            return;
        }

        setIsLoading(true);
        try {
            const res = await axios.get(`${baseUrl}/movements/${selectedUser}`);
            const allReports = Array.isArray(res.data) ? res.data : [];
            const filtered = allReports.filter((report) => isDateInRange(report.dateTime, fromDate, toDate));
            setMovementReports(allReports);
            setFilteredReports(filtered);
            setCurrentPage(0);
            if (filtered.length === 0) toast.info('No records found for the selected criteria');
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch movement reports');
            setMovementReports([]);
            setFilteredReports([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSelectedUser('');
        setFromDate('');
        setToDate('');
        setMovementReports([]);
        setFilteredReports([]);
        setCurrentPage(0);
    };

    const pageCount = Math.ceil(filteredReports.length / rowsPerPage);
    const offset = currentPage * rowsPerPage;
    const currentReports = filteredReports.slice(offset, offset + rowsPerPage);

    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };

    const handleDownloadCSV = () => {
        if (filteredReports.length === 0) {
            toast.warning('No data to export');
            return;
        }
        
        const headers = [
            'Username', 'Date', 'Punching Time', 'Punch Status',
            'Status', 'Place', 'Party', 'Purpose', 'Remarks'
        ];
        const rows = filteredReports.map((report) => [
            report.username || '-',
            formatDateOnly(report.dateTime),
            formatTimeOnly(report.punchingTime),
            report.punchTime || '-',
            report.visitingStatus || '-',
            report.placeName || '-',
            report.partyName || '-',
            report.purpose || '-',
            report.remark || '-'
        ]);
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `movement_reports_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('CSV exported successfully');
    };

    const handlePrint = () => {
        if (filteredReports.length === 0) {
            toast.warning('No data to print');
            return;
        }

        const selectedUserInfo = users.find(user => String(user.userID) === String(selectedUser));

        const userDetails = selectedUserInfo ? `
            <div style="margin-bottom: 16px; font-size: 12px; display: flex; flex-direction: column; gap: 4px;">
                <div><strong>Name:</strong> ${selectedUserInfo.username || '-'}</div>
                <div><strong>Employee ID:</strong> ${selectedUserInfo.E_ID || '-'}</div>
                <div><strong>Company:</strong> ${selectedUserInfo.Company_name || '-'}</div>
                <div><strong>Department:</strong> ${selectedUserInfo.Department || '-'}</div>
                <div><strong>Designation:</strong> ${selectedUserInfo.Designation || '-'}</div>
                <div><strong>Date Range:</strong> ${fromDate || 'Start'} to ${toDate || 'End'}</div>
            </div>
        ` : '<div style="margin-bottom: 16px; font-size: 12px;">User info not available.</div>';

        const printContent = printRef.current.innerHTML;
        const printWindow = window.open('', '', 'height=600,width=1000');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Movement Report</title>
                    <style>
                        @media print {
                            body {
                                margin: 0;
                                padding: 20px;
                                font-family: Arial, sans-serif;
                                font-size: 10px;
                                color: #333;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-top: 10px;
                            }
                            th, td {
                                padding: 8px 12px;
                                border: 1px solid #ddd;
                                text-align: left;
                            }
                            th {
                                background-color: #f5f5f5;
                                font-weight: 600;
                            }
                            .print-header {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                margin-bottom: 15px;
                                border-bottom: 1px solid #eee;
                                padding-bottom: 10px;
                            }
                            .print-title {
                                font-size: 16px;
                                font-weight: bold;
                                color: #333;
                            }
                            .print-date {
                                font-size: 11px;
                                color: #666;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-header">
                        <div class="print-title">Movement Report</div>
                        <div class="print-date">Generated on ${format(new Date(), 'MM/dd/yyyy hh:mm a')}</div>
                    </div>
                    ${userDetails}
                    ${printContent}
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className='flex items-center justify-between mb-6'>
                <h1 className="text-2xl font-semibold text-gray-800">Movement Reports</h1>
                <LogOutButton />
            </div>
            
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                    <div className="relative md:col-span-3">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiUser className="text-gray-400 text-sm" />
                        </div>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md shadow-sm text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Select a user</option>
                            {users.filter(
                                (user) => user.userStatus === 'active'
                            ).map((user) => (
                                <option className="capitalize" key={user.userID} value={user.userID}>
                                    {user.username}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="relative md:col-span-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiCalendar className="text-gray-400 text-sm" />
                        </div>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md shadow-sm text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div className="relative md:col-span-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiCalendar className="text-gray-400 text-sm" />
                        </div>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md shadow-sm text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            min={fromDate}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 md:col-span-5 justify-end">
                        <button 
                            onClick={handleSearch} 
                            disabled={isLoading}
                            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 min-w-[100px] transition-colors duration-150"
                        >
                            {isLoading ? (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <FiSearch className="mr-2" />
                            )}
                            Search
                        </button>
                        <button 
                            onClick={handleClear}
                            className="flex items-center px-4 py-2 border border-gray-300 text-sm rounded-md bg-white text-gray-700 hover:bg-gray-50 min-w-[90px] transition-colors duration-150"
                        >
                            <FiX className="mr-2" />Clear
                        </button>
                        <button 
                            onClick={handleDownloadCSV}
                            disabled={filteredReports.length === 0}
                            className="flex items-center px-4 py-2 border border-gray-300 text-sm rounded-md bg-white text-gray-700 hover:bg-gray-50 min-w-[90px] transition-colors duration-150 disabled:opacity-50"
                        >
                            <FiDownload className="mr-2" />CSV
                        </button>
                        <button 
                            onClick={handlePrint}
                            disabled={filteredReports.length === 0}
                            className="flex items-center px-4 py-2 border border-gray-300 text-sm rounded-md bg-white text-gray-700 hover:bg-gray-50 min-w-[90px] transition-colors duration-150 disabled:opacity-50"
                        >
                            <FiPrinter className="mr-2" />Print
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100" ref={printRef}>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Username', 'Date', 'Punching Time', 'Punch Status', 'Status', 'Place', 'Party', 'Purpose', 'Remarks'].map((head, idx) => (
                                    <th
                                        key={idx}
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        {head}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentReports.length > 0 ? (
                                currentReports.map((report, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        {[
                                            report.username || '-',
                                            formatDateOnly(report.dateTime),
                                            formatTimeOnly(report.punchingTime),
                                            report.punchTime || '-',
                                            report.visitingStatus || '-',
                                            report.placeName || '-',
                                            report.partyName || '-',
                                            report.purpose || '-',
                                            report.remark || '-'
                                        ].map((value, cellIdx) => (
                                            <td 
                                                key={cellIdx} 
                                                className="px-4 py-3 whitespace-nowrap text-sm text-gray-500"
                                            >
                                                {cellIdx === 3 ? (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        value === 'Punch In' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {value}
                                                    </span>
                                                ) : (
                                                    value
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">
                                        {isLoading ? (
                                            <div className="flex justify-center items-center">
                                                <svg className="animate-spin h-5 w-5 mr-2 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Loading...
                                            </div>
                                        ) : 'No records found. Please select a user and click Search.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {pageCount > 1 && (
                    <div className="px-4 py-3 border-t flex items-center justify-between bg-gray-50">
                        <div className="flex items-center">
                            <span className="text-xs text-gray-700 mr-2">Rows per page:</span>
                            <select
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
                                    setCurrentPage(0);
                                }}
                                className="border border-gray-200 rounded text-xs py-1 px-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                {[5, 10, 25, 50].map((size) => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>
                        <ReactPaginate
                            previousLabel={<FiChevronLeft className="h-3 w-3" />}
                            nextLabel={<FiChevronRight className="h-3 w-3" />}
                            breakLabel={'...'}
                            pageCount={pageCount}
                            marginPagesDisplayed={1}
                            pageRangeDisplayed={3}
                            onPageChange={handlePageClick}
                            containerClassName="flex items-center space-x-1"
                            pageClassName="flex items-center justify-center w-6 h-6 rounded text-xs"
                            pageLinkClassName="w-full h-full flex items-center justify-center"
                            activeClassName="bg-indigo-500 text-white"
                            previousClassName="flex items-center justify-center w-6 h-6 rounded text-xs border border-gray-200"
                            nextClassName="flex items-center justify-center w-6 h-6 rounded text-xs border border-gray-200"
                            disabledClassName="opacity-50 cursor-not-allowed"
                            forcePage={currentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovementReports;