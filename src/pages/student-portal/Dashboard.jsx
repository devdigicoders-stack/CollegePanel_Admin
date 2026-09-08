import { useState, useEffect } from 'react';
import {
  BookOpen, FileText, Home,
  GraduationCap, CheckCircle, ChevronRight,
  User, Bell, QrCode, Smartphone, MapPin, Clock, ExternalLink, ShieldCheck, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const StatCard = ({ label, value, sub, icon: Icon, colorClass, bgClass, onClick }) => (
  <div
    className={`bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-[22px] font-black text-gray-800 leading-tight">{value}</h3>
        {sub && <p className="text-[11px] text-gray-400 font-medium mt-0.5">{sub}</p>}
      </div>
      <div className={`${bgClass} p-2.5 rounded-xl flex-shrink-0`}>
        <Icon className={colorClass} size={20} />
      </div>
    </div>
  </div>
);

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [notices, setNotices] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [todayClasses, setTodayClasses] = useState([]);
  const [selectedClassIdx, setSelectedClassIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();

    const handleUpdate = () => {
      fetchAll();
    };

    window.addEventListener('materials_updated', handleUpdate);
    window.addEventListener('assignments_updated', handleUpdate);
    window.addEventListener('notices_updated', handleUpdate);
    window.addEventListener('student_content_updated', handleUpdate);
    window.addEventListener('live-notification', handleUpdate);

    return () => {
      window.removeEventListener('materials_updated', handleUpdate);
      window.removeEventListener('assignments_updated', handleUpdate);
      window.removeEventListener('notices_updated', handleUpdate);
      window.removeEventListener('student_content_updated', handleUpdate);
      window.removeEventListener('live-notification', handleUpdate);
    };
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        axiosInstance.get('/student-portal/profile'),
        axiosInstance.get('/student-portal/dashboard/stats'),
        axiosInstance.get('/notices'),
        axiosInstance.get('/student-portal/assignments'),
        axiosInstance.get('/student-portal/today-classes'),
      ]);

      if (results[0].status === 'fulfilled') setProfile(results[0].value.data);
      if (results[1].status === 'fulfilled') setStats(results[1].value.data || {});
      if (results[2].status === 'fulfilled') {
        const noticeData = results[2].value.data;
        setNotices((noticeData.data || noticeData || []).slice(0, 4));
      }
      if (results[3].status === 'fulfilled') {
        const all = results[3].value.data || [];
        const pending = all.filter(a => a.submissionStatus === 'Pending');
        setAssignments(pending.slice(0, 5));
      }
      if (results[4].status === 'fulfilled') {
        const classData = results[4].value.data?.classes || [];
        setTodayClasses(classData);
      }

    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <SkeletonLoader type="table" rows={5} cols={5} />
      </div>
    );
  }

  const currentClass = todayClasses[selectedClassIdx] || todayClasses[0] || null;

  return (
    <div className="space-y-5 font-['Inter'] pb-4">

      {/* ── Welcome Banner ─────────────────────────────── */}
      <div className="bg-gradient-to-r from-primary to-[#0d8a6b] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-green-200 text-[12px] font-semibold mb-1">{today}</p>
            <h1 className="text-xl md:text-2xl font-black mb-1">
              Welcome back, {profile?.studentName?.split(' ')[0] || 'Student'}! 👋
            </h1>
            <div className="flex items-center flex-wrap gap-2 mt-2">
              <span className="bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full">
                {profile?.course || 'Course'}
              </span>
              <span className="bg-white/15 text-green-100 text-[11px] font-semibold px-3 py-1 rounded-full">
                Enroll: {profile?.studentId || 'N/A'}
              </span>
              {profile?.year && (
                <span className="bg-white/15 text-green-100 text-[11px] font-semibold px-3 py-1 rounded-full">
                  {profile.year}
                </span>
              )}
              {stats.totalClasses > 0 && (
                <span className="bg-emerald-400/30 text-emerald-100 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-300/30">
                  Attendance: {stats.attendancePercentage}% ({stats.presentClasses}/{stats.totalClasses})
                </span>
              )}
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <GraduationCap size={28} className="text-white" />
          </div>
        </div>
        <BookOpen className="absolute right-6 -bottom-4 text-white/5" size={100} />
      </div>

      {/* ── Dynamic Attendance QR Section ────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 overflow-hidden relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <QrCode size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-black text-gray-800 tracking-tight">Today's Class Attendance QR Pass</h2>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE PASS
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Dynamic attendance verification for <strong className="text-gray-700">{profile?.branch || 'Your Branch'}</strong> • Sem <strong className="text-gray-700">{String(currentClass?.semester || profile?.semester || '1').replace(/^Sem\s*/i, '')}</strong> • Section <strong className="text-gray-700">{currentClass?.section || profile?.section || 'A'}</strong>
              </p>
            </div>
          </div>

          {currentClass && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/student-portal/attendance/scan?classId=${currentClass._id}`)}
                className={`text-[12px] font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm hover:shadow active:scale-95 ${
                  currentClass.attendanceStatus === 'Present'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-primary hover:bg-primary-hover text-white'
                }`}
              >
                {currentClass.attendanceStatus === 'Present' ? (
                  <>
                    <CheckCircle size={14} /> View Attendance Pass
                  </>
                ) : (
                  <>
                    <Smartphone size={14} /> Mark Attendance
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Class Selector Tabs (if multiple classes) */}
        {todayClasses.length > 1 && (
          <div className="flex items-center gap-2 pt-4 pb-1 overflow-x-auto custom-scrollbar">
            {todayClasses.map((cls, idx) => (
              <button
                key={cls._id}
                onClick={() => setSelectedClassIdx(idx)}
                className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  selectedClassIdx === idx
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/60'
                }`}
              >
                <span>{cls.subjectName} ({cls.subjectCode}){cls.teacherName ? ` • ${cls.teacherName}` : ''}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                  cls.attendanceStatus === 'Present'
                    ? selectedClassIdx === idx ? 'bg-emerald-400/30 text-white' : 'bg-emerald-50 text-emerald-700'
                    : selectedClassIdx === idx ? 'bg-amber-400/30 text-white' : 'bg-amber-50 text-amber-700'
                }`}>
                  {cls.attendanceStatus === 'Present' ? '✓ Present' : '⏳ Scan to Mark'}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Main Card Content */}
        {currentClass ? (
          <div className="pt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left 7 cols: Academic & Faculty Details */}
            <div className="lg:col-span-7 space-y-4">
              {/* Subject and Code */}
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-primary/10 text-primary tracking-wide">
                    {currentClass.subjectCode}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600">
                    {currentClass.courseName || currentClass.department}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700">
                    Semester {currentClass.semester}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700">
                    Section {currentClass.section || 'A'}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-gray-800 leading-tight">
                  {currentClass.subjectName}
                </h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-gray-400" />
                  Faculty In-charge: <strong className="text-gray-700">{currentClass.teacherName}</strong>
                </p>
              </div>

              {/* Verification Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-xl bg-gray-50/70 border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Enrolled Branch</p>
                  <p className="text-[12px] font-bold text-gray-800 truncate">{currentClass.branch}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50/70 border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Academic Sem</p>
                  <p className="text-[12px] font-bold text-gray-800">Sem {currentClass.semester}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50/70 border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Class Section</p>
                  <p className="text-[12px] font-bold text-gray-800">Section {currentClass.section || 'A'}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50/70 border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Student ID</p>
                  <p className="text-[12px] font-bold text-primary font-mono truncate">{profile?.studentId || 'N/A'}</p>
                </div>
              </div>

              {/* Geo-fence notification */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-blue-800 text-[11px] font-medium">
                <MapPin size={14} className="text-blue-600 flex-shrink-0" />
                <span>
                  {currentClass.geoFence?.isEnabled
                    ? `Geo-fencing is ON (Location restricted within ${currentClass.geoFence.radius || 50}m of classroom)`
                    : 'Classroom Location verified for instant attendance marking'}
                </span>
              </div>

              {/* Attendance Status Banner */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                currentClass.attendanceStatus === 'Present'
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center gap-2.5">
                  {currentClass.attendanceStatus === 'Present' ? (
                    <CheckCircle size={22} className="text-emerald-600 flex-shrink-0" />
                  ) : (
                    <Clock size={22} className="text-amber-600 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-[12px] font-bold leading-tight">
                      {currentClass.attendanceStatus === 'Present'
                        ? 'Attendance Marked: PRESENT ✅'
                        : 'Attendance Not Yet Marked Today'}
                    </p>
                    <p className="text-[10px] opacity-80 mt-0.5">
                      {currentClass.attendanceStatus === 'Present'
                        ? 'Your presence has been securely verified and recorded on the server.'
                        : 'Scan the QR code on the right with your phone or tap the button above.'}
                    </p>
                  </div>
                </div>
                {currentClass.attendanceStatus !== 'Present' && (
                  <button
                    onClick={() => navigate(`/student-portal/attendance/scan?classId=${currentClass._id}`)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold shadow-sm whitespace-nowrap"
                  >
                    Mark Now
                  </button>
                )}
              </div>
            </div>

            {/* Right 5 cols: Dedicated QR Display */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b from-gray-50 to-emerald-50/30 border border-gray-100">
              <div className="bg-white p-3.5 rounded-2xl shadow-md border border-gray-100 mb-3 group relative transition-transform hover:scale-[1.02]">
                <QRCodeCanvas
                  id="attendance-qr-canvas"
                  value={
                    currentClass.scanUrl && !currentClass.scanUrl.includes('localhost')
                      ? currentClass.scanUrl
                      : `https://college-panel-admin.vercel.app/student-portal/attendance/scan?classId=${currentClass._id}`
                  }
                  size={160}
                  bgColor="#ffffff"
                  fgColor="#064e3b"
                  level="H"
                  includeMargin={false}
                />
              </div>
              
              <p className="text-[11px] font-bold text-gray-700 text-center flex items-center gap-1.5">
                <Smartphone size={13} className="text-primary" /> Scan with Phone or Camera
              </p>
              <p className="text-[10px] text-gray-400 text-center mt-0.5">
                Class Key: <span className="font-mono font-bold text-gray-600">{currentClass._id.slice(-6).toUpperCase()}</span> • {today}
              </p>

              <div className="mt-3 flex items-center gap-2 w-full max-w-[220px]">
                <button
                  onClick={() => navigate(`/student-portal/attendance/scan?classId=${currentClass._id}`)}
                  className="w-full text-[11px] font-bold py-2 px-3 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <ExternalLink size={12} /> Open Scanner Screen
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mb-2">
              <QrCode size={24} />
            </div>
            <p className="text-[13px] font-bold text-gray-700">No Scheduled Class QR Available Right Now</p>
            <p className="text-[11px] text-gray-400 mt-1 max-w-md">
              Active classes for {profile?.branch || 'your branch'} in Semester {String(profile?.semester || '1').replace(/^Sem\s*/i, '')} will appear here once faculty activates the session.
            </p>
          </div>
        )}
      </div>

      {/* ── Key Stats ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Pending Assignments"
          value={stats.pendingAssignments || 0}
          sub="assignments due"
          icon={FileText}
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
        />
        <StatCard
          label="Submitted"
          value={stats.submittedAssignments || 0}
          sub="completed"
          icon={CheckCircle}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50"
        />
        <StatCard
          label="Study Materials"
          value={stats.totalMaterials || 0}
          sub="available"
          icon={BookOpen}
          colorClass="text-blue-500"
          bgClass="bg-blue-50"
        />
        <StatCard
          label="Branch"
          value={profile?.branch || 'N/A'}
          sub={`Status: ${profile?.status || 'Active'}`}
          icon={User}
          colorClass="text-gray-500"
          bgClass="bg-gray-50"
        />
      </div>

      {/* ── Main Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Pending Assignments */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[13px] font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <FileText size={14} className="text-amber-500" /> Pending Assignments
            </h3>
            <Link to="/student/assignments" className="text-[11px] text-primary font-bold flex items-center gap-1 hover:underline">
              View All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {assignments.length > 0 ? assignments.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/40 border border-amber-100">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <FileText size={14} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-gray-800 truncate">{a.title}</p>
                  <p className="text-[10px] text-gray-400 font-medium">
                    Due: {new Date(a.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                  Pending
                </span>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-10">
                <CheckCircle size={32} className="text-emerald-200 mb-2" />
                <p className="text-[12px] text-gray-400 font-medium">No pending assignments!</p>
                <p className="text-[11px] text-gray-300 mt-0.5">You're all caught up 🎉</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4 flex flex-col">

          {/* Quick Access */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-[12px] font-black text-gray-700 mb-3 uppercase tracking-wider">Quick Access</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: 'Hostel', icon: Home, color: 'bg-purple-50 text-purple-500', path: '/student/hostel' },
                { label: 'Materials', icon: BookOpen, color: 'bg-blue-50 text-blue-500', path: '/student/materials' },
                { label: 'Assignments', icon: FileText, color: 'bg-amber-50 text-amber-600', path: '/student/assignments' },
                { label: 'Notices', icon: Bell, color: 'bg-emerald-50 text-emerald-600', path: '/student/notices' },
              ].map((link, i) => {
                const Icon = link.icon;
                return (
                  <Link key={i} to={link.path}
                    className="flex items-center gap-2.5 p-2.5 bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm rounded-xl transition-all group"
                  >
                    <div className={`w-8 h-8 rounded-lg ${link.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon size={15} />
                    </div>
                    <span className="text-[11px] font-bold text-gray-600">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Notices */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex-1">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[12px] font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <Bell size={13} className="text-orange-500" /> Notices
              </h3>
              <Link to="/student/notices" className="text-[10px] text-orange-600 font-bold hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-2">
              {notices.length > 0 ? notices.map((n, i) => (
                <Link key={i} to="/student/notices" className="block p-3 bg-orange-50/40 border border-orange-100 rounded-xl hover:bg-orange-50 transition-colors">
                  <p className="text-[12px] font-bold text-orange-800 leading-tight">{n.title}</p>
                  {n.details && (
                    <p className="text-[10px] text-orange-600/70 mt-1 line-clamp-1">{n.details}</p>
                  )}
                  {n.dateOfPublishing && (
                    <p className="text-[10px] text-orange-400 mt-1 font-medium">
                      {new Date(n.dateOfPublishing).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  )}
                </Link>
              )) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell size={28} className="text-gray-200 mb-2" />
                  <p className="text-[12px] text-gray-400 font-medium">No new notices</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;
