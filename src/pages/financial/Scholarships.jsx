import React, { useState } from 'react';
import { Search, Plus, Eye, ChevronDown, Download, X } from 'lucide-react';

const scholarshipsData = [
  { id: 1, enrollNo: 'OP/24/IT/001', name: 'Neha Verma', course: 'Diploma in IT', scheme: 'Post Matric Scholarship', type: 'Government', category: 'OBC', income: '₹1,20,000', amount: 8000, received: 8000, pending: 0, sanctionStatus: 'Sanctioned', ledgerAdjusted: true },
  { id: 2, enrollNo: 'OP/24/CE/001', name: 'Aarav Singh', course: 'Diploma in CE', scheme: 'Merit Scholarship', type: 'College', category: 'General', income: '₹2,50,000', amount: 5000, received: 0, pending: 5000, sanctionStatus: 'Approved', ledgerAdjusted: false },
  { id: 3, enrollNo: 'OP/24/ME/001', name: 'Vikram Patel', course: 'Diploma in ME', scheme: 'SC/ST Scholarship', type: 'Government', category: 'SC', income: '₹80,000', amount: 12000, received: 6000, pending: 6000, sanctionStatus: 'Partial', ledgerAdjusted: true },
  { id: 4, enrollNo: 'OP/24/EE/002', name: 'Sneha Patel', course: 'Diploma in EE', scheme: 'Sports Scholarship', type: 'College', category: 'General', income: '₹1,80,000', amount: 3000, received: 0, pending: 3000, sanctionStatus: 'Pending', ledgerAdjusted: false },
  { id: 5, enrollNo: 'OP/24/IT/002', name: 'Priya Singh', course: 'Diploma in IT', scheme: 'EWS Scholarship', type: 'Government', category: 'EWS', income: '₹90,000', amount: 10000, received: 10000, pending: 0, sanctionStatus: 'Sanctioned', ledgerAdjusted: true },
  { id: 6, enrollNo: 'OP/24/CE/002', name: 'Rohit Sharma', course: 'Diploma in CE', scheme: 'Minority Scholarship', type: 'Government', category: 'OBC', income: '₹1,10,000', amount: 7500, received: 0, pending: 7500, sanctionStatus: 'Under Review', ledgerAdjusted: false },
];

const statusColors = {
  'Sanctioned': 'bg-green-100 text-green-700',
  'Approved': 'bg-blue-100 text-blue-700',
  'Partial': 'bg-orange-100 text-orange-700',
  'Pending': 'bg-yellow-100 text-yellow-700',
  'Under Review': 'bg-purple-100 text-purple-700',
  'Rejected': 'bg-red-100 text-red-700',
};

const Scholarships = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const filtered = scholarshipsData.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.enrollNo.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'All' || s.type === filterType;
    const matchStatus = filterStatus === 'All' || s.sanctionStatus === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const totalAmount = filtered.reduce((sum, s) => sum + s.amount, 0);
  const totalReceived = filtered.reduce((sum, s) => sum + s.received, 0);
  const totalPending = filtered.reduce((sum, s) => sum + s.pending, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Scholarships</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Track government and college scholarships</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">
            <Download size={15} /> Export
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold">
            <Plus size={15} /> Add Scholarship
          </button>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-3 gap-4">
        {[
          { label: 'Total Scholarship Amount', value: `₹${totalAmount.toLocaleString()}`, color: 'bg-blue-50 text-blue-700' },
          { label: 'Amount Received', value: `₹${totalReceived.toLocaleString()}`, color: 'bg-green-50 text-green-700' },
          { label: 'Amount Pending', value: `₹${totalPending.toLocaleString()}`, color: 'bg-orange-50 text-orange-700' },
        ].map(card => (
          <div key={card.label} className={`${card.color} rounded-xl p-4`}>
            <p className="text-[11px] font-medium mb-1 opacity-80">{card.label}</p>
            <p className="text-[20px] font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by name or enrollment no..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
        <div className="relative">
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
            <option>All</option>
            <option>Government</option>
            <option>College</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
        <div className="relative">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
            <option>All</option>
            {Object.keys(statusColors).map(s => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <table className="w-full text-left border-collapse min-w-[1300px]">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-100">
              {['Enroll No.', 'Student Name', 'Course', 'Scheme', 'Type', 'Category', 'Amount', 'Received', 'Pending', 'Sanction Status', 'Ledger Adj.', 'Actions'].map(h => (
                <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{s.enrollNo}</td>
                <td className="py-3 px-4 text-[13px] font-medium text-gray-800">{s.name}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{s.course}</td>
                <td className="py-3 px-4 text-[13px] text-gray-700">{s.scheme}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${s.type === 'Government' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`}>{s.type}</span>
                </td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{s.category}</td>
                <td className="py-3 px-4 text-[13px] font-semibold text-gray-800">₹{s.amount.toLocaleString()}</td>
                <td className="py-3 px-4 text-[13px] font-semibold text-green-700">₹{s.received.toLocaleString()}</td>
                <td className="py-3 px-4 text-[13px] font-semibold text-orange-600">₹{s.pending.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[s.sanctionStatus]}`}>{s.sanctionStatus}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${s.ledgerAdjusted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {s.ledgerAdjusted ? 'Done' : 'Pending'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye size={14} className="text-gray-500" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-800">Add Scholarship</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Student Enrollment No.', placeholder: 'e.g. OP/24/CE/001' },
                { label: 'Scholarship Scheme Name', placeholder: 'Enter scheme name' },
                { label: 'Scholarship Amount (₹)', placeholder: 'Enter amount' },
                { label: 'Annual Family Income', placeholder: 'Enter income' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">{f.label}</label>
                  <input type="text" placeholder={f.placeholder} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
                </div>
              ))}
              {[
                { label: 'Scholarship Type', options: ['Government', 'College', 'Merit', 'Sports', 'Other'] },
                { label: 'Sanction Status', options: ['Pending', 'Approved', 'Sanctioned', 'Under Review'] },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">{f.label}</label>
                  <div className="relative">
                    <select className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                      {f.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold">Save Scholarship</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scholarships;
