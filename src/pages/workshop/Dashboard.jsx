import { Wrench, Users, ShieldAlert, CheckCircle, Clock, AlertTriangle, Cpu } from 'lucide-react';

const WorkshopDashboard = () => {
  const stats = [
    { label: 'Total Machines & Tools', value: '320', icon: Cpu, color: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'Available Tools', value: '280', icon: CheckCircle, color: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Tools Issued', value: '40', icon: Clock, color: 'bg-orange-50', iconColor: 'text-orange-500' },
    { label: 'Under Maintenance', value: '6 Machines', icon: Wrench, color: 'bg-red-50', iconColor: 'text-red-500' },
    { label: 'Today\'s Workshop Runs', value: '4 Sessions', icon: Users, color: 'bg-indigo-50', iconColor: 'text-indigo-500' },
    { label: 'Low Consumable Stock', value: '3 Items', icon: AlertTriangle, color: 'bg-pink-50', iconColor: 'text-pink-500' },
    { label: 'Pending Practical Work', value: '18 Submissions', icon: AlertTriangle, color: 'bg-amber-50', iconColor: 'text-amber-500' },
    { label: 'Safety Alerts', value: '0 Active', icon: ShieldAlert, color: 'bg-teal-50', iconColor: 'text-teal-500' },
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
          <h3 className="text-[14px] font-bold text-gray-800 font-semibold uppercase tracking-wider">Today's Workshop Schedule</h3>
          <div className="space-y-3">
            {[
              { time: '08:30 AM - 11:30 AM', subject: 'Welding & Fitting Shop', section: 'Section A', batch: 'Batch W1 (ME)' },
              { time: '12:00 PM - 03:00 PM', subject: 'Machine Shop Practical', section: 'Section B', batch: 'Batch W2 (ME)' },
            ].map((session, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg text-[13px] border border-gray-100">
                <div className="flex justify-between">
                  <h4 className="font-bold text-gray-800">{session.subject}</h4>
                  <span className="text-[11px] text-gray-400 font-bold">{session.time}</span>
                </div>
                <p className="text-[12px] text-gray-500 mt-1">{session.section} | {session.batch}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-[14px] font-bold text-gray-800 font-semibold uppercase tracking-wider">Safety & Inspection Alerts</h3>
          <div className="space-y-3">
            {[
              { type: 'PPE Compliance', status: 'Leather aprons and welding shields checked for Batch W1', priority: 'High' },
              { type: 'Emergency Stop', status: 'Emergency cut-off switch test verified in Machine Shop', priority: 'High' },
            ].map((alert, idx) => (
              <div key={idx} className="p-3 bg-green-50/20 border border-green-50 rounded-lg text-[13px] flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-800">{alert.type}</h4>
                  <p className="text-[12px] text-gray-600 mt-1">{alert.status}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-green-100 text-green-700">Verified</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopDashboard;
