import { useState, useEffect } from 'react';
import { Download, CalendarCheck, Save, History, Clock, QrCode, X, MapPin, Shield, ShieldCheck, Navigation, Locate, Loader2 } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import ClassSelector from './components/ClassSelector';
import { useSocket } from '../../context/SocketContext';

const Attendance = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [classesList, setClassesList] = useState([]);
  const [activeTab, setActiveTab] = useState('mark'); // 'mark' | 'history'
  
  // Mark Attendance State
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // History State
  const [historyRecords, setHistoryRecords] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // QR State & Socket
  const [showQRModal, setShowQRModal] = useState(false);

  // Geo-Fence State
  const [showGeoModal, setShowGeoModal] = useState(false);
  const [geoFence, setGeoFence] = useState({ isEnabled: false, lat: null, lng: null, radius: 50 });
  const [geoLoading, setGeoLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  
  // Single Student History State
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudentInfo, setSelectedStudentInfo] = useState(null);
  const [studentHistoryData, setStudentHistoryData] = useState([]);
  const [studentHistoryLoading, setStudentHistoryLoading] = useState(false);
  
  // Date History State
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDateRecord, setSelectedDateRecord] = useState(null);
  
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      const handleAttendanceMarked = (data) => {
        // data: { classId, studentId, date, status }
        if (data.classId === selectedClass && data.date === attendanceDate) {
          setAttendanceRecords(prev => ({
            ...prev,
            [data.studentId]: data.status
          }));
          toast.success('A student scanned and marked attendance live!', { icon: '📱' });
        }
      };
      socket.on('attendance_marked', handleAttendanceMarked);
      return () => {
        socket.off('attendance_marked', handleAttendanceMarked);
      };
    }
  }, [socket, selectedClass, attendanceDate]);

  // Load geo-fence settings when class changes
  useEffect(() => {
    if (selectedClass && classesList.length > 0) {
      const cls = classesList.find(c => c._id === selectedClass);
      if (cls?.geoFence) {
        setGeoFence({
          isEnabled: cls.geoFence.isEnabled || false,
          lat: cls.geoFence.lat || null,
          lng: cls.geoFence.lng || null,
          radius: cls.geoFence.radius || 50
        });
      } else {
        setGeoFence({ isEnabled: false, lat: null, lng: null, radius: 50 });
      }
    }
  }, [selectedClass, classesList]);

  useEffect(() => {
    if (selectedClass) {
      if (activeTab === 'mark') {
        fetchClassData();
      } else {
        fetchHistoryData();
      }
    }
  }, [selectedClass, attendanceDate, activeTab]);

  const fetchClassData = async () => {
    setLoading(true);
    try {
      const [studentsRes, attendanceRes] = await Promise.all([
        axiosInstance.get(`/teacher-portal/class/${selectedClass}/students`),
        axiosInstance.get(`/teacher-portal/class/${selectedClass}/attendance?date=${attendanceDate}`)
      ]);
      
      const studentsList = studentsRes.data || [];
      setStudents(studentsList);
      
      const recordsMap = {};
      const attData = attendanceRes.data;
      if (attData && attData.records && attData.records.length > 0) {
        attData.records.forEach(r => {
          recordsMap[r.studentId._id || r.studentId] = r.status;
        });
      }
      setAttendanceRecords(recordsMap);
    } catch (error) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryData = async () => {
    setLoadingHistory(true);
    try {
      const res = await axiosInstance.get(`/teacher-portal/class/${selectedClass}/attendance/history`);
      setHistoryRecords(res.data || []);
    } catch (error) {
      toast.error('Failed to load attendance history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleViewStudentHistory = async (student) => {
    if (!selectedClass) return;
    setSelectedStudentInfo(student);
    setShowStudentModal(true);
    setStudentHistoryLoading(true);
    try {
      const res = await axiosInstance.get(`/teacher-portal/class/${selectedClass}/student/${student._id}/attendance/history`);
      setStudentHistoryData(res.data || []);
    } catch (error) {
      toast.error('Failed to fetch student history');
    } finally {
      setStudentHistoryLoading(false);
    }
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass) return;
    setSaving(true);
    try {
      const records = Object.keys(attendanceRecords).map(studentId => ({
        studentId,
        status: attendanceRecords[studentId],
        remarks: ''
      }));

      await axiosInstance.post(`/teacher-portal/class/${selectedClass}/attendance`, {
        date: attendanceDate,
        records
      });
      toast.success('Attendance saved successfully');
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadQR = async () => {
    try {
      const baseUrl = window.location.origin;
      const qrDataUrl = `${baseUrl}/student-portal/attendance/scan?classId=${selectedClass}`;
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qrDataUrl)}`;
      
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 600;
      canvas.height = 700;
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        ctx.drawImage(img, 50, 50, 500, 500);
        
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        const classObj = classesList.find(c => c._id === selectedClass);
        if (classObj) {
          ctx.fillText(`${classObj.subjectName} (${classObj.subjectCode})`, 300, 600);
          ctx.font = 'bold 20px Inter, sans-serif';
          ctx.fillStyle = '#4b5563';
          ctx.fillText(`${classObj.courseName} • Sem ${classObj.semester}`, 300, 635);
          ctx.font = '16px Inter, sans-serif';
          ctx.fillStyle = '#6b7280';
          ctx.fillText(`Scan Daily for Attendance`, 300, 665);
        } else {
          ctx.fillText(`Daily Attendance QR Code`, 300, 600);
        }
        
        const finalUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = finalUrl;
        link.download = `Class_Attendance_QR_${selectedClass}.png`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('QR Code downloaded successfully!');
      };
      img.src = url;
    } catch (error) {
      toast.error('Failed to download QR code');
    }
  };

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser.');
      return;
    }
    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoFence(prev => ({
          ...prev,
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }));
        toast.success('Location captured successfully!');
        setFetchingLocation(false);
      },
      (err) => {
        toast.error('Failed to get location: ' + err.message);
        setFetchingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSaveGeoFence = async () => {
    if (!selectedClass) return;
    if (geoFence.isEnabled && (!geoFence.lat || !geoFence.lng)) {
      toast.error('Please capture location before enabling geo-fence.');
      return;
    }
    setGeoLoading(true);
    try {
      await axiosInstance.put(`/teacher-portal/class/${selectedClass}/geofence`, geoFence);
      toast.success('Geo-fence settings saved!');
      setShowGeoModal(false);
    } catch (error) {
      toast.error('Failed to save geo-fence settings.');
    } finally {
      setGeoLoading(false);
    }
  };

  return (
    <div className="font-['Inter'] space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight font-['Outfit'] flex items-center gap-2">
            <CalendarCheck size={24} className="text-primary" />
            Class Attendance
          </h1>
          <p className="text-[13px] text-gray-500 font-medium mt-1">Manage and view student attendance.</p>
        </div>
        <ClassSelector selectedClass={selectedClass} setSelectedClass={setSelectedClass} setClassesList={setClassesList} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('mark')} 
          className={`px-6 py-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'mark' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          <CalendarCheck size={18} /> Mark Attendance
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`px-6 py-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'history' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          <History size={18} /> Attendance History
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 overflow-hidden min-h-[400px]">
        {activeTab === 'mark' ? (
          <>
            {/* Controls */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-700">Select Date:</label>
                <input 
                  type="date" 
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowGeoModal(true)}
                  disabled={!selectedClass}
                  title={geoFence.isEnabled ? 'Geo-fence Active' : 'Set Geo-fence'}
                  className={`border-2 px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 ${geoFence.isEnabled ? 'bg-emerald-50 border-emerald-500 text-emerald-700 hover:bg-emerald-100' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                  {geoFence.isEnabled ? <ShieldCheck size={16} /> : <Shield size={16} />}
                  {geoFence.isEnabled ? 'Geo-fence ON' : 'Geo-fence'}
                </button>
                <button 
                  onClick={() => setShowQRModal(true)}
                  disabled={!selectedClass || students.length === 0}
                  className="bg-white border-2 border-primary text-primary hover:bg-primary/5 px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <QrCode size={16} />
                  Show QR Code
                </button>
                <button 
                  onClick={handleSaveAttendance}
                  disabled={saving || !selectedClass || students.length === 0}
                  className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="p-6"><SkeletonLoader type="table" rows={6} cols={3} /></div>
            ) : !selectedClass ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                <CalendarCheck size={48} className="mb-4 opacity-20" />
                <p>Please select a class to mark attendance.</p>
              </div>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                <p>No students found in this class.</p>
              </div>
            ) : (
              <div className="overflow-x-auto p-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-100">
                      <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-16">Roll No</th>
                      <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Student Details</th>
                      <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status (P/A/L)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                        <td className="py-3 px-4 text-sm font-bold text-primary">{s.studentId}</td>
                        <td className="py-3 px-4">
                          <div 
                            className="text-sm font-bold text-gray-800 cursor-pointer hover:text-primary transition-colors inline-block"
                            onClick={() => handleViewStudentHistory(s)}
                            title="Click to view full attendance history"
                          >
                            {s.studentName}
                          </div>
                          <div className="text-[11px] font-semibold text-gray-500 mt-0.5">{s.course} • {s.branch} • {s.year}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{s.email} | {s.phone}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-3">
                            {['Present', 'Absent', 'Late'].map(status => (
                              <button
                                key={status}
                                onClick={() => setAttendanceRecords(prev => ({ ...prev, [s._id]: status }))}
                                className={`w-9 h-9 rounded-xl text-xs font-black tracking-wide transition-all ${
                                  attendanceRecords[s._id] === status
                                    ? status === 'Present' ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500 shadow-sm'
                                    : status === 'Absent' ? 'bg-red-100 text-red-700 border-2 border-red-500 shadow-sm'
                                    : 'bg-orange-100 text-orange-700 border-2 border-orange-500 shadow-sm'
                                    : 'bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100'
                                }`}
                              >
                                {status.charAt(0)}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div className="p-6">
            {loadingHistory ? (
              <SkeletonLoader type="card" count={3} />
            ) : !selectedClass ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                <History size={48} className="mb-4 opacity-20" />
                <p>Please select a class to view history.</p>
              </div>
            ) : historyRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                <p>No past attendance records found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {historyRecords.map(record => (
                  <div key={record._id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-primary/10 text-primary p-2.5 rounded-lg">
                        <Clock size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-[15px]">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</h4>
                        <p className="text-[12px] font-semibold text-gray-500">Total Students: {record.total}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2">
                        <p className="text-emerald-700 font-black text-lg">{record.present}</p>
                        <p className="text-emerald-600 text-[10px] font-bold uppercase">Present</p>
                      </div>
                      <div className="bg-red-50 border border-red-100 rounded-lg p-2">
                        <p className="text-red-700 font-black text-lg">{record.absent}</p>
                        <p className="text-red-600 text-[10px] font-bold uppercase">Absent</p>
                      </div>
                      <div className="bg-orange-50 border border-orange-100 rounded-lg p-2">
                        <p className="text-orange-700 font-black text-lg">{record.late}</p>
                        <p className="text-orange-600 text-[10px] font-bold uppercase">Late</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end gap-3">
                      <button 
                        onClick={() => {
                          setSelectedDateRecord(record);
                          setShowDateModal(true);
                        }}
                        className="text-primary text-[12px] font-bold hover:underline"
                      >
                        View Students
                      </button>
                      <button 
                        onClick={() => {
                          setAttendanceDate(new Date(record.date).toISOString().split('T')[0]);
                          setActiveTab('mark');
                        }}
                        className="text-gray-500 text-[12px] font-bold hover:text-gray-700 hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-center p-8 relative">
            <button 
              onClick={() => setShowQRModal(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Class Attendance QR</h2>
            <p className="text-sm font-semibold text-gray-500 mb-6">Print this static QR code. Students can scan this every day to mark their attendance.</p>
            
            <div className="flex justify-center bg-gray-50 p-6 rounded-xl border border-gray-100 mb-6">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${window.location.origin}/student-portal/attendance/scan?classId=${selectedClass}`)}`} 
                alt="Attendance QR Code"
                className="w-48 h-48 object-contain"
              />
            </div>
            
            <button 
              onClick={handleDownloadQR}
              className="w-full bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 mb-4"
            >
              <Download size={18} /> Download QR with Details
            </button>
            
            <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm font-bold bg-emerald-50 py-2 rounded-lg border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync Active
            </div>
          </div>
        </div>
      )}

      {/* Geo-Fence Settings Modal */}
      {showGeoModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
              <button onClick={() => setShowGeoModal(false)} className="absolute top-4 right-4 text-white/70 hover:text-white">
                <X size={24} />
              </button>
              <div className="flex items-center gap-3 mb-1">
                <MapPin size={24} />
                <h2 className="text-xl font-black">Geo-fence Settings</h2>
              </div>
              <p className="text-emerald-100 text-sm">Students can only mark attendance from within the set radius.</p>
            </div>

            <div className="p-6 space-y-5">
              {/* Enable Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <p className="font-bold text-gray-800 text-sm">Enable Geo-fencing</p>
                  <p className="text-xs text-gray-500 mt-0.5">Restrict attendance to college location</p>
                </div>
                <button
                  onClick={() => setGeoFence(prev => ({ ...prev, isEnabled: !prev.isEnabled }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${geoFence.isEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${geoFence.isEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Capture Location */}
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2 flex items-center gap-2">
                  <Locate size={14} /> Classroom Location
                </label>
                {geoFence.lat && geoFence.lng ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm">
                    <p className="font-bold text-emerald-800 flex items-center gap-2"><MapPin size={14} /> Location Captured</p>
                    <p className="text-emerald-600 text-xs mt-1">Lat: {geoFence.lat.toFixed(6)}, Lng: {geoFence.lng.toFixed(6)}</p>
                  </div>
                ) : (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
                    No location captured yet. Please stand inside the classroom and capture.
                  </div>
                )}
                <button
                  onClick={handleCaptureLocation}
                  disabled={fetchingLocation}
                  className="mt-3 w-full bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Navigation size={16} className={fetchingLocation ? 'animate-spin' : ''} />
                  {fetchingLocation ? 'Detecting Location...' : geoFence.lat ? 'Recapture Current Location' : 'Capture Current Location'}
                </button>
              </div>

              {/* Radius Input */}
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">
                  Allowed Radius: <span className="text-primary font-black">{geoFence.radius}m</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="5"
                  value={geoFence.radius}
                  onChange={(e) => setGeoFence(prev => ({ ...prev, radius: Number(e.target.value) }))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>10m (Strict)</span>
                  <span>250m (Medium)</span>
                  <span>500m (Loose)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowGeoModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 px-4 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGeoFence}
                  disabled={geoLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <ShieldCheck size={16} />
                  {geoLoading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single Student History Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative flex flex-col max-h-[80vh]">
            <div className="bg-primary p-6 text-white shrink-0">
              <button onClick={() => setShowStudentModal(false)} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
                <X size={24} />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <History size={24} />
                <h2 className="text-xl font-black truncate">{selectedStudentInfo?.studentName}'s History</h2>
              </div>
              <p className="text-primary-50 text-sm">Attendance records for this class</p>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {studentHistoryLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 size={32} className="text-primary animate-spin mb-3" />
                  <p className="text-gray-500 text-sm font-medium">Fetching records...</p>
                </div>
              ) : studentHistoryData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <History size={40} className="mb-3 opacity-20" />
                  <p className="text-sm font-medium">No attendance records found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                      <p className="text-emerald-700 font-black text-xl">{studentHistoryData.filter(d => d.status === 'Present').length}</p>
                      <p className="text-emerald-600 text-[10px] font-bold uppercase mt-1">Present</p>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                      <p className="text-red-700 font-black text-xl">{studentHistoryData.filter(d => d.status === 'Absent').length}</p>
                      <p className="text-red-600 text-[10px] font-bold uppercase mt-1">Absent</p>
                    </div>
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                      <p className="text-orange-700 font-black text-xl">{studentHistoryData.filter(d => d.status === 'Late').length}</p>
                      <p className="text-orange-600 text-[10px] font-bold uppercase mt-1">Late</p>
                    </div>
                  </div>
                  
                  {/* List of dates */}
                  <div className="space-y-2">
                    {studentHistoryData.map((record, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <CalendarCheck size={16} className="text-gray-400" />
                          <span className="text-sm font-bold text-gray-700">
                            {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <span className={`text-[11px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${
                          record.status === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                          record.status === 'Absent' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 shrink-0 bg-gray-50">
              <button 
                onClick={() => setShowStudentModal(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-xl font-bold text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date History Modal */}
      {showDateModal && selectedDateRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[85vh]">
            <div className="bg-primary p-6 text-white shrink-0">
              <button onClick={() => setShowDateModal(false)} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
                <X size={24} />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <CalendarCheck size={24} />
                <h2 className="text-xl font-black">Attendance Details</h2>
              </div>
              <p className="text-primary-50 text-sm">
                {new Date(selectedDateRecord.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-2 mb-6 text-center">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                  <p className="text-gray-700 font-black text-xl">{selectedDateRecord.total}</p>
                  <p className="text-gray-500 text-[10px] font-bold uppercase mt-1">Total</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                  <p className="text-emerald-700 font-black text-xl">{selectedDateRecord.present}</p>
                  <p className="text-emerald-600 text-[10px] font-bold uppercase mt-1">Present</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                  <p className="text-red-700 font-black text-xl">{selectedDateRecord.absent}</p>
                  <p className="text-red-600 text-[10px] font-bold uppercase mt-1">Absent</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                  <p className="text-orange-700 font-black text-xl">{selectedDateRecord.late}</p>
                  <p className="text-orange-600 text-[10px] font-bold uppercase mt-1">Late</p>
                </div>
              </div>
              
              {/* List of students */}
              <div className="space-y-2">
                {selectedDateRecord.records && selectedDateRecord.records.length > 0 ? (
                  selectedDateRecord.records.map((r, idx) => {
                    const student = r.studentId || {};
                    return (
                      <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800">{student.studentName || 'Unknown'}</span>
                          <span className="text-xs text-gray-500 font-medium">Roll No: {student.studentId || student.rollNo || 'N/A'}</span>
                        </div>
                        <span className={`text-[11px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${
                          r.status === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                          r.status === 'Absent' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {r.status}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-400 py-4 text-sm font-medium">No student records found for this date.</p>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 shrink-0 bg-gray-50 flex gap-3">
              <button 
                onClick={() => {
                  setShowDateModal(false);
                  setAttendanceDate(new Date(selectedDateRecord.date).toISOString().split('T')[0]);
                  setActiveTab('mark');
                }}
                className="flex-1 bg-primary hover:bg-primary-hover text-white px-4 py-3 rounded-xl font-bold text-sm transition-colors"
              >
                Edit Attendance
              </button>
              <button 
                onClick={() => setShowDateModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-xl font-bold text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
