import React, { useState } from 'react';
import { Search, Download, Plus, AlertCircle, Wrench, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const initialComplaints = [
  { id: 1, ticketNo: 'TKT-301', room: 'Room A-104', category: 'Plumbing', desc: 'Water leak in tap', priority: 'High', status: 'Assigned', assignee: 'P.K. Sharma (Plumber)', date: '2024-02-14' },
  { id: 2, ticketNo: 'TKT-302', room: 'Room C-302', category: 'Electrical', desc: 'Ceiling fan making noise', priority: 'Medium', status: 'In Progress', assignee: 'R.S. Yadav (Electrician)', date: '2024-02-15' },
  { id: 3, ticketNo: 'TKT-303', room: 'Room B-205', category: 'Internet', desc: 'Wi-Fi connection drop', priority: 'High', status: 'Open', assignee: '-', date: '2024-02-15' },
  { id: 4, ticketNo: 'TKT-304', room: 'Room A-112', category: 'Furniture', desc: 'Study table leg broken', priority: 'Low', status: 'Resolved', assignee: 'M.L. Suthar (Carpenter)', date: '2024-02-10' },
];

const categories = ['All', 'Electrical', 'Plumbing', 'Furniture', 'Cleanliness', 'Internet/Wi-Fi', 'Bathroom', 'Water supply', 'Room damage', 'Security'];

const Complaints = () => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [complaints, setComplaints] = useState(initialComplaints);

  const filtered = complaints.filter(c => {
    const matchesSearch = c.room.toLowerCase().includes(search.toLowerCase()) || 
                          c.ticketNo.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'All' || c.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleResolve = (id) => {
    setComplaints(complaints.map(c => c.id === id ? { ...c, status: 'Resolved' } : c));
    toast.success('Complaint status marked as Resolved!');
  };

  const handleAssign = (id, assignee) => {
    setComplaints(complaints.map(c => c.id === id ? { ...c, status: 'Assigned', assignee } : c));
    toast.success(`Complaint assigned to ${assignee}.`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Room Complaints & Maintenance</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify maintenance logs, prioritize plumbing/electrical tasks, and assign jobs</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={15} /> Export Tickets
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by Ticket No or Room..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>

        <div>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Ticket No</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Room Location</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Category</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Description</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Priority</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Assigned To</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.ticketNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.room}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-semibold">{item.category}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500">{item.desc}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    item.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-100' :
                    item.priority === 'Medium' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                    'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {item.priority}
                  </span>
                </td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{item.assignee}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Resolved' ? 'bg-green-50 text-green-700 border border-green-100' :
                    item.status === 'In Progress' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                    item.status === 'Assigned' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                    'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6 flex gap-1.5">
                  {item.status === 'Open' && (
                    <button onClick={() => handleAssign(item.id, 'R.S. Yadav (Electrician)')} className="px-2 py-1 text-[11px] font-bold bg-blue-600 text-white rounded flex items-center gap-1 hover:bg-blue-700">
                      <Wrench size={12} /> Assign Job
                    </button>
                  )}
                  {item.status !== 'Resolved' && item.status !== 'Open' && (
                    <button onClick={() => handleResolve(item.id)} className="px-2 py-1 text-[11px] font-bold bg-[#0A6C54] text-white rounded flex items-center gap-1 hover:bg-[#085a46]">
                      <CheckCircle size={12} /> Resolve
                    </button>
                  )}
                  {item.status === 'Resolved' && (
                    <span className="text-[12px] text-gray-400 italic">Work Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Complaints;
