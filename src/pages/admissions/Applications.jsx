import React, { useState } from 'react';
import { Search, Plus, Edit2, Eye, MoreVertical, ChevronDown, Download, X, CheckCircle, XCircle, Clock } from 'lucide-react';

const applicationsData = [
  { id: 1, appNo: 'APP/2024/001', name: 'Aarav Singh', mobile: '9876543210', course: 'Diploma in CE', dept: 'Civil', session: '2024-25', category: 'General', appDate: '2024-02-15', appFee: 'Paid', documents: '8/10', status: 'Pending Verification' },
  { id: 2, appNo: 'APP/2024/002', name: 'Neha Verma', mobile: '9876543211', course: 'Diploma in IT', dept: 'IT', session: '2024-25', category: 'OBC', appDate: '2024-02-14', appFee: 'Paid', documents: '10/10', status: 'Verified' },
  { id: 3, appNo: 'APP/2024/003', name: 'Vikram Patel', mobile: '9876543212', course: 'Diploma in ME', dept: 'Mechanical', session: '2024-25', category: 'SC', appDate: '2024-02-13', appFee: 'Pending', documents: '5/10', status: 'Incomplete' },
  { id: 4, appNo: 'APP/2024/004', name: 'Muskan Jain', mobile: '9876543213', course: 'Diploma in EE', dept: 'Electrical', session: '2024-25', category: 'General', appDate: '2024-02-12', appFee: 'Paid', documents: '10/10', status: 'Approved' },
  { id: 5, appNo: 'APP/2024/005', name: 'Rohit Sharma', mobile: '9876543214', course: 'Diploma in CE', dept: 'Civil', session: '2024-25', category: 'ST', appDate: '2024-02-11', appFee: 'Paid', documents: '7/10', status: 'Rejected' },
  { id: 6, appNo: 'APP/2024/006', name: 'Priya Singh', mobile: '9876543215', course: 'Diploma in IT', dept: 'IT', session: '2024-25', category: 'OBC', appDate: '2024-02-10', appFee: 'Paid', documents: '9/10', status: 'On Hold' },
  { id: 7, appNo: 'APP/2024/007', name: 'Arjun Kumar', mobile: '9876543216', course: 'Diploma in ME', dept: 'Mechanical', session: '2024-25', category: 'General', appDate: '2024-02-09', appFee: 'Paid', documents: '10/10', status: 'Approved' },
];

const statusColors = {
  'Incomplete': 'bg-gray-100 text-gray-700',
  'Pending Verification': 'bg-orange-100 text-orange-700',
  'Verified': 'bg-blue-100 text-blue-700',
  'Approved': 'bg-green-100 text-green-700',
  'Rejected': 'bg-red-100 text-red-700',
  'On Hold': 'bg-yellow-100 text-yellow-700',
};

const Applications = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const filtered = applicationsData.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.appNo.includes(search) || a.mobile.includes(search);
    const matchStatus = filterStatus === 'All' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Applications</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Manage student applications</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">
            <Download size={15} /> Export
          </button>
          <button onClick={() => setShowModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2">
            <Plus size={16} /> New Application
          </button>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by app no., name, mobile..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
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
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-100">
              {['App No.','Student Name','Course','Category','App Date','App Fee','Documents','Status','Actions'].map(h => (
                <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{a.appNo}</td>
                <td className="py-3 px-4">
                  <p className="text-[13px] font-medium text-gray-800">{a.name}</p>
                  <p className="text-[11px] text-gray-500">{a.mobile}</p>
                </td>
                <td className="py-3 px-4">
                  <p className="text-[13px] text-gray-700">{a.course}</p>
                  <p className="text-[11px] text-gray-500">{a.session}</p>
                </td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{a.category}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{a.appDate}</td>
                <td className="py-3 px-4">
                  <span className={`text-[13px] font-semibold ${a.appFee === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>{a.appFee}</span>
                </td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{a.documents}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[a.status]}`}>{a.status}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye size={15} className="text-gray-500" /></button>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit2 size={15} className="text-gray-500" /></button>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg"><MoreVertical size={15} className="text-gray-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <p className="text-[12px] text-gray-500">Showing {filtered.length} of 892 applications</p>
        <div className="flex gap-2">
          {['Prev','1','2','3','Next'].map(p => (
            <button key={p} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium ${p === '1' ? 'bg-[#0A6C54] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p}</button>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-800">New Application</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Student Name','Mobile Number','Email','Parent Name'].map(f => (
                <div key={f}>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">{f}</label>
                  <input type="text" placeholder={`Enter ${f.toLowerCase()}`} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
                </div>
              ))}
              {[
                { label: 'Course', options: ['Diploma in CE','Diploma in IT','Diploma in ME','Diploma in EE'] },
                { label: 'Category', options: ['General','OBC','SC','ST','EWS'] },
                { label: 'Academic Session', options: ['2024-25','2025-26'] },
                { label: 'Admission Type', options: ['Regular','Lateral Entry','Management Quota'] },
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
              <button className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold">Save Application</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
