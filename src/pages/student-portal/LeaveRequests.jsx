import React, { useState } from 'react';
import { Plus, Calendar, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const initialLeaves = [
  { id: 1, type: 'Medical Leave', reason: 'High fever and doctor-prescribed bed rest', duration: '3 Days (12-Feb to 14-Feb)', status: 'Approved' },
  { id: 2, type: 'Personal Leave', reason: 'Sibling wedding ceremonies', duration: '5 Days (22-Feb to 26-Feb)', status: 'Pending Coordinator Review' },
];

const LeaveRequests = () => {
  const [leaves, setLeaves] = useState(initialLeaves);
  const [showModal, setShowModal] = useState(false);
  const [newLeave, setNewLeave] = useState({
    type: 'Medical Leave',
    reason: '',
    duration: '',
  });

  const handleApply = (e) => {
    e.preventDefault();
    const itemToAdd = {
      id: leaves.length + 1,
      type: newLeave.type,
      reason: newLeave.reason,
      duration: newLeave.duration,
      status: 'Pending Coordinator Review'
    };
    setLeaves([itemToAdd, ...leaves]);
    setShowModal(false);
    toast.success('Leave application dispatched to Class Coordinator!');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">My Leave Applications</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Create medical leave requests, log personal outing approvals, and track verification stages</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
          <Plus size={16} /> Request Academic Leave
        </button>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto max-w-3xl">
        {leaves.map(item => (
          <div key={item.id} className="p-5 border border-gray-100 rounded-xl space-y-3 bg-gray-50/20 shadow-sm text-[13px]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-semibold text-gray-400">{item.type}</span>
                <p className="font-bold text-gray-800 mt-1">{item.reason}</p>
                <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1"><Calendar size={13} /> {item.duration}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                item.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
              }`}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Request Academic Leave</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleApply} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Leave Classification</label>
                <select 
                  value={newLeave.type} 
                  onChange={(e) => setNewLeave({...newLeave, type: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                >
                  <option value="Medical Leave">Medical Leave (Requires prescription file)</option>
                  <option value="Personal Leave">Personal Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Duration Details</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 3 Days (12-Feb to 14-Feb)"
                  value={newLeave.duration}
                  onChange={(e) => setNewLeave({...newLeave, duration: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Reason / Remarks</label>
                <textarea 
                  required
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-20 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold"
                >
                  File Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
