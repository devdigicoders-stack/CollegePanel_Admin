import React, { useState } from 'react';
import { ShieldAlert, Plus, CheckCircle, Home } from 'lucide-react';
import toast from 'react-hot-toast';

const initialOutings = [
  { id: 1, type: 'Temporary Outing', purpose: 'Purchase drawing board tools', outTime: '11:00 AM', inTime: '01:30 PM', status: 'Returned' },
];

const Hostel = () => {
  const [outings, setOutings] = useState(initialOutings);
  const [showModal, setShowModal] = useState(false);
  const [newOuting, setNewOuting] = useState({
    type: 'Temporary Outing',
    purpose: '',
  });

  const handleApply = (e) => {
    e.preventDefault();
    const itemToAdd = {
      id: outings.length + 1,
      type: newOuting.type,
      purpose: newOuting.purpose,
      outTime: '-',
      inTime: '-',
      status: 'Pending Warden Approval'
    };
    setOutings([itemToAdd, ...outings]);
    setShowModal(false);
    toast.success('Outing Pass request submitted to Warden!');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">My Hostel Room & Outings</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify your allocated room details, view warden notice boards, and apply for outing passes</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
          <Plus size={16} /> Apply for Outing Pass
        </button>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto max-w-3xl">
        <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/50 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#0A6C54]/10 text-[#0A6C54] flex items-center justify-center">
            <Home size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-[14px]">Room Allocation</h4>
            <p className="text-[12px] text-gray-500 mt-0.5">Block A - Room 102 | Bed B (Under Warden Rawat)</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 text-[14px]">My Outing & Leave History</h3>
          {outings.map(item => (
            <div key={item.id} className="p-4 border border-gray-100 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/20 shadow-sm text-[13px]">
              <div>
                <h4 className="font-bold text-gray-800">{item.type}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Purpose: {item.purpose}</p>
                <p className="text-[11px] text-gray-400 mt-1">Timings: {item.outTime} to {item.inTime}</p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold md:self-center self-start ${
                item.status === 'Returned' ? 'bg-gray-50 text-gray-600 border border-gray-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Outing Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Apply for Outing Pass</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleApply} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Outing Type</label>
                <select 
                  value={newOuting.type} 
                  onChange={(e) => setNewOuting({...newOuting, type: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                >
                  <option value="Temporary Outing">Temporary Outing (Under 4 hours)</option>
                  <option value="Night Outing Pass">Night Outing Pass (Home visit)</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Detailed Reason / Purpose</label>
                <textarea 
                  required
                  value={newOuting.purpose}
                  onChange={(e) => setNewOuting({...newOuting, purpose: e.target.value})}
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
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hostel;
