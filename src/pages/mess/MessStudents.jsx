import React, { useState } from 'react';
import { Search, Download, Plus, Edit2, Eye, Ban, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const initialMembers = [
  { id: 1, name: 'Aarav Singh', enrollNo: 'OP/23/CE/001', plan: 'Semester Plan', preference: 'Veg', startDate: '2023-08-01', endDate: '2024-05-31', status: 'Active' },
  { id: 2, name: 'Neha Verma', enrollNo: 'OP/23/IT/002', plan: 'Monthly Plan', preference: 'Veg', startDate: '2024-02-01', endDate: '2024-02-29', status: 'Suspended' },
  { id: 3, name: 'Vikram Patel', enrollNo: 'OP/23/ME/015', plan: 'Semester Plan', preference: 'Non-Veg', startDate: '2023-08-01', endDate: '2024-05-31', status: 'Active' },
];

const MessStudents = () => {
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState(initialMembers);

  const filtered = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                          m.enrollNo.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const toggleSuspension = (id) => {
    setMembers(members.map(m => {
      if (m.id === id) {
        const newStatus = m.status === 'Active' ? 'Suspended' : 'Active';
        toast.success(`Membership for ${m.name} is now ${newStatus}`);
        return { ...m, status: newStatus };
      }
      return m;
    }));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Student Mess Memberships</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify card status, student preferences, and suspend active meal plans</p>
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
            placeholder="Search by student name or roll number..." 
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
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Enrollment No</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Mess Plan</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Dietary Pref</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Plan Period</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.enrollNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.name}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.plan}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{item.preference}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500">{item.startDate} to {item.endDate}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6 flex gap-2">
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="View Account"><Eye size={15} /></button>
                  <button onClick={() => toggleSuspension(item.id)} className={`p-1.5 rounded-lg transition-colors ${item.status === 'Active' ? 'hover:bg-red-50 text-red-600' : 'hover:bg-green-50 text-green-600'}`} title={item.status === 'Active' ? 'Suspend Plan' : 'Reactivate Plan'}>
                    {item.status === 'Active' ? <Ban size={15} /> : <CheckCircle size={15} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MessStudents;
