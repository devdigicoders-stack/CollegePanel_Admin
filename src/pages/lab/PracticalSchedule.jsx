import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Cpu, User } from 'lucide-react';

const scheduleData = [
  { id: 1, subject: 'Digital Electronics Lab', code: 'ECE-303P', teacher: 'Prof. K.K. Sen', lab: 'Digital Electronics Lab', timing: '09:00 AM - 11:00 AM', batch: 'Batch B1 (3rd Sem)', equipment: 'Breadboards, IC 7408 (AND), Multimeter' },
  { id: 2, subject: 'Microprocessor Lab', code: 'ECE-501P', teacher: 'Dr. Ramesh Patil', lab: 'Digital Electronics Lab', timing: '11:30 AM - 01:30 PM', batch: 'Batch B2 (5th Sem)', equipment: '8085 Microprocessor Kits, Power Adapter' },
  { id: 3, subject: 'Basic Electrical Lab', code: 'EE-102P', teacher: 'Mrs. S.K. Bose', lab: 'Basic Electrical Lab', timing: '02:00 PM - 04:00 PM', batch: 'Batch B3 (1st Sem)', equipment: 'Wattmeters, Single Phase Transformers' },
];

const PracticalSchedule = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Assigned Practical Timetable</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">View scheduled lab experiments and pre-requisite tool requirements</p>
        </div>
      </div>

      {/* Schedule List */}
      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scheduleData.map(item => (
            <div key={item.id} className="p-5 border border-gray-100 rounded-xl shadow-sm space-y-4 bg-gradient-to-br from-white to-gray-50/50">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A6C54] bg-[#0A6C54]/5 px-2 py-0.5 rounded border border-[#0A6C54]/10">{item.code}</span>
                  <h3 className="font-bold text-gray-800 text-[15px] mt-2">{item.subject}</h3>
                  <p className="text-[12px] text-[#0A6C54] font-bold mt-1">{item.batch}</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                  <Clock size={13} />
                  <span>{item.timing}</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3 text-[13px]">
                <div className="flex items-center gap-2 text-gray-600">
                  <User size={15} className="text-gray-400" />
                  <span>Faculty: <strong className="text-gray-800 font-bold">{item.teacher}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={15} className="text-gray-400" />
                  <span>Lab Hall: <strong className="text-gray-800 font-bold">{item.lab}</strong></span>
                </div>
                <div className="flex items-start gap-2 text-gray-600">
                  <Cpu size={15} className="text-gray-400 mt-0.5" />
                  <span>Required Tools: <span className="text-gray-700 font-semibold">{item.equipment}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PracticalSchedule;
