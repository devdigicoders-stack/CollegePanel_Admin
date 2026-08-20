import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ScanAttendance = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('Verifying your attendance...');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const classId = params.get('classId');
    // Date is now handled automatically by the backend

    if (!classId) {
      setStatus('error');
      setMessage('Invalid QR Code. Missing class information.');
      return;
    }

    markAttendance(classId);
  }, [location.search]);

  const markAttendance = async (classId) => {
    try {
      // Backend automatically uses current server date if date is omitted
      const res = await axiosInstance.post('/student-portal/attendance/mark-auto', { classId });
      
      if (res.data.status === 'already_marked') {
        setStatus('info');
        setMessage('You have already marked your attendance for this class today!');
      } else {
        setStatus('success');
        setMessage('Your attendance has been marked successfully!');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to mark attendance. Please try again or contact your teacher.');
      toast.error('Attendance failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-['Inter']">
      <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 size={48} className="text-primary animate-spin mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Processing Scan</h2>
            <p className="text-gray-500 text-sm mt-2">Verifying your attendance...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Success!</h2>
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
          <div className="flex flex-col items-center justify-center py-8">
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
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <XCircle size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Scan Failed</h2>
            <p className="text-gray-500 text-sm mb-8">{message}</p>
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
