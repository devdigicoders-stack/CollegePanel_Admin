import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Eye, Download } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import { CheckCircle } from 'lucide-react';

const categories = ['All', 'Electricity', 'Maintenance', 'Stationery', 'Lab equipment', 'Transport', 'Events', 'Internet', 'Office expenses'];

const VendorPayments = () => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [newPayment, setNewPayment] = useState({
    vendor: '',
    invoiceNo: '',
    amount: '',
    category: 'Stationery',
    dueDate: '',
    description: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterCategory !== 'All') params.category = filterCategory;
      if (filterStatus !== 'All') params.status = filterStatus;
      const res = await axiosInstance.get('/fees/vendor-payments', { params });
      setData(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to fetch vendor payments');
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, filterStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/fees/vendor-payments', newPayment);
      toast.success('Vendor invoice added successfully');
      setShowModal(false);
      setNewPayment({
        vendor: '',
        invoiceNo: '',
        amount: '',
        category: 'Stationery',
        dueDate: '',
        description: '',
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add vendor invoice');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/fees/vendor-payments/${id}`, { status });
      toast.success(`Payment status updated to ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  const filtered = data.filter(item => {
    const matchesSearch = item.vendor?.toLowerCase().includes(search.toLowerCase()) || 
                          item.invoiceNo?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Vendor Payments</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Manage vendors, purchase invoices, and outgoing payments</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => toast.success('Exporting...')} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export
          </button>
          <button onClick={() => setShowModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Add Invoice
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by vendor or invoice number..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>

        <div className="flex gap-3">
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={8} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Invoice No</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Vendor</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Category</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Amount</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Due Date</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Payment Date</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id || item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.invoiceNo}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-medium">{item.vendor}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.category}</td>
                  <td className="py-4 px-6 text-[13px] font-bold text-gray-900">₹{(item.amount || 0).toLocaleString()}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-500">{item.dueDate}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-500">{item.datePaid || '-'}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      item.status === 'Paid' ? 'bg-green-50 text-green-700 border border-green-100' :
                      item.status === 'Partial' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                      item.status === 'Overdue' ? 'bg-red-50 text-red-700 border border-red-100' :
                      'bg-yellow-50 text-yellow-700 border border-yellow-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 flex gap-2">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"><Eye size={15} /></button>
                    <button onClick={() => handleUpdateStatus(item._id || item.id, 'Paid')} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Mark Paid"><CheckCircle size={15} /></button>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-gray-500 text-[13px]">No vendor payments found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Add Vendor Invoice</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Vendor Name</label>
                <input 
                  type="text" 
                  required
                  value={newPayment.vendor}
                  onChange={(e) => setNewPayment({...newPayment, vendor: e.target.value})}
                  placeholder="e.g. Shree Stationary Mart"
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Invoice Number</label>
                  <input 
                    type="text" 
                    required
                    value={newPayment.invoiceNo}
                    onChange={(e) => setNewPayment({...newPayment, invoiceNo: e.target.value})}
                    placeholder="e.g. INV-2024-001"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Category</label>
                  <select 
                    value={newPayment.category} 
                    onChange={(e) => setNewPayment({...newPayment, category: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Amount (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                    placeholder="0"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Due Date</label>
                  <input 
                    type="date" 
                    required
                    value={newPayment.dueDate}
                    onChange={(e) => setNewPayment({...newPayment, dueDate: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Description</label>
                <textarea 
                  value={newPayment.description}
                  onChange={(e) => setNewPayment({...newPayment, description: e.target.value})}
                  placeholder="Details of the items purchased..."
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-20 resize-none focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold"
                >
                  Add Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorPayments;

