import React from 'react';
import { ShieldAlert, Users, Bed, CheckSquare, RefreshCw, Clipboard, ClipboardList, Shield, Zap, AlertTriangle, Landmark, UserMinus } from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const HCReact = HighchartsReact.default || HighchartsReact;

const HostelWardenDashboard = () => {
  const stats = [
    { label: 'Total Capacity', value: '450 Beds', icon: Bed, color: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'Occupied Beds', value: '380 Beds', icon: Bed, color: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Available Beds', value: '70 Beds', icon: Bed, color: 'bg-emerald-50', iconColor: 'text-emerald-500' },
    { label: 'Hostel Students', value: '380', icon: Users, color: 'bg-cyan-50', iconColor: 'text-cyan-500' },
    { label: 'Students Present', value: '342', icon: CheckSquare, color: 'bg-indigo-50', iconColor: 'text-indigo-500' },
    { label: 'Students on Leave', value: '28', icon: UserMinus, color: 'bg-orange-50', iconColor: 'text-orange-500' },
    { label: 'Outing Requests', value: '10 Pending', icon: Clipboard, color: 'bg-yellow-50', iconColor: 'text-yellow-600' },
    { label: 'Pending Complaints', value: '15 Open', icon: ShieldAlert, color: 'bg-red-50', iconColor: 'text-red-500' },
    { label: 'Visitors Today', value: '8', icon: Users, color: 'bg-purple-50', iconColor: 'text-purple-500' },
    { label: 'Maintenance Pending', value: '6 Tasks', icon: Zap, color: 'bg-amber-50', iconColor: 'text-amber-500' },
    { label: 'Fee Defaulters', value: '12 Students', icon: Landmark, color: 'bg-rose-50', iconColor: 'text-rose-500' },
    { label: 'Upcoming Check-Outs', value: '4', icon: RefreshCw, color: 'bg-pink-50', iconColor: 'text-pink-500' },
  ];

  const occupancyOptions = {
    chart: { type: 'bar', height: 260, backgroundColor: 'transparent' },
    title: { text: '' },
    xAxis: { categories: ['Block A (Boys)', 'Block B (Boys)', 'Block C (Girls)', 'Block D (Girls)'] },
    yAxis: { title: { text: 'Beds' } },
    plotOptions: { series: { stacking: 'normal' } },
    series: [
      { name: 'Occupied Beds', data: [110, 95, 105, 70], color: '#0A6C54' },
      { name: 'Available Beds', data: [10, 25, 15, 20], color: '#E5E7EB' }
    ],
    credits: { enabled: false }
  };

  return (
    <div className="space-y-6 font-['Inter']">
      {/* 12 Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">{stat.label}</span>
                  <div className={`${stat.color} p-2 rounded-lg`}>
                    <Icon className={stat.iconColor} size={16} />
                  </div>
                </div>
                <h3 className="text-[18px] font-bold text-gray-800 mt-2">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4 font-semibold uppercase tracking-wider">Block-wise Occupancy</h3>
          <HCReact highcharts={Highcharts} options={occupancyOptions} />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4 font-semibold uppercase tracking-wider">Pending Leave & Outing Approvals</h3>
          <div className="space-y-3">
            {[
              { name: 'Varun Sen', block: 'Block A - Room 102', duration: '15-Feb to 17-Feb', reason: 'Home Visit' },
              { name: 'Aditi Rao', block: 'Block C - Room 304', duration: '16-Feb (Day Out)', reason: 'Coaching Exam' },
              { name: 'Rahul Joshi', block: 'Block B - Room 209', duration: '18-Feb to 20-Feb', reason: 'Medical Checkup' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg text-[13px] border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-800">{item.name}</h4>
                    <p className="text-[11px] text-gray-500">{item.block}</p>
                    <p className="text-[11px] text-gray-600 font-semibold mt-1">{item.duration} - {item.reason}</p>
                  </div>
                  <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-100">Pending</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4 font-semibold uppercase tracking-wider">Room Maintenance Complaints</h3>
          <div className="space-y-3">
            {[
              { room: 'Room A-104', type: 'Plumbing', desc: 'Water leak in tap', status: 'Assigned' },
              { room: 'Room C-302', type: 'Electrical', desc: 'Ceiling fan making noise', status: 'In Progress' },
              { room: 'Room B-205', type: 'Internet', desc: 'Wi-Fi connection drop', status: 'Open' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg text-[13px]">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-800">{item.room} ({item.type})</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    item.status === 'Assigned' ? 'bg-blue-50 text-blue-600' :
                    item.status === 'In Progress' ? 'bg-orange-50 text-orange-600' :
                    'bg-red-50 text-red-600'
                  }`}>{item.status}</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4 font-semibold uppercase tracking-wider">Today's Check-In / Check-Out</h3>
          <div className="space-y-3">
            {[
              { name: 'Kunal Sen', type: 'Check-In', room: 'Room B-304', time: '09:30 AM' },
              { name: 'Priya Mishra', type: 'Check-Out', room: 'Room C-212', time: '11:00 AM' },
              { name: 'Jayesh Soni', type: 'Check-In', room: 'Room A-115', time: '02:00 PM' },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-[13px] font-bold text-gray-800">{item.name}</h4>
                  <p className="text-[11px] text-gray-500">{item.room}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    item.type === 'Check-In' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                  }`}>{item.type}</span>
                  <p className="text-[10px] text-gray-400 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4 font-semibold uppercase tracking-wider">Emergency Contacts</h3>
          <div className="space-y-3">
            {[
              { role: 'Campus Security Gate 1', contact: '+91 9988776655' },
              { role: 'Local Hospital / Ambulance', contact: '0265-223344' },
              { role: 'Campus Electrician', contact: '+91 9876543210' },
              { role: 'Campus Plumber', contact: '+91 9876543211' },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-[13px]">
                <span className="font-semibold text-gray-700">{item.role}</span>
                <span className="font-bold text-[#0A6C54]">{item.contact}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostelWardenDashboard;
