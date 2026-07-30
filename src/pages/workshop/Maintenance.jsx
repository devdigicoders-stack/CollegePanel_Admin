import React, { useState } from 'react';
import { Search, Download, Plus, AlertCircle, Wrench, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const initialTasks = [
  { id: 1, ticketNo: 'MNT-W-01', equipName: 'HMT Lathe Machine 5HP', code: 'MAC-ME-01', desc: 'Main spindle gear slipping during high speed turning operations', status: 'In Progress', technician: 'R.K. Prasad (Technician)', date: '2024-02-14' },
  { id: 2, ticketNo: 'MNT-W-02', equipName: 'Universal Milling Machine', code: 'MAC-ME-03', desc: 'Coolant pump motor failure, replacing pump seal', status: 'Open', technician: '-', date: '2024-02-15' },
];

const Maintenance = () => {
  const [search, setSearch] = useState('');
  const [tasks, setTasks] = useState(initialTasks);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    equipName: '',
    code: '',
    desc: '',
  });

  const filtered = tasks.filter(t => {
    return t.equipName.toLowerCase().includes(search.toLowerCase()) || 
           t.ticketNo.toLowerCase().includes(search.toLowerCase());
  });

  const handleResolve = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: 'Resolved' } : t));
    toast.success('Machine breakdown ticket marked as Resolved!');
  };

  const handleAddRequest = (e) => {
    e.preventDefault();
    const taskToAdd = {
      id: tasks.length + 1,
      ticketNo: `MNT-W-${Math.floor(10 + Math.random() * 90)}`,
      equipName: newRequest.equipName,
      code: newRequest.code,
      desc: newRequest.desc,
      status: 'Open',
      technician: '-',
      date: new Date().toISOString().split('T')[0]
    };
    setTasks([...tasks, taskToAdd]);
    setShowAddModal(false);
    toast.success(`Breakdown report filed for ${newRequest.equipName}!`);
    setNewRequest({
      equipName: '',
      code: '',
      desc: '',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Machine breakdown & Maintenance</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify workshop machinery fault logs, assign workshop technicians, and update repair status</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Logs
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Report Breakdown
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by Ticket No or Machine..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Ticket No</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Machine Reference</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Fault Description</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Assigned Tech</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Date Logged</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.ticketNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.equipName} ({item.code})</td>
                <td className="py-4 px-6 text-[13px] text-gray-500">{item.desc}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.technician}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500">{item.date}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Resolved' ? 'bg-green-50 text-green-700 border border-green-100' :
                    item.status === 'In Progress' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                    'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {item.status !== 'Resolved' ? (
                    <button onClick={() => handleResolve(item.id)} className="px-2 py-1 text-[11px] font-bold bg-[#0A6C54] text-white rounded flex items-center gap-1 hover:bg-[#085a46]">
                      <CheckCircle size={12} /> Resolve
                    </button>
                  ) : (
                    <span className="text-[12px] text-gray-400 font-medium italic">Fixed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Report Machine Breakdown</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Machine Name</label>
                <input 
                  type="text" 
                  required
                  value={newRequest.equipName}
                  onChange={(e) => setNewRequest({...newRequest, equipName: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Machine Code</label>
                <input 
                  type="text" 
                  required
                  value={newRequest.code}
                  onChange={(e) => setNewRequest({...newRequest, code: e.target.value})}
                  placeholder="e.g. MAC-ME-01"
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Breakdown Fault Description</label>
                <textarea 
                  required
                  value={newRequest.desc}
                  onChange={(e) => setNewRequest({...newRequest, desc: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-24 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold"
                >
                  Post Breakdown Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
