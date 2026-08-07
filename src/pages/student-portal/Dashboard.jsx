import { useState, useEffect } from 'react';
import {
  BookOpen, Calendar, CheckSquare, ShieldAlert, Award,
  FileText, Bookmark, Home, CreditCard, Clock, TrendingUp,
  GraduationCap, AlertCircle, Wallet, CheckCircle, ChevronRight,
  User, ClipboardList, Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';
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
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [timetable, setTimetable] = useState([]);
  const [notices, setNotices] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        axiosInstance.get('/student-portal/profile'),
        axiosInstance.get('/student-portal/dashboard/stats'),
        axiosInstance.get('/student-portal/timetable'),
        axiosInstance.get('/notices'),
        axiosInstance.get('/student-portal/assignments'),
        axiosInstance.get('/student-portal/exams'),
      ]);

      // Profile
      if (results[0].status === 'fulfilled') setProfile(results[0].value.data);

      // Stats
      if (results[1].status === 'fulfilled') setStats(results[1].value.data || {});

      // Timetable → filter today
      if (results[2].status === 'fulfilled') {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[new Date().getDay()];
        const all = results[2].value.data || [];
        setTimetable(all.filter(t => t.day === today).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || '')));
      }

      // Notices
      if (results[3].status === 'fulfilled') {
        const noticeData = results[3].value.data;
        setNotices((noticeData.data || noticeData || []).slice(0, 4));
      }

      // Assignments — pending only
      if (results[4].status === 'fulfilled') {
        const all = results[4].value.data || [];
        const pending = all.filter(a => a.submissionStatus === 'Pending' && new Date(a.dueDate) >= new Date());
        setAssignments(pending.slice(0, 4));
      }

      // Exams — upcoming
      if (results[5].status === 'fulfilled') {
        const all = results[5].value.data || [];
        const upcoming = all.filter(e => new Date(e.date) >= new Date()).slice(0, 3);
        setExams(upcoming);
      }

    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const attendPct = parseFloat(stats.attendancePercentage || 0);
  const attendColor = attendPct >= 75 ? 'text-emerald-600' : attendPct >= 60 ? 'text-amber-600' : 'text-red-600';
  const attendBg = attendPct >= 75 ? 'bg-emerald-50' : attendPct >= 60 ? 'bg-amber-50' : 'bg-red-50';
  const attendIcon = attendPct >= 75 ? CheckCircle : AlertCircle;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-10 h-10 border-4 border-[#0A6C54]/20 border-t-[#0A6C54] rounded-full animate-spin"></div>
        <SkeletonLoader type="table" rows={5} cols={5} />
      </div>
    );
  }

  return (
    <div className="space-y-5 font-['Inter'] pb-4">

      {/* ── Welcome Banner ─────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#0A6C54] to-[#0d8a6b] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
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
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <GraduationCap size={28} className="text-white" />
          </div>
        </div>
        <BookOpen className="absolute right-6 -bottom-4 text-white/5" size={100} />
      </div>

      {/* ── Key Stats ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Attendance"
          value={`${attendPct}%`}
          sub={`${stats.presentClasses || 0}/${stats.totalClasses || 0} classes`}
          icon={attendIcon}
          colorClass={attendColor}
          bgClass={attendBg}
        />
        <StatCard
          label="Today's Classes"
          value={timetable.length}
          sub={timetable.length > 0 ? `${timetable[0]?.startTime || ''} onwards` : 'No classes today'}
          icon={BookOpen}
          colorClass="text-blue-500"
          bgClass="bg-blue-50"
        />
        <StatCard
          label="Pending Tasks"
          value={stats.pendingAssignments || 0}
          sub="assignments due"
          icon={FileText}
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
        />
        <StatCard
          label="Upcoming Exams"
          value={stats.upcomingExams || 0}
          sub="scheduled"
          icon={Calendar}
          colorClass="text-indigo-500"
          bgClass="bg-indigo-50"
        />
      </div>

      {/* ── Secondary Stats ───────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Fee Pending"
          value={stats.pendingFee > 0 ? `₹${Number(stats.pendingFee).toLocaleString('en-IN')}` : '✓ Clear'}
          sub={stats.pendingFee > 0 ? 'outstanding balance' : 'all dues paid'}
          icon={Wallet}
          colorClass={stats.pendingFee > 0 ? 'text-red-500' : 'text-emerald-500'}
          bgClass={stats.pendingFee > 0 ? 'bg-red-50' : 'bg-emerald-50'}
        />
        <StatCard
          label="Leave Requests"
          value={stats.totalLeaves || 0}
          sub={`${stats.approvedLeaves || 0} approved`}
          icon={ClipboardList}
          colorClass="text-purple-500"
          bgClass="bg-purple-50"
        />
        <StatCard
          label="Scholarship"
          value={stats.hasScholarship ? '✓ Active' : 'None'}
          sub={stats.hasScholarship ? `₹${Number(stats.scholarshipAmount || 0).toLocaleString('en-IN')} sanctioned` : 'Apply now'}
          icon={Award}
          colorClass={stats.hasScholarship ? 'text-teal-600' : 'text-gray-400'}
          bgClass={stats.hasScholarship ? 'bg-teal-50' : 'bg-gray-50'}
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

        {/* Timetable */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[13px] font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <Clock size={15} className="text-[#0A6C54]" /> Today's Timetable
            </h3>
            <Link to="/student/timetable" className="text-[11px] text-[#0A6C54] font-bold flex items-center gap-1 hover:underline">
              Full Timetable <ChevronRight size={12} />
            </Link>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {timetable.length > 0 ? timetable.map((cls, idx) => (
              <div key={idx} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3 hover:bg-white hover:shadow-sm transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-[12px] ${cls.type === 'Lab' ? 'bg-purple-500' : 'bg-[#0A6C54]'}`}>
                  {cls.type === 'Lab' ? 'LAB' : 'CLS'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-[13px] truncate">
                    {cls.subject || cls.subjectId?.name || 'Subject'}
                  </h4>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                    {cls.teacherName || cls.teacherId?.name || 'Faculty'} · Room {cls.roomNo || 'TBA'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[11px] font-bold text-[#0A6C54] bg-[#0A6C54]/8 px-2.5 py-1 rounded-lg">
                    {cls.startTime}{cls.endTime ? ` - ${cls.endTime}` : ''}
                  </span>
                  {cls.type && (
                    <p className="text-[10px] text-gray-400 mt-1">{cls.semester} · Sec {cls.section}</p>
                  )}
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Calendar size={40} className="text-gray-200 mb-3" />
                <p className="text-[13px] font-bold text-gray-500">No classes today</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  {new Date().getDay() === 0 ? 'It\'s Sunday — enjoy your rest!' : 'Check your full timetable for the week.'}
                </p>
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
                { label: 'Fees', icon: CreditCard, color: 'bg-red-50 text-red-500', path: '/student/fees' },
                { label: 'Scholarships', icon: Award, color: 'bg-teal-50 text-teal-600', path: '/student/scholarships' },
                { label: 'Library', icon: Bookmark, color: 'bg-orange-50 text-orange-500', path: '/student/library' },
                { label: 'Hostel', icon: Home, color: 'bg-purple-50 text-purple-500', path: '/student/hostel' },
                { label: 'Leave', icon: ClipboardList, color: 'bg-green-50 text-green-600', path: '/student/leave-requests' },
                { label: 'Results', icon: TrendingUp, color: 'bg-blue-50 text-blue-500', path: '/student/results' },
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
            <h3 className="text-[12px] font-black text-gray-700 mb-3 uppercase tracking-wider flex items-center gap-2">
              <Bell size={13} className="text-orange-500" /> Notices
            </h3>
            <div className="space-y-2">
              {notices.length > 0 ? notices.map((n, i) => (
                <div key={i} className="p-3 bg-orange-50/40 border border-orange-100 rounded-xl">
                  <p className="text-[12px] font-bold text-orange-800 leading-tight">{n.title}</p>
                  {n.description && (
                    <p className="text-[10px] text-orange-600/70 mt-1 line-clamp-1">{n.description}</p>
                  )}
                  {n.createdAt && (
                    <p className="text-[10px] text-orange-400 mt-1 font-medium">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  )}
                </div>
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

      {/* ── Assignments + Exams ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Pending Assignments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[13px] font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <FileText size={14} className="text-amber-500" /> Pending Assignments
            </h3>
            <Link to="/student/assignments" className="text-[11px] text-[#0A6C54] font-bold flex items-center gap-1 hover:underline">
              View All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-2.5">
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
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle size={32} className="text-emerald-200 mb-2" />
                <p className="text-[12px] text-gray-400 font-medium">No pending assignments!</p>
                <p className="text-[11px] text-gray-300 mt-0.5">You're all caught up 🎉</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[13px] font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <GraduationCap size={14} className="text-indigo-500" /> Upcoming Exams
            </h3>
            <Link to="/student/exams" className="text-[11px] text-[#0A6C54] font-bold flex items-center gap-1 hover:underline">
              View All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-2.5">
            {exams.length > 0 ? exams.map((e, i) => {
              const daysLeft = Math.ceil((new Date(e.date) - new Date()) / (1000 * 60 * 60 * 24));
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/40 border border-indigo-100">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[14px] font-black text-indigo-700 leading-none">
                      {new Date(e.date).getDate()}
                    </span>
                    <span className="text-[9px] text-indigo-500 font-bold uppercase">
                      {new Date(e.date).toLocaleString('en-IN', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-gray-800 truncate">{e.examName}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{e.subject} · {e.startTime || 'TBA'}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${
                    daysLeft <= 3 ? 'bg-red-100 text-red-700' :
                    daysLeft <= 7 ? 'bg-amber-100 text-amber-700' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    {daysLeft === 0 ? 'Today!' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft}d left`}
                  </span>
                </div>
              );
            }) : (
              <div className="flex flex-col items-center justify-center py-8">
                <CheckSquare size={32} className="text-emerald-200 mb-2" />
                <p className="text-[12px] text-gray-400 font-medium">No upcoming exams</p>
                <p className="text-[11px] text-gray-300 mt-0.5">Relax, you're exam-free! 🎯</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;



