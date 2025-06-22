import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaHome, FaSearch } from 'react-icons/fa';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-100 p-5 rounded-full animate-pulse">
            <FaExclamationTriangle className="text-yellow-500 text-5xl" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-3">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-6">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
          >
            <FaHome />
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;