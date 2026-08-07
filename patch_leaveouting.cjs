const fs = require('fs');
const path = require('path');

const filepath = path.join('d:', 'Desktop', 'DCT_CLG_CRM', 'admin', 'src', 'pages', 'hostel-warden', 'LeaveOuting.jsx');

const content = `import React, { useState, useEffect } from 'react';
import { Search, Download, Check, X, Phone, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../../utils/axiosInstance';

const LeaveOuting = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/hostel/leaves');
      setRequests(res.data || []);
    } catch (error) {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const filtered = requests.filter(r => {
    const studentName = r.studentId?.name?.toLowerCase() || '';
    const room = r.studentId?.room || ''; // if room is populated, else we don't have it directly in leave schema unless we fetch allocation
    const matchesSearch = studentName.includes(search.toLowerCase()) || room.includes(search);
    const matchesType = filterType === 'All' || r.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleStatusUpdate = async (id, status) => {
    try {
      await axiosInstance.put(\`/hostel/leaves/\${id}/status\`, { status });
      setRequests(requests.map(r => r._id === id ? { ...r, status } : r));
      toast.success(\`Leave request \${status.toLowerCase()}!\`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating status');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Leave & Outing Request Logs</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify parent SMS verification status and generate checkout passes</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={15} /> Export History
        </button>
      </div>

      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 flex-wrap bg-gray-50/30">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by student name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>

        <div className="flex gap-3">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Leave">Leave</option>
            <option value="Outing">Outing</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">Loading leave requests...</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Request Type</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">From Date</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">To Date</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Reason</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.studentId?.name || 'Unknown'} <span className="text-gray-500 text-[11px] font-normal block">{item.studentId?.rollNumber}</span></td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.type}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-500">{new Date(item.fromDate).toLocaleString()}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-500">{new Date(item.toDate).toLocaleString()}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 max-w-[200px] truncate" title={item.reason}>{item.reason}</td>
                  <td className="py-4 px-6">
                    <span className={\`px-2.5 py-1 rounded-full text-[11px] font-semibold \${
                      item.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-100' :
                      item.status === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                      'bg-yellow-50 text-yellow-700 border border-yellow-100'
                    }\`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 flex gap-2">
                    {item.status === 'Pending' && (
                      <>
                        <button onClick={() => handleStatusUpdate(item._id, 'Approved')} className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors" title="Approve Request"><Check size={15} /></button>
                        <button onClick={() => handleStatusUpdate(item._id, 'Rejected')} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors" title="Reject Request"><X size={15} /></button>
                      </>
                    )}
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Call Guardian"><Phone size={15} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500 text-[13px]">No requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LeaveOuting;
`;

fs.writeFileSync(filepath, content, 'utf-8');
console.log("Rewrote LeaveOuting.jsx");
