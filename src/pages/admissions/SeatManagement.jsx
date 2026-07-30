import React, { useState } from 'react';
import { Plus, Edit2, ChevronDown } from 'lucide-react';

const seatData = [
  { id: 1, course: 'Diploma in CE', dept: 'Civil Engineering', totalSeats: 60, generalSeats: 30, obcSeats: 16, scSeats: 9, stSeats: 5, mgmtSeats: 0, filledSeats: 45, availableSeats: 15, waitingList: 3 },
  { id: 2, course: 'Diploma in IT', dept: 'Information Technology', totalSeats: 60, generalSeats: 30, obcSeats: 16, scSeats: 9, stSeats: 5, mgmtSeats: 0, filledSeats: 52, availableSeats: 8, waitingList: 5 },
  { id: 3, course: 'Diploma in ME', dept: 'Mechanical Engineering', totalSeats: 60, generalSeats: 30, obcSeats: 16, scSeats: 9, stSeats: 5, mgmtSeats: 0, filledSeats: 38, availableSeats: 22, waitingList: 0 },
  { id: 4, course: 'Diploma in EE', dept: 'Electrical Engineering', totalSeats: 60, generalSeats: 30, obcSeats: 16, scSeats: 9, stSeats: 5, mgmtSeats: 0, filledSeats: 33, availableSeats: 27, waitingList: 0 },
];

const SeatManagement = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Seat Management</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Course-wise seat tracking and allotment</p>
        </div>
        <button className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2">
          <Plus size={16} /> Configure Seats
        </button>
      </div>

      {/* Summary Cards */}
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-gray-100">
        {[
          { label: 'Total Seats', value: '240', color: 'bg-blue-50 text-blue-700' },
          { label: 'Filled Seats', value: '168', color: 'bg-orange-50 text-orange-700' },
          { label: 'Available Seats', value: '72', color: 'bg-green-50 text-green-700' },
          { label: 'Waiting List', value: '8', color: 'bg-purple-50 text-purple-700' },
        ].map(card => (
          <div key={card.label} className={`${card.color} rounded-xl p-4 text-center`}>
            <p className="text-[12px] font-medium mb-1">{card.label}</p>
            <p className="text-[24px] font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-4">
          {seatData.map(course => (
            <div key={course.id} className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-[14px] font-bold text-gray-800">{course.course}</h4>
                  <p className="text-[12px] text-gray-500">{course.dept}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[12px] text-gray-500">Filled / Total</p>
                    <p className="text-[16px] font-bold text-gray-800">{course.filledSeats} / {course.totalSeats}</p>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg"><Edit2 size={15} className="text-gray-500" /></button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-[#0A6C54] h-2 rounded-full" style={{ width: `${(course.filledSeats/course.totalSeats)*100}%` }}></div>
              </div>

              {/* Category Breakdown */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { label: 'General', total: course.generalSeats, filled: Math.floor(course.generalSeats * course.filledSeats / course.totalSeats) },
                  { label: 'OBC', total: course.obcSeats, filled: Math.floor(course.obcSeats * course.filledSeats / course.totalSeats) },
                  { label: 'SC', total: course.scSeats, filled: Math.floor(course.scSeats * course.filledSeats / course.totalSeats) },
                  { label: 'ST', total: course.stSeats, filled: Math.floor(course.stSeats * course.filledSeats / course.totalSeats) },
                  { label: 'Available', total: course.availableSeats, filled: null, highlight: true },
                  { label: 'Waiting', total: course.waitingList, filled: null, highlight: false },
                ].map(cat => (
                  <div key={cat.label} className={`text-center p-3 rounded-lg ${cat.highlight ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <p className="text-[11px] text-gray-500 mb-1">{cat.label}</p>
                    <p className="text-[16px] font-bold text-gray-800">{cat.total}</p>
                    {cat.filled !== null && <p className="text-[10px] text-gray-500">Filled: {cat.filled}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeatManagement;
