import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, FileText } from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axios from 'axios';
import SkeletonLoader from '../../components/SkeletonLoader';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const HCReact = HighchartsReact.default || HighchartsReact;

const AdmissionOfficerDashboard = () => {
  if (!checkPermission('View Admissions')) {
    return <AccessDenied />;
  }
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

  const { stats, latestPendingApps = [], admissionsByCourse } = dashboardData;

  const statCards = [
    { label: 'Total Applications', value: stats.totalApplications, icon: FileText, color: 'bg-purple-50', iconColor: 'text-purple-500' },
    { label: 'Pending Applications', value: stats.pendingApplications, icon: AlertCircle, color: 'bg-yellow-50', iconColor: 'text-yellow-600' },
    { label: 'Approved Admissions', value: stats.approvedAdmissions, icon: CheckCircle, color: 'bg-emerald-50', iconColor: 'text-emerald-500' },
    { label: 'Rejected/Cancelled', value: stats.rejectedAdmissions, icon: XCircle, color: 'bg-red-50', iconColor: 'text-red-500' },
  ];

  const conversionChartOptions = {
    chart: { type: 'column', height: 280, backgroundColor: 'transparent' },
    title: { text: '' },
    xAxis: { categories: ['Current Overview'], gridLineWidth: 0 },
    yAxis: { title: { text: '' }, gridLineDashStyle: 'Dash' },
    series: [
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
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Latest Pending Applications Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-gray-800 flex items-center gap-2">
            <AlertCircle size={16} className="text-yellow-500" /> Latest Pending Applications
          </h3>
        </div>
        
        {latestPendingApps.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">App No</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Mobile</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {latestPendingApps.map((app, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-[13px] font-bold text-[#0A6C54]">{app.appNo}</td>
                    <td className="px-5 py-3.5 text-[13px] font-bold text-gray-800">{app.name}</td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-600 font-medium">{app.course}</td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-600">{app.mobile}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 inline-flex items-center gap-1">
                        <AlertCircle size={12} /> Pending
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 text-[13px] bg-gray-50/50">
            No pending applications right now.
          </div>
        )}
      </div>

    </div>
  );
};

export default AdmissionOfficerDashboard;
