import React, { useState } from 'react';
import { Search, Download, Plus, Camera, Barcode } from 'lucide-react';
import toast from 'react-hot-toast';

const initialVisitors = [
  { id: 1, name: 'Suresh Chandra', mobile: '9988776655', idProof: 'Aadhaar Card', meetPerson: 'Principal Office', entry: '15-Feb 09:30 AM', exit: '15-Feb 10:30 AM', status: 'Checked Out' },
  { id: 2, name: 'Aditya Birla Rep', mobile: '9988776656', idProof: 'Employee ID', meetPerson: 'Placement Officer', entry: '15-Feb 10:00 AM', exit: '-', status: 'Inside Campus' },
];

const Visitors = () => {
  const [search, setSearch] = useState('');
  const [visitors, setVisitors] = useState(initialVisitors);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVisitor, setNewVisitor] = useState({
    name: '',
    mobile: '',
    idProof: 'Aadhaar Card',
    meetPerson: '',
    purpose: '',
  });

  const filtered = visitors.filter(v => {
    return v.name.toLowerCase().includes(search.toLowerCase()) || 
           v.meetPerson.toLowerCase().includes(search.toLowerCase());
  });

  const handleAddVisitor = (e) => {
    e.preventDefault();
    const visitorToAdd = {
      id: visitors.length + 1,
      name: newVisitor.name,
      mobile: newVisitor.mobile,
      idProof: newVisitor.idProof,
      meetPerson: newVisitor.meetPerson,
      entry: new Date().toLocaleString(),
      exit: '-',
      status: 'Inside Campus'
    };
    setVisitors([visitorToAdd, ...visitors]);
    setShowAddModal(false);
    toast.success(`Visitor Pass generated for ${newVisitor.name}!`);
    setNewVisitor({
      name: '',
      mobile: '',
      idProof: 'Aadhaar Card',
      meetPerson: '',
      purpose: '',
    });
  };

  const handleCheckout = (id) => {
    setVisitors(visitors.map(v => v.id === id ? { ...v, status: 'Checked Out', exit: new Date().toLocaleTimeString() } : v));
    toast.success('Visitor exit confirmed and pass deactivated.');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Campus Visitor Registration</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Record verification details, print visitor badges, and track exit checkouts</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Registry
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Register Visitor
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by visitor name or contact staff..." 
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
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Staff to Meet</th>
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
                <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">{item.meetPerson}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500">{item.entry} / <span className="font-semibold">{item.exit}</span></td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Checked Out' ? 'bg-gray-50 text-gray-600 border border-gray-200' : 'bg-green-50 text-green-700 border border-green-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {item.status === 'Inside Campus' && (
                    <button onClick={() => handleCheckout(item.id)} className="px-2 py-1 text-[11px] font-bold bg-[#0A6C54] text-white rounded hover:bg-[#085a46]">Checkout</button>
                  )}
                  {item.status === 'Checked Out' && (
                    <span className="text-[12px] text-gray-400 italic font-medium">Logged</span>
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
              <h3 className="font-bold text-gray-800 text-[15px]">Register Visitor Entry</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddVisitor} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Visitor Full Name</label>
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
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">ID Verification Type</label>
                  <select 
                    value={newVisitor.idProof} 
                    onChange={(e) => setNewVisitor({...newVisitor, idProof: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Driving License">Driving License</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Staff / Office to Meet</label>
                <input 
                  type="text" 
                  required
                  value={newVisitor.meetPerson}
                  onChange={(e) => setNewVisitor({...newVisitor, meetPerson: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div className="flex gap-2 p-2 border border-dashed border-gray-200 rounded-lg justify-center items-center text-[12px] text-gray-500 cursor-pointer hover:bg-gray-50">
                <Camera size={16} /> Capture Visitor Photo (Optional)
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
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1"
                >
                  <Barcode size={15} /> Log & Print Pass
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
