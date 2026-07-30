import React from 'react';
import { Users, AlertTriangle, ShieldAlert, FileText, CheckCircle, Car } from 'lucide-react';

const SecurityDashboard = () => {
  const stats = [
    { label: 'Students Inside Campus', value: '1,240', icon: Users, color: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Students Outside', value: '180', icon: Users, color: 'bg-gray-50', iconColor: 'text-gray-500' },
    { label: 'Visitors Inside Campus', value: '14', icon: Users, color: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'Total Visitors Today', value: '45 Passes', icon: FileText, color: 'bg-emerald-50', iconColor: 'text-emerald-500' },
    { label: 'Pending Outing Verification', value: '3', icon: AlertTriangle, color: 'bg-yellow-50', iconColor: 'text-yellow-600' },
    { label: 'Vehicles Checked-In Today', value: '82', icon: Car, color: 'bg-indigo-50', iconColor: 'text-indigo-500' },
  ];

  return (
    <div className="space-y-6 font-['Inter']">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-[14px] font-bold text-gray-800 font-semibold uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="text-red-500" size={18} /> Active Emergency SOS Notifications
          </h3>
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
            <ShieldAlert className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-bold text-red-800 text-[14px]">Routine Mock Drill Broadcast</h4>
              <p className="text-[12px] text-red-700 mt-1">Status: Operational. No emergency detected at front-gate sector.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-[14px] font-bold text-gray-800 font-semibold uppercase tracking-wider">Recent Incidents Logged</h3>
          <div className="space-y-3">
            {[
              { type: 'Property Damage', desc: 'Slight dent to staff parking side gate', priority: 'Medium', status: 'Forwarded to Admin' },
              { type: 'Lost Item', desc: 'Calculated scale drawing board left in auditorium', priority: 'Low', status: 'Logged' },
            ].map((inc, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg text-[13px] border border-gray-100 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-800">{inc.type}</h4>
                  <p className="text-[12px] text-gray-500 mt-0.5">{inc.desc}</p>
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  inc.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>{inc.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
