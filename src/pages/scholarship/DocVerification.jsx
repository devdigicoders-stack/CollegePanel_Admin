import React, { useState } from 'react';
import { Search, Download, Check, X, RefreshCw, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const initialDocs = [
  { id: 1, name: 'Income Certificate', status: 'Pending Verification', url: '#' },
  { id: 2, name: 'Caste Certificate', status: 'Verified', url: '#' },
  { id: 3, name: 'Previous Academic Marksheet', status: 'Pending Verification', url: '#' },
  { id: 4, name: 'Bank Passbook Front Page', status: 'Verified', url: '#' },
];

const DocVerification = () => {
  const [studentSearch, setStudentSearch] = useState('');
  const [targetStudent, setTargetStudent] = useState(null);
  const [docs, setDocs] = useState(initialDocs);

  const handleStudentSearch = (e) => {
    e.preventDefault();
    if (studentSearch.toLowerCase() === 'amit sharma' || studentSearch === 'OP/23/CS/001') {
      setTargetStudent({
        name: 'Amit Sharma',
        enrollNo: 'OP/23/CS/001',
        scheme: 'Post-Matric Scholarship for OBC'
      });
      setStudentSearch('');
    } else {
      toast.error('Student application details not found!');
    }
  };

  const handleAction = (id, action) => {
    setDocs(docs.map(d => d.id === id ? { ...d, status: action } : d));
    toast.success(`Document marked as ${action}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Income & Category Document Verification</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Perform Aadhaar matching, check caste classifications, and request file re-uploads</p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto">
        <div className="space-y-6">
          <div className="border border-gray-100 p-5 rounded-xl bg-gray-50/50 space-y-4">
            <h3 className="font-bold text-gray-800 text-[14px]">1. Search Student Application</h3>
            <form onSubmit={handleStudentSearch} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter Student Name / Roll No..." 
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="flex-1 p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] bg-white"
              />
              <button type="submit" className="bg-[#0A6C54] text-white px-4 py-2.5 rounded-lg text-[13px] font-bold">Search</button>
            </form>

            {targetStudent && (
              <div className="bg-white p-4 rounded-lg border border-gray-100 text-[13px] space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Student Name:</span>
                  <span className="font-bold text-gray-800">{targetStudent.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Enrollment No:</span>
                  <span className="font-semibold text-gray-700">{targetStudent.enrollNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Applied Scheme:</span>
                  <span className="font-semibold text-[#0A6C54]">{targetStudent.scheme}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {targetStudent ? (
          <div className="border border-gray-100 p-6 rounded-xl space-y-4">
            <h3 className="font-bold text-gray-800 text-[14px] pb-2 border-b border-gray-100">Document Checklist</h3>
            <div className="space-y-3">
              {docs.map(doc => (
                <div key={doc.id} className="p-3 border border-gray-100 rounded-lg flex items-center justify-between hover:bg-gray-50 text-[13px]">
                  <div>
                    <p className="font-bold text-gray-800">{doc.name}</p>
                    <span className={`text-[11px] font-semibold ${
                      doc.status === 'Verified' ? 'text-green-600' :
                      doc.status === 'Needs Re-Upload' ? 'text-red-500' :
                      'text-yellow-600'
                    }`}>{doc.status}</span>
                  </div>

                  <div className="flex gap-2">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600" title="View Document"><Eye size={14} /></button>
                    {doc.status !== 'Verified' && (
                      <>
                        <button onClick={() => handleAction(doc.id, 'Verified')} className="p-1.5 hover:bg-green-50 rounded-lg text-green-600" title="Verify Document"><Check size={14} /></button>
                        <button onClick={() => handleAction(doc.id, 'Needs Re-Upload')} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500" title="Request Re-upload"><RefreshCw size={14} /></button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center border border-dashed border-gray-200 rounded-xl p-6 text-gray-400 text-[13px]">
            Please search and select a student application to verify documents.
          </div>
        )}
      </div>
    </div>
  );
};

export default DocVerification;
