import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const InactivityHandler = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        let timeout;
        const logoutTime = 10 * 60 * 1000; // 10 minutes

        const resetTimer = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                // Log out
                localStorage.removeItem('adminLoggedIn');
                navigate('/', { replace: true });
            }, logoutTime);
        };

        // Events that count as activity
        const events = ['mousemove', 'keydown', 'scroll', 'click'];

        // Attach listeners
        events.forEach((event) => {
            window.addEventListener(event, resetTimer);
        });

        // Start timer on mount
        resetTimer();

        // Cleanup
        return () => {
            clearTimeout(timeout);
            events.forEach((event) => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [navigate]);

    return children;
};

export default InactivityHandler;
