import React, { useState } from 'react';
import { Search, Download, Plus, AlertCircle, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

const initialAssets = [
  { id: 1, name: 'Single Wooden Bed', category: 'Furniture', total: 200, occupied: 180, damaged: 5, status: 'In Stock' },
  { id: 2, name: 'Standard Mattress', category: 'Bedding', total: 200, occupied: 180, damaged: 2, status: 'In Stock' },
  { id: 3, name: 'Study Table', category: 'Furniture', total: 200, occupied: 180, damaged: 8, status: 'In Stock' },
  { id: 4, name: 'Study Chair (Plastic)', category: 'Furniture', total: 200, occupied: 180, damaged: 12, status: 'Low Stock' },
  { id: 5, name: 'Ceiling Fan 48"', category: 'Electrical', total: 150, occupied: 142, damaged: 3, status: 'In Stock' },
];

const Inventory = () => {
  const [search, setSearch] = useState('');
  const [assets, setAssets] = useState(initialAssets);
  const [showReqModal, setShowReqModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    assetName: 'Study Chair (Plastic)',
    qty: '',
    reason: '',
  });

  const filtered = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleSendRequest = (e) => {
    e.preventDefault();
    setShowReqModal(false);
    toast.success(`Purchase replacement request submitted for ${newRequest.qty} ${newRequest.assetName}!`);
    setNewRequest({
      assetName: 'Study Chair (Plastic)',
      qty: '',
      reason: '',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Hostel Inventory & Assets</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Monitor bed frames, study desks, electrical fans, and request purchase updates</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Inventory
          </button>
          <button onClick={() => setShowReqModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Asset Request
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by asset name..." 
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
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Asset Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Category</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Total Registered</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Issued / Occupied</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Damaged / Broken</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Stock Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.name}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.category}</td>
                <td className="py-4 px-6 text-[13px] text-center font-bold text-gray-900">{item.total}</td>
                <td className="py-4 px-6 text-[13px] text-center font-semibold text-gray-700">{item.occupied}</td>
                <td className="py-4 px-6 text-[13px] text-center font-bold text-red-500">{item.damaged}</td>
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

      {/* Asset request modal */}
      {showReqModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Replacement / Purchase Request</h3>
              <button onClick={() => setShowReqModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleSendRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Select Asset Head</label>
                <select 
                  value={newRequest.assetName} 
                  onChange={(e) => setNewRequest({...newRequest, assetName: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                >
                  {assets.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Quantity Requested</label>
                <input 
                  type="number" 
                  required
                  value={newRequest.qty}
                  onChange={(e) => setNewRequest({...newRequest, qty: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Justification Reason</label>
                <textarea 
                  required
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({...newRequest, reason: e.target.value})}
                  placeholder="e.g. Broken desk chairs in Block B room audits"
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-24 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowReqModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold"
                >
                  Submit Request
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
