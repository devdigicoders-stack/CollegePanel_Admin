import React, { useState, useEffect } from 'react';
import { Search, Download, Plus, CheckCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import SkeletonLoader from '../../components/SkeletonLoader';

const PurchaseRequests = () => {
  const [search, setSearch] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRequest, setNewRequest] = useState({
    item: '',
    quantity: '',
    unit: 'kg',
    estimatedCost: '',
    vendor: 'Shree Grocery Distributors' // we'll just keep this hardcoded in UI for now, no vendor schema
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/mess/purchase-requests');
      setRequests(res.data);
    } catch (error) {
      toast.error('Failed to load purchase requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filtered = requests.filter(r => {
    return r.item.toLowerCase().includes(search.toLowerCase());
  });

  const handleAddRequest = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await axiosInstance.post('/mess/purchase-requests', {
        item: newRequest.item,
        quantity: parseFloat(newRequest.quantity),
        unit: newRequest.unit,
        estimatedCost: parseFloat(newRequest.estimatedCost),
        // we can store vendor in a custom field or skip it, since schema only requires item, qty, unit, cost
      });
      toast.success(`Purchase requisition submitted for ${newRequest.item}!`);
      setShowAddModal(false);
      setNewRequest({ item: '', quantity: '', unit: 'kg', estimatedCost: '', vendor: 'Shree Grocery Distributors' });
      fetchRequests();
    } catch (error) {
      toast.error('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/mess/purchase-requests/${id}/status`, { status });
      toast.success(`Request status updated to ${status}`);
      fetchRequests();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Kitchen Purchase Requisitions</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Configure item requests, estimated billing logs, and select supply vendors</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Requisitions
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Raise Requisition
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search items requested (e.g. Potatoes, LPG)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={6} />
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-[13px]">No purchase requests found.</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Raw Item Name</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Required Qty</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Est. Billing Cost</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Approval Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.item}</td>
                  <td className="py-4 px-6 text-[13px] text-center font-semibold text-gray-700">{item.quantity} {item.unit}</td>
                  <td className="py-4 px-6 text-[13px] text-right font-bold text-gray-900">₹{item.estimatedCost.toLocaleString()}</td>
                  <td className="py-4 px-6 text-[13px]">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      item.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 flex gap-2">
                    {item.status === 'Pending' && (
                      <button onClick={() => updateStatus(item._id, 'Approved')} className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors" title="Approve"><CheckCircle size={15} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Record New Requisition</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Raw Item Name</label>
                <input 
                  type="text" 
                  required
                  value={newRequest.item}
                  onChange={(e) => setNewRequest({...newRequest, item: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Required Quantity</label>
                  <input 
                    type="number" 
                    required
                    value={newRequest.quantity}
                    onChange={(e) => setNewRequest({...newRequest, quantity: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Unit</label>
                  <select 
                    value={newRequest.unit} 
                    onChange={(e) => setNewRequest({...newRequest, unit: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  >
                    <option value="kg">kg</option>
                    <option value="Liters">Liters</option>
                    <option value="Bags">Bags</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Estimated Cost (₹)</label>
                <input 
                  type="number" 
                  required
                  value={newRequest.estimatedCost}
                  onChange={(e) => setNewRequest({...newRequest, estimatedCost: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Select Supply Vendor</label>
                <select 
                  value={newRequest.vendor} 
                  onChange={(e) => setNewRequest({...newRequest, vendor: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                >
                  <option value="Shree Grocery Distributors">Shree Grocery Distributors</option>
                  <option value="Local Farmer Mandi">Local Farmer Mandi</option>
                  <option value="HP Gas Agencies">HP Gas Agencies</option>
                </select>
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
                  {isSubmitting ? 'Saving...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseRequests;
