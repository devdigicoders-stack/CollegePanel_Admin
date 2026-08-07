const fs = require('fs');
const path = require('path');

const filepath = path.join('d:', 'Desktop', 'DCT_CLG_CRM', 'admin', 'src', 'pages', 'hostel-warden', 'Complaints.jsx');

const content = `import React, { useState, useEffect } from 'react';
import { Search, Download, CheckCircle, Clock, XCircle, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../../utils/axiosInstance';

const Complaints = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, [filterStatus]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      // Fetch only Hostel category complaints
      let url = '/complaints?category=Hostel';
      if (filterStatus !== 'All') {
        url += \`&status=\${filterStatus}\`;
      }
      const res = await axiosInstance.get(url);
      setComplaints(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const filtered = complaints.filter(c => {
    const searchString = \`\${c.complaintId} \${c.submittedBy} \${c.subject}\`.toLowerCase();
    return searchString.includes(search.toLowerCase());
  });

  const handleUpdateStatus = async (id, status, reply = '') => {
    try {
      await axiosInstance.put(\`/complaints/\${id}\`, { status, adminReply: reply });
      toast.success(\`Complaint marked as \${status}\`);
      fetchComplaints();
    } catch (error) {
      toast.error('Failed to update complaint');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Room Complaints & Maintenance</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify maintenance logs, prioritize plumbing/electrical tasks, and track statuses</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={15} /> Export Tickets
        </button>
      </div>

      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 flex-wrap bg-gray-50/30">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by Ticket No, Subject or Student..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>

        <div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        {loading ? (
           <div className="flex items-center justify-center py-12 text-gray-500">Loading complaints...</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Ticket No</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Submitted By</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Subject</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Description</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Priority</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Date</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.complaintId}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.submittedBy}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-semibold">{item.subject}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-500 max-w-[200px] truncate" title={item.description}>{item.description}</td>
                  <td className="py-4 px-6 text-[13px]">
                    <span className={\`px-2 py-0.5 rounded text-[11px] font-bold \${
                      item.priority === 'High' || item.priority === 'Urgent' ? 'bg-red-50 text-red-600 border border-red-100' :
                      item.priority === 'Medium' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                      'bg-blue-50 text-blue-600 border border-blue-100'
                    }\`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-6 text-[13px]">
                    <span className={\`px-2.5 py-1 rounded-full text-[11px] font-semibold \${
                      item.status === 'Resolved' ? 'bg-green-50 text-green-700 border border-green-100' :
                      item.status === 'In Progress' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                      item.status === 'Pending' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      'bg-red-50 text-red-700 border border-red-100'
                    }\`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 flex justify-center gap-1.5">
                    {item.status === 'Pending' && (
                      <button onClick={() => handleUpdateStatus(item._id, 'In Progress', 'Assigned to maintenance team')} className="px-2 py-1 text-[11px] font-bold bg-blue-600 text-white rounded flex items-center gap-1 hover:bg-blue-700 transition-colors" title="Mark In Progress">
                        <Wrench size={12} /> Assign
                      </button>
                    )}
                    {item.status === 'In Progress' && (
                      <button onClick={() => handleUpdateStatus(item._id, 'Resolved')} className="px-2 py-1 text-[11px] font-bold bg-[#0A6C54] text-white rounded flex items-center gap-1 hover:bg-[#085a46] transition-colors" title="Mark Resolved">
                        <CheckCircle size={12} /> Resolve
                      </button>
                    )}
                    {item.status === 'Pending' && (
                      <button onClick={() => handleUpdateStatus(item._id, 'Rejected')} className="px-2 py-1 text-[11px] font-bold bg-red-600 text-white rounded flex items-center gap-1 hover:bg-red-700 transition-colors" title="Reject">
                         <XCircle size={12} />
                      </button>
                    )}
                    {item.status === 'Resolved' && (
                       <span className="text-[12px] text-gray-400 italic">Completed</span>
                    )}
                    {item.status === 'Rejected' && (
                       <span className="text-[12px] text-gray-400 italic">Rejected</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500 text-[13px]">No complaints found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Complaints;
`;

fs.writeFileSync(filepath, content, 'utf-8');
console.log("Rewrote Complaints.jsx");
