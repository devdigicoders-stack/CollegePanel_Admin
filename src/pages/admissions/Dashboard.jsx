import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Clock, CheckCircle, AlertCircle, XCircle, FileText, DollarSign, Zap } from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axios from 'axios';
import SkeletonLoader from '../../components/SkeletonLoader';

const HCReact = HighchartsReact.default || HighchartsReact;

const AdmissionOfficerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admissions/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(res.data);
    } catch (error) {
      console.error('Error fetching admission dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dashboardData) {
    return <SkeletonLoader type="cards" />;
  }

  const { stats, recentEnquiriesList, todayFollowUpsList, docVerPendingList, admissionsByCourse } = dashboardData;

  const statCards = [
    { label: 'Total Enquiries', value: stats.totalEnquiries, icon: Users, color: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'New Enquiries Today', value: stats.todayEnquiries, icon: TrendingUp, color: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Pending Follow-ups', value: stats.pendingFollowUps, icon: Clock, color: 'bg-orange-50', iconColor: 'text-orange-500' },
    { label: 'Total Applications', value: stats.totalApplications, icon: FileText, color: 'bg-purple-50', iconColor: 'text-purple-500' },
    { label: 'Pending Applications', value: stats.pendingApplications, icon: AlertCircle, color: 'bg-yellow-50', iconColor: 'text-yellow-600' },
    { label: 'Approved Admissions', value: stats.approvedAdmissions, icon: CheckCircle, color: 'bg-emerald-50', iconColor: 'text-emerald-500' },
    { label: 'Rejected/Cancelled', value: stats.rejectedAdmissions, icon: XCircle, color: 'bg-red-50', iconColor: 'text-red-500' },
    { label: 'Document Verification', value: stats.docVerPending, icon: FileText, color: 'bg-indigo-50', iconColor: 'text-indigo-500' },
    { label: 'Fee Pending Admissions', value: stats.feePending, icon: DollarSign, color: 'bg-pink-50', iconColor: 'text-pink-500' },
    { label: 'Total Available Seats', value: 'N/A', icon: Zap, color: 'bg-cyan-50', iconColor: 'text-cyan-500' },
  ];

  const conversionChartOptions = {
    chart: { type: 'column', height: 280, backgroundColor: 'transparent' },
    title: { text: '' },
    xAxis: { categories: ['Current Overview'], gridLineWidth: 0 },
    yAxis: { title: { text: '' }, gridLineDashStyle: 'Dash' },
    series: [
      { name: 'Enquiries', data: [stats.totalEnquiries], color: '#3B82F6' },
      { name: 'Applications', data: [stats.totalApplications], color: '#10B981' },
      { name: 'Admissions', data: [stats.approvedAdmissions], color: '#0A6C54' }
    ],
    legend: { enabled: true },
    credits: { enabled: false },
    tooltip: { backgroundColor: '#fff', borderRadius: 8, shadow: true }
  };

  const courseChartOptions = {
    chart: { type: 'pie', height: 280, backgroundColor: 'transparent' },
    title: { text: '' },
    plotOptions: { pie: { dataLabels: { enabled: true, format: '{point.name}: {point.y}' } } },
    series: [{
      name: 'Admissions',
      data: admissionsByCourse.length > 0 ? admissionsByCourse.map(c => ({ name: c._id, y: c.count })) : [{ name: 'No Data', y: 1 }]
    }],
    credits: { enabled: false }
  };

  return (
    <div className="space-y-6 font-['Inter']">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-gray-600 font-medium mb-1">{stat.label}</p>
                  <h3 className="text-[20px] font-bold text-gray-800">{stat.value}</h3>
                </div>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className={`${stat.iconColor}`} size={18} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4">Admission Conversion Rate</h3>
          <HCReact highcharts={Highcharts} options={conversionChartOptions} containerProps={{ style: { height: '280px' } }} />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4">Course-wise Admissions</h3>
          <HCReact highcharts={Highcharts} options={courseChartOptions} containerProps={{ style: { height: '280px' } }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4">Recent Enquiries</h3>
          <div className="space-y-3">
            {recentEnquiriesList.length > 0 ? recentEnquiriesList.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-[13px] font-medium text-gray-800">{item.studentName}</p>
                  <p className="text-[11px] text-gray-600">{item.courseInterested}</p>
                </div>
                <span className="text-[11px] text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            )) : (
              <div className="p-3 bg-gray-50 rounded-lg text-[13px] text-gray-500">No recent enquiries.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4">Today's Follow-ups</h3>
          <div className="space-y-3">
            {todayFollowUpsList.length > 0 ? todayFollowUpsList.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-[13px] font-medium text-gray-800">{item.enquiryId?.studentName || 'Unknown'}</p>
                  <p className="text-[11px] text-gray-600">{item.callStatus}</p>
                </div>
                <span className="text-[11px] text-gray-500">{new Date(item.followUpDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )) : (
              <div className="p-3 bg-gray-50 rounded-lg text-[13px] text-gray-500">No follow-ups today.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4">Pending Document Verification</h3>
          <div className="space-y-3">
            {docVerPendingList.length > 0 ? docVerPendingList.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-[13px] font-medium text-gray-800">{item.name}</p>
                  <p className="text-[11px] text-gray-600">{item.course}</p>
                </div>
                <span className="text-[11px] font-semibold px-2 py-1 rounded bg-yellow-100 text-yellow-700">
                  Pending
                </span>
              </div>
            )) : (
              <div className="p-3 bg-gray-50 rounded-lg text-[13px] text-gray-500">No pending verifications.</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4">Admission Target Progress (Beta)</h3>
          <div className="space-y-4">
            {admissionsByCourse.length > 0 ? admissionsByCourse.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <span className="text-[12px] font-medium text-gray-800">{item._id}</span>
                  <span className="text-[12px] font-bold text-gray-800">{item.count} Admitted</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#0A6C54] h-2 rounded-full" style={{ width: `${Math.min(item.count, 100)}%` }}></div>
                </div>
                <p className="text-[11px] text-gray-600 mt-1">{item.count} / 100 (Default Target)</p>
              </div>
            )) : (
              <div className="p-3 bg-gray-50 rounded-lg text-[13px] text-gray-500">No admission data yet.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4">Seat Availability</h3>
          <div className="space-y-4">
            {admissionsByCourse.length > 0 ? admissionsByCourse.map((item, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-[12px] font-medium text-gray-800">{item._id}</span>
                  <span className="text-[12px] font-bold text-emerald-600">{100 - item.count} Available</span>
                </div>
                <div className="flex gap-2 text-[11px]">
                  <span className="text-gray-600">Total: 100</span>
                  <span className="text-gray-600">Filled: {item.count}</span>
                </div>
              </div>
            )) : (
              <div className="p-3 bg-gray-50 rounded-lg text-[13px] text-gray-500">No admission data yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionOfficerDashboard;
