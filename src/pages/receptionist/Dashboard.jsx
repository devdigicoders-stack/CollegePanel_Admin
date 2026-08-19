import React from 'react';
import { Users, FileText, Calendar, Phone, Mail, HelpCircle, ChevronRight } from 'lucide-react';

const ReceptionistDashboard = () => {
  const stats = [
    { label: 'Visitors Checked-In Today', value: '18', icon: Users, color: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'New Admission Enquiries', value: '8 Enquiries', icon: FileText, color: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Appointments Today', value: '12 Scheduled', icon: Calendar, color: 'bg-indigo-50', iconColor: 'text-indigo-500' },
    { label: 'Pending Callbacks', value: '5 Calls', icon: Phone, color: 'bg-orange-50', iconColor: 'text-orange-500' },
    { label: 'Courier Parcels Pending', value: '4 Shipments', icon: Mail, color: 'bg-purple-50', iconColor: 'text-purple-500' },
    { label: 'Student Help Desk Tickets', value: '3 Open', icon: HelpCircle, color: 'bg-amber-50', iconColor: 'text-amber-500' },
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
          <h3 className="text-[14px] font-bold text-gray-800 font-semibold uppercase tracking-wider">Today's Appointments Timeline</h3>
          <div className="space-y-3">
            {[
              { time: '10:00 AM', visitor: 'Suresh Chandra (Parent)', person: 'Principal Office', purpose: 'Fee concession appeal' },
              { time: '11:30 AM', visitor: 'Tech Solutions Rep', person: 'HOD CSE', purpose: 'Lab software licensing demo' },
              { time: '02:30 PM', visitor: 'Aditya Birla Recruiter', person: 'Placement Officer', purpose: 'Campus placement drive discussion' },
            ].map((appt, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg text-[13px] border border-gray-100 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-800">{appt.visitor}</h4>
                  <p className="text-[12px] text-gray-500 mt-0.5">Meeting: {appt.person} | Purpose: {appt.purpose}</p>
                </div>
                <span className="text-[11px] font-bold text-primary bg-primary/5 px-2.5 py-1 rounded border border-primary/10">{appt.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-[14px] font-bold text-gray-800 font-semibold uppercase tracking-wider">Student Gate Passes Issued Today</h3>
          <div className="space-y-3">
            {[
              { student: 'Rahul Sen (ECE)', gatePassNo: 'GP-901', exitTime: '10:15 AM', type: 'Medical Emergency' },
              { student: 'Neha Patel (CS)', gatePassNo: 'GP-902', exitTime: '11:00 AM', type: 'Temporary Outing' },
            ].map((gp, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg text-[13px] border border-gray-100 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-800">{gp.student}</h4>
                  <p className="text-[12px] text-gray-500 mt-0.5">Gate Pass: {gp.gatePassNo} | Reason: {gp.type}</p>
                </div>
                <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded border border-red-100">{gp.exitTime}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
