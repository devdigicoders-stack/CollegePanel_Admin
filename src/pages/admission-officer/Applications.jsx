import React, { useState } from 'react';
import { Search, Plus, Edit2, Eye, MoreVertical, ChevronDown, CheckCircle, XCircle, Clock } from 'lucide-react';

const Applications = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const applications = [
    { id: 1, appNo: 'APP/2024/001', studentName: 'Aarav Singh', mobile: '9876543210', course: 'Diploma in CE', appDate: '2024-02-15', appFee: 'Paid', status: 'Pending Verification', documents: '8/10' },
    { id: 2, appNo: 'APP/2024/002', studentName: 'Neha Verma', mobile: '9876543211', course: 'Diploma in IT', appDate: '2024-02-14', appFee: 'Paid', status: 'Verified', documents: '10/10' },
    { id: 3, appNo: 'APP/2024/003', studentName: 'Vikram Patel', mobile: '9876543212', course: 'Diploma in ME', appDate: '2024-02-13', appFee: 'Pending', status: 'Incomplete', documents: '5/10' },
    { id: 4, appNo: 'APP/2024/004', studentName: 'Muskan Jain', mobile: '9876543213', course: 'Diploma in EE', appDate: '2024-02-12', appFee: 'Paid', status: 'Approved', documents: '10/10' },
    { id: 5, appNo: 'APP/2024/005', studentName: 'Rohit Sharma', mobile: '9876543214', course: 'Diploma in CE', appDate: '2024-02-11', appFee: 'Paid', status: 'Rejected', documents: '7/10' },
    { id: 6, appNo: 'APP/2024/006', studentName: 'Priya Singh', mobile: '9876543215', course: 'Diploma in IT', appDate: '2024-02-10', appFee: 'Paid', status: 'On Hold', documents: '9/10' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Incomplete': 'bg-gray-100 text-gray-700',
      'Pending Verification': 'bg-orange-100 text-orange-700',
      'Verified': 'bg-blue-100 text-blue-700',
      'Approved': 'bg-green-100 text-green-700',
      'Rejected': 'bg-red-100 text-red-700',
      'On Hold': 'bg-yellow-100 text-yellow-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getFeeColor = (fee) => {
    return fee === 'Paid' ? 'text-green-600' : 'text-orange-600';
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Applications Management</h2>
          <p className="text-[12px] text-gray-600 mt-1">View and manage student applications</p>
        </div>
        <button className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
          <Plus size={18} /> New Application
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by application no., student name..." 
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
            <option>Incomplete</option>
            <option>Pending Verification</option>
            <option>Verified</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>On Hold</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto p-6">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-100">
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">App No.</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Student Name</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Course</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">App Date</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">App Fee</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Documents</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Status</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{app.appNo}</td>
                <td className="py-3 px-4 text-[13px] font-medium text-gray-800">{app.studentName}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{app.course}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{app.appDate}</td>
                <td className={`py-3 px-4 text-[13px] font-semibold ${getFeeColor(app.appFee)}`}>{app.appFee}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{app.documents}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                      <Eye size={16} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                      <Edit2 size={16} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="More">
                      <MoreVertical size={16} className="text-gray-600" />
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
        <p className="text-[12px] text-gray-600">Showing 1 to 6 of 892 applications</p>
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

export default Applications;
