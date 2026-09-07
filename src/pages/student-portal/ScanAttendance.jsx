import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { 
  CheckCircle, XCircle, Loader2, MapPin, ShieldAlert, 
  ArrowLeft, GraduationCap, ShieldCheck, RefreshCw, Smartphone
} from 'lucide-react';
import toast from 'react-hot-toast';

const ScanAttendance = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [loadingInfo, setLoadingInfo] = useState(true);
  const [classInfo, setClassInfo] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [isMarked, setIsMarked] = useState(false);
  const [markedTime, setMarkedTime] = useState(null);

  // Marking submission state
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('ready'); // 'ready' | 'submitting' | 'requesting-location' | 'success' | 'already-marked' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [errorCode, setErrorCode] = useState(null);
  const [distanceInfo, setDistanceInfo] = useState(null);

  const params = new URLSearchParams(location.search);
  const classId = params.get('classId');

  useEffect(() => {
    if (!classId) {
      setStatus('error');
      setErrorMessage('Invalid QR Code. Missing class identification key.');
      setLoadingInfo(false);
      return;
    }

    fetchClassInfo(classId);
  }, [classId]);

  const fetchClassInfo = async (cid) => {
    try {
      setLoadingInfo(true);
      const res = await axiosInstance.get(`/student-portal/attendance/class-info/${cid}`);
      const data = res.data;

      setClassInfo(data.classDetails);
      setStudentInfo(data.studentDetails);
      setIsMarked(data.alreadyMarked);
      if (data.markedAt) setMarkedTime(data.markedAt);

      if (data.alreadyMarked) {
        setStatus('already-marked');
      } else {
        setStatus('ready');
      }
    } catch (err) {
      console.error('Failed to load class info:', err);
      setStatus('error');
      setErrorMessage(err.response?.data?.message || 'Class session not found or invalid QR code.');
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleStartMarking = () => {
    if (!classId) return;

    // Check if geo-fence is enabled for this class
    if (classInfo?.geoFence?.isEnabled) {
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported by your browser.');
        sendAttendanceRequest(classId, null, null);
        return;
      }

      setStatus('requesting-location');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          sendAttendanceRequest(classId, position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.warn('Geolocation failed or denied:', err);
          sendAttendanceRequest(classId, null, null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      sendAttendanceRequest(classId, null, null);
    }
  };

  const sendAttendanceRequest = async (cid, lat, lng) => {
    try {
      setSubmitting(true);
      setStatus('submitting');
      
      const payload = { classId: cid };
      if (lat !== null && lng !== null) {
        payload.studentLat = lat;
        payload.studentLng = lng;
      }

      const res = await axiosInstance.post('/student-portal/attendance/mark-auto', payload);
      
      if (res.data.status === 'already_marked') {
        setIsMarked(true);
        setStatus('already-marked');
        toast.success('Attendance is already marked for today!');
      } else {
        setIsMarked(true);
        setStatus('success');
        toast.success('Attendance marked successfully! 🎉');
      }
    } catch (error) {
      const errData = error.response?.data;
      setStatus('error');
      setErrorCode(errData?.code || null);
      if (errData?.code === 'OUT_OF_BOUNDS') {
        setDistanceInfo({ distance: errData.distance, allowedRadius: errData.allowedRadius });
        setErrorMessage(`You are ${errData.distance}m away from the classroom. You must be within ${errData.allowedRadius}m.`);
      } else {
        setErrorMessage(errData?.message || 'Failed to mark attendance. Please verify your connection or contact teacher.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-emerald-50/40 flex flex-col items-center justify-center p-4 sm:p-6 font-['Inter']">
      
      {/* Top Header / Back Button */}
      <div className="w-full max-w-lg mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/student/dashboard')}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-white/80 hover:bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-sm transition-all"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 bg-white/60 px-3 py-1.5 rounded-xl border border-gray-200/50">
          Smart Attendance Pass
        </span>
      </div>

      {/* Main Verification Card */}
      <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 relative overflow-hidden">
        
        {/* Loading State */}
        {loadingInfo && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 size={44} className="text-primary animate-spin mb-4" />
            <h3 className="text-base font-bold text-gray-800">Verifying Lecture Details...</h3>
            <p className="text-xs text-gray-400 mt-1">Fetching live attendance session information</p>
          </div>
        )}

        {/* Ready to Mark State */}
        {!loadingInfo && status === 'ready' && classInfo && (
          <div className="space-y-5">
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Smartphone size={18} />
                </div>
                <div>
                  <h2 className="text-[14px] font-black text-gray-800">Lecture Attendance</h2>
                  <p className="text-[11px] text-gray-400 font-medium">Verify your session and tap confirm</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                READY
              </span>
            </div>

            {/* Subject Hero Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/80">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-primary text-white">
                  {classInfo.subjectCode}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-gray-700 border border-gray-200">
                  Sem {classInfo.semester}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-gray-700 border border-gray-200">
                  Sec {studentInfo?.section || 'A'}
                </span>
              </div>
              <h3 className="text-lg font-black text-gray-800 leading-snug">
                {classInfo.subjectName}
              </h3>
              <p className="text-xs text-gray-600 font-medium mt-1 flex items-center gap-1.5">
                <GraduationCap size={14} className="text-primary" /> Faculty: <strong>{classInfo.teacherName}</strong>
              </p>
            </div>

            {/* Verified Student Details Grid */}
            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Student Name</p>
                <p className="text-xs font-bold text-gray-800 truncate mt-0.5">{studentInfo?.studentName || 'Student'}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Student ID</p>
                <p className="text-xs font-bold text-primary font-mono truncate mt-0.5">{studentInfo?.studentId || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Branch</p>
                <p className="text-xs font-bold text-gray-800 truncate mt-0.5">{studentInfo?.branch || classInfo.courseName}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Semester</p>
                <p className="text-xs font-bold text-gray-800 truncate mt-0.5">Semester {classInfo.semester}</p>
              </div>
            </div>

            {/* Geo-fence notice */}
            {classInfo.geoFence?.isEnabled ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <MapPin size={16} className="text-amber-600 flex-shrink-0" />
                <span>Geo-fencing active. GPS verification required within <strong>{classInfo.geoFence.radius || 50}m</strong> of classroom.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-xs">
                <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
                <span>Classroom location verified. Instant attendance marking enabled.</span>
              </div>
            )}

            {/* Confirm & Mark Attendance Button */}
            <button
              onClick={handleStartMarking}
              className="w-full bg-primary hover:bg-primary-hover text-white text-sm font-bold py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <CheckCircle size={18} /> Confirm & Mark Attendance Now
            </button>
          </div>
        )}

        {/* Submitting / Geolocation State */}
        {!loadingInfo && (status === 'submitting' || status === 'requesting-location') && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Loader2 size={48} className="text-primary animate-spin mb-4" />
            <h3 className="text-lg font-black text-gray-800">
              {status === 'requesting-location' ? 'Acquiring GPS Location...' : 'Recording Attendance...'}
            </h3>
            <p className="text-xs text-gray-500 mt-1.5 max-w-xs">
              {status === 'requesting-location'
                ? 'Please tap "Allow" if your browser prompts for device location access.'
                : 'Encrypting and saving your attendance record on the server.'}
            </p>
          </div>
        )}

        {/* Success State */}
        {!loadingInfo && status === 'success' && (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner border border-emerald-100">
              <CheckCircle size={44} />
            </div>
            
            <div>
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                ✓ Recorded as Present
              </span>
              <h2 className="text-2xl font-black text-gray-800 mt-2">Attendance Marked!</h2>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Your attendance for <strong>{classInfo?.subjectName}</strong> has been successfully recorded.
              </p>
            </div>

            {/* Summary Box */}
            <div className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold">Subject</span>
                <span className="font-bold text-gray-800">{classInfo?.subjectName} ({classInfo?.subjectCode})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold">Faculty</span>
                <span className="font-bold text-gray-800">{classInfo?.teacherName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold">Student</span>
                <span className="font-bold text-gray-800">{studentInfo?.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold">Time</span>
                <span className="font-bold text-emerald-600 font-mono">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/student/dashboard')}
              className="w-full bg-gray-900 hover:bg-black text-white text-xs font-bold py-3 px-6 rounded-xl transition-colors shadow-sm"
            >
              Return to Student Dashboard
            </button>
          </div>
        )}

        {/* Already Marked State */}
        {!loadingInfo && status === 'already-marked' && (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-inner border border-blue-100">
              <ShieldCheck size={44} />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 uppercase tracking-wide">
                Already Verified
              </span>
              <h2 className="text-2xl font-black text-gray-800 mt-2">Attendance Already Marked</h2>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                You are already marked <strong>PRESENT</strong> for this lecture session today.
              </p>
            </div>

            {/* Breakdown card */}
            {classInfo && (
              <div className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">Subject:</span>
                  <span className="font-bold text-gray-800">{classInfo.subjectName} ({classInfo.subjectCode})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">Faculty:</span>
                  <span className="font-bold text-gray-800">{classInfo.teacherName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">Student:</span>
                  <span className="font-bold text-gray-800">{studentInfo?.studentName} ({studentInfo?.studentId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">Status:</span>
                  <span className="font-black text-emerald-600">✓ PRESENT TODAY</span>
                </div>
              </div>
            )}

            <button
              onClick={() => navigate('/student/dashboard')}
              className="w-full bg-gray-900 hover:bg-black text-white text-xs font-bold py-3 px-6 rounded-xl transition-colors shadow-sm"
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {/* Error / Out of bounds State */}
        {!loadingInfo && status === 'error' && (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center border border-rose-100">
              {errorCode === 'OUT_OF_BOUNDS' ? <ShieldAlert size={44} /> : <XCircle size={44} />}
            </div>

            <div>
              <h2 className="text-xl font-black text-gray-800">
                {errorCode === 'OUT_OF_BOUNDS' ? 'Outside Classroom Location' : 'Attendance Verification Failed'}
              </h2>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                {errorMessage || 'Unable to record attendance. Please try again or notify your teacher.'}
              </p>
            </div>

            {distanceInfo && (
              <div className="w-full bg-rose-50/70 border border-rose-200 rounded-2xl p-4 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Your current distance:</span>
                  <span className="font-black text-rose-600">{distanceInfo.distance} meters</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Classroom radius allowed:</span>
                  <span className="font-black text-emerald-600">Within {distanceInfo.allowedRadius} meters</span>
                </div>
                <p className="text-[10px] text-gray-400 pt-1">
                  Please move inside the classroom and tap Retry.
                </p>
              </div>
            )}

            <div className="w-full flex items-center gap-2">
              <button
                onClick={() => {
                  setStatus('ready');
                  if (classId) fetchClassInfo(classId);
                }}
                className="flex-1 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 px-4 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={14} /> Retry Verification
              </button>
              <button
                onClick={() => navigate('/student/dashboard')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-3 px-4 rounded-xl transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ScanAttendance;
