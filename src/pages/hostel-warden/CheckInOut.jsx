import React, { useState } from 'react';
import { Search, Bed, Key, CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CheckInOut = () => {
  const [activeTab, setActiveTab] = useState('CheckIn');
  const [studentSearch, setStudentSearch] = useState('');
  const [targetStudent, setTargetStudent] = useState(null);

  const [keyIssued, setKeyIssued] = useState(false);
  const [mattressIssued, setMattressIssued] = useState(false);
  const [chairIssued, setChairIssued] = useState(false);

  // Static list for search lookup
  const studentRegistry = [
    { id: 1, name: 'Jayesh Soni', enrollNo: 'OP/23/CE/104', block: 'Block A (Boys)', room: '102', status: 'Pending Check-In' },
    { id: 2, name: 'Neha Verma', enrollNo: 'OP/23/IT/002', block: 'Block C (Girls)', room: '301', status: 'Checked-In' },
  ];

  const handleStudentSearch = (e) => {
    e.preventDefault();
    const found = studentRegistry.find(s => s.enrollNo.toLowerCase() === studentSearch.toLowerCase() || s.name.toLowerCase().includes(studentSearch.toLowerCase()));
    if (found) {
      setTargetStudent(found);
      setStudentSearch('');
    } else {
      toast.error('Student not found in allotment list!');
    }
  };

  const handleCompleteCheckIn = () => {
    toast.success(`Check-In process completed for ${targetStudent.name}! Room keys registered.`);
    setTargetStudent(null);
    setKeyIssued(false);
    setMattressIssued(false);
    setChairIssued(false);
  };

  const handleCompleteCheckOut = () => {
    toast.success(`Check-Out clearance generated for ${targetStudent.name}. Room inspected.`);
    setTargetStudent(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-6 pt-2">
        {['CheckIn', 'CheckOut'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setTargetStudent(null);
            }}
            className={`px-6 py-4 text-[14px] font-semibold relative ${
              activeTab === tab ? 'text-[#0A6C54]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'CheckIn' ? 'Student Check-In' : 'Student Check-Out & Clearance'}
            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0A6C54] rounded-t-md"></div>}
          </button>
        ))}
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto">
        <div className="space-y-6">
          <div className="border border-gray-100 p-5 rounded-xl bg-gray-50/50 space-y-4">
            <h3 className="font-bold text-gray-800 text-[14px]">1. Search Allotted Student</h3>
            <form onSubmit={handleStudentSearch} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter Student Name / Enrollment No..." 
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
                  <span className="text-gray-500">Allotted Location:</span>
                  <span className="font-semibold text-[#0A6C54]">{targetStudent.block} - Room {targetStudent.room}</span>
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
          <div className="border border-gray-100 p-6 rounded-xl space-y-4 flex flex-col justify-between">
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
              className={`w-full py-3 rounded-lg text-[13px] font-bold text-white transition-colors ${
                targetStudent && keyIssued && mattressIssued && chairIssued ? 'bg-[#0A6C54] hover:bg-[#085a46]' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Complete Check-In
            </button>
          </div>
        ) : (
          <div className="border border-gray-100 p-6 rounded-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-[14px] pb-2 border-b border-gray-100">Check-Out Clearance Checklist</h3>
              
              <div className="space-y-3 text-[13px]">
                <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-lg text-[12px]">
                  ⚠️ Ensure student has returned all room inventory assets. Inspect walls and cupboards for damages.
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Room Damage Charges (₹)</label>
                  <input type="number" defaultValue="0" className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]" />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Inspection Status Remarks</label>
                  <textarea placeholder="e.g. Wall paint slightly worn, all furniture items returned intact." className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-20 resize-none"></textarea>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCompleteCheckOut}
              disabled={!targetStudent}
              className={`w-full py-3 rounded-lg text-[13px] font-bold text-white transition-colors ${
                targetStudent ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'
              }`}
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
