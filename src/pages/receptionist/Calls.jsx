import React, { useState } from 'react';
import { Search, Download, Plus, PhoneCall, PhoneMissed, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const initialCalls = [
  { id: 1, type: 'Incoming', caller: 'Suresh Chandra', phone: '9988776655', purpose: 'Principal meeting request', time: '10:00 AM', status: 'Completed' },
  { id: 2, type: 'Missed', caller: 'Unknown Prospect', phone: '9988776612', purpose: 'Admission Enquiry callback', time: '11:15 AM', status: 'Pending Callback' },
  { id: 3, type: 'Outgoing', caller: 'Rita Roy', phone: '9988776656', purpose: 'Follow-up regarding document verification', time: '11:30 AM', status: 'Completed' },
];

const Calls = () => {
  const [search, setSearch] = useState('');
  const [calls, setCalls] = useState(initialCalls);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCall, setNewCall] = useState({
    type: 'Incoming',
    caller: '',
    phone: '',
    purpose: '',
  });

  const filtered = calls.filter(c => {
    return c.caller.toLowerCase().includes(search.toLowerCase()) || 
           c.phone.includes(search);
  });

  const handleAddCall = (e) => {
    e.preventDefault();
    const itemToAdd = {
      id: calls.length + 1,
      type: newCall.type,
      caller: newCall.caller,
      phone: newCall.phone,
      purpose: newCall.purpose,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Completed'
    };
    setCalls([itemToAdd, ...calls]);
    setShowAddModal(false);
    toast.success(`Call logged for ${newCall.caller}!`);
    setNewCall({
      type: 'Incoming',
      caller: '',
      phone: '',
      purpose: '',
    });
  };

  const handleCallback = (id) => {
    setCalls(calls.map(c => c.id === id ? { ...c, status: 'Completed' } : c));
    toast.success('Callback completed. Status updated.');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Phone Calls Ledger</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Record incoming admissions requests, log outgoing updates, and trigger callback alerts</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Logs
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Log Call
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by caller name or phone number..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Call Type</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Caller Identity</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Phone Number</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Purpose / Call Notes</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Time</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px]">
                  <span className="flex items-center gap-1.5 font-semibold text-gray-700">
                    {item.type === 'Missed' ? <PhoneMissed size={14} className="text-red-500" /> : <PhoneCall size={14} className="text-blue-500" />}
                    {item.type}
                  </span>
                </td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.caller}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-mono font-medium">{item.phone}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500">{item.purpose}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500 font-semibold">{item.time}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {item.status === 'Pending Callback' ? (
                    <button onClick={() => handleCallback(item.id)} className="px-2 py-1 text-[11px] font-bold bg-[#0A6C54] text-white rounded hover:bg-[#085a46]">Callback Done</button>
                  ) : (
                    <span className="text-[12px] text-gray-400 italic">Logged</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Call Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Log Phone Call</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddCall} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Call Type</label>
                  <select 
                    value={newCall.type} 
                    onChange={(e) => setNewCall({...newCall, type: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Incoming">Incoming</option>
                    <option value="Outgoing">Outgoing</option>
                    <option value="Missed">Missed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Caller Name</label>
                  <input 
                    type="text" 
                    required
                    value={newCall.caller}
                    onChange={(e) => setNewCall({...newCall, caller: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  required
                  value={newCall.phone}
                  onChange={(e) => setNewCall({...newCall, phone: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Call Notes / Purpose</label>
                <textarea 
                  required
                  value={newCall.purpose}
                  onChange={(e) => setNewCall({...newCall, purpose: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-20 resize-none"
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
                  Log Call
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calls;
