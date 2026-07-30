import React from 'react';
import { Users, TrendingUp, Clock, CheckCircle, AlertCircle, XCircle, FileText, DollarSign, Zap } from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const HCReact = HighchartsReact.default || HighchartsReact;

const AdmissionOfficerDashboard = () => {
  const stats = [
    { label: 'Total Enquiries', value: '1,245', icon: Users, color: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'New Enquiries Today', value: '23', icon: TrendingUp, color: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Pending Follow-ups', value: '156', icon: Clock, color: 'bg-orange-50', iconColor: 'text-orange-500' },
    { label: 'Total Applications', value: '892', icon: FileText, color: 'bg-purple-50', iconColor: 'text-purple-500' },
    { label: 'Pending Applications', value: '234', icon: AlertCircle, color: 'bg-yellow-50', iconColor: 'text-yellow-600' },
    { label: 'Approved Admissions', value: '567', icon: CheckCircle, color: 'bg-emerald-50', iconColor: 'text-emerald-500' },
    { label: 'Rejected Applications', value: '45', icon: XCircle, color: 'bg-red-50', iconColor: 'text-red-500' },
    { label: 'Document Verification Pending', value: '89', icon: FileText, color: 'bg-indigo-50', iconColor: 'text-indigo-500' },
    { label: 'Fee Pending Admissions', value: '123', icon: DollarSign, color: 'bg-pink-50', iconColor: 'text-pink-500' },
    { label: 'Available Seats', value: '234', icon: Zap, color: 'bg-cyan-50', iconColor: 'text-cyan-500' },
    { label: 'Cancelled Admissions', value: '12', icon: XCircle, color: 'bg-rose-50', iconColor: 'text-rose-500' },
  ];

  const conversionChartOptions = {
    chart: { type: 'column', height: 280, backgroundColor: 'transparent' },
    title: { text: '' },
    xAxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], gridLineWidth: 0 },
    yAxis: { title: { text: '' }, gridLineDashStyle: 'Dash' },
    series: [
      { name: 'Enquiries', data: [120, 145, 160, 175, 190, 210], color: '#3B82F6' },
      { name: 'Applications', data: [85, 102, 115, 128, 142, 156], color: '#10B981' },
      { name: 'Admissions', data: [65, 78, 88, 98, 110, 125], color: '#0A6C54' }
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
      data: [
        { name: 'Diploma in CE', y: 245 },
        { name: 'Diploma in ME', y: 189 },
        { name: 'Diploma in EE', y: 167 },
        { name: 'Diploma in IT', y: 156 }
      ]
    }],
    credits: { enabled: false }
  };

  return (
    <div className="space-y-6 font-['Inter']">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-gray-600 font-medium mb-1">{stat.label}</p>
                  <h3 className="text-[24px] font-bold text-gray-800">{stat.value}</h3>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className={`${stat.iconColor}`} size={20} />
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
            {[
              { name: 'Aarav Singh', course: 'Diploma in CE', date: 'Today' },
              { name: 'Neha Verma', course: 'Diploma in IT', date: 'Yesterday' },
              { name: 'Vikram Patel', course: 'Diploma in ME', date: '2 days ago' },
              { name: 'Muskan Jain', course: 'Diploma in EE', date: '3 days ago' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-[13px] font-medium text-gray-800">{item.name}</p>
                  <p className="text-[11px] text-gray-600">{item.course}</p>
                </div>
                <span className="text-[11px] text-gray-500">{item.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4">Today's Follow-ups</h3>
          <div className="space-y-3">
            {[
              { name: 'Priya Singh', status: 'Interested', time: '10:00 AM' },
              { name: 'Rahul Verma', status: 'Call Later', time: '02:00 PM' },
              { name: 'Sneha Patel', status: 'Visit Scheduled', time: '03:30 PM' },
              { name: 'Arjun Kumar', status: 'Application Started', time: '04:00 PM' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-[13px] font-medium text-gray-800">{item.name}</p>
                  <p className="text-[11px] text-gray-600">{item.status}</p>
                </div>
                <span className="text-[11px] text-gray-500">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4">Pending Document Verification</h3>
          <div className="space-y-3">
            {[
              { name: 'Aarav Singh', docs: '3 pending', priority: 'High' },
              { name: 'Neha Verma', docs: '2 pending', priority: 'Medium' },
              { name: 'Vikram Patel', docs: '1 pending', priority: 'Low' },
              { name: 'Muskan Jain', docs: '4 pending', priority: 'High' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-[13px] font-medium text-gray-800">{item.name}</p>
                  <p className="text-[11px] text-gray-600">{item.docs}</p>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-1 rounded ${
                  item.priority === 'High' ? 'bg-red-100 text-red-700' :
                  item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {item.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4">Admission Target Progress</h3>
          <div className="space-y-4">
            {[
              { course: 'Diploma in CE', target: 300, achieved: 245, percentage: 82 },
              { course: 'Diploma in ME', target: 250, achieved: 189, percentage: 76 },
              { course: 'Diploma in EE', target: 200, achieved: 167, percentage: 84 },
              { course: 'Diploma in IT', target: 200, achieved: 156, percentage: 78 },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <span className="text-[12px] font-medium text-gray-800">{item.course}</span>
                  <span className="text-[12px] font-bold text-gray-800">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#0A6C54] h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                </div>
                <p className="text-[11px] text-gray-600 mt-1">{item.achieved} / {item.target}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4">Seat Availability</h3>
          <div className="space-y-4">
            {[
              { course: 'Diploma in CE', total: 60, filled: 45, available: 15 },
              { course: 'Diploma in ME', total: 50, filled: 38, available: 12 },
              { course: 'Diploma in EE', total: 40, filled: 33, available: 7 },
              { course: 'Diploma in IT', total: 40, filled: 31, available: 9 },
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-[12px] font-medium text-gray-800">{item.course}</span>
                  <span className="text-[12px] font-bold text-emerald-600">{item.available} Available</span>
                </div>
                <div className="flex gap-2 text-[11px]">
                  <span className="text-gray-600">Total: {item.total}</span>
                  <span className="text-gray-600">Filled: {item.filled}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionOfficerDashboard;
