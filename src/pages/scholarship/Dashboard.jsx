import React from 'react';
import { Users, FileText, CheckCircle, XCircle, Clock, DollarSign, RefreshCw, Award } from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const HCReact = HighchartsReact.default || HighchartsReact;

const ScholarshipDashboard = () => {
  const stats = [
    { label: 'Total Applications', value: '450', icon: FileText, color: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'Pending Verification', value: '82', icon: Clock, color: 'bg-yellow-50', iconColor: 'text-yellow-600' },
    { label: 'Approved Applications', value: '310', icon: CheckCircle, color: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Rejected Applications', value: '58', icon: XCircle, color: 'bg-red-50', iconColor: 'text-red-500' },
    { label: 'Renewal Pending', value: '45', icon: RefreshCw, color: 'bg-orange-50', iconColor: 'text-orange-500' },
    { label: 'Approved Amount', value: '₹45,50,000', icon: DollarSign, color: 'bg-emerald-50', iconColor: 'text-emerald-500' },
    { label: 'Amount Disbursed', value: '₹32,00,000', icon: DollarSign, color: 'bg-teal-50', iconColor: 'text-teal-500' },
    { label: 'Active Schemes', value: '12 Schemes', icon: Award, color: 'bg-indigo-50', iconColor: 'text-indigo-500' },
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
          <h3 className="text-[14px] font-bold text-gray-800 font-semibold uppercase tracking-wider">Recent Scholarship Applications</h3>
          <div className="space-y-3">
            {[
              { student: 'Amit Sharma', scheme: 'Post-Matric Scholarship for OBC', amount: '₹12,000', status: 'Under Verification' },
              { student: 'Neha Verma', scheme: 'NSP Merit-cum-Means', amount: '₹25,000', status: 'Pending Upload' },
              { student: 'Vikram Patel', scheme: 'AICTE Pragati Scholarship', amount: '₹50,000', status: 'Approved' },
            ].map((app, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg text-[13px] border border-gray-100 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-800">{app.student}</h4>
                  <p className="text-[12px] text-gray-500 mt-0.5">{app.scheme} | <strong className="text-[#0A6C54]">{app.amount}</strong></p>
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  app.status === 'Approved' ? 'bg-green-100 text-green-700' :
                  app.status === 'Under Verification' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>{app.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDashboard;
