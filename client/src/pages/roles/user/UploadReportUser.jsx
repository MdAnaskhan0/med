import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../auth/AuthContext';
import { FiClock, FiMapPin, FiBriefcase, FiFileText, FiEdit2, FiSend, FiUser, FiCalendar } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PlaceNames from '../../../assets/Json/Places.json';
import LogoutButton from '../../../components/LogoutButton';

const UploadReportUser = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    userID: '',
    username: '',
    punchTime: '',
    punchingTime: '',
    visitingStatus: '',
    placeName: '',
    partyName: '',
    purpose: '',
    remark: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visitingStatuses, setVisitingStatuses] = useState([]);
  const [partyNames, setPartyNames] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [filteredParties, setFilteredParties] = useState([]);
  const [currentDate] = useState(new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        userID: user.userID,
        username: user.username
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [visitRes, partyRes] = await Promise.all([
          axios.get(`${baseUrl}/visitingstatus`),
          axios.get(`${baseUrl}/partynames`),
        ]);

        setVisitingStatuses(visitRes.data);
        setPartyNames(partyRes.data.map(p => p.partyname));
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        toast.error('Failed to load dropdown data', {
          position: "top-right",
          className: 'bg-red-100 text-red-800 border border-red-200'
        });
      }
    };

    fetchData();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'placeName') {
      const matches = PlaceNames.filter(place =>
        place.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPlaces(matches);
    }

    if (name === 'partyName') {
      const matches = partyNames.filter(party =>
        party.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredParties(matches);
    }
  };

  const handleSelectSuggestion = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'placeName') setFilteredPlaces([]);
    if (name === 'partyName') setFilteredParties([]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await axios.post(`${baseUrl}/movements`, formData);

      if (res.status === 201) {
        toast.success('Movement recorded successfully!', {
          position: "top-right",
          className: 'bg-green-100 text-green-800 border border-green-200'
        });
        setFormData(prev => ({
          ...prev,
          punchTime: '',
          punchingTime: '',
          visitingStatus: '',
          placeName: '',
          partyName: '',
          purpose: '',
          remark: '',
        }));
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Submission failed', {
        position: "top-right",
        className: 'bg-red-100 text-red-800 border border-red-200'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-gray-500">Loading user data...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Movement Tracker</h1>
            <p className="text-gray-600 flex items-center">
              <FiCalendar className="mr-2" />
              {currentDate}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <LogoutButton />
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 py-6 px-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center space-x-3">
                    <FiClock className="text-white" />
                    <span>Movement Status Report</span>
                  </h2>
                  <p className="text-sm text-blue-100 mt-1">Record your daily movements and visits</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Punch Status */}
                <div className="space-y-2">
                  <label htmlFor="punchTime" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiClock className="mr-2 text-indigo-600" />
                    Punch Status <span className='text-red-600 pl-1'>*</span>
                  </label>
                  <select
                    id="punchTime"
                    name="punchTime"
                    value={formData.punchTime}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full pl-10 pr-3 py-3 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm bg-gray-50"
                  >
                    <option value="">Select Status</option>
                    <option value="Punch In">Punch In</option>
                    <option value="Punch Out">Punch Out</option>
                  </select>
                </div>

                {/* Punching Time */}
                <div className="space-y-2">
                  <label htmlFor="punchingTime" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiClock className="mr-2 text-indigo-600" />
                    Punching Time<span className='text-red-600 pl-1'>*</span>
                  </label>
                  <input
                    type="time"
                    id="punchingTime"
                    name="punchingTime"
                    value={formData.punchingTime}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-3 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm bg-gray-50"
                  />
                </div>

                {/* Visiting Status */}
                <div className="space-y-2">
                  <label htmlFor="visitingStatus" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiMapPin className="mr-2 text-indigo-600" />
                    Visiting Status<span className='text-red-600 pl-1'>*</span>
                  </label>
                  <select
                    id="visitingStatus"
                    name="visitingStatus"
                    value={formData.visitingStatus}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-3 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm bg-gray-50"
                  >
                    <option value="">Select Status</option>
                    {visitingStatuses.map(status => (
                      <option key={status.visitingstatusID} value={status.visitingstatusname}>
                        {status.visitingstatusname}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Place Name with Suggestions */}
                <div className="space-y-2 relative">
                  <label htmlFor="placeName" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiMapPin className="mr-2 text-indigo-600" />
                    Place Name<span className='text-red-600 pl-1'>*</span>
                  </label>
                  <input
                    id="placeName"
                    name="placeName"
                    value={formData.placeName}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="mt-1 block w-full px-4 py-3 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm bg-gray-50"
                  />
                  {filteredPlaces.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg max-h-48 overflow-y-auto shadow-xl divide-y divide-gray-100">
                      {filteredPlaces.map((place, idx) => (
                        <li
                          key={idx}
                          className="px-4 py-3 hover:bg-indigo-50 cursor-pointer text-sm flex items-center"
                          onClick={() => handleSelectSuggestion('placeName', place)}
                        >
                          <FiMapPin className="text-indigo-400 mr-2" />
                          {place}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Party Name with Suggestions */}
                <div className="space-y-2 relative">
                  <label htmlFor="partyName" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiBriefcase className="mr-2 text-indigo-600" />
                    Party Name<span className='text-red-600 pl-1'>*</span>
                  </label>
                  <input
                    id="partyName"
                    name="partyName"
                    value={formData.partyName}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="mt-1 block w-full px-4 py-3 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm bg-gray-50"
                  />
                  {filteredParties.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg max-h-48 overflow-y-auto shadow-xl divide-y divide-gray-100">
                      {filteredParties.map((party, idx) => (
                        <li
                          key={idx}
                          className="px-4 py-3 hover:bg-indigo-50 cursor-pointer text-sm flex items-center"
                          onClick={() => handleSelectSuggestion('partyName', party)}
                        >
                          <FiBriefcase className="text-indigo-400 mr-2" />
                          {party}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Purpose */}
                <div className="space-y-2">
                  <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiFileText className="mr-2 text-indigo-600" />
                    Purpose<span className='text-red-600 pl-1'>*</span>
                  </label>
                  <input
                    type="text"
                    id="purpose"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-3 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm bg-gray-50"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <label htmlFor="remark" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FiEdit2 className="mr-2 text-indigo-600" />
                  Remarks
                </label>
                <textarea
                  id="remark"
                  name="remark"
                  value={formData.remark}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm bg-gray-50"
                  rows="4"
                  placeholder="Additional notes..."
                ></textarea>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-90 cursor-not-allowed' : ''}`}
                >
                  <FiSend className="mr-3" />
                  {isSubmitting ? 'Processing...' : 'Submit Movement Report'}
                </button>
              </div>
            </form>
          </div>
        </div>

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
          toastClassName="border"
          progressClassName="bg-gradient-to-r from-indigo-500 to-blue-500"
        />
      </div>
    </div>
  );
};

export default UploadReportUser;