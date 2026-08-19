import React, { useState, useEffect } from 'react';
import { Users, Briefcase, GraduationCap, Calendar, FileText, CheckCircle, TrendingUp } from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const HCReact = HighchartsReact.default || HighchartsReact;

const PlacementDashboard = () => {
  const [stats, setStats] = useState({
    companies: 0,
    jobs: 0,
    applications: 0,
    upcomingDrives: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/placement/dashboard-stats');
        setStats(res.data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Registered Companies', value: stats.companies, icon: Briefcase, color: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Active Openings', value: stats.jobs, icon: Briefcase, color: 'bg-indigo-50', iconColor: 'text-indigo-500' },
    { label: 'Upcoming Drives', value: `${stats.upcomingDrives.length} Drives`, icon: Calendar, color: 'bg-purple-50', iconColor: 'text-purple-500' },
    { label: 'Total Applications', value: stats.applications, icon: FileText, color: 'bg-orange-50', iconColor: 'text-orange-500' },
  ];

  const deptPlacementOptions = {
    chart: { type: 'column', height: 260, backgroundColor: 'transparent' },
    title: { text: '' },
    xAxis: { categories: ['CSE', 'ECE', 'ME', 'CE', 'IT'] },
    yAxis: { title: { text: 'Placement Rate (%)' }, max: 100 },
    series: [
      { name: 'Placement Percentage', data: [88, 72, 55, 48, 82], color: 'var(--color-primary)' }
    ],
    credits: { enabled: false }
  };

  return (
    <div className="space-y-6 font-['Inter']">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-gray-500 font-semibold uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-[22px] font-bold text-gray-800 mt-2">{loading ? '...' : stat.value}</h3>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className={stat.iconColor} size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4 font-semibold uppercase tracking-wider">Department-wise Placement Percentage</h3>
          <HCReact highcharts={Highcharts} options={deptPlacementOptions} />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-[14px] font-bold text-gray-800 font-semibold uppercase tracking-wider">Upcoming Campus Drives</h3>
          <div className="space-y-3">
            {loading ? (
              <SkeletonLoader type="list" rows={3} />
            ) : stats.upcomingDrives.length === 0 ? (
              <p className="text-[13px] text-gray-500">No upcoming drives.</p>
            ) : stats.upcomingDrives.map((drive, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg text-[13px] border border-gray-100">
                <div className="flex justify-between">
                  <h4 className="font-bold text-gray-800">{drive.companyId?.name}</h4>
                  <span className="text-[11px] text-gray-400 font-bold">{new Date(drive.deadline).toLocaleDateString()}</span>
                </div>
                <p className="text-[12px] text-gray-500 mt-1">{drive.title} | {drive.salaryPkg}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementDashboard;
