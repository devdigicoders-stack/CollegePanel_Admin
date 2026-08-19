import React, { useState } from 'react';
import { Search, Download, Plus, Edit2, Eye, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const initialInternships = [
  { id: 1, studentName: 'Amit Sharma', company: 'Tata Consultancy Services', duration: '6 Months', stipend: '₹15,000/mo', start: '2024-01-10', end: '2024-07-10', ppo: 'Eligible for PPO' },
  { id: 2, studentName: 'Neha Verma', company: 'Cognizant Technology Solutions', duration: '3 Months', stipend: '₹12,000/mo', start: '2024-02-01', end: '2024-05-01', ppo: 'No' },
];

const Internships = () => {
  const [search, setSearch] = useState('');
  const [internships, setInternships] = useState(initialInternships);

  const filtered = internships.filter(i => {
    return i.studentName.toLowerCase().includes(search.toLowerCase()) || 
           i.company.toLowerCase().includes(search.toLowerCase());
  });

  const handleGrantPpo = (id) => {
    setInternships(internships.map(i => i.id === id ? { ...i, ppo: 'PPO Offered' } : i));
    toast.success('PPO offer status recorded for candidate!');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Industrial Internships Registry</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify internship allocations, monthly stipend logs, and track pre-placement offers (PPOs)</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={15} /> Export Roster
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by student name or internship company..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Allocated Company</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Duration</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Stipend Amount</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Period</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">PPO Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.studentName}</td>
                <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">{item.company}</td>
                <td className="py-4 px-6 text-[13px] text-center font-medium text-gray-600">{item.duration}</td>
                <td className="py-4 px-6 text-[13px] text-right font-bold text-gray-900">{item.stipend}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500 font-semibold">{item.start} to {item.end}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.ppo === 'PPO Offered' ? 'bg-green-50 text-green-700 border border-green-100' :
                    item.ppo === 'Eligible for PPO' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                    'bg-gray-50 text-gray-500 border border-gray-200'
                  }`}>
                    {item.ppo}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {item.ppo === 'Eligible for PPO' && (
                    <button onClick={() => handleGrantPpo(item.id)} className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors" title="Log PPO Offer"><Award size={15} /></button>
                  )}
                  {item.ppo !== 'Eligible for PPO' && (
                    <span className="text-[12px] text-gray-400 italic">No Action</span>
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

export default Internships;
