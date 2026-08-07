const fs = require('fs');
const path = require('path');

const filepath = path.join('d:', 'Desktop', 'DCT_CLG_CRM', 'admin', 'src', 'pages', 'hostel-warden', 'CheckInOut.jsx');

const content = `import React, { useState, useEffect } from 'react';
import { Search, Bed, Key, CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../../utils/axiosInstance';

const CheckInOut = () => {
  const [activeTab, setActiveTab] = useState('CheckIn');
  const [studentSearch, setStudentSearch] = useState('');
  const [targetStudent, setTargetStudent] = useState(null);

  const [allocations, setAllocations] = useState([]);
  
  const [keyIssued, setKeyIssued] = useState(false);
  const [mattressIssued, setMattressIssued] = useState(false);
  const [chairIssued, setChairIssued] = useState(false);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchAllocations();
  }, []);

  const fetchAllocations = async () => {
    try {
      const res = await axiosInstance.get('/hostel/allocations');
      setAllocations(res.data || []);
    } catch (error) {
      toast.error('Failed to load allotments');
    }
  };

  const handleStudentSearch = (e) => {
    e.preventDefault();
    const found = allocations.find(a => 
      a.studentId?.rollNumber?.toLowerCase() === studentSearch.toLowerCase() || 
      a.studentId?.name?.toLowerCase().includes(studentSearch.toLowerCase())
    );
    
    if (found) {
      setTargetStudent(found);
      setStudentSearch('');
    } else {
      toast.error('Student not found in allotment list!');
    }
  };

  const handleCompleteCheckIn = async () => {
    try {
      await axiosInstance.post('/hostel/check-in-out', {
        studentId: targetStudent.studentId._id,
        type: 'Check-In',
        remarks: 'Items issued: Key, Mattress, Chair'
      });
      toast.success(\`Check-In process completed for \${targetStudent.studentId.name}!\`);
      setTargetStudent(null);
      setKeyIssued(false);
      setMattressIssued(false);
      setChairIssued(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-In failed');
    }
  };

  const handleCompleteCheckOut = async () => {
    try {
      await axiosInstance.post('/hostel/check-in-out', {
        studentId: targetStudent.studentId._id,
        type: 'Check-Out',
        remarks: remarks
      });
      toast.success(\`Check-Out clearance generated for \${targetStudent.studentId.name}.\`);
      setTargetStudent(null);
      setRemarks('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-Out failed');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="flex border-b border-gray-100 px-6 pt-2">
        {['CheckIn', 'CheckOut'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setTargetStudent(null);
              setRemarks('');
            }}
            className={\`px-6 py-4 text-[14px] font-semibold relative \${
              activeTab === tab ? 'text-[#0A6C54]' : 'text-gray-500 hover:text-gray-700'
            }\`}
          >
            {tab === 'CheckIn' ? 'Student Check-In' : 'Student Check-Out & Clearance'}
            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0A6C54] rounded-t-md"></div>}
          </button>
        ))}
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto bg-gray-50/30">
        <div className="space-y-6">
          <div className="border border-gray-100 p-5 rounded-xl bg-white shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 text-[14px]">1. Search Allotted Student</h3>
            <form onSubmit={handleStudentSearch} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter Student Name / Enrollment No..." 
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="flex-1 p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] bg-white"
              />
              <button type="submit" className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-4 py-2.5 rounded-lg text-[13px] font-bold">Search</button>
            </form>

            {targetStudent && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-[13px] space-y-2 mt-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Student Name:</span>
                  <span className="font-bold text-gray-800">{targetStudent.studentId?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Enrollment No:</span>
                  <span className="font-semibold text-gray-700">{targetStudent.studentId?.rollNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Allotted Location:</span>
                  <span className="font-semibold text-[#0A6C54]">{targetStudent.roomId?.blockName} - Room {targetStudent.roomId?.roomNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Allotment Status:</span>
                  <span className="font-bold text-orange-600">{targetStudent.status}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {activeTab === 'CheckIn' ? (
          <div className="border border-gray-100 p-6 rounded-xl space-y-4 flex flex-col justify-between bg-white shadow-sm">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-[14px] pb-2 border-b border-gray-100">Check-In Inventory Checklist</h3>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 text-[13px]">
                  <input type="checkbox" checked={keyIssued} onChange={(e) => setKeyIssued(e.target.checked)} className="rounded text-[#0A6C54] focus:ring-[#0A6C54]" />
                  <div>
                    <p className="font-bold text-gray-800">Room Key Issued</p>
                    <p className="text-[11px] text-gray-500">Physical brass key handed over and duplicate verified</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 text-[13px]">
                  <input type="checkbox" checked={mattressIssued} onChange={(e) => setMattressIssued(e.target.checked)} className="rounded text-[#0A6C54] focus:ring-[#0A6C54]" />
                  <div>
                    <p className="font-bold text-gray-800">Mattress & Pillow Handed Over</p>
                    <p className="text-[11px] text-gray-500">Standard single mattress with cover pillow issued</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 text-[13px]">
                  <input type="checkbox" checked={chairIssued} onChange={(e) => setChairIssued(e.target.checked)} className="rounded text-[#0A6C54] focus:ring-[#0A6C54]" />
                  <div>
                    <p className="font-bold text-gray-800">Study Desk Chair Issued</p>
                    <p className="text-[11px] text-gray-500">Plastic study chair tagged under student bed ID</p>
                  </div>
                </label>
              </div>
            </div>

            <button 
              onClick={handleCompleteCheckIn}
              disabled={!targetStudent || !keyIssued || !mattressIssued || !chairIssued}
              className={\`w-full py-3 rounded-lg text-[13px] font-bold text-white transition-colors \${
                targetStudent && keyIssued && mattressIssued && chairIssued ? 'bg-[#0A6C54] hover:bg-[#085a46]' : 'bg-gray-300 cursor-not-allowed'
              }\`}
            >
              Complete Check-In
            </button>
          </div>
        ) : (
          <div className="border border-gray-100 p-6 rounded-xl space-y-4 flex flex-col justify-between bg-white shadow-sm">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-[14px] pb-2 border-b border-gray-100">Check-Out Clearance Checklist</h3>
              
              <div className="space-y-3 text-[13px]">
                <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-lg text-[12px]">
                  ⚠️ Ensure student has returned all room inventory assets. Inspect walls and cupboards for damages.
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Room Damage Charges (₹) - if any</label>
                  <input type="number" defaultValue="0" className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Inspection Status Remarks</label>
                  <textarea 
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g. Wall paint slightly worn, all furniture items returned intact." 
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-20 resize-none focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  ></textarea>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCompleteCheckOut}
              disabled={!targetStudent}
              className={\`w-full py-3 rounded-lg text-[13px] font-bold text-white transition-colors \${
                targetStudent ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'
              }\`}
            >
              Approve Check-Out & Clearance
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckInOut;
`;

fs.writeFileSync(filepath, content, 'utf-8');
console.log("Rewrote CheckInOut.jsx");
