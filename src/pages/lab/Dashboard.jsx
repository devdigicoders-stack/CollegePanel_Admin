import React from 'react';
import { ShieldAlert, Users, Wrench, CheckCircle, Clock, AlertTriangle, Cpu } from 'lucide-react';

const LabDashboard = () => {
  const stats = [
    { label: 'Total Equipment', value: '450', icon: Cpu, color: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'Available Equipment', value: '380', icon: CheckCircle, color: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Issued Equipment', value: '55', icon: Clock, color: 'bg-orange-50', iconColor: 'text-orange-500' },
    { label: 'Damaged Equipment', value: '15', icon: AlertTriangle, color: 'bg-red-50', iconColor: 'text-red-500' },
    { label: 'Under Repair', value: '12', icon: Wrench, color: 'bg-yellow-50', iconColor: 'text-yellow-600' },
    { label: 'Today\'s Practicals', value: '6 Sessions', icon: Users, color: 'bg-indigo-50', iconColor: 'text-indigo-500' },
    { label: 'Low Consumable Stock', value: '5 Items', icon: AlertTriangle, color: 'bg-pink-50', iconColor: 'text-pink-500' },
    { label: 'Pending Maintenance', value: '8 Tasks', icon: Wrench, color: 'bg-amber-50', iconColor: 'text-amber-500' },
  ];

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-[14px] font-bold text-gray-800 font-semibold uppercase tracking-wider">Today's Practical Schedule</h3>
          <div className="space-y-3">
            {[
              { time: '09:00 AM - 11:00 AM', subject: 'Digital Electronics Lab', teacher: 'Prof. K.K. Sen', batch: 'Batch B1 (3rd Sem)' },
              { time: '11:30 AM - 01:30 PM', subject: 'Microprocessor Lab', teacher: 'Dr. Ramesh Patil', batch: 'Batch B2 (5th Sem)' },
              { time: '02:00 PM - 04:00 PM', subject: 'Basic Electrical Lab', teacher: 'Mrs. S.K. Bose', batch: 'Batch B3 (1st Sem)' },
            ].map((session, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg text-[13px] border border-gray-100">
                <div className="flex justify-between">
                  <h4 className="font-bold text-gray-800">{session.subject}</h4>
                  <span className="text-[11px] text-gray-400 font-bold">{session.time}</span>
                </div>
                <p className="text-[12px] text-gray-500 mt-1">{session.teacher} | {session.batch}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-[14px] font-bold text-gray-800 font-semibold uppercase tracking-wider">Safety & Inspection Alerts</h3>
          <div className="space-y-3">
            {[
              { type: 'Fire Safety', status: 'Fire extinguishers in Electrical Lab due for refilling', priority: 'High' },
              { type: 'First Aid', status: 'First aid box in Chemistry Lab needs restocking', priority: 'Medium' },
              { type: 'Electrical Safety', status: 'Earthing check required for machine tools in workshop', priority: 'High' },
            ].map((alert, idx) => (
              <div key={idx} className="p-3 bg-red-50/20 border border-red-50 rounded-lg text-[13px] flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-800">{alert.type}</h4>
                  <p className="text-[12px] text-gray-600 mt-1">{alert.status}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  alert.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>{alert.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabDashboard;
