import React, { useState } from 'react';
import { Search, Download, Plus, Barcode } from 'lucide-react';
import toast from 'react-hot-toast';

const initialPasses = [
  { id: 1, passNo: 'GP-901', name: 'Rahul Sen (Student)', purpose: 'Medical Emergency checkout', type: 'Emergency Exit', outTime: '10:15 AM', inTime: '-', status: 'Currently Out' },
  { id: 2, passNo: 'GP-902', name: 'Neha Patel (Student)', purpose: 'Purchase drawing board tools', type: 'Temporary Outing', outTime: '11:00 AM', inTime: '01:30 PM', status: 'Returned' },
];

const GatePass = () => {
  const [search, setSearch] = useState('');
  const [passes, setPasses] = useState(initialPasses);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPass, setNewPass] = useState({
    name: '',
    purpose: '',
    type: 'Temporary Outing',
  });

  const filtered = passes.filter(p => {
    return p.name.toLowerCase().includes(search.toLowerCase()) || 
           p.passNo.toLowerCase().includes(search.toLowerCase());
  });

  const handleGeneratePass = (e) => {
    e.preventDefault();
    const passToAdd = {
      id: passes.length + 1,
      passNo: `GP-${Math.floor(900 + Math.random() * 99)}`,
      name: newPass.name,
      purpose: newPass.purpose,
      type: newPass.type,
      outTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      inTime: '-',
      status: 'Currently Out'
    };
    setPasses([passToAdd, ...passes]);
    setShowAddModal(false);
    toast.success(`Gate pass ${passToAdd.passNo} generated successfully!`);
    setNewPass({
      name: '',
      purpose: '',
      type: 'Temporary Outing',
    });
  };

  const handleConfirmIn = (id) => {
    setPasses(passes.map(p => p.id === id ? { ...p, status: 'Returned', inTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : p));
    toast.success('Student check-in logged. Gate pass closed.');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Campus Outing Gate Passes</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Generate temporary outing slips, print emergency checkout QR codes, and confirm returns</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Gate Logs
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Generate Gate Pass
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search gate passes by student name or slip number..." 
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
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Pass Number</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Holder Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Reason / Purpose</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Outing Class</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Out / In Time</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 font-bold">Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-semibold text-primary">{item.passNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.name}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500">{item.purpose}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-semibold">{item.type}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500">{item.outTime} / <span className="font-semibold">{item.inTime}</span></td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Returned' ? 'bg-gray-50 text-gray-600 border border-gray-200' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {item.status === 'Currently Out' && (
                    <button onClick={() => handleConfirmIn(item.id)} className="px-2 py-1 text-[11px] font-bold bg-primary text-white rounded hover:bg-primary-hover">Confirm Return</button>
                  )}
                  {item.status === 'Returned' && (
                    <span className="text-[12px] text-gray-400 italic">Closed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Pass Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Generate Gate Pass</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleGeneratePass} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Student / Holder Name</label>
                <input 
                  type="text" 
                  required
                  value={newPass.name}
                  onChange={(e) => setNewPass({...newPass, name: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Outing Category</label>
                <select 
                  value={newPass.type} 
                  onChange={(e) => setNewPass({...newPass, type: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                >
                  <option value="Temporary Outing">Temporary Outing</option>
                  <option value="Emergency Exit">Emergency Exit</option>
                  <option value="Official Duty Pass">Official Duty Pass</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Reason / Purpose</label>
                <textarea 
                  required
                  value={newPass.purpose}
                  onChange={(e) => setNewPass({...newPass, purpose: e.target.value})}
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
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1"
                >
                  <Barcode size={15} /> Print Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GatePass;
