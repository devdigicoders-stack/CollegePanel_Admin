import React, { useState, useEffect } from 'react';
import { Search, Download, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import SkeletonLoader from '../../components/SkeletonLoader';

const Complaints = () => {
  const [search, setSearch] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/complaints?category=Food');
      setComplaints(res.data.data);
    } catch (error) {
      toast.error('Failed to load mess complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filtered = complaints.filter(c => {
    return c.submittedBy?.toLowerCase().includes(search.toLowerCase()) || 
           c.subject?.toLowerCase().includes(search.toLowerCase());
  });

  const handleResolve = async (id) => {
    try {
      await axiosInstance.put(`/complaints/${id}`, { status: 'Resolved', adminReply: 'Kitchen staff instructed, resolved.' });
      toast.success('Mess complaint ticket marked as Resolved!');
      fetchComplaints();
    } catch (error) {
      toast.error('Error resolving complaint');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Food & Mess Complaints</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify daily raw hygiene standards, quantity feedbacks, and post resolution logs</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={15} /> Export Tickets
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by student name or subject..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        {loading ? (
          <SkeletonLoader type="table" rows={4} cols={7} />
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-[13px]">No food complaints found.</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Ticket No</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Subject</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Description</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Occurrence Date</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-semibold text-primary">{item.complaintId}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.submittedBy}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-semibold">{item.subject}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-500">{item.description}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-6 text-[13px]">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      item.status === 'Resolved' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {item.status !== 'Resolved' ? (
                      <button onClick={() => handleResolve(item._id)} className="px-2 py-1 text-[11px] font-bold bg-primary text-white rounded hover:bg-primary-hover flex items-center gap-1">
                        <CheckCircle size={12} /> Resolve
                      </button>
                    ) : (
                      <span className="text-[12px] text-gray-400 font-medium italic">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Complaints;
