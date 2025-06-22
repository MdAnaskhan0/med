import { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function JsonUpdater() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const [fileName, setFileName] = useState('partyNames');
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        navigate('/');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!fileName || !inputValue) {
            setError("Both fields are required.");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setMessage(null);

            const res = await axios.post('http://192.168.111.140:5137/update-json', {
                fileName,
                value: inputValue,
            });

            setMessage(res.data.message || 'Successfully updated!');
            setInputValue('');
        } catch (err) {
            setError('Failed to update JSON');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100 overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} handleLogout={handleLogout} />

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="flex flex-col flex-1 w-full">
                <header className="flex items-center justify-between bg-white shadow p-4">
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

                    <h1 className="text-xl font-semibold text-gray-800">Add Field Data</h1>
                </header>

                <main className="flex-grow overflow-auto p-6 bg-gray-50">
                    <div className="max-w-xl mx-auto bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4 text-gray-700">Add New Entry</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="fileName" className="block text-sm font-medium text-gray-600">
                                    Select File
                                </label>
                                <select
                                    id="fileName"
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                >
                                    <option value="/">Select Field</option>
                                    <option value="companynames">Company Names</option>
                                    <option value="designations">Designations</option>
                                    <option value="departments">Departments</option>
                                    <option value="partynames">Party Names</option>
                                    <option value="placenames">Place Names</option>
                                    <option value="role">Role</option>
                                    <option value="visitingstatus">Visiting Status</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="inputValue" className="block text-sm font-medium text-gray-600">
                                    Enter Value
                                </label>
                                <input
                                    id="inputValue"
                                    type="text"
                                    placeholder="Enter new value"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                />
                            </div>

                            {message && (
                                <div className="text-green-600 text-sm">{message}</div>
                            )}
                            {error && (
                                <div className="text-red-600 text-sm">Already exists</div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition ${
                                        loading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {loading ? 'Adding...' : 'Add Entry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}
