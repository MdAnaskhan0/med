import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../../../components/LogoutButton';
import axios from 'axios';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { FiSearch, FiChevronLeft, FiChevronRight, FiEye, FiUserPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Users = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]); // Store original unfiltered data
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${baseUrl}/users`);
      const usersWithKeys = res.data.data.map((user, index) => ({ ...user, key: index + 1 }));
      setUsers(usersWithKeys);
      setOriginalUsers(usersWithKeys); // Store original data
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load user data. Please try again.');
      toast.error('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [baseUrl]);

  // Apply status filter when statusFilter changes
  useEffect(() => {
    if (statusFilter === 'all') {
      setUsers(originalUsers);
    } else {
      const filtered = originalUsers.filter(user => 
        user.userStatus?.toLowerCase() === statusFilter.toLowerCase()
      );
      setUsers(filtered);
    }
  }, [statusFilter, originalUsers]);

  const columns = useMemo(
    () => [
      {
        header: 'No.',
        accessorKey: 'key',
        cell: info => <span className="text-gray-600 text-sm">{info.getValue()}</span>,
        size: 60,
      },
      {
        header: 'Username',
        accessorKey: 'username',
        cell: info => <span className="text-gray-800 font-medium">{info.getValue()}</span>,
        size: 120,
      },
      {
        header: 'E-ID',
        accessorKey: 'E_ID',
        cell: info => <span className="text-gray-600">{info.getValue() || '-'}</span>,
        size: 100,
      },
      {
        header: 'Name',
        accessorKey: 'Name',
        cell: info => <span className="text-gray-800">{info.getValue()}</span>,
        size: 150,
      },
      {
        header: 'Role',
        accessorKey: 'Role',
        cell: info => (
          <span className={`text-xs px-2 py-1 rounded-full ${
            info.getValue() === 'admin' ? 'bg-purple-50 text-purple-700' :
            info.getValue() === 'user' ? 'bg-blue-50 text-blue-700' :
            'bg-gray-50 text-gray-700'
          }`}>
            {info.getValue()}
          </span>
        ),
        size: 100,
      },
      {
        header: 'Department',
        accessorKey: 'Department',
        cell: info => <span className="text-gray-600 text-sm">{info.getValue() || '-'}</span>,
        size: 120,
      },
      {
        header: 'Designation',
        accessorKey: 'Designation',
        cell: info => <span className="text-gray-600 text-sm">{info.getValue() || '-'}</span>,
        size: 120,
      },
      {
        header: 'Company',
        accessorKey: 'Company_name',
        cell: info => <span className="text-gray-600 text-sm">{info.getValue() || '-'}</span>,
        size: 120,
      },
      {
        header: 'Email',
        accessorKey: 'email',
        cell: info => (
          <a 
            href={`mailto:${info.getValue()}`} 
            className="text-gray-600 text-sm hover:text-blue-600 hover:underline"
          >
            {info.getValue()}
          </a>
        ),
        size: 180,
      },
      {
        header: 'Status',
        accessorKey: 'userStatus',
        cell: info => (
          <span className={`text-xs px-2 py-1 rounded-full ${
            info.getValue() === 'active' ? 'bg-green-100 text-green-800' :
            info.getValue() === 'deactive' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {info.getValue()}
          </span>
        ),
        size: 80,
      },
      {
        header: 'Actions',
        accessorKey: 'userID',
        cell: info => (
          <button
            onClick={() => navigate(`/admin/user-profile/${info.getValue()}`)}
            className="text-xs flex items-center text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            aria-label="View user details"
          >
            <FiEye className="mr-1" /> View
          </button>
        ),
        size: 80,
      },
    ],
    [navigate]
  );

  const table = useReactTable({
    data: users,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">User Management</h2>
            <p className="text-xs text-gray-500">Manage system users and permissions</p>
          </div>
          <LogoutButton />
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
          <button 
            onClick={fetchData}
            className="mt-2 text-sm text-red-700 hover:text-red-900 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header Section */}
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">User Management</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage {users.length} system users and their permissions
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <LogoutButton className="hidden sm:block" />
          </div>
        </div>
      </div>

      {/* Toolbar Section */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="w-full sm:w-auto">
            <div className="relative max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={globalFilter}
                onChange={e => setGlobalFilter(e.target.value)}
                aria-label="Search users"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="deactive">Deactive</option>
            </select>
            
            <button
              onClick={() => navigate('/admin/create-user')}
              className="flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Add new user"
            >
              <FiUserPlus className="mr-2 h-4 w-4" />
              Add User
            </button>
            
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className="hidden sm:block text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Items per page"
            >
              {[5, 10, 20, 50, 100, 200, 500, 1000].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Logout Button */}
      <div className="sm:hidden p-4 flex justify-end">
        <LogoutButton />
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: header.getSize() }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td 
                      key={cell.id} 
                      className="px-4 py-3 whitespace-nowrap text-sm"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-500">
                  {globalFilter ? 'No users match your search' : 'No users found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Section */}
      <div className="px-4 py-3 sm:px-6 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                users.length
              )}
            </span>{' '}
            of <span className="font-medium">{users.length}</span> users
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex sm:hidden">
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => table.setPageSize(Number(e.target.value))}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-label="Items per page"
              >
                {[5, 10, 20, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize} per page
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className={`p-2 rounded-md ${!table.getCanPreviousPage() ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                aria-label="First page"
              >
                <span className="sr-only">First page</span>
                <span className="text-sm">«</span>
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className={`p-2 rounded-md ${!table.getCanPreviousPage() ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                aria-label="Previous page"
              >
                <FiChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center text-sm text-gray-600 px-2">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </div>
              
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className={`p-2 rounded-md ${!table.getCanNextPage() ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                aria-label="Next page"
              >
                <FiChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className={`p-2 rounded-md ${!table.getCanNextPage() ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                aria-label="Last page"
              >
                <span className="sr-only">Last page</span>
                <span className="text-sm">»</span>
              </button>
            </div>
            
            <div className="hidden sm:flex items-center space-x-1">
              <span className="text-sm text-gray-500">Go to:</span>
              <input
                type="number"
                min="1"
                max={table.getPageCount()}
                defaultValue={table.getState().pagination.pageIndex + 1}
                onChange={e => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  table.setPageIndex(page);
                }}
                className="w-16 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-label="Page number"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;