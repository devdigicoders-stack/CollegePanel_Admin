import React, { useState } from 'react';
import { Search, Plus, Edit2, Eye, Download, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const initialLabs = [
  { id: 1, name: 'Digital Electronics Lab', code: 'LAB-ECE-01', dept: 'Electronics', capacity: 30, incharge: 'Prof. K.K. Sen', timing: '09:00 AM - 05:00 PM', status: 'Active' },
  { id: 2, name: 'Chemistry & Metallurgy Lab', code: 'LAB-CHEM-01', dept: 'Applied Science', capacity: 25, incharge: 'Dr. S.K. Jha', timing: '09:00 AM - 05:00 PM', status: 'Active' },
  { id: 3, name: 'Computer Networking Lab', code: 'LAB-CSE-02', dept: 'Computer Science', capacity: 40, incharge: 'Mr. Vinod Kumar', timing: '09:00 AM - 06:00 PM', status: 'Active' },
  { id: 4, name: 'Machine Tools Workshop', code: 'LAB-MECH-01', dept: 'Mechanical', capacity: 35, incharge: 'Mr. Harish Patel', timing: '08:00 AM - 04:00 PM', status: 'Under Maintenance' },
];

const Labs = () => {
  const [search, setSearch] = useState('');
  const [labs, setLabs] = useState(initialLabs);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLab, setNewLab] = useState({
    name: '',
    code: '',
    dept: 'Electronics',
    capacity: 30,
    incharge: '',
    timing: '09:00 AM - 05:00 PM'
  });

  const filtered = labs.filter(l => {
    return l.name.toLowerCase().includes(search.toLowerCase()) || 
           l.code.toLowerCase().includes(search.toLowerCase());
  });

  const handleAddLab = (e) => {
    e.preventDefault();
    const labToAdd = {
      id: labs.length + 1,
      name: newLab.name,
      code: newLab.code,
      dept: newLab.dept,
      capacity: parseInt(newLab.capacity) || 30,
      incharge: newLab.incharge,
      timing: newLab.timing,
      status: 'Active'
    };
    setLabs([...labs, labToAdd]);
    setShowAddModal(false);
    toast.success(`Lab ${newLab.name} configured successfully!`);
    setNewLab({
      name: '',
      code: '',
      dept: 'Electronics',
      capacity: 30,
      incharge: '',
      timing: '09:00 AM - 05:00 PM'
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Laboratory Units Management</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Define lab codes, track capacities, and assign lab in-charges</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
          <Plus size={16} /> Configure Laboratory
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search laboratory name or lab code..." 
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
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Lab Code</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Laboratory Unit</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Department</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Batch Capacity</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">In-Charge Faculty</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Operating Timings</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.code}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.name}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.dept}</td>
                <td className="py-4 px-6 text-[13px] text-center font-semibold text-gray-700">{item.capacity} Studs</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-medium">{item.incharge}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500 font-semibold">{item.timing}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Lab Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Configure Laboratory</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddLab} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Laboratory Name</label>
                <input 
                  type="text" 
                  required
                  value={newLab.name}
                  onChange={(e) => setNewLab({...newLab, name: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Lab Code</label>
                  <input 
                    type="text" 
                    required
                    value={newLab.code}
                    onChange={(e) => setNewLab({...newLab, code: e.target.value})}
                    placeholder="e.g. LAB-CSE-03"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Department</label>
                  <select 
                    value={newLab.dept} 
                    onChange={(e) => setNewLab({...newLab, dept: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Applied Science">Applied Science</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Batch Capacity</label>
                  <input 
                    type="number" 
                    required
                    value={newLab.capacity}
                    onChange={(e) => setNewLab({...newLab, capacity: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">In-Charge Faculty</label>
                  <input 
                    type="text" 
                    required
                    value={newLab.incharge}
                    onChange={(e) => setNewLab({...newLab, incharge: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Operating Timings</label>
                <input 
                  type="text" 
                  required
                  value={newLab.timing}
                  onChange={(e) => setNewLab({...newLab, timing: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
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
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Labs;
