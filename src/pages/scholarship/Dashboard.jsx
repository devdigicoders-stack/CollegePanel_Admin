import { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, DollarSign, Award } from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axiosInstance from '../../utils/axiosInstance';
import SkeletonLoader from '../../components/SkeletonLoader';

const HCReact = HighchartsReact.default || HighchartsReact;

const ScholarshipDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/scholarships/dashboard/stats');
      setData(res.data);
    } catch (error) {
      console.error('Error fetching scholarship stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6"><SkeletonLoader type="dashboard" /></div>;
  }

  const stats = [
    { label: 'Total Applications', value: data?.totalApplications || 0, icon: FileText, color: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'Pending Verification', value: data?.pendingVerification || 0, icon: Clock, color: 'bg-yellow-50', iconColor: 'text-yellow-600' },
    { label: 'Approved Applications', value: data?.approvedApplications || 0, icon: CheckCircle, color: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Amount Disbursed', value: `₹${(data?.totalDisbursed || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-teal-50', iconColor: 'text-teal-500' },
    { label: 'Active Schemes', value: `${data?.totalSchemes || 0} Schemes`, icon: Award, color: 'bg-indigo-50', iconColor: 'text-indigo-500' },
  ];

  const categoryOptions = {
    chart: { type: 'pie', height: 260, backgroundColor: 'transparent' },
    title: { text: '' },
    series: [{
      name: 'Applications',
      colorByPoint: true,
      data: [
        { name: 'OBC Scholarship', y: 45, color: '#3B82F6' },
        { name: 'SC/ST Scheme', y: 30, color: '#10B981' },
        { name: 'Merit-cum-Means', y: 15, color: '#F59E0B' },
        { name: 'Minority Scholarship', y: 10, color: '#EF4444' }
      ]
    }],
    credits: { enabled: false }
  };

  return (
    <div className="space-y-6 font-['Inter']">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-gray-500 font-semibold uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-[20px] font-bold text-gray-800 mt-2">{stat.value}</h3>
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
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4 font-semibold uppercase tracking-wider">Application Share by Category</h3>
          <HCReact highcharts={Highcharts} options={categoryOptions} />
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-[14px] font-bold text-gray-800 font-semibold uppercase tracking-wider">Recent Information</h3>
          <div className="space-y-3">
             <div className="p-3 bg-gray-50 rounded-lg text-[13px] border border-gray-100 text-gray-500">
               Please navigate to Applications tab to view and verify recent student scholarship applications.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDashboard;
