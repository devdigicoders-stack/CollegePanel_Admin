import React, { useState } from 'react';
import { Search, Plus, Edit2, Eye, MoreVertical, ChevronDown, Download, Filter } from 'lucide-react';

const Enquiries = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSource, setFilterSource] = useState('All');

  const enquiries = [
    { id: 1, enquiryNo: 'ENQ/2024/001', name: 'Aarav Singh', mobile: '9876543210', email: 'aarav@email.com', course: 'Diploma in CE', source: 'Website', date: '2024-02-15', counsellor: 'Mr. Sharma', status: 'Interested' },
    { id: 2, enquiryNo: 'ENQ/2024/002', name: 'Neha Verma', mobile: '9876543211', email: 'neha@email.com', course: 'Diploma in IT', source: 'Phone Call', date: '2024-02-14', counsellor: 'Ms. Patel', status: 'Follow-up' },
    { id: 3, enquiryNo: 'ENQ/2024/003', name: 'Vikram Patel', mobile: '9876543212', email: 'vikram@email.com', course: 'Diploma in ME', source: 'Walk-in', date: '2024-02-13', counsellor: 'Mr. Kumar', status: 'New' },
    { id: 4, enquiryNo: 'ENQ/2024/004', name: 'Muskan Jain', mobile: '9876543213', email: 'muskan@email.com', course: 'Diploma in EE', source: 'Social Media', date: '2024-02-12', counsellor: 'Ms. Singh', status: 'Contacted' },
    { id: 5, enquiryNo: 'ENQ/2024/005', name: 'Rohit Sharma', mobile: '9876543214', email: 'rohit@email.com', course: 'Diploma in CE', source: 'Referral', date: '2024-02-11', counsellor: 'Mr. Sharma', status: 'Converted' },
    { id: 6, enquiryNo: 'ENQ/2024/006', name: 'Priya Singh', mobile: '9876543215', email: 'priya@email.com', course: 'Diploma in IT', source: 'Education Fair', date: '2024-02-10', counsellor: 'Ms. Patel', status: 'Not Interested' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      'New': 'bg-blue-100 text-blue-700',
      'Contacted': 'bg-purple-100 text-purple-700',
      'Interested': 'bg-green-100 text-green-700',
      'Follow-up': 'bg-orange-100 text-orange-700',
      'Not Interested': 'bg-red-100 text-red-700',
      'Converted': 'bg-emerald-100 text-emerald-700',
      'Closed': 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getSourceColor = (source) => {
    const colors = {
      'Website': 'bg-blue-50 text-blue-700',
      'Phone Call': 'bg-purple-50 text-purple-700',
      'Walk-in': 'bg-green-50 text-green-700',
      'Social Media': 'bg-pink-50 text-pink-700',
      'Referral': 'bg-orange-50 text-orange-700',
      'Education Fair': 'bg-indigo-50 text-indigo-700',
      'Advertisement': 'bg-yellow-50 text-yellow-700'
    };
    return colors[source] || 'bg-gray-50 text-gray-700';
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Enquiries Management</h2>
          <p className="text-[12px] text-gray-600 mt-1">Manage prospective student enquiries</p>
        </div>
        <button className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
          <Plus size={18} /> Add Enquiry
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, mobile, email..." 
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
            <option>New</option>
            <option>Contacted</option>
            <option>Interested</option>
            <option>Follow-up</option>
            <option>Not Interested</option>
            <option>Converted</option>
            <option>Closed</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="relative">
          <select 
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option>All Sources</option>
            <option>Website</option>
            <option>Phone Call</option>
            <option>Walk-in</option>
            <option>Social Media</option>
            <option>Referral</option>
            <option>Education Fair</option>
            <option>Advertisement</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={16} /> Export
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto p-6">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-100">
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Enquiry No.</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Student Name</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Mobile</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Course</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Source</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Counsellor</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Date</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Status</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map(enquiry => (
              <tr key={enquiry.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{enquiry.enquiryNo}</td>
                <td className="py-3 px-4 text-[13px] font-medium text-gray-800">{enquiry.name}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{enquiry.mobile}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{enquiry.course}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${getSourceColor(enquiry.source)}`}>
                    {enquiry.source}
                  </span>
                </td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{enquiry.counsellor}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{enquiry.date}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${getStatusColor(enquiry.status)}`}>
                    {enquiry.status}
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
        <p className="text-[12px] text-gray-600">Showing 1 to 6 of 1,245 enquiries</p>
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

export default Enquiries;
