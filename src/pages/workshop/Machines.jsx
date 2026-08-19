import React, { useState } from 'react';
import { Search, Download, Plus, Edit2, Eye, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';

const initialMachines = [
  { id: 1, assetId: 'MAC-ME-01', name: 'HMT Lathe Machine 5HP', serialNo: 'LTH-88210', location: 'Machine Shop Sec', condition: 'Good', availability: 'Available' },
  { id: 2, assetId: 'MAC-ME-02', name: 'Arc Welding Transformer 400A', serialNo: 'WLD-44211', location: 'Welding Shop Sec', condition: 'Good', availability: 'Available' },
  { id: 3, assetId: 'MAC-ME-03', name: 'Universal Milling Machine', serialNo: 'MIL-9911A', location: 'Machine Shop Sec', condition: 'Faulty', availability: 'Under Repair' },
  { id: 4, assetId: 'MAC-ME-04', name: 'Bench Drilling Machine 2HP', serialNo: 'DRL-3321A', location: 'Fitting Shop Sec', condition: 'Good', availability: 'Available' },
];

const Machines = () => {
  const [search, setSearch] = useState('');
  const [machines, setMachines] = useState(initialMachines);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMachine, setNewMachine] = useState({
    assetId: '',
    name: '',
    serialNo: '',
    location: 'Machine Shop Sec',
    condition: 'Good',
    availability: 'Available'
  });

  const filtered = machines.filter(m => {
    return m.name.toLowerCase().includes(search.toLowerCase()) || 
           m.assetId.toLowerCase().includes(search.toLowerCase());
  });

  const handleAddMachine = (e) => {
    e.preventDefault();
    const itemToAdd = {
      id: machines.length + 1,
      assetId: newMachine.assetId,
      name: newMachine.name,
      serialNo: newMachine.serialNo,
      location: newMachine.location,
      condition: newMachine.condition,
      availability: newMachine.availability
    };
    setMachines([...machines, itemToAdd]);
    setShowAddModal(false);
    toast.success(`Machine/Tool ${newMachine.name} registered under ${newMachine.location}!`);
    setNewMachine({
      assetId: '',
      name: '',
      serialNo: '',
      location: 'Machine Shop Sec',
      condition: 'Good',
      availability: 'Available'
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Workshop Machinery & Machine Tools</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify lathe machines, drilling motors, and check service availability logs</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Assets
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Add Machinery
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search machinery by name or asset code..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Asset ID</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Machine Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Serial Number</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Shop Location</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Condition</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Availability</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-semibold text-primary">{item.assetId}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.name}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500 font-semibold">{item.serialNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.location}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.condition === 'Good' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {item.condition}
                  </span>
                </td>
                <td className="py-4 px-6 text-[13px] font-bold text-gray-600">{item.availability}</td>
                <td className="py-4 px-6 flex gap-2">
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"><Eye size={15} /></button>
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"><Edit2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Machine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Register Machinery Asset</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddMachine} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Asset ID</label>
                  <input 
                    type="text" 
                    required
                    value={newMachine.assetId}
                    onChange={(e) => setNewMachine({...newMachine, assetId: e.target.value})}
                    placeholder="e.g. MAC-ME-05"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Machine Name</label>
                  <input 
                    type="text" 
                    required
                    value={newMachine.name}
                    onChange={(e) => setNewMachine({...newMachine, name: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Serial Number</label>
                  <input 
                    type="text" 
                    required
                    value={newMachine.serialNo}
                    onChange={(e) => setNewMachine({...newMachine, serialNo: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Shop Section Location</label>
                  <select 
                    value={newMachine.location} 
                    onChange={(e) => setNewMachine({...newMachine, location: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Machine Shop Sec">Machine Shop Sec</option>
                    <option value="Welding Shop Sec">Welding Shop Sec</option>
                    <option value="Fitting Shop Sec">Fitting Shop Sec</option>
                    <option value="Carpentry Shop Sec">Carpentry Shop Sec</option>
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
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Machines;
