import React, { useState } from 'react';
import { Search, Plus, Edit2, Eye, MoreVertical, ChevronDown, Phone, MessageSquare, Calendar } from 'lucide-react';

const FollowUps = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const followUps = [
    { id: 1, followUpNo: 'FUP/2024/001', studentName: 'Aarav Singh', mobile: '9876543210', course: 'Diploma in CE', followUpDate: '2024-02-15', callStatus: 'Interested', counsellor: 'Mr. Sharma', nextFollowUp: '2024-02-20', interestLevel: 'Very High' },
    { id: 2, followUpNo: 'FUP/2024/002', studentName: 'Neha Verma', mobile: '9876543211', course: 'Diploma in IT', followUpDate: '2024-02-14', callStatus: 'Call Later', counsellor: 'Ms. Patel', nextFollowUp: '2024-02-18', interestLevel: 'High' },
    { id: 3, followUpNo: 'FUP/2024/003', studentName: 'Vikram Patel', mobile: '9876543212', course: 'Diploma in ME', followUpDate: '2024-02-13', callStatus: 'Visit Scheduled', counsellor: 'Mr. Kumar', nextFollowUp: '2024-02-17', interestLevel: 'High' },
    { id: 4, followUpNo: 'FUP/2024/004', studentName: 'Muskan Jain', mobile: '9876543213', course: 'Diploma in EE', followUpDate: '2024-02-12', callStatus: 'Application Started', counsellor: 'Ms. Singh', nextFollowUp: '2024-02-22', interestLevel: 'Very High' },
    { id: 5, followUpNo: 'FUP/2024/005', studentName: 'Rohit Sharma', mobile: '9876543214', course: 'Diploma in CE', followUpDate: '2024-02-11', callStatus: 'Not Interested', counsellor: 'Mr. Sharma', nextFollowUp: null, interestLevel: 'Low' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Interested': 'bg-green-100 text-green-700',
      'Call Later': 'bg-orange-100 text-orange-700',
      'Visit Scheduled': 'bg-blue-100 text-blue-700',
      'Application Started': 'bg-purple-100 text-purple-700',
      'Not Interested': 'bg-red-100 text-red-700',
      'No Response': 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getInterestColor = (level) => {
    const colors = {
      'Very High': 'bg-emerald-100 text-emerald-700',
      'High': 'bg-green-100 text-green-700',
      'Medium': 'bg-yellow-100 text-yellow-700',
      'Low': 'bg-orange-100 text-orange-700',
      'Not Interested': 'bg-red-100 text-red-700'
    };
    return colors[level] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Follow-ups Management</h2>
          <p className="text-[12px] text-gray-600 mt-1">Track and manage student follow-ups</p>
        </div>
        <button className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
          <Plus size={18} /> Add Follow-up
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by student name, mobile..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>

        <div className="relative">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option>All Status</option>
            <option>Interested</option>
            <option>Call Later</option>
            <option>Visit Scheduled</option>
            <option>Application Started</option>
            <option>Not Interested</option>
            <option>No Response</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto p-6">
        <table className="w-full text-left border-collapse min-w-[1400px]">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-100">
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Follow-up No.</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Student Name</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Course</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Follow-up Date</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Call Status</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Interest Level</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Counsellor</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Next Follow-up</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {followUps.map(followUp => (
              <tr key={followUp.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{followUp.followUpNo}</td>
                <td className="py-3 px-4 text-[13px] font-medium text-gray-800">{followUp.studentName}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{followUp.course}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{followUp.followUpDate}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${getStatusColor(followUp.callStatus)}`}>
                    {followUp.callStatus}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${getInterestColor(followUp.interestLevel)}`}>
                    {followUp.interestLevel}
                  </span>
                </td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{followUp.counsellor}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">
                  {followUp.nextFollowUp ? (
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-gray-400" />
                      {followUp.nextFollowUp}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                      <Eye size={16} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                      <Edit2 size={16} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Add Note">
                      <MessageSquare size={16} className="text-gray-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-between">
        <p className="text-[12px] text-gray-600">Showing 1 to 5 of 156 follow-ups</p>
        <div className="flex gap-2">
          <button className="px-3 py-2 border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50">Previous</button>
          <button className="px-3 py-2 bg-[#0A6C54] text-white rounded-lg text-[12px] font-medium">1</button>
          <button className="px-3 py-2 border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50">2</button>
          <button className="px-3 py-2 border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
};

export default FollowUps;
