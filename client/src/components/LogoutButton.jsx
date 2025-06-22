import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LogoutButton = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post(`${baseUrl}/logout`, {
                username: user.username,
                role: user.role
            });
        } catch (error) {
            console.error('Logout logging failed:', error);
        }
        logout();
        navigate('/');
    };
    return (
        <>
            <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
                Logout
            </button>
        </>
    )
}

export default LogoutButton