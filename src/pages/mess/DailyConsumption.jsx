import React, { useState } from 'react';
import { Search, Save, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const initialConsumption = [
  { id: 1, date: '2024-02-15', meal: 'Lunch', itemUsed: 'Basmati Rice', qtyUsed: 40, unit: 'kg', servedCount: 345, wastage: 2 },
  { id: 2, date: '2024-02-15', meal: 'Lunch', itemUsed: 'Mustard Oil', qtyUsed: 5, unit: 'Liters', servedCount: 345, wastage: 0 },
  { id: 3, date: '2024-02-15', meal: 'Breakfast', itemUsed: 'Wheat Flour (Atta)', qtyUsed: 35, unit: 'kg', servedCount: 312, wastage: 1.5 },
];

const DailyConsumption = () => {
  const [logs, setLogs] = useState(initialConsumption);
  const [showLogModal, setShowLogModal] = useState(false);
  const [newLog, setNewLog] = useState({
    meal: 'Lunch',
    itemUsed: 'Basmati Rice',
    qtyUsed: '',
    unit: 'kg',
    servedCount: '',
    wastage: '',
  });

  const handleLogConsumption = (e) => {
    e.preventDefault();
    const logToAdd = {
      id: logs.length + 1,
      date: new Date().toISOString().split('T')[0],
      meal: newLog.meal,
      itemUsed: newLog.itemUsed,
      qtyUsed: parseFloat(newLog.qtyUsed) || 0,
      unit: newLog.unit,
      servedCount: parseInt(newLog.servedCount) || 0,
      wastage: parseFloat(newLog.wastage) || 0,
    };
    setLogs([logToAdd, ...logs]);
    setShowLogModal(false);
    toast.success('Daily raw usage logged successfully!');
    setNewLog({
      meal: 'Lunch',
      itemUsed: 'Basmati Rice',
      qtyUsed: '',
      unit: 'kg',
      servedCount: '',
      wastage: '',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Daily Kitchen Consumption Logs</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify raw food wastage counts, log quantity used, and review students served</p>
        </div>
        <button onClick={() => setShowLogModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
          <Plus size={16} /> Log Usage
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Date</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Meal Session</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Raw Item Used</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Quantity Used</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Students Served</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Wastage / Garbage (kg)</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-500">{item.date}</td>
                <td className="py-4 px-6 text-[13px] text-[#0A6C54] font-bold">{item.meal}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-semibold">{item.itemUsed}</td>
                <td className="py-4 px-6 text-[13px] text-center font-bold text-gray-900">{item.qtyUsed} {item.unit}</td>
                <td className="py-4 px-6 text-[13px] text-center font-semibold text-gray-700">{item.servedCount} Students</td>
                <td className="py-4 px-6 text-[13px] text-center font-bold text-red-500">{item.wastage} kg</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Log Kitchen Usage</h3>
              <button onClick={() => setShowLogModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleLogConsumption} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Meal Session</label>
                  <select 
                    value={newLog.meal} 
                    onChange={(e) => setNewLog({...newLog, meal: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Raw Item</label>
                  <input 
                    type="text" 
                    required
                    value={newLog.itemUsed}
                    onChange={(e) => setNewLog({...newLog, itemUsed: e.target.value})}
                    placeholder="e.g. Basmati Rice"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Quantity Used</label>
                  <input 
                    type="number" 
                    required
                    value={newLog.qtyUsed}
                    onChange={(e) => setNewLog({...newLog, qtyUsed: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Unit</label>
                  <select 
                    value={newLog.unit} 
                    onChange={(e) => setNewLog({...newLog, unit: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="kg">kg</option>
                    <option value="Liters">Liters</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Students Served</label>
                  <input 
                    type="number" 
                    required
                    value={newLog.servedCount}
                    onChange={(e) => setNewLog({...newLog, servedCount: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Wastage Quantity (kg)</label>
                  <input 
                    type="number" 
                    required
                    value={newLog.wastage}
                    onChange={(e) => setNewLog({...newLog, wastage: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold"
                >
                  Post Usage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyConsumption;
