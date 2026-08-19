import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Search, Download, Plus, AlertTriangle, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import SkeletonLoader from '../../components/SkeletonLoader';

const StockInventory = () => {
  const [search, setSearch] = useState('');
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStock, setNewStock] = useState({
    item: '',
    category: 'Grains',
    quantity: '',
    unit: 'kg',
    threshold: '',
  });

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/mess/inventory');
      setStock(res.data);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const filtered = stock.filter(item => {
    return item.item.toLowerCase().includes(search.toLowerCase());
  });

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await axiosInstance.post('/mess/inventory', {
        ...newStock,
        quantity: parseFloat(newStock.quantity),
        threshold: parseFloat(newStock.threshold)
      });
      toast.success(`Inventory updated for ${newStock.item}!`);
      setShowAddModal(false);
      setNewStock({ item: '', category: 'Grains', quantity: '', unit: 'kg', threshold: '' });
      fetchStock();
    } catch (error) {
      toast.error('Failed to update inventory');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, proceed!'
    });
    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/mess/inventory/${id}`);
        toast.success('Item deleted successfully');
        fetchStock();
      } catch (error) {
        toast.error('Error deleting item');
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Raw Food Stock & Inventory</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify kitchen storage reserves, track inwards, and monitor low supplies</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Stock List
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Add Stock (Inward)
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search raw items (e.g. Rice, Flour, Oil)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        {loading ? (
          <SkeletonLoader type="table" rows={6} cols={6} />
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-[13px]">No inventory items found.</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Item Name</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Category</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Available Stock</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Minimum Alert Limit</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const status = item.quantity <= item.threshold ? 'Low Stock' : 'In Stock';
                return (
                  <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.item}</td>
                    <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.category}</td>
                    <td className="py-4 px-6 text-[13px] text-center font-bold text-gray-900">{item.quantity} {item.unit}</td>
                    <td className="py-4 px-6 text-[13px] text-center font-semibold text-gray-500">{item.threshold} {item.unit}</td>
                    <td className="py-4 px-6 text-[13px]">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        status === 'In Stock' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="py-4 px-6 flex gap-2">
                      <button onClick={() => handleDelete(item._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors" title="Delete Item"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Record Stock Inward</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddStock} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Item Name</label>
                <input 
                  type="text" 
                  required
                  value={newStock.item}
                  onChange={(e) => setNewStock({...newStock, item: e.target.value})}
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
                    <option value="Grains">Grains</option>
                    <option value="Oils">Oils</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Spices">Spices</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Unit</label>
                  <select 
                    value={newStock.unit} 
                    onChange={(e) => setNewStock({...newStock, unit: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="kg">kg</option>
                    <option value="Liters">Liters</option>
                    <option value="Bags">Bags</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Quantity Received</label>
                  <input 
                    type="number" 
                    required
                    value={newStock.quantity}
                    onChange={(e) => setNewStock({...newStock, quantity: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Minimum Alert Level</label>
                  <input 
                    type="number" 
                    required
                    value={newStock.threshold}
                    onChange={(e) => setNewStock({...newStock, threshold: e.target.value})}
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
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] disabled:opacity-50 text-white rounded-lg text-[13px] font-semibold"
                >
                  {isSubmitting ? 'Saving...' : 'Record Inward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockInventory;
