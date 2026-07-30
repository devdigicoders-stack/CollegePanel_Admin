import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import SkeletonLoader from '../../components/SkeletonLoader';

const AdmissionCancellation = () => {
  const [admissions, setAdmissions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Only show admitted or application stage for cancellation
      const data = (res.data.admissions || res.data).filter(
        a => a.stage === 'Admitted' || a.stage === 'Application'
      );
      setAdmissions(data);
    } catch (error) {
      console.error('Error fetching admissions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const handleCancelRequest = (id) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Please enter a cancellation reason');
      return;
    }
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(`${import.meta.env.VITE_API_URL}/admissions/${selectedId}`,
        { stage: 'Cancelled', status: 'Pending' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      setCancelReason('');
      setSelectedId(null);
      fetchAdmissions();
    } catch (error) {
      console.error('Error cancelling admission', error);
    }
  };

  const filtered = admissions.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) || a.appNo?.includes(search)
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-[18px] font-bold text-gray-800">Admission Cancellation</h2>
        <p className="text-[12px] text-gray-500 mt-0.5">Manage admission cancellation requests</p>
      </div>

      <div className="px-6 py-4 border-b border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by name or app no..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={8} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                {['App No.','Student Name','Course','Category','Session','Stage','Applied On','Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(a => (
                <tr key={a._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{a.appNo}</td>
                  <td className="py-3 px-4">
                    <p className="text-[13px] font-medium text-gray-800">{a.name}</p>
                    <p className="text-[11px] text-gray-500">{a.mobile}</p>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{a.course}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{a.category || '-'}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{a.academicSession || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      a.stage === 'Admitted' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>{a.stage}</span>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-gray-600">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye size={15} className="text-gray-500" /></button>
                      <button
                        onClick={() => handleCancelRequest(a._id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[11px] font-semibold"
                      >
                        <XCircle size={13} /> Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500 text-[13px]">No active admissions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-gray-800">Confirm Cancellation</h3>
                <p className="text-[12px] text-gray-500">This action cannot be undone easily.</p>
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Cancellation Reason</label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Enter reason for cancellation..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-red-400"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowModal(false); setCancelReason(''); }} className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">
                Back
              </button>
              <button onClick={handleConfirmCancel} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold">
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionCancellation;
