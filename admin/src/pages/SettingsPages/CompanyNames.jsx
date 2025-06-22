import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import { 
  FaBars, 
  FaTimes, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaImage,
  FaSave,
  FaTimesCircle
} from 'react-icons/fa';
import { FiUpload } from 'react-icons/fi';
import { BsBuilding } from 'react-icons/bs';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { FiRefreshCw } from 'react-icons/fi';

const CompanyNames = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // Form states
  const [companyname, setCompanyname] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyLogoFile, setCompanyLogoFile] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [editingCompanyId, setEditingCompanyId] = useState(null);

  // Fetch all companies
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${baseUrl}/companynames`);
      setCompanies(res.data.data || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch companies');
      toast.error('Failed to load companies');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Handle file upload preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyLogoFile(file);
      setPreviewLogo(URL.createObjectURL(file));
    }
  };

  // Handle create or update submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyname.trim()) {
      toast.warn('Company name is required');
      return;
    }

    const formData = new FormData();
    formData.append('companyname', companyname);
    formData.append('companyDescription', companyDescription);
    if (companyLogoFile) {
      formData.append('companyLogo', companyLogoFile);
    }

    try {
      setLoading(true);
      if (editingCompanyId) {
        // Update company
        await axios.put(
          `${baseUrl}/companynames/${editingCompanyId}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        toast.success('Company updated successfully');
      } else {
        // Create new company
        await axios.post(
          `${baseUrl}/companynames`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        toast.success('Company created successfully');
      }

      // Reset form and refresh list
      resetForm();
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting form');
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setCompanyname('');
    setCompanyDescription('');
    setCompanyLogoFile(null);
    setPreviewLogo(null);
    setEditingCompanyId(null);
    setLoading(false);
  };

  // Handle edit click
  const handleEdit = (company) => {
    setCompanyname(company.companyname);
    setCompanyDescription(company.companyDescription || '');
    setEditingCompanyId(company.companynameID);
    setCompanyLogoFile(null);
    setPreviewLogo(
      company.companyLogo 
        ? `${baseUrl}/companylogos/${company.companynameID}?${Date.now()}` 
        : null
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;

    try {
      setLoading(true);
      await axios.delete(`${baseUrl}/companynames/${id}`);
      toast.success('Company deleted successfully');
      fetchCompanies();
    } catch (err) {
      toast.error('Error deleting company');
      setLoading(false);
    }
  };

  // Sidebar logout handler
  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} handleLogout={handleLogout} />

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      <div className="flex flex-col flex-1 w-full">
        {/* Header */}
        <header className="flex items-center justify-between bg-white shadow-sm p-4 border-b">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 focus:outline-none md:hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
          </button>

          <div className="flex items-center">
            {/* <BsBuilding className="text-blue-600 mr-2 text-xl" /> */}
            <h1 className="text-xl font-semibold text-gray-800">Company Management</h1>
          </div>
        </header>

        <main className="flex-grow overflow-auto p-4 md:p-6">
          <ToastContainer position="top-right" autoClose={3000} />

          {/* Form Section */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-700 to-blue-800 p-4 text-white">
                <h2 className="text-lg font-semibold flex items-center">
                  {editingCompanyId ? (
                    <>
                      <FaEdit className="mr-2" /> Edit Company
                    </>
                  ) : (
                    <>
                      <FaPlus className="mr-2" /> Add New Company
                    </>
                  )}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6" encType="multipart/form-data">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={companyname}
                          onChange={(e) => setCompanyname(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter company name"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        value={companyDescription}
                        onChange={(e) => setCompanyDescription(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Enter company address"
                      />
                    </div>
                  </div>

                  {/* Right Column - Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Logo {editingCompanyId && '(Upload to change)'}
                    </label>
                    
                    <div className="flex flex-col items-center">
                      {/* Logo Preview */}
                      <div className="mb-4 w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center overflow-hidden bg-gray-100">
                        {previewLogo ? (
                          <img 
                            src={previewLogo} 
                            alt="Logo preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaImage className="text-gray-400 text-3xl" />
                        )}
                      </div>
                      
                      {/* File Upload */}
                      <label className="cursor-pointer bg-white border border-gray-300 rounded-md px-4 py-2 flex items-center justify-center text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <FiUpload className="mr-2" />
                        Upload Logo
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange}
                          className="sr-only"
                          {...(!editingCompanyId && { required: true })}
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500">
                        JPG, PNG or GIF (Max 1MB)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-6 flex justify-end space-x-3">
                  {editingCompanyId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      disabled={loading}
                    >
                      <FaTimesCircle className="mr-2" /> Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                    disabled={loading}
                  >
                    {loading ? (
                      'Processing...'
                    ) : (
                      <>
                        {editingCompanyId ? (
                          <>
                            <FaSave className="mr-2" /> Update Company
                          </>
                        ) : (
                          <>
                            <FaPlus className="mr-2" /> Add Company
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Companies List Section */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-4 text-white flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center">
                  <BsBuilding className="mr-2" /> Company List
                </h2>
                <button
                  onClick={fetchCompanies}
                  className="flex items-center gap-2 bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-100 hover:text-gray-800 transition cursor-pointer"
                  disabled={loading}
                >
                  <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              <div>
                
              </div>

              {loading && companies.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading companies...</p>
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-500">
                  <AiOutlineInfoCircle className="mx-auto text-3xl mb-2" />
                  {error}
                </div>
              ) : companies.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <AiOutlineInfoCircle className="mx-auto text-3xl mb-2" />
                  No companies found. Add your first company above.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Logo
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Address
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {companies.map((company) => (
                        <tr key={company.companynameID} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex-shrink-0 h-10 w-10">
                              {company.companyLogo ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={`${baseUrl}/companylogos/${company.companynameID}?${Date.now()}`}
                                  alt={`${company.companyname} logo`}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/100?text=No+Logo';
                                  }}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <BsBuilding className="text-gray-400" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{company.companyname}</div>
                            <div className="text-sm text-gray-500 md:hidden">
                              {company.companyDescription?.substring(0, 30)}{company.companyDescription?.length > 30 ? '...' : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                            {company.companyDescription || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEdit(company)}
                              className="text-blue-800 hover:text-blue-900 mr-4 cursor-pointer"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(company.companynameID)}
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

export default CompanyNames;