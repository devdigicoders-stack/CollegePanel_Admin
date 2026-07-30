import React, { useState } from 'react';
import { Search, Plus, Edit2, Eye, Download, FileText, CheckCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const initialAllotments = [
  { id: 1, enrollNo: 'OP/23/CE/001', name: 'Aarav Singh', course: 'Diploma CE', room: '101', block: 'Block A (Boys)', date: '2023-08-01', guardian: 'Ramesh Singh', contact: '9988776655', feePaid: 'Yes' },
  { id: 2, enrollNo: 'OP/23/IT/002', name: 'Neha Verma', course: 'Diploma IT', room: '301', block: 'Block C (Girls)', date: '2023-08-01', guardian: 'Suresh Verma', contact: '9988776656', feePaid: 'Yes' },
  { id: 3, enrollNo: 'OP/23/ME/015', name: 'Vikram Patel', course: 'Diploma ME', room: '102', block: 'Block A (Boys)', date: '2023-08-02', guardian: 'Dinesh Patel', contact: '9988776657', feePaid: 'Yes' },
];

const Allotment = () => {
  const [search, setSearch] = useState('');
  const [allotments, setAllotments] = useState(initialAllotments);
  const [showAllotModal, setShowAllotModal] = useState(false);
  const [newAllot, setNewAllot] = useState({
    enrollNo: '',
    name: '',
    course: 'Diploma CE',
    room: '',
    block: 'Block A (Boys)',
    guardian: '',
    contact: '',
    medical: 'None',
  });

  const filtered = allotments.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.enrollNo.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleAllot = (e) => {
    e.preventDefault();
    const allotToAdd = {
      id: allotments.length + 1,
      enrollNo: newAllot.enrollNo,
      name: newAllot.name,
      course: newAllot.course,
      room: newAllot.room,
      block: newAllot.block,
      date: new Date().toISOString().split('T')[0],
      guardian: newAllot.guardian,
      contact: newAllot.contact,
      feePaid: 'Yes'
    };
    setAllotments([...allotments, allotToAdd]);
    setShowAllotModal(false);
    toast.success(`Hostel bed allocated successfully to ${newAllot.name}!`);
    setNewAllot({
      enrollNo: '',
      name: '',
      course: 'Diploma CE',
      room: '',
      block: 'Block A (Boys)',
      guardian: '',
      contact: '',
      medical: 'None',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Student Bed Allotments</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify fee receipts, validate gender block eligibility, and issue hostel entry pass</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Allotment Registry
          </button>
          <button onClick={() => setShowAllotModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> New Allotment
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by student name or enrollment no..." 
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
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Enrollment No</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Course</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Block / Room</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Allotment Date</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Guardian / Contact</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Fee Paid</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.enrollNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.name}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.course}</td>
                <td className="py-4 px-6 text-[13px] text-gray-700 font-bold">{item.block} - Room {item.room}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500">{item.date}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{item.guardian} ({item.contact})</td>
                <td className="py-4 px-6 text-center">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-green-50 text-green-700 border border-green-100">
                    {item.feePaid}
                  </span>
                </td>
                <td className="py-4 px-6 flex gap-2">
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Print Allotment Letter"><FileText size={15} /></button>
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Room Transfer"><RefreshCw size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Allotment Modal */}
      {showAllotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">New Student Allotment</h3>
              <button onClick={() => setShowAllotModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAllot} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Enrollment Number</label>
                  <input 
                    type="text" 
                    required
                    value={newAllot.enrollNo}
                    onChange={(e) => setNewAllot({...newAllot, enrollNo: e.target.value})}
                    placeholder="e.g. OP/23/CE/001"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Student Name</label>
                  <input 
                    type="text" 
                    required
                    value={newAllot.name}
                    onChange={(e) => setNewAllot({...newAllot, name: e.target.value})}
                    placeholder="Student full name"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Block Location</label>
                  <select 
                    value={newAllot.block} 
                    onChange={(e) => setNewAllot({...newAllot, block: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Block A (Boys)">Block A (Boys)</option>
                    <option value="Block B (Boys)">Block B (Boys)</option>
                    <option value="Block C (Girls)">Block C (Girls)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Room Number</label>
                  <input 
                    type="text" 
                    required
                    value={newAllot.room}
                    onChange={(e) => setNewAllot({...newAllot, room: e.target.value})}
                    placeholder="e.g. 102"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Guardian Name</label>
                  <input 
                    type="text" 
                    required
                    value={newAllot.guardian}
                    onChange={(e) => setNewAllot({...newAllot, guardian: e.target.value})}
                    placeholder="Father/Guardian Name"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Emergency Mobile</label>
                  <input 
                    type="text" 
                    required
                    value={newAllot.contact}
                    onChange={(e) => setNewAllot({...newAllot, contact: e.target.value})}
                    placeholder="10 digit number"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Medical Condition / Allergies</label>
                <textarea 
                  value={newAllot.medical}
                  onChange={(e) => setNewAllot({...newAllot, medical: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-20 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAllotModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold"
                >
                  Allot Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Allotment;
