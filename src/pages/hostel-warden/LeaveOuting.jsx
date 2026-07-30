import React, { useState } from 'react';
import { Search, Download, Check, X, Phone, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const initialRequests = [
  { id: 1, studentName: 'Varun Sen', room: '102', type: 'Weekend leave', from: '2024-02-16', to: '2024-02-18', reason: 'Family Function', parentContact: '9988776655', status: 'Pending' },
  { id: 2, studentName: 'Aditi Rao', room: '304', type: 'Short outing', from: '2024-02-15 14:00', to: '2024-02-15 18:00', reason: 'Book purchasing', parentContact: '9988776656', status: 'Approved' },
  { id: 3, studentName: 'Rahul Joshi', room: '209', type: 'Medical leave', from: '2024-02-17', to: '2024-02-20', reason: 'Dental appointment', parentContact: '9988776657', status: 'Pending' },
];

const LeaveOuting = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [requests, setRequests] = useState(initialRequests);

  const filtered = requests.filter(r => {
    const matchesSearch = r.studentName.toLowerCase().includes(search.toLowerCase()) || r.room.includes(search);
    const matchesType = filterType === 'All' || r.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleApprove = (id) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
    toast.success('Leave request approved! Notification sent to parents.');
  };

  const handleReject = (id) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
    toast.error('Leave request rejected.');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Leave & Outing Request Logs</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify parent SMS verification status and generate checkout passes</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={15} /> Export History
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by student name or room number..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>

        <div className="flex gap-3">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Weekend leave">Weekend leave</option>
            <option value="Short outing">Short outing</option>
            <option value="Medical leave">Medical leave</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Room No</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Request Type</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">From Date / Time</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">To Date / Time</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Reason</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.studentName}</td>
                <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">Room {item.room}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.type}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500">{item.from}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500">{item.to}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{item.reason}</td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-100' :
                    item.status === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                    'bg-yellow-50 text-yellow-700 border border-yellow-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6 flex gap-2">
                  {item.status === 'Pending' && (
                    <>
                      <button onClick={() => handleApprove(item.id)} className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors" title="Approve Request"><Check size={15} /></button>
                      <button onClick={() => handleReject(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors" title="Reject Request"><X size={15} /></button>
                    </>
                  )}
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Call Guardian"><Phone size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveOuting;
