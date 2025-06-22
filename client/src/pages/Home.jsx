import React, { useState } from 'react';
import Login from './Login';
import HomeVideo from '../assets/video/GPS.mp4';
import { FaUserShield, FaLock, FaEnvelope, FaSignInAlt, FaChevronRight } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Home = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex flex-col lg:flex-row items-center justify-center px-4 py-8">
      {/* Toast notifications container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="shadow-lg"
      />

      {/* Left Content - Text + Video */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 lg:px-12 lg:py-8 mb-8 lg:mb-0"
      >
        <div className="w-full max-w-2xl">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white p-1 rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
          >
            <video
              src={HomeVideo}
              autoPlay
              loop
              muted
              className="w-full h-auto rounded-xl object-cover shadow-lg transform transition-all duration-500 hover:scale-105"
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-8 text-center lg:text-left"
          >
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Welcome to <span className="text-[#05b356]">Fashion Group</span>
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Track. Monitor. Optimize – Seamless Employee Movement Management.
            </p>
            
          </motion.div>
        </div>
      </motion.div>

      {/* Right Content - Login Form */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/2 flex items-center justify-center"
      >
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-6 text-center">
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-indigo-100 mt-1">Sign in to continue to your dashboard</p>
          </div>
          
          <div className="p-8 sm:p-10">
            <div className="flex justify-center mb-6">
              <div className="bg-indigo-100 p-4 rounded-full -mt-14 shadow-lg border-4 border-white">
                <FaSignInAlt className="text-indigo-600 text-2xl" />
              </div>
            </div>

            <Login />

            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="text-center text-sm">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                    Request access
                  </Link>
                </p>
                <p className="mt-3 text-xs text-gray-500">
                  By continuing, you agree to our{' '}
                  <Link href="/" className="text-indigo-600 hover:underline">Terms</Link> and{' '}
                  <Link href="/" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;