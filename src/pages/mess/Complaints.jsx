import React, { useState } from 'react';
import { Search, Download, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const initialComplaints = [
  { id: 1, ticketNo: 'MESS-101', studentName: 'Jayesh Soni', type: 'Food Quality', desc: 'Roti was undercooked during yesterday dinner session', date: '2024-02-14', status: 'Open' },
  { id: 2, ticketNo: 'MESS-102', studentName: 'Neha Verma', type: 'Hygiene', desc: 'Water cooler area in block C dining hall needs cleaning', date: '2024-02-13', status: 'Resolved', note: 'Cleaning staff deployed, area sanitized.' },
  { id: 3, ticketNo: 'MESS-103', studentName: 'Amit Sharma', type: 'Quantity', desc: 'Shortage of paneer pieces in lunch service today', date: '2024-02-15', status: 'Open' },
];

const Complaints = () => {
  const [search, setSearch] = useState('');
  const [complaints, setComplaints] = useState(initialComplaints);

  const filtered = complaints.filter(c => {
    return c.studentName.toLowerCase().includes(search.toLowerCase()) || 
           c.type.toLowerCase().includes(search.toLowerCase());
  });

  const handleResolve = (id) => {
    setComplaints(complaints.map(c => c.id === id ? { ...c, status: 'Resolved', note: 'Kitchen staff instructed, resolved.' } : c));
    toast.success('Mess complaint ticket marked as Resolved!');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Food & Mess Complaints</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify daily raw hygiene standards, quantity feedbacks, and post resolution logs</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={15} /> Export Tickets
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by student name or category type..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Ticket No</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Complaint Category</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Description</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Occurrence Date</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.ticketNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.studentName}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-semibold">{item.type}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500">{item.desc}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500">{item.date}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Resolved' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {item.status === 'Open' ? (
                    <button onClick={() => handleResolve(item.id)} className="px-2 py-1 text-[11px] font-bold bg-[#0A6C54] text-white rounded hover:bg-[#085a46] flex items-center gap-1">
                      <CheckCircle size={12} /> Resolve
                    </button>
                  ) : (
                    <span className="text-[12px] text-gray-400 font-medium italic">Resolved</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Complaints;
