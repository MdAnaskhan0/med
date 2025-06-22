import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaHome } from 'react-icons/fa';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <FaLock className="text-red-500 text-4xl" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Unauthorized Access</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please contact your administrator or return to the home page.
        </p>
        
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
        >
          <FaHome />
          Go to Home Page
        </button>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Need help? <a href="anas.cse.201@gmail.com" className="text-blue-600 hover:underline">Contact support</a></p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;