import { useState, useEffect } from 'react';
import {
  BookOpen, FileText, Home,
  GraduationCap, CheckCircle, ChevronRight,
  User, Bell} from 'lucide-react';
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
  const [notices, setNotices] = useState([]);
  const [assignments, setAssignments] = useState([]);
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
        axiosInstance.get('/notices'),
        axiosInstance.get('/student-portal/assignments'),
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
