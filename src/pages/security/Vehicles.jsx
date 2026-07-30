import React, { useState } from 'react';
import { Search, Download, Plus, Car } from 'lucide-react';
import toast from 'react-hot-toast';

const initialVehicles = [
  { id: 1, plateNo: 'DL-3C-AS-9921', ownerName: 'Dr. R.S. Rawat (Staff)', type: 'Staff 4-Wheeler', parkingZone: 'Staff Parking Area B', checkInTime: '08:30 AM', checkOutTime: '-' },
  { id: 2, plateNo: 'HR-26-CV-8812', ownerName: 'Sanjay Dutt (Student)', type: 'Student 2-Wheeler', parkingZone: 'Student Parking Zone A', checkInTime: '09:15 AM', checkOutTime: '-' },
];

const Vehicles = () => {
  const [search, setSearch] = useState('');
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    plateNo: '',
    ownerName: '',
    type: 'Staff 4-Wheeler',
    parkingZone: 'Staff Parking Area B',
  });

  const filtered = vehicles.filter(v => {
    return v.plateNo.toLowerCase().includes(search.toLowerCase()) || 
           v.ownerName.toLowerCase().includes(search.toLowerCase());
  });

  const handleRegister = (e) => {
    e.preventDefault();
    const itemToAdd = {
      id: vehicles.length + 1,
      plateNo: newVehicle.plateNo,
      ownerName: newVehicle.ownerName,
      type: newVehicle.type,
      parkingZone: newVehicle.parkingZone,
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      checkOutTime: '-'
    };
    setVehicles([itemToAdd, ...vehicles]);
    setShowAddModal(false);
    toast.success(`Vehicle entry recorded for ${newVehicle.plateNo}`);
    setNewVehicle({
      plateNo: '',
      ownerName: '',
      type: 'Staff 4-Wheeler',
      parkingZone: 'Staff Parking Area B',
    });
  };

  const handleCheckout = (id) => {
    setVehicles(vehicles.map(v => v.id === id ? { ...v, checkOutTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : v));
    toast.success('Vehicle checkout time logged.');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Campus Vehicle Registry</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Record staff/student vehicle entries, assign designated parking zones, and track logouts</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Vehicle Logs
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Log Vehicle Entry
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by license plate or owner identity..." 
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
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">License Plate No</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Owner Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Vehicle Type</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Parking zone</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Check-In / Out</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-bold font-mono text-[#0A6C54]">{item.plateNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.ownerName}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-semibold">{item.type}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500 font-semibold">{item.parkingZone}</td>
                <td className="py-4 px-6 text-[13px] text-center text-gray-600 font-semibold">{item.checkInTime} / {item.checkOutTime}</td>
                <td className="py-4 px-6">
                  {item.checkOutTime === '-' ? (
                    <button onClick={() => handleCheckout(item.id)} className="px-2 py-1 text-[11px] font-bold bg-[#0A6C54] text-white rounded hover:bg-[#085a46]">Checkout</button>
                  ) : (
                    <span className="text-[12px] text-gray-400 italic">Logged</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Record Vehicle Entry</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleRegister} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">License Plate No</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. DL-3C-AS-9921"
                  value={newVehicle.plateNo}
                  onChange={(e) => setNewVehicle({...newVehicle, plateNo: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] font-mono"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Owner Identity / Name</label>
                <input 
                  type="text" 
                  required
                  value={newVehicle.ownerName}
                  onChange={(e) => setNewVehicle({...newVehicle, ownerName: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Vehicle Category</label>
                  <select 
                    value={newVehicle.type} 
                    onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Staff 4-Wheeler">Staff 4-Wheeler</option>
                    <option value="Student 2-Wheeler">Student 2-Wheeler</option>
                    <option value="Visitor Vehicle">Visitor Vehicle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Parking Zone Allocation</label>
                  <select 
                    value={newVehicle.parkingZone} 
                    onChange={(e) => setNewVehicle({...newVehicle, parkingZone: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Staff Parking Area B">Staff Parking Area B</option>
                    <option value="Student Parking Zone A">Student Parking Zone A</option>
                    <option value="Visitor Slots C">Visitor Slots C</option>
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
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1"
                >
                  <Car size={15} /> Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
