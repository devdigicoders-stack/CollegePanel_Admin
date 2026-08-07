import React, { useState, useEffect } from 'react';
import { Search, Download, Eye, Ban, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import SkeletonLoader from '../../components/SkeletonLoader';

const MessStudents = () => {
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/mess/members');
      setMembers(res.data);
    } catch (error) {
      toast.error('Failed to load mess members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filtered = members.filter(m => {
    const matchesSearch = m.studentId?.name?.toLowerCase().includes(search.toLowerCase()) || 
                          m.studentId?.rollNo?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const toggleSuspension = async (id, currentStatus, name) => {
    try {
      await axiosInstance.put(`/mess/members/${id}/toggle-status`);
      const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
      toast.success(`Membership for ${name} is now ${newStatus}`);
      fetchMembers();
    } catch (error) {
      toast.error('Error updating member status');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Student Mess Memberships</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify card status, student preferences, and suspend active meal plans</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={15} /> Export Roster
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by student name or roll number..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        {loading ? (
          <SkeletonLoader type="table" rows={6} cols={7} />
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-[13px]">No mess members found.</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Enrollment No</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Mess Plan</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Dietary Pref</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Plan Period</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.studentId?.rollNo || '-'}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.studentId?.name || '-'}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.plan}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{item.preference}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-500 font-semibold">{new Date(item.startDate).toLocaleDateString()} to {new Date(item.endDate).toLocaleDateString()}</td>
                  <td className="py-4 px-6 text-[13px]">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      item.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 flex gap-2">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="View Account"><Eye size={15} /></button>
                    <button onClick={() => toggleSuspension(item._id, item.status, item.studentId?.name)} className={`p-1.5 rounded-lg transition-colors ${item.status === 'Active' ? 'hover:bg-red-50 text-red-600' : 'hover:bg-green-50 text-green-600'}`} title={item.status === 'Active' ? 'Suspend Plan' : 'Reactivate Plan'}>
                      {item.status === 'Active' ? <Ban size={15} /> : <CheckCircle size={15} />}
                    </button>
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

export default MessStudents;
