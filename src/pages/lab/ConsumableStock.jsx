import React, { useState } from 'react';
import { Search, Download, Plus, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const initialStock = [
  { id: 1, name: 'Connecting Copper Wires', category: 'Electrical', qty: 25, unit: 'Rolls', minLevel: 5, status: 'In Stock' },
  { id: 2, name: 'AND Gate IC 7408', category: 'Electronics', qty: 150, unit: 'Units', minLevel: 20, status: 'In Stock' },
  { id: 3, name: 'Resistor 10k Ohm', category: 'Electronics', qty: 1200, unit: 'Units', minLevel: 100, status: 'In Stock' },
  { id: 4, name: 'Hydrochloric Acid (HCl)', category: 'Chemicals', qty: 2, unit: 'Liters', minLevel: 5, status: 'Low Stock' },
  { id: 5, name: 'Printer Cartridges HP 12A', category: 'Office', qty: 1, unit: 'Units', minLevel: 2, status: 'Low Stock' },
];

const ConsumableStock = () => {
  const [search, setSearch] = useState('');
  const [stock, setStock] = useState(initialStock);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStock, setNewStock] = useState({
    name: '',
    category: 'Electronics',
    qty: '',
    unit: 'Units',
    minLevel: '',
  });

  const filtered = stock.filter(item => {
    return item.name.toLowerCase().includes(search.toLowerCase());
  });

  const handleAddStock = (e) => {
    e.preventDefault();
    const qtyVal = parseFloat(newStock.qty) || 0;
    const minVal = parseFloat(newStock.minLevel) || 0;
    const status = qtyVal <= minVal ? 'Low Stock' : 'In Stock';

    const itemToAdd = {
      id: stock.length + 1,
      name: newStock.name,
      category: newStock.category,
      qty: qtyVal,
      unit: newStock.unit,
      minLevel: minVal,
      status
    };
    setStock([...stock, itemToAdd]);
    setShowAddModal(false);
    toast.success(`Inventory updated for ${newStock.name}!`);
    setNewStock({
      name: '',
      category: 'Electronics',
      qty: '',
      unit: 'Units',
      minLevel: '',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Consumable Materials Inventory</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify connection cables, IC elements, chemical volumes, and record purchase lists</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Inventory
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Record Material Inward
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search material items (e.g. Wires, ICs, Chemicals)..." 
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
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Material Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Category</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Available Stock</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Minimum Alert Limit</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Stock Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.name}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.category}</td>
                <td className="py-4 px-6 text-[13px] text-center font-bold text-gray-900">{item.qty} {item.unit}</td>
                <td className="py-4 px-6 text-[13px] text-center font-semibold text-gray-500">{item.minLevel} {item.unit}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'In Stock' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Record Material Inward</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddStock} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Material Name</label>
                <input 
                  type="text" 
                  required
                  value={newStock.name}
                  onChange={(e) => setNewStock({...newStock, name: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Category</label>
                  <select 
                    value={newStock.category} 
                    onChange={(e) => setNewStock({...newStock, category: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Chemicals">Chemicals</option>
                    <option value="Office">Office</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Unit</label>
                  <select 
                    value={newStock.unit} 
                    onChange={(e) => setNewStock({...newStock, unit: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="Units">Units</option>
                    <option value="Rolls">Rolls</option>
                    <option value="Liters">Liters</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Quantity Received</label>
                  <input 
                    type="number" 
                    required
                    value={newStock.qty}
                    onChange={(e) => setNewStock({...newStock, qty: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Minimum Alert Level</label>
                  <input 
                    type="number" 
                    required
                    value={newStock.minLevel}
                    onChange={(e) => setNewStock({...newStock, minLevel: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
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
                  Record Inward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumableStock;
