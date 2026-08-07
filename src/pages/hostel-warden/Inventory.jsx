import React, { useState, useEffect } from 'react';
import { Search, Download, Plus, AlertCircle, ShoppingCart, CheckCircle, PenTool, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';
import SkeletonLoader from '../../components/SkeletonLoader';

const CATEGORIES = ['Furniture', 'Bedding', 'Electrical', 'Plumbing', 'Cleaning', 'Other'];
const CONDITIONS = ['Good', 'Needs Repair', 'Damaged'];

const Inventory = () => {
  if (!checkPermission('Manage Rooms')) {
    return <AccessDenied />;
  }
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterCondition, setFilterCondition] = useState('All');
  const [assets, setAssets] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newAsset, setNewAsset] = useState({
    itemName: '', category: 'Furniture', quantity: 1, condition: 'Good', roomId: '', remarks: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, roomsRes] = await Promise.all([
        axiosInstance.get('/hostel/inventory'),
        axiosInstance.get('/hostel/rooms')
      ]);
      setAssets(invRes.data || []);
      setRooms(roomsRes.data?.rooms || []);
    } catch {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────
  const totalAssets = assets.reduce((sum, a) => sum + a.quantity, 0);
  const damagedCount = assets.filter(a => a.condition === 'Damaged').length;
  const repairCount = assets.filter(a => a.condition === 'Needs Repair').length;

  // ── Filter ─────────────────────────────────────────────────────────
  const filtered = assets.filter(a => {
    const nameMatch = a.itemName?.toLowerCase().includes(search.toLowerCase());
    const catMatch = filterCategory === 'All' || a.category === filterCategory;
    const condMatch = filterCondition === 'All' || a.condition === filterCondition;
    return nameMatch && catMatch && condMatch;
  });

  // ── Add Asset ──────────────────────────────────────────────────────
  const handleAddAsset = async (e) => {
    e.preventDefault();
    if (!newAsset.itemName || newAsset.quantity < 1) return toast.error('Check required fields');
    try {
      setSubmitting(true);
      const res = await axiosInstance.post('/hostel/inventory', newAsset);
      const created = res.data.asset || res.data;
      setAssets(prev => [created, ...prev]);
      toast.success(`Asset "${created.itemName}" added`);
      setShowAddModal(false);
      setNewAsset({ itemName: '', category: 'Furniture', quantity: 1, condition: 'Good', roomId: '', remarks: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding asset');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Update Condition ───────────────────────────────────────────────
  const handleUpdateCondition = async (id, condition) => {
    try {
      const res = await axiosInstance.put(`/hostel/inventory/${id}`, { condition });
      const updated = res.data.asset || res.data;
      setAssets(prev => prev.map(a => a._id === id ? { ...a, condition: updated.condition } : a));
      toast.success(`Marked as ${condition}`);
    } catch {
      toast.error('Failed to update condition');
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────
  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: 'Delete Asset?',
      html: `Are you sure you want to delete <strong>${item.itemName}</strong> from inventory?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    });
    if (!result.isConfirmed) return;
    try {
      await axiosInstance.delete(`/hostel/inventory/${item._id}`);
      setAssets(prev => prev.filter(a => a._id !== item._id));
      toast.success('Asset deleted successfully');
    } catch {
      toast.error('Failed to delete asset');
    }
  };

  // ── Export ─────────────────────────────────────────────────────────
  const handleExport = () => {
    if (filtered.length === 0) return toast.error('No data to export');
    const data = filtered.map(a => ({
      'Asset Name': a.itemName,
      'Category': a.category,
      'Quantity': a.quantity,
      'Condition': a.condition,
      'Room Assigned': a.roomId ? `${a.roomId.blockName} - Room ${a.roomId.roomNumber}` : 'General / Storage',
      'Remarks': a.remarks || '',
      'Date Added': a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-IN') : ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, `Hostel_Inventory_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.xlsx`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Hostel Inventory & Assets</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Manage furniture, electrical appliances, and facility equipment</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={14} /> Export
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={15} /> Add Asset
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><ShoppingCart size={16} /></div>
          <div><p className="text-[11px] sm:text-[10px] text-gray-500 font-medium">Total Assets (Qty)</p><p className="text-[18px] sm:text-[17px] font-bold text-blue-700">{totalAssets}</p></div>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600"><PenTool size={15} /></div>
          <div><p className="text-[11px] sm:text-[10px] text-gray-500 font-medium">Needs Repair</p><p className="text-[18px] sm:text-[17px] font-bold text-orange-700">{repairCount} Items</p></div>
        </div>
        <div className="bg-red-50 rounded-xl p-3 flex items-center gap-3 border border-red-100/30">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600"><AlertCircle size={15} /></div>
          <div><p className="text-[11px] sm:text-[10px] text-gray-500 font-medium">Damaged</p><p className="text-[18px] sm:text-[17px] font-bold text-red-700">{damagedCount} Items</p></div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-3 bg-gray-50/30">
        <div className="flex-1 w-full sm:min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search by asset name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>
        <div className="grid grid-cols-2 sm:flex gap-3 w-full sm:w-auto">
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full sm:w-auto bg-white border border-gray-200 text-gray-700 py-2.5 px-3 sm:px-4 rounded-lg text-[12px] sm:text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterCondition} onChange={(e) => setFilterCondition(e.target.value)}
            className="w-full sm:w-auto bg-white border border-gray-200 text-gray-700 py-2.5 px-3 sm:px-4 rounded-lg text-[12px] sm:text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
            <option value="All">All Conditions</option>
            {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={5} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Asset Name</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Category</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Qty</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Condition</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Location</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-6">
                    <p className="text-[13px] font-bold text-gray-800">{item.itemName}</p>
                    {item.remarks && <p className="text-[11px] text-gray-500 truncate max-w-[150px] mt-0.5" title={item.remarks}>{item.remarks}</p>}
                  </td>
                  <td className="py-3 px-6 text-[13px] font-semibold text-gray-600">{item.category}</td>
                  <td className="py-3 px-6 text-center">
                    <span className="text-[13px] font-bold bg-gray-100 px-2.5 py-1 rounded-md text-gray-700">{item.quantity}</span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      item.condition === 'Good' ? 'bg-green-50 text-green-700 border-green-200' :
                      item.condition === 'Needs Repair' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {item.condition}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    {item.roomId ? (
                      <div>
                        <p className="text-[12px] font-bold text-gray-700">{item.roomId.blockName}</p>
                        <p className="text-[11px] text-gray-500 font-semibold">Room {item.roomId.roomNumber}</p>
                      </div>
                    ) : (
                      <span className="text-[12px] text-gray-500 font-medium italic">General / Storage</span>
                    )}
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex justify-end gap-2 items-center">
                      <select
                        value={item.condition}
                        onChange={(e) => handleUpdateCondition(item._id, e.target.value)}
                        className="text-[11px] border border-gray-200 rounded p-1 font-semibold text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                      >
                        {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <button onClick={() => handleDelete(item)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Delete Asset">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-gray-400 text-[13px]">
                    {assets.length === 0 ? 'No assets found in inventory.' : 'No assets match your filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {assets.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 text-[12px] text-gray-400">
          Showing {filtered.length} of {assets.length} items
        </div>
      )}

      {/* ── Add Asset Modal ────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Add Inventory Asset</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <form onSubmit={handleAddAsset} className="p-6 space-y-4">
              {/* Asset Name */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Asset Name *</label>
                <input type="text" required placeholder="e.g. Study Table, Ceiling Fan"
                  value={newAsset.itemName}
                  onChange={(e) => setNewAsset({ ...newAsset, itemName: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Category *</label>
                  <select required value={newAsset.category} onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Condition *</label>
                  <select required value={newAsset.condition} onChange={(e) => setNewAsset({ ...newAsset, condition: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Quantity & Room */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Quantity *</label>
                  <input type="number" required min="1"
                    value={newAsset.quantity}
                    onChange={(e) => setNewAsset({ ...newAsset, quantity: parseInt(e.target.value) || '' })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Location / Room (Optional)</label>
                  <select value={newAsset.roomId} onChange={(e) => setNewAsset({ ...newAsset, roomId: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    <option value="">General Storage</option>
                    {rooms.map(r => (
                      <option key={r._id} value={r._id}>{r.blockName} - Room {r.roomNumber}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Remarks (Optional)</label>
                <textarea rows={2} placeholder="Serial numbers, notes..."
                  value={newAsset.remarks}
                  onChange={(e) => setNewAsset({ ...newAsset, remarks: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] resize-none focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] disabled:opacity-50 text-white rounded-lg text-[13px] font-semibold">
                  {submitting ? 'Saving...' : 'Save Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
