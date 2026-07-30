import React, { useState } from 'react';
import { Search, Eye, CheckCircle, XCircle, ChevronDown, AlertTriangle } from 'lucide-react';

const cancellationData = [
  { id: 1, appNo: 'APP/2024/010', name: 'Karan Mehta', course: 'Diploma in CE', reason: 'Joined another college', requestDate: '2024-02-20', docReturn: 'Pending', refundEligible: '₹5,000', status: 'Pending Approval' },
  { id: 2, appNo: 'APP/2024/015', name: 'Riya Shah', course: 'Diploma in IT', reason: 'Personal reasons', requestDate: '2024-02-18', docReturn: 'Returned', refundEligible: '₹3,000', status: 'Approved' },
  { id: 3, appNo: 'APP/2024/020', name: 'Dev Patel', course: 'Diploma in ME', reason: 'Financial issues', requestDate: '2024-02-15', docReturn: 'Pending', refundEligible: '₹8,000', status: 'Rejected' },
];

const AdmissionCancellation = () => {
  const [search, setSearch] = useState('');
  const filtered = cancellationData.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.appNo.includes(search));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-[18px] font-bold text-gray-800">Admission Cancellation</h2>
        <p className="text-[12px] text-gray-500 mt-0.5">Manage admission cancellation requests</p>
      </div>
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-100">
              {['App No.','Student Name','Course','Reason','Request Date','Doc Return','Refund Eligible','Status','Actions'].map(h => (
                <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{c.appNo}</td>
                <td className="py-3 px-4 text-[13px] font-medium text-gray-800">{c.name}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{c.course}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{c.reason}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{c.requestDate}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${c.docReturn === 'Returned' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{c.docReturn}</span>
                </td>
                <td className="py-3 px-4 text-[13px] font-semibold text-orange-600">{c.refundEligible}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    c.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    c.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>{c.status}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye size={15} className="text-gray-500" /></button>
                    {c.status === 'Pending Approval' && (
                      <>
                        <button className="p-1.5 hover:bg-green-100 rounded-lg"><CheckCircle size={15} className="text-green-600" /></button>
                        <button className="p-1.5 hover:bg-red-100 rounded-lg"><XCircle size={15} className="text-red-600" /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdmissionCancellation;
