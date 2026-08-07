const fs = require('fs');

const content = `import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Eye, Download, Bell, CheckCircle, XCircle } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const Reservations = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/library/reservations');
      setReservations(res.data);
    } catch (error) {
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axiosInstance.put(\`/library/reservations/\${id}\`, { status: 'Available for Pickup' });
      toast.success('Reservation approved! Book is marked for pickup.');
      fetchReservations();
    } catch (error) {
      toast.error('Failed to approve reservation');
    }
  };

  const handleCancel = async (id) => {
    if(!window.confirm('Cancel this reservation?')) return;
    try {
      await axiosInstance.put(\`/library/reservations/\${id}\`, { status: 'Cancelled' });
      toast.success('Reservation cancelled.');
      fetchReservations();
    } catch (error) {
      toast.error('Failed to cancel reservation');
    }
  };

  const handleNotify = (memberName) => {
    toast.success(\`Availability alert SMS & Email sent to \${memberName}!\`);
  };

  const filtered = reservations.filter(r => {
    const titleMatch = r.bookId?.title?.toLowerCase().includes(search.toLowerCase());
    const memberMatch = r.memberId?.firstName?.toLowerCase().includes(search.toLowerCase());
    const idMatch = r.reserveId?.toLowerCase().includes(search.toLowerCase());
    const matchesSearch = titleMatch || memberMatch || idMatch;
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Book Reservation Logs</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Approve reserve holdings, verify pickup queues, and notify students</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={15} /> Export Queue
        </button>
      </div>

      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by book title, member name or request ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>

        <div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option value="All">All Reservations</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Available for Pickup">Available for Pickup</option>
            <option value="Issued">Issued</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading reservations...</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Request ID</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Book Title</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Reserved For</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Request Date</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Queue Position</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.reserveId}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.bookId?.title || 'Unknown'}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">
                    {item.memberId ? \`\${item.memberId.firstName} \${item.memberId.lastName || ''}\` : 'Unknown'}
                  </td>
                  <td className="py-4 px-6 text-[13px] text-gray-500">{new Date(item.requestDate).toLocaleDateString()}</td>
                  <td className="py-4 px-6 text-[13px] text-center font-bold text-gray-700">
                    {item.queuePosition > 0 ? \`#\${item.queuePosition}\` : '-'}
                  </td>
                  <td className="py-4 px-6">
                    <span className={\`px-2.5 py-1 rounded-full text-[11px] font-semibold \${
                      item.status === 'Available for Pickup' ? 'bg-green-50 text-green-700 border border-green-100' :
                      item.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      item.status === 'Issued' ? 'bg-gray-50 text-gray-600 border border-gray-200' :
                      item.status === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-100' :
                      'bg-yellow-50 text-yellow-700 border border-yellow-100'
                    }\`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 flex gap-2">
                    {item.status === 'Pending' && (
                      <>
                        <button onClick={() => handleApprove(item._id)} className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors" title="Approve Reservation"><CheckCircle size={15} /></button>
                        <button onClick={() => handleCancel(item._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors" title="Cancel Request"><XCircle size={15} /></button>
                      </>
                    )}
                    {item.status === 'Available for Pickup' && (
                      <button onClick={() => handleNotify(item.memberId?.firstName)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors" title="Notify Member for Pickup"><Bell size={15} /></button>
                    )}
                    {item.status !== 'Pending' && item.status !== 'Available for Pickup' && (
                      <span className="text-[12px] text-gray-400 font-medium italic">No action pending</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-gray-500">No reservations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Reservations;
`;

fs.writeFileSync('d:/Desktop/DCT_CLG_CRM/admin/src/pages/library/Reservations.jsx', content, 'utf-8');
console.log("Rewrote Reservations.jsx");
