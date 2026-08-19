import React, { useState } from 'react';
import { Search, Download, Plus, AlertCircle, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const initialCases = [
  { id: 1, caseNo: 'DMG-ECE-01', equipName: 'Digital Oscilloscope', code: 'EQP-ECE-041', responsibleName: 'Amit Sharma (Student)', desc: 'Knob broken due to rough handling during lab practical', recoveryCost: 500, status: 'Pending Fine' },
  { id: 2, caseNo: 'DMG-ECE-02', equipName: 'Variable DC Power Supply', code: 'EQP-ECE-042', responsibleName: 'Nikhil Mehta (Student)', desc: 'Short circuit burn due to wrong connection during transformer test', recoveryCost: 2000, status: 'Recovered' },
];

const DamageLost = () => {
  const [search, setSearch] = useState('');
  const [cases, setCases] = useState(initialCases);

  const filtered = cases.filter(c => {
    return c.equipName.toLowerCase().includes(search.toLowerCase()) || 
           c.responsibleName.toLowerCase().includes(search.toLowerCase());
  });

  const handleRecover = (id) => {
    setCases(cases.map(c => c.id === id ? { ...c, status: 'Recovered' } : c));
    toast.success('Penalty cost recovered and asset updated!');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Lab Equipment Damage & Lost Logs</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Record broken instruments, identify responsible students, and track fine recoveries</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={15} /> Export Registry
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by student name or equipment name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-red-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Case No</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Equipment Reference</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Responsible Person</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Damage Details</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Recovery Penalty (₹)</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Recovery Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-semibold text-red-600">{item.caseNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.equipName} ({item.code})</td>
                <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">{item.responsibleName}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500">{item.desc}</td>
                <td className="py-4 px-6 text-[13px] text-right font-bold text-gray-900">₹{item.recoveryCost}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Recovered' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {item.status === 'Pending Fine' ? (
                    <button onClick={() => handleRecover(item.id)} className="px-2 py-1 text-[11px] font-bold bg-primary text-white rounded hover:bg-primary-hover flex items-center gap-1">
                      <Check size={12} /> Clear Dues
                    </button>
                  ) : (
                    <span className="text-[12px] text-gray-400 font-medium italic">Cleared</span>
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

export default DamageLost;
