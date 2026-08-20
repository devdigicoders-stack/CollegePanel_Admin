import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Bell, FileText } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const TeacherDashboard = () => {
  const [stats, setStats] = useState({
    classesCount: 0,
    studentsCount: 0,
    noticesCount: 0,
    assignmentsCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await axiosInstance.get('/teacher-portal/dashboard-stats');
      setStats(res.data);
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'My Classes', value: stats.classesCount, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Students', value: stats.studentsCount, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Active Assignments', value: stats.assignmentsCount, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Recent Notices', value: stats.noticesCount, icon: Bell, color: 'text-purple-600', bg: 'bg-purple-50' }
  ];

  return (
    <div className="font-['Inter'] space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-800 tracking-tight font-['Outfit']">Teacher Dashboard</h1>
        <p className="text-[13px] text-gray-500 font-medium mt-1">
          Welcome back! Here's an overview of your academic activities.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 h-32 border border-gray-100"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-black text-gray-800">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Placeholder for Quick Actions or Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 min-h-[300px] flex flex-col items-center justify-center text-gray-400">
          <BookOpen size={48} className="mb-4 opacity-20" />
          <p className="font-medium">Upcoming Classes (Coming Soon)</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 min-h-[300px] flex flex-col items-center justify-center text-gray-400">
          <Bell size={48} className="mb-4 opacity-20" />
          <p className="font-medium">Recent Notifications (Coming Soon)</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
