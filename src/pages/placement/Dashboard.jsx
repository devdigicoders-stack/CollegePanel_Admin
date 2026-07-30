import React from 'react';
import { Users, Briefcase, GraduationCap, Calendar, FileText, CheckCircle, TrendingUp, BarChart3 } from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const HCReact = HighchartsReact.default || HighchartsReact;

const PlacementDashboard = () => {
  const stats = [
    { label: 'Eligible Students', value: '280', icon: Users, color: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'Registered Companies', value: '45', icon: Briefcase, color: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Active Openings', value: '18', icon: Briefcase, color: 'bg-indigo-50', iconColor: 'text-indigo-500' },
    { label: 'Upcoming Drives', value: '4 Drives', icon: Calendar, color: 'bg-purple-50', iconColor: 'text-purple-500' },
    { label: 'Total Applications', value: '340', icon: FileText, color: 'bg-orange-50', iconColor: 'text-orange-500' },
    { label: 'Shortlisted Students', value: '120', icon: CheckCircle, color: 'bg-teal-50', iconColor: 'text-teal-500' },
    { label: 'Selected Students', value: '82', icon: GraduationCap, color: 'bg-emerald-50', iconColor: 'text-emerald-500' },
    { label: 'Offers Received', value: '96 Offers', icon: TrendingUp, color: 'bg-amber-50', iconColor: 'text-amber-500' },
  ];

  const deptPlacementOptions = {
    chart: { type: 'column', height: 260, backgroundColor: 'transparent' },
    title: { text: '' },
    xAxis: { categories: ['CSE', 'ECE', 'ME', 'CE', 'IT'] },
    yAxis: { title: { text: 'Placement Rate (%)' }, max: 100 },
    series: [
      { name: 'Placement Percentage', data: [88, 72, 55, 48, 82], color: '#0A6C54' }
    ],
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
                  <h3 className="text-[22px] font-bold text-gray-800 mt-2">{stat.value}</h3>
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
            {[
              { company: 'Tata Consultancy Services', date: '18-Feb-2024', role: 'System Engineer', package: '₹3.6 - ₹7.0 LPA' },
              { company: 'Cognizant Technology Solutions', date: '22-Feb-2024', role: 'Programmer Analyst', package: '₹4.0 LPA' },
              { company: 'Infosys Limited', date: '26-Feb-2024', role: 'Systems Associate', package: '₹3.2 LPA' },
            ].map((drive, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg text-[13px] border border-gray-100">
                <div className="flex justify-between">
                  <h4 className="font-bold text-gray-800">{drive.company}</h4>
                  <span className="text-[11px] text-gray-400 font-bold">{drive.date}</span>
                </div>
                <p className="text-[12px] text-gray-500 mt-1">{drive.role} | {drive.package}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementDashboard;
