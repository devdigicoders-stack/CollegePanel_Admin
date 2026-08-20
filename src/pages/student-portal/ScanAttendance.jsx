import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { CheckCircle, XCircle, Loader2, MapPin, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const ScanAttendance = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'requesting-location' | 'success' | 'info' | 'error'
  const [message, setMessage] = useState('Verifying your attendance...');
  const [errorCode, setErrorCode] = useState(null);
  const [distanceInfo, setDistanceInfo] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const classId = params.get('classId');

    if (!classId) {
      setStatus('error');
      setMessage('Invalid QR Code. Missing class information.');
      return;
    }

    // Step 1: Try to get student's GPS location
    setStatus('requesting-location');
    setMessage('Requesting your location...');

    if (!navigator.geolocation) {
      // No geolocation support - try without location (backend will decide)
      markAttendance(classId, null, null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Got location, mark attendance with coords
        markAttendance(classId, position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        // Location denied or failed - try without (backend will block if geofence is on)
        markAttendance(classId, null, null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [location.search]);

  const markAttendance = async (classId, studentLat, studentLng) => {
    setStatus('loading');
    setMessage('Marking your attendance...');
    try {
      const payload = { classId };
      if (studentLat !== null && studentLng !== null) {
        payload.studentLat = studentLat;
        payload.studentLng = studentLng;
      }

      const res = await axiosInstance.post('/student-portal/attendance/mark-auto', payload);
      
      if (res.data.status === 'already_marked') {
        setStatus('info');
        setMessage('You have already marked your attendance for this class today!');
      } else {
        setStatus('success');
        setMessage('Your attendance has been marked successfully!');
      }
    } catch (error) {
      const errData = error.response?.data;
      setStatus('error');
      setErrorCode(errData?.code || null);
      if (errData?.code === 'OUT_OF_BOUNDS') {
        setDistanceInfo({ distance: errData.distance, allowedRadius: errData.allowedRadius });
        setMessage(`You are ${errData.distance}m away from the classroom. Must be within ${errData.allowedRadius}m.`);
      } else {
        setMessage(errData?.message || 'Failed to mark attendance. Please try again or contact your teacher.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4 font-['Inter']">
      <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
        
        {/* College Header */}
        <div className="mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <CheckCircle size={24} className="text-primary" />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Attendance System</p>
        </div>

        {(status === 'loading' || status === 'requesting-location') && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 size={48} className="text-primary animate-spin mb-4" />
            <h2 className="text-xl font-bold text-gray-800">
              {status === 'requesting-location' ? 'Detecting Location' : 'Processing Scan'}
            </h2>
            <p className="text-gray-500 text-sm mt-2">{message}</p>
            {status === 'requesting-location' && (
              <div className="mt-4 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
                <MapPin size={12} />
                Please allow location permission when prompted
              </div>
            )}
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Attendance Marked! ✅</h2>
            <p className="text-gray-500 text-sm mb-8">{message}</p>
            <button 
              onClick={() => navigate('/student/dashboard')}
              className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-colors w-full"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {status === 'info' && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={40} className="text-blue-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Already Marked</h2>
            <p className="text-gray-500 text-sm mb-8">{message}</p>
            <button 
              onClick={() => navigate('/student/dashboard')}
              className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-colors w-full"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center py-6">
            {errorCode === 'OUT_OF_BOUNDS' ? (
              <>
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                  <ShieldAlert size={40} className="text-orange-500" />
                </div>
                <h2 className="text-2xl font-black text-gray-800 mb-2">Outside Classroom</h2>
                <p className="text-gray-600 text-sm mb-4">{message}</p>
                {distanceInfo && (
                  <div className="w-full bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6 text-left">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-gray-600">Your distance</span>
                      <span className="font-black text-orange-600">{distanceInfo.distance}m away</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-600">Required</span>
                      <span className="font-black text-emerald-600">Within {distanceInfo.allowedRadius}m</span>
                    </div>
                    <div className="mt-3 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((distanceInfo.allowedRadius / distanceInfo.distance) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Move closer to your classroom and scan again</p>
                  </div>
                )}
              </>
            ) : errorCode === 'LOCATION_REQUIRED' ? (
              <>
                <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mb-6">
                  <MapPin size={40} className="text-yellow-500" />
                </div>
                <h2 className="text-2xl font-black text-gray-800 mb-2">Location Required</h2>
                <p className="text-gray-500 text-sm mb-6">{message}</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                  <XCircle size={40} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-black text-gray-800 mb-2">Scan Failed</h2>
                <p className="text-gray-500 text-sm mb-6">{message}</p>
              </>
            )}
            <button 
              onClick={() => navigate('/student/dashboard')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-bold transition-colors w-full"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanAttendance;
