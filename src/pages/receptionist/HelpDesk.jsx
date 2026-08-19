import React, { useState } from 'react';
import { Search, Download, Plus, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const initialTickets = [
  { id: 1, ticketNo: 'HELP-701', studentName: 'Jayesh Soni', type: 'Bonafide Certificate', targetDept: 'Admissions Office', status: 'Pending Forward' },
  { id: 2, ticketNo: 'HELP-702', studentName: 'Neha Verma', type: 'Duplicate ID Card', targetDept: 'Security/Office', status: 'Dispatched to Department' },
];

const HelpDesk = () => {
  const [search, setSearch] = useState('');
  const [tickets, setTickets] = useState(initialTickets);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    studentName: '',
    type: 'Bonafide Certificate',
    targetDept: 'Admissions Office',
  });

  const filtered = tickets.filter(t => {
    return t.studentName.toLowerCase().includes(search.toLowerCase()) || 
           t.ticketNo.toLowerCase().includes(search.toLowerCase());
  });

  const handleCreateTicket = (e) => {
    e.preventDefault();
    const ticketToAdd = {
      id: tickets.length + 1,
      ticketNo: `HELP-${Math.floor(700 + Math.random() * 200)}`,
      studentName: newTicket.studentName,
      type: newTicket.type,
      targetDept: newTicket.targetDept,
      status: 'Pending Forward'
    };
    setTickets([ticketToAdd, ...tickets]);
    setShowAddModal(false);
    toast.success(`Help desk ticket generated for ${newTicket.studentName}!`);
    setNewTicket({
      studentName: '',
      type: 'Bonafide Certificate',
      targetDept: 'Admissions Office',
    });
  };

  const handleForward = (id) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: 'Dispatched to Department' } : t));
    toast.success('Ticket forwarded to respective department cabinet.');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Student Help Desk Console</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Record bonafide certificates requests, duplicate ID logs, and forward tickets</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Tickets
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> File Request Ticket
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search tickets by student name or ticket code..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Ticket No</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Request Type</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Target Department</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 font-bold">Ticket Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-semibold text-primary">{item.ticketNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.studentName}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-semibold">{item.type}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.targetDept}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status.includes('Dispatched') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {item.status === 'Pending Forward' ? (
                    <button onClick={() => handleForward(item.id)} className="px-2.5 py-1 text-[11px] font-bold bg-primary text-white rounded hover:bg-primary-hover flex items-center gap-1">
                      Forward <ArrowRight size={12} />
                    </button>
                  ) : (
                    <span className="text-[12px] text-gray-400 italic">Dispatched</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Ticket Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">File Help Desk Request</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Student Name</label>
                <input 
                  type="text" 
                  required
                  value={newTicket.studentName}
                  onChange={(e) => setNewTicket({...newTicket, studentName: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Request Type</label>
                  <select 
                    value={newTicket.type} 
                    onChange={(e) => setNewTicket({...newTicket, type: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Bonafide Certificate">Bonafide Certificate</option>
                    <option value="Duplicate ID Card">Duplicate ID Card</option>
                    <option value="TC Request">TC Request</option>
                    <option value="Character Certificate">Character Certificate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Target Department</label>
                  <select 
                    value={newTicket.targetDept} 
                    onChange={(e) => setNewTicket({...newTicket, targetDept: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Admissions Office">Admissions Office</option>
                    <option value="Academic Cell">Academic Cell</option>
                    <option value="Administration Desk">Administration Desk</option>
                  </select>
                </div>
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
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpDesk;
