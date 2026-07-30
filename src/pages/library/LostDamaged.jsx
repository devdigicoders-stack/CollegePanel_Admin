import React, { useState } from 'react';
import { Search, Download, Plus, Check, Trash2, Eye, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

const initialCases = [
  { id: 1, caseNo: 'LD-201', bookTitle: 'Theory of Machines', accessionNo: 'ACC-8025', reportedBy: 'Amit Sharma', type: 'Lost', cost: 750, penalty: 250, status: 'Pending Cost Recovery' },
  { id: 2, caseNo: 'LD-202', bookTitle: 'Introduction to Algorithms', accessionNo: 'ACC-8021', reportedBy: 'Neha Verma', type: 'Damaged', cost: 1200, penalty: 400, status: 'Book Cost Recovered' },
  { id: 3, caseNo: 'LD-203', bookTitle: 'Advanced Engineering Mathematics', accessionNo: 'ACC-8024', reportedBy: 'Pooja Patel', type: 'Lost', cost: 950, penalty: 0, status: 'Replacement Received' },
];

const LostDamaged = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [cases, setCases] = useState(initialCases);

  const filtered = cases.filter(c => {
    const matchesSearch = c.bookTitle.toLowerCase().includes(search.toLowerCase()) || 
                          c.caseNo.toLowerCase().includes(search.toLowerCase()) ||
                          c.reportedBy.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' || c.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleResolve = (id, resolution) => {
    setCases(cases.map(c => c.id === id ? { ...c, status: resolution } : c));
    toast.success(`Case updated with resolution: ${resolution}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Lost & Damaged Book Registry</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Record missing books, process student replacements, and manage cost recovery penalties</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={15} /> Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by book title, member name or case number..." 
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
            <option value="Lost">Lost</option>
            <option value="Damaged">Damaged</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Case ID</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Accession No</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Book Title</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Reported By</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Type</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Book Cost</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Fine / Penalty</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Resolution Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.caseNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-semibold">{item.accessionNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.bookTitle}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.reportedBy}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2 py-0.5 text-[11px] rounded font-semibold ${
                    item.type === 'Lost' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                  }`}>
                    {item.type}
                  </span>
                </td>
                <td className="py-4 px-6 text-[13px] text-right font-semibold text-gray-800">₹{item.cost}</td>
                <td className="py-4 px-6 text-[13px] text-right font-semibold text-red-500">₹{item.penalty}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status.includes('Recovered') || item.status.includes('Received') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6 flex gap-1.5">
                  {item.status.includes('Recovery') && (
                    <>
                      <button onClick={() => handleResolve(item.id, 'Replacement Received')} className="px-2 py-1 text-[11px] font-bold bg-[#0A6C54] text-white rounded hover:bg-[#085a46]">Replacement</button>
                      <button onClick={() => handleResolve(item.id, 'Book Cost Recovered')} className="px-2 py-1 text-[11px] font-bold bg-blue-600 text-white rounded hover:bg-blue-700">Recover Cost</button>
                    </>
                  )}
                  {!item.status.includes('Recovery') && (
                    <span className="text-[12px] text-gray-400 font-medium italic">Case Closed</span>
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

export default LostDamaged;
