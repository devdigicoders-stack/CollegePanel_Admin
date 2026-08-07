import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, CheckCircle, Home } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const Hostel = () => {
  const [allocation, setAllocation] = useState(null);
  const [outings, setOutings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newOuting, setNewOuting] = useState({
    type: 'Outing',
    purpose: '',
    fromDate: '',
    toDate: ''
  });

  useEffect(() => {
    fetchHostelDetails();
  }, []);

  const fetchHostelDetails = async () => {
    try {
      const res = await axiosInstance.get('/student-portal/hostel');
      setAllocation(res.data.allocation);
      
      const combined = [
        ...(res.data.leaves || []).map(l => ({ ...l, recordType: 'Leave' })),
        ...(res.data.gatepasses || []).map(g => ({ ...g, recordType: 'Gatepass' }))
      ].sort((a, b) => new Date(b.createdAt || b.fromDate || b.passDate) - new Date(a.createdAt || a.fromDate || a.passDate));
      
      setOutings(combined);
    } catch (error) {
      toast.error('Failed to fetch hostel details');
    } finally { setLoading(false); }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      if (!newOuting.purpose.trim()) {
        return toast.error('Please enter a valid reason');
      }
      if (!newOuting.fromDate || !newOuting.toDate) {
        return toast.error('Please select both From and To dates/times');
      }
      if (new Date(newOuting.toDate) <= new Date(newOuting.fromDate)) {
        return toast.error('Return time must be after leaving time');
      }
      await axiosInstance.post('/student-portal/leaves', {
        reason: newOuting.purpose,
        duration: newOuting.type,
        fromDate: newOuting.fromDate,
        toDate: newOuting.toDate
      });
      toast.success('Outing/Leave Pass request submitted to Warden!');
      setShowModal(false);
      setNewOuting({ type: 'Outing', purpose: '', fromDate: '', toDate: '' });
      fetchHostelDetails(); // Refresh list
    } catch (error) {
      toast.error('Failed to apply for outing');
    } finally { setLoading(false); }
  };

  
  if (loading) {
    return (
      <div className="p-6">
        <SkeletonLoader type="table" rows={6} cols={5} />
      </div>
    );
  }

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

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/50 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#0A6C54]/10 text-[#0A6C54] flex items-center justify-center">
            <Home size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-[14px]">Room Allocation</h4>
            {allocation ? (
              <p className="text-[12px] text-gray-500 mt-0.5">
                Block {allocation.roomId?.block} - Room {allocation.roomId?.roomNo} | Floor {allocation.roomId?.floor} (Allocated on {new Date(allocation.allotmentDate).toLocaleDateString()})
              </p>
            ) : (
              <p className="text-[12px] text-gray-500 mt-0.5">No active hostel allocation found.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 text-[14px]">My Outing & Leave History</h3>
          {outings.length > 0 ? outings.map((item, idx) => (
            <div key={idx} className="p-4 border border-gray-100 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/20 shadow-sm text-[13px]">
              <div>
                <h4 className="font-bold text-gray-800">{item.type || item.recordType}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Purpose: {item.reason || item.purpose}</p>
                {item.recordType === 'Leave' ? (
                  <p className="text-[11px] text-gray-400 mt-1">From: {new Date(item.fromDate).toLocaleDateString()} to {new Date(item.toDate).toLocaleDateString()}</p>
                ) : (
                  <p className="text-[11px] text-gray-400 mt-1">Pass Date: {new Date(item.passDate || item.createdAt).toLocaleDateString()} | Out: {item.outTime || '-'} In: {item.inTime || '-'}</p>
                )}
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold md:self-center self-start ${
                item.status === 'Returned' || item.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-100' : 
                item.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' : 
                'bg-gray-50 text-gray-600 border border-gray-200'
              }`}>
                {item.status}
              </span>
            </div>
          )) : (
            <div className="text-gray-500 text-[13px] p-4 bg-gray-50 rounded-xl border border-gray-100">
              No outing or leave history found.
            </div>
          )}
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
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                >
                  <option value="Outing">Temporary Outing (Hours)</option>
                  <option value="Leave">Night Outing Pass / Leave (Days)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">From Date & Time</label>
                  <input 
                    type={newOuting.type === 'Outing' ? 'datetime-local' : 'date'}
                    required
                    value={newOuting.fromDate}
                    onChange={(e) => setNewOuting({...newOuting, fromDate: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">To Date & Time</label>
                  <input 
                    type={newOuting.type === 'Outing' ? 'datetime-local' : 'date'}
                    required
                    value={newOuting.toDate}
                    onChange={(e) => setNewOuting({...newOuting, toDate: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
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
