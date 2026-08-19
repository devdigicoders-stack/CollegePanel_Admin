import React, { useState } from 'react';
import { Search, Download, Plus, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const initialParcels = [
  { id: 1, trackingNo: 'TRK-992182', sender: 'DTDC Courier Service', receiver: 'HOD CSE Office', type: 'Department Parcel', date: '15-Feb', status: 'Pending Delivery' },
  { id: 2, trackingNo: 'TRK-882191', sender: 'Amazon Shipping', receiver: 'Jayesh Soni (Student)', type: 'Student Parcel', date: '15-Feb', status: 'Delivered', sign: 'Jayesh (Self)' },
];

const Courier = () => {
  const [search, setSearch] = useState('');
  const [parcels, setParcels] = useState(initialParcels);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newParcel, setNewParcel] = useState({
    trackingNo: '',
    sender: '',
    receiver: '',
    type: 'Department Parcel',
  });

  const filtered = parcels.filter(p => {
    return p.receiver.toLowerCase().includes(search.toLowerCase()) || 
           p.trackingNo.toLowerCase().includes(search.toLowerCase());
  });

  const handleAddParcel = (e) => {
    e.preventDefault();
    const itemToAdd = {
      id: parcels.length + 1,
      trackingNo: newParcel.trackingNo,
      sender: newParcel.sender,
      receiver: newParcel.receiver,
      type: newParcel.type,
      date: new Date().toLocaleDateString([], { day: '2-digit', month: 'short' }),
      status: 'Pending Delivery'
    };
    setParcels([itemToAdd, ...parcels]);
    setShowAddModal(false);
    toast.success(`Parcel logged for ${newParcel.receiver}!`);
    setNewParcel({
      trackingNo: '',
      sender: '',
      receiver: '',
      type: 'Department Parcel',
    });
  };

  const handleDeliver = (id) => {
    setParcels(parcels.map(p => p.id === id ? { ...p, status: 'Delivered', sign: 'Received' } : p));
    toast.success('Parcel status updated to Delivered.');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Courier & Parcel Registry</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Record incoming postages, track department allocations, and document signatures</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Registry
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Log Parcel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by receiver name or tracking ID..." 
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
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Tracking Code</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Courier Sender</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Receiver Allocation</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 font-semibold">Parcel Category</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Date Received</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 font-bold">Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-semibold text-primary">{item.trackingNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.sender}</td>
                <td className="py-4 px-6 text-[13px] text-gray-700 font-semibold">{item.receiver}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.type}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500 font-semibold">{item.date}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Delivered' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {item.status === 'Pending Delivery' ? (
                    <button onClick={() => handleDeliver(item.id)} className="px-2.5 py-1 text-[11px] font-bold bg-primary text-white rounded hover:bg-primary-hover flex items-center gap-1">
                      <Check size={12} /> Mark Delivered
                    </button>
                  ) : (
                    <span className="text-[12px] text-gray-400 italic">Signature: {item.sign}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Parcel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Log Incoming Postage</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddParcel} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Tracking Code / Number</label>
                <input 
                  type="text" 
                  required
                  value={newParcel.trackingNo}
                  onChange={(e) => setNewParcel({...newParcel, trackingNo: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Courier Sender</label>
                  <input 
                    type="text" 
                    required
                    value={newParcel.sender}
                    onChange={(e) => setNewParcel({...newParcel, sender: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Receiver Allocation</label>
                  <input 
                    type="text" 
                    required
                    value={newParcel.receiver}
                    onChange={(e) => setNewParcel({...newParcel, receiver: e.target.value})}
                    placeholder="Student or HOD name"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Parcel Category</label>
                <select 
                  value={newParcel.type} 
                  onChange={(e) => setNewParcel({...newParcel, type: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                >
                  <option value="Department Parcel">Department Parcel</option>
                  <option value="Student Parcel">Student Parcel</option>
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
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold"
                >
                  Log Parcel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courier;
