// src/components/layout/Header.jsx
import React from 'react';
import logo from '../../assets/logo.png';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

export default function Header() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <div className="bg-gray-100 py-2 px-6 shadow-md">
      <div className="flex flex-row items-center justify-between md:space-y-0">

        {/* Logo */}
        <div className="w-1/3 md:w-1/2 flex justify-center md:justify-start items-center">
          {isLoggedIn ? (
            <Link to="/dashboard">
              <img src={logo} alt="Logo" className="w-40 md:w-48 items-center p-4" />
            </Link>
          ) : (
            <Link to="/">
              <img src={logo} alt="Logo" className="w-40 md:w-48 items-center p-4" />
            </Link>
          )}
        </div>

        {/* Management System */}
        <div className="w-full md:w-1/2 text-center md:text-right">
          <h1 className="text-sm md:text-3xl font-bold text-gray-800">
            Employee Movement Management System
          </h1>
        </div>
      </div>
    </div>
  );
}
