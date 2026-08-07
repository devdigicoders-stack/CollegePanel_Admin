const fs = require('fs');
const path = require('path');

const filepath = path.join('d:', 'Desktop', 'DCT_CLG_CRM', 'admin', 'src', 'pages', 'hostel-warden', 'Inventory.jsx');

const content = `import React, { useState, useEffect } from 'react';
import { Search, Download, Plus, AlertCircle, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../../utils/axiosInstance';

const Inventory = () => {
  const [search, setSearch] = useState('');
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReqModal, setShowReqModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
    itemName: '',
    category: 'Furniture',
    quantity: '',
    condition: 'Good',
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/hostel/inventory');
      setAssets(res.data || []);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const filtered = assets.filter(a => {
    return a.itemName?.toLowerCase().includes(search.toLowerCase());
  });

  const handleAddAsset = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/hostel/inventory', newAsset);
      setShowReqModal(false);
      toast.success(\`Asset \${newAsset.itemName} added successfully!\`);
      setNewAsset({
        itemName: '',
        category: 'Furniture',
        quantity: '',
        condition: 'Good',
      });
      fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding asset');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Hostel Inventory & Assets</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Monitor bed frames, study desks, electrical fans, and add new assets</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Inventory
          </button>
          <button onClick={() => setShowReqModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Add Asset
          </button>
        </div>
      </div>

      <div className="p-6 border-b border-gray-100 bg-gray-50/30">
        <div className="relative max-w-md">
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

      <div className="overflow-x-auto flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">Loading inventory...</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Asset Name</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Category</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Quantity</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Condition</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Room (if assigned)</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Date Added</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.itemName}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.category}</td>
                  <td className="py-4 px-6 text-[13px] text-center font-bold text-gray-900">{item.quantity}</td>
                  <td className="py-4 px-6 text-[13px] text-center">
                    <span className={\`px-2.5 py-1 rounded-full text-[11px] font-semibold \${
                      item.condition === 'Good' ? 'bg-green-50 text-green-700 border border-green-100' : 
                      item.condition === 'Needs Repair' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                      'bg-red-50 text-red-700 border border-red-100'
                    }\`}>
                      {item.condition}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">{item.roomId ? \`\${item.roomId.blockName} - \${item.roomId.roomNumber}\` : 'Unassigned (Storage)'}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500 text-[13px]">No assets found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showReqModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Add Inventory Asset</h3>
              <button onClick={() => setShowReqModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddAsset} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Asset Name</label>
                <input 
                  type="text" 
                  required
                  value={newAsset.itemName}
                  onChange={(e) => setNewAsset({...newAsset, itemName: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Category</label>
                  <select 
                    value={newAsset.category} 
                    onChange={(e) => setNewAsset({...newAsset, category: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="Furniture">Furniture</option>
                    <option value="Bedding">Bedding</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Condition</label>
                  <select 
                    value={newAsset.condition} 
                    onChange={(e) => setNewAsset({...newAsset, condition: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="Good">Good</option>
                    <option value="Needs Repair">Needs Repair</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Quantity Added</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={newAsset.quantity}
                  onChange={(e) => setNewAsset({...newAsset, quantity: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
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

export default Inventory;
`;

fs.writeFileSync(filepath, content, 'utf-8');
console.log("Rewrote Inventory.jsx");
