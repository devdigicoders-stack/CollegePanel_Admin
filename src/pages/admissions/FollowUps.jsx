import React, { useState } from 'react';
import { Search, Plus, Edit2, Eye, MessageSquare, ChevronDown, Calendar, X } from 'lucide-react';

const followUpsData = [
  { id: 1, no: 'FUP/2024/001', enquiryNo: 'ENQ/2024/001', studentName: 'Aarav Singh', mobile: '9876543210', course: 'Diploma in CE', followUpDate: '2024-02-15', callStatus: 'Interested', counsellor: 'Mr. Sharma', nextFollowUp: '2024-02-20', interestLevel: 'Very High', notes: 'Student is very keen, will visit tomorrow.' },
  { id: 2, no: 'FUP/2024/002', enquiryNo: 'ENQ/2024/002', studentName: 'Neha Verma', mobile: '9876543211', course: 'Diploma in IT', followUpDate: '2024-02-14', callStatus: 'Call Later', counsellor: 'Ms. Patel', nextFollowUp: '2024-02-18', interestLevel: 'High', notes: 'Will call back after discussing with parents.' },
  { id: 3, no: 'FUP/2024/003', enquiryNo: 'ENQ/2024/003', studentName: 'Vikram Patel', mobile: '9876543212', course: 'Diploma in ME', followUpDate: '2024-02-13', callStatus: 'Visit Scheduled', counsellor: 'Mr. Kumar', nextFollowUp: '2024-02-17', interestLevel: 'High', notes: 'Scheduled campus visit for 17th Feb.' },
  { id: 4, no: 'FUP/2024/004', enquiryNo: 'ENQ/2024/004', studentName: 'Muskan Jain', mobile: '9876543213', course: 'Diploma in EE', followUpDate: '2024-02-12', callStatus: 'Application Started', counsellor: 'Ms. Singh', nextFollowUp: '2024-02-22', interestLevel: 'Very High', notes: 'Started filling application form.' },
  { id: 5, no: 'FUP/2024/005', enquiryNo: 'ENQ/2024/005', studentName: 'Rohit Sharma', mobile: '9876543214', course: 'Diploma in CE', followUpDate: '2024-02-11', callStatus: 'Not Interested', counsellor: 'Mr. Sharma', nextFollowUp: null, interestLevel: 'Low', notes: 'Decided to join another college.' },
  { id: 6, no: 'FUP/2024/006', enquiryNo: 'ENQ/2024/006', studentName: 'Priya Singh', mobile: '9876543215', course: 'Diploma in IT', followUpDate: '2024-02-10', callStatus: 'No Response', counsellor: 'Ms. Patel', nextFollowUp: '2024-02-16', interestLevel: 'Medium', notes: 'Phone not reachable, will try again.' },
];

const callStatusColors = {
  'Interested': 'bg-green-100 text-green-700',
  'Call Later': 'bg-orange-100 text-orange-700',
  'Visit Scheduled': 'bg-blue-100 text-blue-700',
  'Application Started': 'bg-purple-100 text-purple-700',
  'Not Interested': 'bg-red-100 text-red-700',
  'No Response': 'bg-gray-100 text-gray-700',
};

const interestColors = {
  'Very High': 'bg-emerald-100 text-emerald-700',
  'High': 'bg-green-100 text-green-700',
  'Medium': 'bg-yellow-100 text-yellow-700',
  'Low': 'bg-orange-100 text-orange-700',
  'Not Interested': 'bg-red-100 text-red-700',
};

const FollowUps = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const filtered = followUpsData.filter(f => {
    const matchSearch = f.studentName.toLowerCase().includes(search.toLowerCase()) || f.mobile.includes(search);
    const matchStatus = filterStatus === 'All' || f.callStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Follow-ups</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Track and manage student follow-ups</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2">
          <Plus size={16} /> Add Follow-up
        </button>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search student name, mobile..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
        <div className="relative">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
            <option>All</option>
            {Object.keys(callStatusColors).map(s => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-100">
              {['Follow-up No.','Student Name','Course','Follow-up Date','Call Status','Interest Level','Counsellor','Next Follow-up','Actions'].map(h => (
                <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{f.no}</td>
                <td className="py-3 px-4">
                  <p className="text-[13px] font-medium text-gray-800">{f.studentName}</p>
                  <p className="text-[11px] text-gray-500">{f.mobile}</p>
                </td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{f.course}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{f.followUpDate}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${callStatusColors[f.callStatus]}`}>{f.callStatus}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${interestColors[f.interestLevel]}`}>{f.interestLevel}</span>
                </td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{f.counsellor}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">
                  {f.nextFollowUp ? <span className="flex items-center gap-1"><Calendar size={13} className="text-gray-400" />{f.nextFollowUp}</span> : <span className="text-gray-400">-</span>}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye size={15} className="text-gray-500" /></button>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit2 size={15} className="text-gray-500" /></button>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg"><MessageSquare size={15} className="text-gray-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <p className="text-[12px] text-gray-500">Showing {filtered.length} of 156 follow-ups</p>
        <div className="flex gap-2">
          {['Prev','1','2','Next'].map(p => (
            <button key={p} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium ${p === '1' ? 'bg-[#0A6C54] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p}</button>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-800">Add Follow-up</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Enquiry No.', placeholder: 'e.g. ENQ/2024/001' },
                { label: 'Follow-up Date', type: 'date' },
                { label: 'Next Follow-up Date', type: 'date' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">{f.label}</label>
                  <input type={f.type || 'text'} placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
                </div>
              ))}
              {[
                { label: 'Call Status', options: Object.keys(callStatusColors) },
                { label: 'Interest Level', options: Object.keys(interestColors) },
                { label: 'Counsellor', options: ['Mr. Sharma', 'Ms. Patel', 'Mr. Kumar', 'Ms. Singh'] },
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
              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Counsellor Notes</label>
                <textarea rows={3} placeholder="Add notes..." className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUps;
