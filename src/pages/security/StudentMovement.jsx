import React, { useState } from 'react';
import { Search, Download, Plus, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const initialMovements = [
  { id: 1, name: 'Amit Sharma', enrollNo: 'OP/23/CS/001', type: 'Exit', time: '10:00 AM', remark: 'Allowed - Medical slip' },
  { id: 2, name: 'Neha Verma', enrollNo: 'OP/23/IT/002', type: 'Entry', time: '10:15 AM', remark: 'Late Entry - Permission slip shown' },
];

const StudentMovement = () => {
  const [search, setSearch] = useState('');
  const [movements, setMovements] = useState(initialMovements);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMove, setNewMove] = useState({
    enrollNo: '',
    name: '',
    type: 'Entry',
    remark: '',
  });

  const filtered = movements.filter(m => {
    return m.name.toLowerCase().includes(search.toLowerCase()) || 
           m.enrollNo.toLowerCase().includes(search.toLowerCase());
  });

  const handleAddMovement = (e) => {
    e.preventDefault();
    const itemToAdd = {
      id: movements.length + 1,
      enrollNo: newMove.enrollNo,
      name: newMove.name,
      type: newMove.type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      remark: newMove.remark
    };
    setMovements([itemToAdd, ...movements]);
    setShowAddModal(false);
    toast.success(`Student ${newMove.type} recorded at gate.`);
    setNewMove({
      enrollNo: '',
      name: '',
      type: 'Entry',
      remark: '',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Student Gate Check-In & Check-Out</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Scan student barcodes, record late entries, and track gate history</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Movement Logs
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Log Manual Movement
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search movement logs by student name or roll number..." 
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
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Enrollment No</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Movement Class</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Gate Timestamp</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Remarks / Off-Hour Permits</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.enrollNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.name}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.type === 'Entry' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {item.type}
                  </span>
                </td>
                <td className="py-4 px-6 text-[13px] text-gray-500 font-semibold">{item.time}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Movement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Log Manual Student Movement</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddMovement} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Student Enrollment No</label>
                <input 
                  type="text" 
                  required
                  value={newMove.enrollNo}
                  onChange={(e) => setNewMove({...newMove, enrollNo: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Student Name</label>
                  <input 
                    type="text" 
                    required
                    value={newMove.name}
                    onChange={(e) => setNewMove({...newMove, name: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Movement Type</label>
                  <select 
                    value={newMove.type} 
                    onChange={(e) => setNewMove({...newMove, type: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Entry">Entry</option>
                    <option value="Exit">Exit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Remarks / Permission Reference</label>
                <textarea 
                  value={newMove.remark}
                  onChange={(e) => setNewMove({...newMove, remark: e.target.value})}
                  placeholder="e.g. Late entry - medical slip"
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
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentMovement;
