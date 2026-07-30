import React, { useState } from 'react';
import { Search, Download, Eye, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const initialApplications = [
  { id: 1, studentName: 'Amit Sharma', cgpa: '8.8', company: 'Tata Consultancy Services', role: 'Systems Engineer', date: '2024-02-14', status: 'Applied' },
  { id: 2, studentName: 'Vikram Patel', cgpa: '6.5', company: 'Tata Consultancy Services', role: 'Systems Engineer', date: '2024-02-14', status: 'Submitted to Company' },
  { id: 3, studentName: 'Aditi Rao', cgpa: '8.1', company: 'Cognizant Technology Solutions', role: 'Associate Software Engineer', date: '2024-02-15', status: 'Applied' },
];

const Applications = () => {
  const [search, setSearch] = useState('');
  const [apps, setApps] = useState(initialApplications);

  const filtered = apps.filter(a => {
    return a.studentName.toLowerCase().includes(search.toLowerCase()) || 
           a.company.toLowerCase().includes(search.toLowerCase());
  });

  const handleForward = (id) => {
    setApps(apps.map(a => a.id === id ? { ...a, status: 'Submitted to Company' } : a));
    toast.success('Application files forwarded to company HR panel!');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Job Applications Registry</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify candidate profiles and submit application bundles to recruiters</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={15} /> Export Applications
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by student name or recruiting company..." 
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
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">CGPA</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Target Company</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Role</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Date Applied</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.studentName}</td>
                <td className="py-4 px-6 text-[13px] text-center font-bold text-gray-900">{item.cgpa}</td>
                <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">{item.company}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.role}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500 font-semibold">{item.date}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Submitted to Company' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6 flex gap-2">
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="View Details"><Eye size={15} /></button>
                  {item.status === 'Applied' && (
                    <button onClick={() => handleForward(item.id)} className="px-2.5 py-1 text-[11px] font-bold bg-[#0A6C54] text-white rounded hover:bg-[#085a46]">Forward HR</button>
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

export default Applications;
