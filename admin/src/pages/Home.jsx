import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HeroImage from '../assets/Hero.jpg';
import { FiUser, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

const Home = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({
    username: false,
    password: false
  });
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // Check if already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${baseUrl}/admin/login`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'ok') {
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminUsername', data.username);
        localStorage.setItem('adminID', data.adminID);

        toast.success('Login successful! Redirecting...', {
          position: "top-center",
          autoClose: 1500,
          hideProgressBar: true,
        });

        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError(data.message || 'Invalid username or password');
        toast.error(data.message || 'Login failed', {
          position: "top-center"
        });
      }
    } catch (err) {
      setError('Network error, please try again.');
      toast.error('Network error, please try again.', {
        position: "top-center"
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (e) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling
    setShowPassword(!showPassword);
  };

  const handleFocus = (field) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field) => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left side - Only Image */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center">
        <img 
          src={HeroImage} 
          alt="Portal Visual" 
          className="w-full h-full object-cover p-10 rounded-xl"
        />
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome! Admin</h2>
            <p className="text-gray-600">Please enter your credentials to login</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className={`block text-sm font-medium mb-1 transition-all duration-200 ${
                    isFocused.username ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className={`h-5 w-5 ${
                      isFocused.username ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => handleFocus('username')}
                    onBlur={() => handleBlur('username')}
                    className={`w-full pl-10 pr-3 py-3 border ${
                      isFocused.username ? 'border-blue-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent`}
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className={`block text-sm font-medium mb-1 transition-all duration-200 ${
                    isFocused.password ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className={`h-5 w-5 ${
                      isFocused.password ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => handleFocus('password')}
                    onBlur={() => handleBlur('password')}
                    className={`w-full pl-10 pr-10 py-3 border ${
                      isFocused.password ? 'border-blue-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent`}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button" // Important: set type to "button" to prevent form submission
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium ${
                  isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Need help?{' '}
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Toast Container for notifications */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="shadow-lg"
      />
    </div>
  );
};

export default Home;