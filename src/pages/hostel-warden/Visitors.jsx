import React, { useState } from 'react';
import { Search, Download, Plus, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const initialVisitors = [
  { id: 1, name: 'Sunil Sen', mobile: '9988776655', idProof: 'Aadhaar (Card)', studentName: 'Varun Sen', relation: 'Father', purpose: 'Home visit pickup', entry: '15-Feb 10:00 AM', exit: '15-Feb 11:30 AM', status: 'Checked Out' },
  { id: 2, name: 'Rekha Rao', mobile: '9988776656', idProof: 'Voter ID', studentName: 'Aditi Rao', relation: 'Mother', purpose: 'Deliver medicines', entry: '16-Feb 02:00 PM', exit: '-', status: 'Currently Inside' },
];

const Visitors = () => {
  const [search, setSearch] = useState('');
  const [visitors, setVisitors] = useState(initialVisitors);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVisitor, setNewVisitor] = useState({
    name: '',
    mobile: '',
    idProof: 'Aadhaar (Card)',
    studentName: '',
    relation: 'Father',
    purpose: '',
  });

  const filtered = visitors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) || 
                          v.studentName.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleAddVisitor = (e) => {
    e.preventDefault();
    const visitorToAdd = {
      id: visitors.length + 1,
      name: newVisitor.name,
      mobile: newVisitor.mobile,
      idProof: newVisitor.idProof,
      studentName: newVisitor.studentName,
      relation: newVisitor.relation,
      purpose: newVisitor.purpose,
      entry: new Date().toLocaleString(),
      exit: '-',
      status: 'Currently Inside'
    };
    setVisitors([visitorToAdd, ...visitors]);
    setShowAddModal(false);
    toast.success(`Visitor entry recorded for ${newVisitor.name}!`);
    setNewVisitor({
      name: '',
      mobile: '',
      idProof: 'Aadhaar (Card)',
      studentName: '',
      relation: 'Father',
      purpose: '',
    });
  };

  const handleCheckout = (id) => {
    setVisitors(visitors.map(v => v.id === id ? { ...v, status: 'Checked Out', exit: new Date().toLocaleTimeString() } : v));
    toast.success('Visitor checked out successfully.');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Visitor Gates Registry</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Record guardian check-ins, issue entry slips, and track exit times</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Registry
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Record Entry
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by visitor name or student name..." 
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
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Visitor Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Mobile</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">ID Verification</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Ref</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Relation</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Entry / Exit</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.name}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{item.mobile}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500 font-semibold">{item.idProof}</td>
                <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">{item.studentName}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{item.relation}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500">{item.entry} / <span className="font-semibold">{item.exit}</span></td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Checked Out' ? 'bg-gray-50 text-gray-600 border border-gray-200' : 'bg-green-50 text-green-700 border border-green-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {item.status === 'Currently Inside' && (
                    <button onClick={() => handleCheckout(item.id)} className="px-2 py-1 text-[11px] font-bold bg-[#0A6C54] text-white rounded hover:bg-[#085a46]">Checkout</button>
                  )}
                  {item.status === 'Checked Out' && (
                    <span className="text-[12px] text-gray-400 italic font-medium">Out</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Visitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Record Visitor Entry</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddVisitor} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Visitor Name</label>
                <input 
                  type="text" 
                  required
                  value={newVisitor.name}
                  onChange={(e) => setNewVisitor({...newVisitor, name: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Mobile No</label>
                  <input 
                    type="text" 
                    required
                    value={newVisitor.mobile}
                    onChange={(e) => setNewVisitor({...newVisitor, mobile: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">ID Proof</label>
                  <select 
                    value={newVisitor.idProof} 
                    onChange={(e) => setNewVisitor({...newVisitor, idProof: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Aadhaar (Card)">Aadhaar (Card)</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Driving License">Driving License</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Visiting Student</label>
                  <input 
                    type="text" 
                    required
                    value={newVisitor.studentName}
                    onChange={(e) => setNewVisitor({...newVisitor, studentName: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Relationship</label>
                  <select 
                    value={newVisitor.relation} 
                    onChange={(e) => setNewVisitor({...newVisitor, relation: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Purpose of Visit</label>
                <textarea 
                  required
                  value={newVisitor.purpose}
                  onChange={(e) => setNewVisitor({...newVisitor, purpose: e.target.value})}
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
                  Log Gate Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visitors;
