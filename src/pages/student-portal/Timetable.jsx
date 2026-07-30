import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

const Timetable = () => {
  const schedule = [
    { day: 'Monday', lectures: [
      { time: '09:00 AM - 10:00 AM', subject: 'Advanced Computer Networks', room: 'Theory Room 4', faculty: 'Dr. R.S. Rawat' },
      { time: '10:00 AM - 11:00 AM', subject: 'Software Engineering Concepts', room: 'Theory Room 4', faculty: 'Er. Amit Sen' },
      { time: '11:15 AM - 01:15 PM', subject: 'Web Technology Lab', room: 'Computer Lab A', faculty: 'Er. Preeti Roy' },
    ]},
    { day: 'Tuesday', lectures: [
      { time: '09:00 AM - 10:00 AM', subject: 'Compiler Design Principle', room: 'Theory Room 4', faculty: 'Er. Preeti Roy' },
      { time: '10:00 AM - 11:00 AM', subject: 'Advanced Computer Networks', room: 'Theory Room 4', faculty: 'Dr. R.S. Rawat' },
    ]},
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-[16px] font-bold text-gray-800">My Class Timetable</h2>
        <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify your daily class schedules, designated theory classrooms, and laboratory sessions</p>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        {schedule.map((dayPlan, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="font-bold text-gray-800 text-[14px] border-b border-gray-100 pb-2">{dayPlan.day}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dayPlan.lectures.map((lec, lIdx) => (
                <div key={lIdx} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 shadow-sm space-y-3">
                  <div className="flex items-center gap-1.5 text-blue-600 text-[12px] font-semibold">
                    <Clock size={14} /> {lec.time}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-[13px]">{lec.subject}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Faculty: {lec.faculty}</p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-[11px] font-semibold">
                    <MapPin size={13} className="text-gray-400" /> Room: {lec.room}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timetable;
