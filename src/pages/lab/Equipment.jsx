import React, { useState } from 'react';
import { Search, Download, Plus, Edit2, Eye, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';

const initialEquipment = [
  { id: 1, equipId: 'EQP-ECE-041', name: 'Digital Oscilloscope', serialNo: 'OSC-892182', brand: 'Tektronix', lab: 'Digital Electronics Lab', condition: 'Good', warranty: 'Active' },
  { id: 2, equipId: 'EQP-ECE-042', name: 'Variable DC Power Supply', serialNo: 'PWR-33211', brand: 'Scientific', lab: 'Digital Electronics Lab', condition: 'Good', warranty: 'Active' },
  { id: 3, equipId: 'EQP-CSE-091', name: 'Cisco Catalyst Switch 2960', serialNo: 'CIS-9811A', brand: 'Cisco Systems', lab: 'Computer Networking Lab', condition: 'Faulty', warranty: 'Expired' },
  { id: 4, equipId: 'EQP-MECH-012', name: 'Lathe Machine 5HP', serialNo: 'LTH-5521A', brand: 'HMT India', lab: 'Machine Tools Workshop', condition: 'Under Repair', warranty: 'Expired' },
];

const Equipment = () => {
  const [search, setSearch] = useState('');
  const [equipment, setEquipment] = useState(initialEquipment);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEquip, setNewEquip] = useState({
    equipId: '',
    name: '',
    serialNo: '',
    brand: '',
    lab: 'Digital Electronics Lab',
    condition: 'Good',
    warranty: 'Active'
  });

  const filtered = equipment.filter(e => {
    return e.name.toLowerCase().includes(search.toLowerCase()) || 
           e.equipId.toLowerCase().includes(search.toLowerCase());
  });

  const handleAddEquipment = (e) => {
    e.preventDefault();
    const itemToAdd = {
      id: equipment.length + 1,
      equipId: newEquip.equipId,
      name: newEquip.name,
      serialNo: newEquip.serialNo,
      brand: newEquip.brand,
      lab: newEquip.lab,
      condition: newEquip.condition,
      warranty: newEquip.warranty
    };
    setEquipment([...equipment, itemToAdd]);
    setShowAddModal(false);
    toast.success(`Equipment ${newEquip.name} registered under ${newEquip.lab}!`);
    setNewEquip({
      equipId: '',
      name: '',
      serialNo: '',
      brand: '',
      lab: 'Digital Electronics Lab',
      condition: 'Good',
      warranty: 'Active'
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Laboratory Equipment Assets</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify serial numbers, track warranty status, and check physical conditions</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Assets
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Add Equipment
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search equipment by name or serial ID..." 
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
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Equipment ID</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Asset Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Serial Number</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Brand / Make</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Assigned Lab</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Condition</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Warranty</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.equipId}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.name}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500 font-semibold">{item.serialNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{item.brand}</td>
                <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">{item.lab}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.condition === 'Good' ? 'bg-green-50 text-green-700 border border-green-100' :
                    item.condition === 'Faulty' ? 'bg-red-50 text-red-700 border border-red-100' :
                    'bg-yellow-50 text-yellow-700 border border-yellow-100'
                  }`}>
                    {item.condition}
                  </span>
                </td>
                <td className="py-4 px-6 text-[13px] font-bold text-gray-600">{item.warranty}</td>
                <td className="py-4 px-6 flex gap-2">
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"><Eye size={15} /></button>
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"><Edit2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Equipment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Register Equipment Asset</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddEquipment} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Equipment ID</label>
                  <input 
                    type="text" 
                    required
                    value={newEquip.equipId}
                    onChange={(e) => setNewEquip({...newEquip, equipId: e.target.value})}
                    placeholder="e.g. EQP-ECE-043"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Equipment Name</label>
                  <input 
                    type="text" 
                    required
                    value={newEquip.name}
                    onChange={(e) => setNewEquip({...newEquip, name: e.target.value})}
                    placeholder="Asset Title"
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
                    value={newEquip.serialNo}
                    onChange={(e) => setNewEquip({...newEquip, serialNo: e.target.value})}
                    placeholder="S/N Code"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Brand / Make</label>
                  <input 
                    type="text" 
                    required
                    value={newEquip.brand}
                    onChange={(e) => setNewEquip({...newEquip, brand: e.target.value})}
                    placeholder="Manufacturer name"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Select Lab</label>
                  <select 
                    value={newEquip.lab} 
                    onChange={(e) => setNewEquip({...newEquip, lab: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Digital Electronics Lab">Digital Electronics Lab</option>
                    <option value="Computer Networking Lab">Computer Networking Lab</option>
                    <option value="Machine Tools Workshop">Machine Tools Workshop</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Warranty Status</label>
                  <select 
                    value={newEquip.warranty} 
                    onChange={(e) => setNewEquip({...newEquip, warranty: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
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
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold"
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

export default Equipment;
