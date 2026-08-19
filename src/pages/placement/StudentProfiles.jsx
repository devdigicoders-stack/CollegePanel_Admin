import React, { useState } from 'react';
import { Search, Download, Plus, Edit2, Eye, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const initialProfiles = [
  { id: 1, name: 'Amit Sharma', enrollNo: 'OP/23/CS/001', dept: 'Computer Science', cgpa: '8.8', backlogs: 0, skills: 'React, Node.js, Python', status: 'Verified', eligible: 'Eligible' },
  { id: 2, name: 'Neha Verma', enrollNo: 'OP/23/IT/002', dept: 'Information Tech', cgpa: '7.9', backlogs: 1, skills: 'Java, SQL, HTML/CSS', status: 'Pending Review', eligible: 'Not Eligible' },
  { id: 3, name: 'Vikram Patel', enrollNo: 'OP/23/ME/015', dept: 'Mechanical', cgpa: '6.5', backlogs: 0, skills: 'AutoCAD, SolidWorks', status: 'Verified', eligible: 'Eligible' },
];

const StudentProfiles = () => {
  const [search, setSearch] = useState('');
  const [profiles, setProfiles] = useState(initialProfiles);

  const filtered = profiles.filter(p => {
    return p.name.toLowerCase().includes(search.toLowerCase()) || 
           p.enrollNo.toLowerCase().includes(search.toLowerCase());
  });

  const handleVerify = (id) => {
    setProfiles(profiles.map(p => p.id === id ? { ...p, status: 'Verified', eligible: 'Eligible' } : p));
    toast.success('Student profile marked as Verified and Eligible!');
  };

  const handleReject = (id) => {
    setProfiles(profiles.map(p => p.id === id ? { ...p, status: 'Needs Correction', eligible: 'Not Eligible' } : p));
    toast.error('Student profile flagged for correction.');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Student Placement Profiles</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify CGPA calculations, review submitted resume uploads, and toggle campus eligibility</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={15} /> Export Profiles
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
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Enrollment No</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Department</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">CGPA</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Backlogs</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Core Skills</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Eligibility</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-semibold text-primary">{item.enrollNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.name}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.dept}</td>
                <td className="py-4 px-6 text-[13px] text-center font-bold text-gray-900">{item.cgpa}</td>
                <td className="py-4 px-6 text-[13px] text-center font-semibold text-red-500">{item.backlogs}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{item.skills}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Verified' ? 'bg-green-50 text-green-700 border border-green-100' :
                    item.status === 'Needs Correction' ? 'bg-red-50 text-red-700 border border-red-100' :
                    'bg-yellow-50 text-yellow-700 border border-yellow-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.eligible === 'Eligible' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {item.eligible}
                  </span>
                </td>
                <td className="py-4 px-6 flex gap-2">
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Review Resume"><Eye size={15} /></button>
                  {item.status !== 'Verified' && (
                    <>
                      <button onClick={() => handleVerify(item.id)} className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors" title="Verify Profile"><CheckCircle size={15} /></button>
                      <button onClick={() => handleReject(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors" title="Request Correction"><XCircle size={15} /></button>
                    </>
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

export default StudentProfiles;
