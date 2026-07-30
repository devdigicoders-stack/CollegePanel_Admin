import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, Eye, ChevronDown, Download, AlertCircle } from 'lucide-react';

const docsData = [
  { id: 1, appNo: 'APP/2024/001', name: 'Aarav Singh', course: 'Diploma in CE', docs: [
    { name: 'Photograph', status: 'Verified' }, { name: 'Aadhaar Card', status: 'Verified' },
    { name: '10th Marksheet', status: 'Pending' }, { name: 'Transfer Certificate', status: 'Correction Required' },
    { name: 'Character Certificate', status: 'Not Uploaded' },
  ]},
  { id: 2, appNo: 'APP/2024/002', name: 'Neha Verma', course: 'Diploma in IT', docs: [
    { name: 'Photograph', status: 'Verified' }, { name: 'Aadhaar Card', status: 'Verified' },
    { name: '10th Marksheet', status: 'Verified' }, { name: 'Transfer Certificate', status: 'Verified' },
    { name: 'Character Certificate', status: 'Verified' },
  ]},
  { id: 3, appNo: 'APP/2024/003', name: 'Vikram Patel', course: 'Diploma in ME', docs: [
    { name: 'Photograph', status: 'Verified' }, { name: 'Aadhaar Card', status: 'Pending' },
    { name: '10th Marksheet', status: 'Rejected' }, { name: 'Transfer Certificate', status: 'Pending' },
    { name: 'Character Certificate', status: 'Not Uploaded' },
  ]},
];

const docStatusColors = {
  'Verified': 'bg-green-100 text-green-700',
  'Pending': 'bg-orange-100 text-orange-700',
  'Rejected': 'bg-red-100 text-red-700',
  'Correction Required': 'bg-yellow-100 text-yellow-700',
  'Not Uploaded': 'bg-gray-100 text-gray-500',
  'Not Applicable': 'bg-blue-100 text-blue-700',
};

const DocumentVerification = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = docsData.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.appNo.includes(search));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-[18px] font-bold text-gray-800">Document Verification</h2>
        <p className="text-[12px] text-gray-500 mt-0.5">Verify student documents for admission</p>
      </div>

      <div className="px-6 py-4 border-b border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by name or app no..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(student => {
            const verified = student.docs.filter(d => d.status === 'Verified').length;
            const total = student.docs.length;
            return (
              <div key={student.id} className="border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-[14px] font-bold text-gray-800">{student.name}</h4>
                    <p className="text-[12px] text-gray-500">{student.appNo} • {student.course}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-semibold text-gray-700">{verified}/{total} Verified</p>
                    <div className="w-32 bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className="bg-[#0A6C54] h-1.5 rounded-full" style={{ width: `${(verified/total)*100}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {student.docs.map(doc => (
                    <div key={doc.name} className="border border-gray-100 rounded-lg p-3">
                      <p className="text-[12px] font-medium text-gray-700 mb-2">{doc.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${docStatusColors[doc.status]}`}>{doc.status}</span>
                      {doc.status !== 'Not Uploaded' && doc.status !== 'Not Applicable' && (
                        <div className="flex gap-1 mt-2">
                          <button className="p-1 hover:bg-gray-100 rounded"><Eye size={12} className="text-gray-500" /></button>
                          <button className="p-1 hover:bg-green-100 rounded"><CheckCircle size={12} className="text-green-600" /></button>
                          <button className="p-1 hover:bg-red-100 rounded"><XCircle size={12} className="text-red-600" /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DocumentVerification;
