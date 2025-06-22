import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../auth/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import { FiDownload, FiSearch, FiCalendar, FiClock, FiEdit, FiSave, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiPrinter } from 'react-icons/fi';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import { Skeleton } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import LogoutButton from '../../../components/LogoutButton';

const UserReport = () => {
    const { user } = useAuth();
    const [movementData, setMovementData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [editRowId, setEditRowId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState({
        startDate: null,
        endDate: null
    });
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userInfoRes = await axios.get(`${baseUrl}/users/${user.userID}`);
                setUserInfo(userInfoRes.data.data);
            } catch (error) {
                console.error('Error fetching user info:', error);
                toast.error('Failed to load user info. Please try again.');
            }
        };
        fetchUserInfo();
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !user.userID) return;
            setIsLoading(true);
            try {
                const movementRes = await axios.get(`${baseUrl}/movements/${user.userID}`);
                const movement = movementRes.data;
                const dataArray = Array.isArray(movement) ? movement : [movement];
                setMovementData(dataArray);
                setFilteredData(dataArray);
            } catch (movementErr) {
                console.error('Error fetching movement data:', movementErr);
                setMovementData([]);
                setFilteredData([]);
                toast.error('Failed to load movement data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user]);

    useEffect(() => {
        let result = movementData;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(item =>
                (item.placeName && item.placeName.toLowerCase().includes(term)) ||
                (item.partyName && item.partyName.toLowerCase().includes(term)) ||
                (item.purpose && item.purpose.toLowerCase().includes(term)) ||
                (item.punchTime && item.punchTime.toLowerCase().includes(term))
            );
        }

        if (statusFilter) {
            result = result.filter(item => item.punchTime?.includes(statusFilter));
        }

        if (dateFilter.startDate || dateFilter.endDate) {
            result = result.filter(item => {
                const itemDate = new Date(item.dateTime);
                const start = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
                const end = dateFilter.endDate ? new Date(dateFilter.endDate) : null;

                if (start && end) {
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    return itemDate >= start && itemDate <= end;
                } else if (start) {
                    start.setHours(0, 0, 0, 0);
                    return itemDate >= start;
                } else if (end) {
                    end.setHours(23, 59, 59, 999);
                    return itemDate <= end;
                }
                return true;
            });
        }

        setFilteredData(result);
        setCurrentPage(1);
    }, [searchTerm, dateFilter, movementData, statusFilter]);

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    const handleEditClick = (movement) => {
        setEditRowId(movement.movementID);
        setEditFormData({
            ...movement,
            punchingTime: movement.punchingTime || '',
            purpose: movement.purpose || '',
            remark: movement.remark || '',
            punchTime: movement.punchTime || '',
            visitingStatus: movement.visitingStatus || '',
            placeName: movement.placeName || '',
            partyName: movement.partyName || '',
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveClick = async () => {
        try {
            const original = movementData.find(m => m.movementID === editRowId);

            await axios.put(`${baseUrl}/movements/${editRowId}`, editFormData);

            await axios.post(`${baseUrl}/movement-logs`, {
                userID: user.userID,
                movementID: editRowId,
                originalData: original,
                updatedData: editFormData,
                editTime: new Date().toISOString()
            });

            setMovementData((prevData) =>
                prevData.map((item) =>
                    item.movementID === editRowId ? { ...item, ...editFormData } : item
                )
            );

            setEditRowId(null);
            toast.success('Movement record updated successfully!');
        } catch (err) {
            console.error('Error updating movement record:', err);
            toast.error('Failed to update record. Please try again.');
        }
    };

    const handleCancelClick = () => {
        setEditRowId(null);
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const pageSizeOptions = [
        { value: 5, label: '5 rows' },
        { value: 10, label: '10 rows' },
        { value: 20, label: '20 rows' },
        { value: 50, label: '50 rows' },
        { value: 100, label: '100 rows' },
        { value: 200, label: '200 rows' },
        { value: 500, label: '500 rows' },
        { value: 1000, label: '1000 rows' }
    ];

    const downloadCSV = () => {
        if (filteredData.length === 0) {
            toast.info('No data available to download');
            return;
        }

        const headers = [
            'Date',
            'Status',
            'Punch Time',
            'Visit Status',
            'Place',
            'Party',
            'Purpose',
            'Remarks'
        ].join(',');

        const rows = filteredData.map(row => {
            return [
                new Date(row.dateTime).toLocaleDateString('en-US'),
                row.punchTime || 'N/A',
                row.punchingTime || 'N/A',
                row.visitingStatus,
                row.placeName,
                row.partyName,
                row.purpose || '-',
                row.remark || '-'
            ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
        });

        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `movement_report_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const clearDateFilters = () => {
        setDateFilter({ startDate: null, endDate: null });
    };
    //     const dataToPrint = currentRows;

    //     if (dataToPrint.length === 0) {
    //         toast.info('No data available to print');
    //         return;
    //     }

    //     const printWindow = window.open('', '_blank');
    //     printWindow.document.open();

    //     const currentDateTime = new Date().toLocaleString();
    //     const formattedRows = dataToPrint.map((mv, index) => {
    //         const date = new Date(mv.dateTime).toLocaleDateString('en-US', {
    //             year: 'numeric',
    //             month: 'short',
    //             day: 'numeric'
    //         });

    //         const time = mv.punchingTime
    //             ? new Date(`1970-01-01T${mv.punchingTime}`).toLocaleTimeString('en-US', {
    //                 hour: '2-digit',
    //                 minute: '2-digit',
    //                 hour12: true
    //             })
    //             : 'N/A';

    //         const statusColor = mv.punchTime === 'Punch In' ? '#27ae60' : '#e74c3c';

    //         return `
    //         <tr ${index > 0 && index % 20 === 0 ? 'class="page-break"' : ''}>
    //             <td>${date}</td>
    //             <td>${time}</td>
    //             <td style="color: ${statusColor}">${mv.punchTime || 'N/A'}</td>
    //             <td>${mv.visitingStatus || '-'}</td>
    //             <td>${mv.placeName || '-'}</td>
    //             <td>${mv.partyName || '-'}</td>
    //             <td>${mv.purpose || '-'}</td>
    //             <td>${mv.remark || '-'}</td>
    //         </tr>
    //     `;
    //     }).join('');

    //     const htmlContent = `
    //     <html>
    //         <head>
    //             <title>Movement Report - ${user.name}</title>
    //             <style>
    //                 html, body {
    //                     height: 100%;
    //                     margin: 0;
    //                     padding: 0;
    //                     font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    //                     color: #333;
    //                     line-height: 1.4;
    //                     font-size: 12px;
    //                 }
    //                 .wrapper {
    //                     display: flex;
    //                     flex-direction: column;
    //                     min-height: 100vh;
    //                     padding: 10px 15px;
    //                 }
    //                 .header {
    //                     text-align: center;
    //                     margin-bottom: 15px;
    //                     padding-bottom: 10px;
    //                     border-bottom: 1px solid #e0e0e0;
    //                 }
    //                 .header h1 {
    //                     margin: 0 0 5px 0;
    //                     font-size: 18px;
    //                     color: #2c3e50;
    //                     font-weight: 600;
    //                 }
    //                 .report-info {
    //                     display: grid;
    //                     grid-template-columns: repeat(2, 1fr);
    //                     gap: 8px;
    //                     margin-bottom: 15px;
    //                     padding: 10px;
    //                     background-color: #f8f9fa;
    //                     border-radius: 4px;
    //                     font-size: 11px;
    //                 }
    //                 .report-info div {
    //                     display: flex;
    //                 }
    //                 .report-info strong {
    //                     color: #2c3e50;
    //                     min-width: 90px;
    //                     display: inline-block;
    //                 }
    //                 table {
    //                     width: 100%;
    //                     border-collapse: collapse;
    //                     margin-top: 10px;
    //                     font-size: 11px;
    //                 }
    //                 th {
    //                     background-color: #3498db;
    //                     color: white;
    //                     padding: 8px 6px;
    //                     text-align: left;
    //                     font-weight: 500;
    //                 }
    //                 td {
    //                     padding: 6px;
    //                     border-bottom: 1px solid #e0e0e0;
    //                 }
    //                 tr:nth-child(even) {
    //                     background-color: #f8f9fa;
    //                 }
    //                 .footer {
    //                     text-align: center;
    //                     font-size: 10px;
    //                     color: #7f8c8d;
    //                     border-top: 1px solid #e0e0e0;
    //                     padding: 10px 0;
    //                     margin-top: 15px;
    //                 }
    //                 .page-break {
    //                     page-break-after: always;
    //                 }
    //                 @page {
    //                     size: A4 portrait;
    //                     margin: 10mm;
    //                 }
    //                 @media print {
    //                     body {
    //                         padding-bottom: 60px;
    //                     }
    //                     .footer {
    //                         position: fixed;
    //                         bottom: 0;
    //                         left: 0;
    //                         right: 0;
    //                         background: white;
    //                     }
    //                     .no-print {
    //                         display: none;
    //                     }
    //                 }
    //             </style>
    //         </head>
    //         <body>
    //             <div class="wrapper">
    //                 <div class="header">
    //                     <h1>Employee Movement Report</h1>
    //                 </div>

    //                 <div class="report-info">
    //                     <div><strong>Employee ID:</strong> ${userInfo?.E_ID || 'N/A'}</div>
    //                     <div><strong>Name:</strong> ${userInfo?.Name || 'N/A'}</div>
    //                     <div><strong>Company:</strong> ${userInfo?.Company_name || 'N/A'}</div>
    //                     <div><strong>Department:</strong> ${userInfo?.Department || 'N/A'}</div>
    //                     <div><strong>Designation:</strong> ${userInfo?.Designation || 'N/A'}</div>
    //                     <div><strong>Period:</strong> ${dateFilter.startDate ? new Date(dateFilter.startDate).toLocaleDateString() : 'All'} - ${dateFilter.endDate ? new Date(dateFilter.endDate).toLocaleDateString() : 'All'}</div>
    //                 </div>

    //                 <table>
    //                     <thead>
    //                         <tr>
    //                             <th>Date</th>
    //                             <th>Time</th>
    //                             <th>Status</th>
    //                             <th>Visit Status</th>
    //                             <th>Location</th>
    //                             <th>Contact</th>
    //                             <th>Purpose</th>
    //                             <th>Remarks</th>
    //                         </tr>
    //                     </thead>
    //                     <tbody>
    //                         ${formattedRows}
    //                     </tbody>
    //                 </table>

    //                 <div class="footer">
    //                     <p>Generated on ${currentDateTime}</p>
    //                     <p class="no-print">This is a computer generated report</p>
    //                 </div>
    //             </div>

    //             <script>
    //                 window.onload = function() {
    //                     setTimeout(function() {
    //                         window.print();
    //                         window.close();
    //                     }, 200);
    //                 };
    //             </script>
    //         </body>
    //     </html>
    // `;

    //     printWindow.document.write(htmlContent);
    //     printWindow.document.close();
    // };

    const PrintFile = () => {
        const dataToPrint = currentRows;

        if (dataToPrint.length === 0) {
            toast.info('No data available to print');
            return;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.open();

        const currentDateTime = new Date().toLocaleString();
        const formattedRows = dataToPrint.map((mv, index) => {
            const date = new Date(mv.dateTime).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const time = mv.punchingTime
                ? new Date(`1970-01-01T${mv.punchingTime}`).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                })
                : 'N/A';

            const statusColor = mv.punchTime === 'Punch In' ? '#27ae60' : '#e74c3c';

            return `
            <tr>
                <td>${date}</td>
                <td>${time}</td>
                <td style="color: ${statusColor}">${mv.punchTime || 'N/A'}</td>
                <td>${mv.visitingStatus || '-'}</td>
                <td>${mv.placeName || '-'}</td>
                <td>${mv.partyName || '-'}</td>
                <td>${mv.purpose || '-'}</td>
                <td>${mv.remark || '-'}</td>
            </tr>
        `;
        }).join('');

        const htmlContent = `
        <html>
            <head>
                <title>Movement Report - ${user.name}</title>
                <style>
                    html, body {
                        margin: 0;
                        padding: 0;
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        color: #333;
                        line-height: 1.4;
                        font-size: 12px;
                    }
                    .wrapper {
                        padding: 10mm;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 15px;
                        padding-bottom: 10px;
                        border-bottom: 1px solid #e0e0e0;
                    }
                    .header h1 {
                        margin: 0 0 5px 0;
                        font-size: 18px;
                        color: #2c3e50;
                        font-weight: 600;
                    }
                    .report-info {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 8px;
                        margin-bottom: 15px;
                        padding: 10px;
                        background-color: #f8f9fa;
                        border-radius: 4px;
                        font-size: 11px;
                    }
                    .report-info div {
                        display: flex;
                    }
                    .report-info strong {
                        color: #2c3e50;
                        min-width: 90px;
                        display: inline-block;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                        font-size: 11px;
                        page-break-inside: auto;
                    }
                    th {
                        background-color: #3498db;
                        color: white;
                        padding: 8px 6px;
                        text-align: left;
                        font-weight: 500;
                    }
                    td {
                        padding: 6px;
                        border-bottom: 1px solid #e0e0e0;
                    }
                    tr:nth-child(even) {
                        background-color: #f8f9fa;
                    }
                    .footer {
                        text-align: center;
                        font-size: 10px;
                        color: #7f8c8d;
                        border-top: 1px solid #e0e0e0;
                        padding: 10px 0;
                        margin-top: 15px;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 10mm;
                    }
                    @media print {
                        body {
                            padding: 0;
                            margin: 0;
                        }
                        .footer {
                            position: fixed;
                            bottom: 0;
                            width: 100%;
                        }
                        .no-print {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="wrapper">
                    <div class="header">
                        <h1>Employee Movement Report</h1>
                    </div>

                    <div class="report-info">
                        <div><strong>Employee ID:</strong> ${userInfo?.E_ID || 'N/A'}</div>
                        <div><strong>Name:</strong> ${userInfo?.Name || 'N/A'}</div>
                        <div><strong>Company:</strong> ${userInfo?.Company_name || 'N/A'}</div>
                        <div><strong>Department:</strong> ${userInfo?.Department || 'N/A'}</div>
                        <div><strong>Designation:</strong> ${userInfo?.Designation || 'N/A'}</div>
                        <div><strong>Period:</strong> ${dateFilter.startDate ? new Date(dateFilter.startDate).toLocaleDateString() : 'All'} - ${dateFilter.endDate ? new Date(dateFilter.endDate).toLocaleDateString() : 'All'}</div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                                <th>Visit Status</th>
                                <th>Location</th>
                                <th>Contact</th>
                                <th>Purpose</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${formattedRows}
                        </tbody>
                    </table>

                    <div class="footer">
                        <p>Generated on ${currentDateTime}</p>
                        <p class="no-print">This is a computer generated report</p>
                    </div>
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
    `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center mb-4">
                    <FiClock size={18} className="mr-2 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Movement History</h2>
                </div>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {[...Array(8)].map((_, i) => (
                                    <th key={i} scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <Skeleton variant="text" width={80} height={15} />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {[...Array(5)].map((_, i) => (
                                <tr key={i}>
                                    {[...Array(8)].map((_, j) => (
                                        <td key={j} className="px-4 py-3 whitespace-nowrap">
                                            <Skeleton variant="text" width="80%" height={20} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-end px-4 py-2">
                <LogoutButton className="text-sm" />
            </div>

            <div className="container mx-auto px-4 py-4 min-h-screen">
                <ToastContainer position="top-right" autoClose={3000} />
                <div className="flex items-center mb-4">
                    <FiClock size={18} className="mr-2 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Movement History</h2>
                </div>

                {movementData.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-6 text-center text-sm text-gray-600">
                        No movement data available for this user.
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-lg shadow p-4 mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiSearch className="text-gray-400 text-sm" />
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Search by place, party, purpose..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col md:flex-row gap-2">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-2 py-2 text-xs border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">All Status</option>
                                        <option value="Punch In">Punch In</option>
                                        <option value="Punch Out">Punch Out</option>
                                    </select>

                                    <div className="flex items-center gap-2">
                                        <DatePicker
                                            selected={dateFilter.startDate}
                                            onChange={(date) => setDateFilter({ ...dateFilter, startDate: date })}
                                            selectsStart
                                            startDate={dateFilter.startDate}
                                            endDate={dateFilter.endDate}
                                            placeholderText="Start date"
                                            dateFormat="dd MMM yyyy"
                                            isClearable
                                            className="px-2 py-1.5 text-xs w-full border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <span className="text-xs text-gray-500">to</span>
                                        <DatePicker
                                            selected={dateFilter.endDate}
                                            onChange={(date) => setDateFilter({ ...dateFilter, endDate: date })}
                                            selectsEnd
                                            startDate={dateFilter.startDate}
                                            endDate={dateFilter.endDate}
                                            minDate={dateFilter.startDate}
                                            placeholderText="End date"
                                            dateFormat="dd MMM yyyy"
                                            isClearable
                                            className="px-2 py-1.5 text-xs w-full border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {(dateFilter.startDate || dateFilter.endDate) && (
                                            <button
                                                onClick={clearDateFilters}
                                                className="px-2 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={downloadCSV}
                                        disabled={filteredData.length === 0}
                                        className={`flex items-center px-3 py-2 text-xs rounded-md focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 ${filteredData.length === 0
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                    >
                                        <FiDownload className="mr-1" size={14} />
                                        CSV
                                    </button>

                                    <button
                                        onClick={PrintFile}
                                        disabled={filteredData.length === 0}
                                        className={`flex items-center px-3 py-2 text-xs rounded-md focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 ${filteredData.length === 0
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-gray-600 text-white hover:bg-gray-700'
                                            }`}
                                    >
                                        <FiPrinter className="mr-1" size={14} />
                                        Print
                                    </button>
                                </div>
                            </div>
                        </div>

                        {filteredData.length === 0 ? (
                            <div className="bg-white rounded-lg shadow p-6 text-center text-sm text-gray-600">
                                No movement data found matching your criteria.
                            </div>
                        ) : (
                            <>
                                <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 text-xs">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                        Date
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                        Time
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                        Visit Status
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                        Place
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                        Party
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                        Purpose
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                        Remarks
                                                    </th>
                                                    <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {currentRows.map((mv) => (
                                                    <tr key={mv.movementID} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 whitespace-nowrap text-gray-600">
                                                            {new Date(mv.dateTime).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-gray-600">
                                                            {editRowId === mv.movementID ? (
                                                                <input
                                                                    type="time"
                                                                    name="punchingTime"
                                                                    value={editFormData.punchingTime}
                                                                    onChange={handleInputChange}
                                                                    className="border border-gray-200 rounded px-2 py-1 text-xs w-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                />
                                                            ) : (
                                                                mv.punchingTime
                                                                    ? new Date(`1970-01-01T${mv.punchingTime}`).toLocaleTimeString('en-US', {
                                                                        hour: 'numeric',
                                                                        minute: 'numeric',
                                                                        hour12: true,
                                                                    })
                                                                    : 'N/A'
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap">
                                                            {editRowId === mv.movementID ? (
                                                                <select
                                                                    name="punchTime"
                                                                    value={editFormData.punchTime}
                                                                    onChange={handleInputChange}
                                                                    className="border border-gray-200 rounded px-2 py-1 text-xs w-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                >
                                                                    <option value="">Select</option>
                                                                    <option value="Punch In">Punch In</option>
                                                                    <option value="Punch Out">Punch Out</option>
                                                                </select>
                                                            ) : (
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${mv.punchTime === 'Punch In' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                    {mv.punchTime || 'N/A'}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-gray-600">
                                                            {editRowId === mv.movementID ? (
                                                                <input
                                                                    name="visitingStatus"
                                                                    type="text"
                                                                    value={editFormData.visitingStatus}
                                                                    onChange={handleInputChange}
                                                                    className="border border-gray-200 rounded px-2 py-1 text-xs w-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                />
                                                            ) : (
                                                                mv.visitingStatus
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-gray-600">
                                                            {editRowId === mv.movementID ? (
                                                                <input
                                                                    name="placeName"
                                                                    type="text"
                                                                    value={editFormData.placeName}
                                                                    onChange={handleInputChange}
                                                                    className="border border-gray-200 rounded px-2 py-1 text-xs w-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                />
                                                            ) : (
                                                                mv.placeName
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-gray-600">
                                                            {editRowId === mv.movementID ? (
                                                                <input
                                                                    name="partyName"
                                                                    type="text"
                                                                    value={editFormData.partyName}
                                                                    onChange={handleInputChange}
                                                                    className="border border-gray-200 rounded px-2 py-1 text-xs w-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                />
                                                            ) : (
                                                                mv.partyName
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-gray-600">
                                                            {editRowId === mv.movementID ? (
                                                                <input
                                                                    type="text"
                                                                    name="purpose"
                                                                    value={editFormData.purpose}
                                                                    onChange={handleInputChange}
                                                                    className="border border-gray-200 rounded px-2 py-1 text-xs w-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                />
                                                            ) : (
                                                                mv.purpose || '-'
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-gray-600">
                                                            {editRowId === mv.movementID ? (
                                                                <input
                                                                    type="text"
                                                                    name="remark"
                                                                    value={editFormData.remark}
                                                                    onChange={handleInputChange}
                                                                    className="border border-gray-200 rounded px-2 py-1 text-xs w-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                />
                                                            ) : (
                                                                mv.remark ? mv.remark.slice(0, 25) + (mv.remark.length > 25 ? '...' : '') : '-'
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-gray-600">
                                                            {(() => {
                                                                if (!mv.dateTime) return null;

                                                                const submittedTime = new Date(mv.dateTime);
                                                                const now = new Date();
                                                                const diffMinutes = (now - submittedTime) / 1000 / 60;

                                                                if (diffMinutes <= 10) {
                                                                    return editRowId === mv.movementID ? (
                                                                        <div className="flex space-x-1">
                                                                            <button
                                                                                onClick={handleSaveClick}
                                                                                className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs flex items-center"
                                                                            >
                                                                                <FiSave className="mr-1" size={10} /> Save
                                                                            </button>
                                                                            <button
                                                                                onClick={handleCancelClick}
                                                                                className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => handleEditClick(mv)}
                                                                            className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs flex items-center"
                                                                        >
                                                                            <FiEdit className="mr-1" size={10} /> Edit
                                                                        </button>
                                                                    );
                                                                } else {
                                                                    return <span className="text-gray-500 text-xs">Completed</span>;
                                                                }
                                                            })()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between px-4 py-3 bg-white rounded-lg shadow text-xs">
                                    <div className="mb-2 md:mb-0">
                                        <span className="text-gray-600">Rows per page: </span>
                                        <select
                                            value={rowsPerPage}
                                            onChange={(e) => setRowsPerPage(Number(e.target.value))}
                                            className="border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {[5, 10, 20, 50, 100, 200, 500, 1000].map(size => (
                                                <option key={size} value={size}>{size}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="text-gray-600 mb-2 md:mb-0">
                                        Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredData.length)} of {filteredData.length} entries
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => paginate(1)}
                                            disabled={currentPage === 1}
                                            className={`p-1 rounded ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            <FiChevronsLeft size={14} />
                                        </button>
                                        <button
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`p-1 rounded ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            <FiChevronLeft size={14} />
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
                                                    className={`w-6 h-6 rounded ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}

                                        <button
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`p-1 rounded ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            <FiChevronRight size={14} />
                                        </button>
                                        <button
                                            onClick={() => paginate(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className={`p-1 rounded ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            <FiChevronsRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default UserReport;