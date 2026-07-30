import React from 'react';
import { BookOpen, Calendar, CheckSquare, ShieldAlert, Award, FileText, Bookmark, Home, CreditCard } from 'lucide-react';

const StudentDashboard = () => {
  const stats = [
    { label: 'Attendance Average', value: '82%', icon: CheckSquare, color: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Today\'s Classes', value: '4 Lectures', icon: BookOpen, color: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'Pending Assignments', value: '2 Tasks', icon: FileText, color: 'bg-yellow-50', iconColor: 'text-yellow-600' },
    { label: 'Upcoming Exam', value: 'Mid-Sem (18-Feb)', icon: Calendar, color: 'bg-indigo-50', iconColor: 'text-indigo-500' },
    { label: 'Pending Fee Dues', value: '₹12,500', icon: CreditCard, color: 'bg-red-50', iconColor: 'text-red-500' },
    { label: 'Scholarship Status', value: 'Approved', icon: Award, color: 'bg-teal-50', iconColor: 'text-teal-500' },
    { label: 'Library Issued Books', value: '3 Books', icon: Bookmark, color: 'bg-orange-50', iconColor: 'text-orange-500' },
    { label: 'Hostel Room', value: 'Block A-102', icon: Home, color: 'bg-purple-50', iconColor: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6 font-['Inter']">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-gray-500 font-semibold uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-[18px] font-bold text-gray-800 mt-2">{stat.value}</h3>
                </div>
                <div className={`${stat.color} p-2.5 rounded-lg flex-shrink-0`}>
                  <Icon className={stat.iconColor} size={18} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-[14px] font-bold text-gray-800 font-semibold uppercase tracking-wider">Today's Class Timetable</h3>
          <div className="space-y-3">
            {[
              { time: '09:00 AM - 10:00 AM', subject: 'Advanced Computer Networks', room: 'Theory Room 4', faculty: 'Dr. R.S. Rawat' },
              { time: '10:00 AM - 11:00 AM', subject: 'Software Engineering Concepts', room: 'Theory Room 4', faculty: 'Er. Amit Sen' },
              { time: '11:15 AM - 01:15 PM', subject: 'Web Technology Lab', room: 'Computer Lab A', faculty: 'Er. Preeti Roy' },
            ].map((cls, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg text-[13px] border border-gray-100 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-800">{cls.subject}</h4>
                  <p className="text-[12px] text-gray-500 mt-0.5">Faculty: {cls.faculty} | Room: {cls.room}</p>
                </div>
                <span className="text-[11px] font-bold text-[#0A6C54] bg-[#0A6C54]/5 px-2.5 py-1 rounded border border-[#0A6C54]/10">{cls.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-[14px] font-bold text-gray-800 font-semibold uppercase tracking-wider">Important Notices & Deadlines</h3>
          <div className="space-y-3">
            {[
              { title: 'Mid-Semester Exam Schedule Published', date: 'Published Today', type: 'Exam' },
              { title: 'TCS Placement Drive Registrations Open', date: 'Deadline: 18-Feb', type: 'Placement' },
              { title: 'Hostel Outing Timings Extended', date: 'Notice Board', type: 'Hostel' },
            ].map((note, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg text-[13px] border border-gray-100 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-800">{note.title}</h4>
                  <p className="text-[12px] text-gray-500 mt-0.5">{note.type}</p>
                </div>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-100">{note.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
