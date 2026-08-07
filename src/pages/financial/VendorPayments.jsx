import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Eye, Edit2, ChevronDown, X, RefreshCw, CheckCircle, XCircle, AlertCircle, Banknote } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const statusColors = {
  Paid:      'bg-green-50 text-green-700 border border-green-100',
  Pending:   'bg-yellow-50 text-yellow-700 border border-yellow-100',
  Overdue:   'bg-red-50 text-red-600 border border-red-100',
  Cancelled: 'bg-gray-100 text-gray-500 border border-gray-200',
};

const catColors = {
  Electricity:      'bg-yellow-50 text-yellow-700',
  Maintenance:      'bg-orange-50 text-orange-700',
  Stationery:       'bg-blue-50 text-blue-700',
  'Lab equipment':  'bg-purple-50 text-purple-700',
  Transport:        'bg-teal-50 text-teal-700',
  Events:           'bg-pink-50 text-pink-700',
  Internet:         'bg-indigo-50 text-indigo-700',
  'Office expenses':'bg-gray-100 text-gray-700',
};

const categories = ['Electricity', 'Maintenance', 'Stationery', 'Lab equipment', 'Transport', 'Events', 'Internet', 'Office expenses'];
const payModes   = ['Bank Transfer', 'Cash', 'Cheque', 'UPI', 'Card'];
const statuses   = ['Pending', 'Paid', 'Overdue', 'Cancelled'];

const emptyForm = {
  vendor: '', invoiceNo: '', amount: '', category: 'Stationery',
  dueDate: '', mode: 'Bank Transfer', description: '',
};

const VendorPayments = () => {
  if (!checkPermission('View Fee Reports')) {
    return <AccessDenied />;
  }
  const [search, setSearch]               = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus]   = useState('All');
  const [showModal, setShowModal]         = useState(false);
  const [editItem, setEditItem]           = useState(null);
  const [viewItem, setViewItem]           = useState(null);
  const [payModal, setPayModal]           = useState(null); // for mark-as-paid with datePaid
  const [payDate, setPayDate]             = useState(new Date().toISOString().split('T')[0]);
  const [payMode, setPayMode]             = useState('Bank Transfer');
  const [loading, setLoading]             = useState(true);
  const [submitting, setSubmitting]       = useState(false);
  const [data, setData]                   = useState([]);
  const [form, setForm]                   = useState(emptyForm);

  /* ─── fetch ─── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)                    params.search   = search;
      if (filterCategory !== 'All') params.category = filterCategory;
      if (filterStatus   !== 'All') params.status   = filterStatus;
      const res = await axiosInstance.get('/fees/vendor-payments', { params });
      setData(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to fetch vendor payments');
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ─── open modals ─── */
  const openAdd = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      vendor:      item.vendor,
      invoiceNo:   item.invoiceNo,
      amount:      item.amount,
      category:    item.category || 'Stationery',
      dueDate:     item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : '',
      mode:        item.mode || 'Bank Transfer',
      description: item.description || '',
    });
    setShowModal(true);
  };

  /* ─── submit add/edit ─── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vendor.trim()) return toast.error('Vendor name is required');
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter a valid amount');
    if (!form.dueDate) return toast.error('Due date is required');

    setSubmitting(true);
    try {
      if (editItem) {
        await axiosInstance.put(`/fees/vendor-payments/${editItem._id || editItem.id}`, form);
        toast.success('Invoice updated successfully');
      } else {
        await axiosInstance.post('/fees/vendor-payments', form);
        toast.success('Vendor invoice added successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save invoice');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── mark as paid ─── */
  const handleMarkPaid = async () => {
    try {
      await axiosInstance.put(`/fees/vendor-payments/${payModal._id || payModal.id}`, {
        status: 'Paid', datePaid: payDate, mode: payMode,
      });
      toast.success('Payment recorded successfully');
      setPayModal(null);
      fetchData();
    } catch {
      toast.error('Failed to mark as paid');
    }
  };

  /* ─── quick status ─── */
  const handleStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/fees/vendor-payments/${id}`, { status });
      toast.success(`Status updated to ${status}`);
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  /* ─── stats ─── */
  const totalAmount  = data.reduce((s, d) => s + (d.amount || 0), 0);
  const paidAmount   = data.filter(d => d.status === 'Paid').reduce((s, d) => s + (d.amount || 0), 0);
  const unpaidAmount = data.filter(d => d.status !== 'Paid' && d.status !== 'Cancelled').reduce((s, d) => s + (d.amount || 0), 0);
  const overdueCount = data.filter(d => d.status === 'Overdue').length;
  const formatDate   = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';
  const fd = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // Check for overdue
  const isOverdue = (item) => item.status === 'Pending' && new Date(item.dueDate) < new Date();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">

      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Vendor Payments</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Manage vendor invoices, outgoing payments and track dues</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button onClick={openAdd} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Add Invoice
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Invoiced',  value: `₹${totalAmount.toLocaleString()}`,  color: 'bg-blue-50 text-blue-700',    sub: `${data.length} invoices` },
          { label: 'Paid',           value: `₹${paidAmount.toLocaleString()}`,    color: 'bg-green-50 text-green-700',  sub: `${data.filter(d=>d.status==='Paid').length} settled` },
          { label: 'Unpaid / Due',   value: `₹${unpaidAmount.toLocaleString()}`,  color: 'bg-orange-50 text-orange-700',sub: 'Pending settlement' },
          { label: 'Overdue',        value: overdueCount,                          color: 'bg-red-50 text-red-700',      sub: 'Requires attention' },
        ].map(c => (
          <div key={c.label} className={`${c.color} rounded-xl p-4`}>
            <p className="text-[11px] font-medium opacity-70 mb-1">{c.label}</p>
            <p className="text-[22px] font-black">{c.value}</p>
            <p className="text-[10px] opacity-60 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by vendor or invoice number..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
        {[
          { val: filterCategory, set: setFilterCategory, opts: ['All', ...categories] },
          { val: filterStatus,   set: setFilterStatus,   opts: ['All', ...statuses] },
        ].map((f, i) => (
          <div key={i} className="relative">
            <select value={f.val} onChange={e => f.set(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
              {f.opts.map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1 p-4">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={8} />
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
              <Banknote size={22} className="text-gray-300" />
            </div>
            <p className="text-gray-500 text-[14px] font-medium">No vendor invoices found</p>
            <p className="text-gray-400 text-[12px] mt-1">Click "Add Invoice" to create one</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                {['Invoice No', 'Vendor', 'Category', 'Amount', 'Due Date', 'Paid On', 'Mode', 'Status', 'Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(item => {
                const overdue = isOverdue(item);
                return (
                  <tr key={item._id || item.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${overdue ? 'bg-red-50/30' : ''}`}>
                    <td className="py-3 px-4 text-[13px] font-bold text-[#0A6C54] whitespace-nowrap">{item.invoiceNo}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="text-[13px] font-semibold text-gray-800">{item.vendor}</p>
                      {item.description && <p className="text-[11px] text-gray-400 max-w-[120px] truncate">{item.description}</p>}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${catColors[item.category] || 'bg-gray-50 text-gray-600'}`}>
                        {item.category || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[13px] font-bold text-gray-900 whitespace-nowrap">₹{(item.amount || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-[13px] ${overdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                        {formatDate(item.dueDate)}
                        {overdue && <span className="ml-1 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">OVERDUE</span>}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[13px] text-gray-500 whitespace-nowrap">{item.datePaid ? formatDate(item.datePaid) : '—'}</td>
                    <td className="py-3 px-4 text-[13px] text-gray-500 whitespace-nowrap">{item.mode || '—'}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[item.status] || 'bg-gray-50 text-gray-600'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        <button onClick={() => setViewItem(item)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500" title="View">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        {item.status !== 'Paid' && item.status !== 'Cancelled' && (
                          <button onClick={() => { setPayModal(item); setPayDate(new Date().toISOString().split('T')[0]); setPayMode('Bank Transfer'); }}
                            className="p-1.5 hover:bg-green-50 rounded-lg text-green-600" title="Mark as Paid">
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {item.status === 'Pending' && overdue && (
                          <button onClick={() => handleStatus(item._id || item.id, 'Overdue')} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500" title="Mark Overdue">
                            <AlertCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-[16px] font-bold text-gray-800">{editItem ? 'Edit Invoice' : 'Add Vendor Invoice'}</h3>
                <p className="text-[12px] text-gray-500 mt-0.5">{editItem ? `Editing ${editItem.invoiceNo}` : 'Enter invoice details'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Vendor Name <span className="text-red-500">*</span></label>
                <input type="text" required placeholder="e.g. Shree Stationery Mart" value={form.vendor} onChange={fd('vendor')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Invoice Number <span className="text-red-500">*</span></label>
                <input type="text" required placeholder="INV-2024-001" value={form.invoiceNo} onChange={fd('invoiceNo')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Category</label>
                <div className="relative">
                  <select value={form.category} onChange={fd('category')}
                    className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Amount (₹) <span className="text-red-500">*</span></label>
                <input type="number" min="1" required placeholder="0" value={form.amount} onChange={fd('amount')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Due Date <span className="text-red-500">*</span></label>
                <input type="date" required value={form.dueDate} onChange={fd('dueDate')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Payment Mode</label>
                <div className="relative">
                  <select value={form.mode} onChange={fd('mode')}
                    className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {payModes.map(m => <option key={m}>{m}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea rows={2} placeholder="Details of purchased items..." value={form.description} onChange={fd('description')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] resize-none focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="bg-[#0A6C54] hover:bg-[#085a46] disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-colors">
                  {submitting ? 'Saving...' : (editItem ? 'Save Changes' : 'Add Invoice')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark as Paid Modal */}
      {payModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-gray-800">Record Payment</h3>
              <button onClick={() => setPayModal(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-center">
                <p className="text-[12px] text-gray-500 font-medium">Paying to <span className="font-bold text-gray-800">{payModal.vendor}</span></p>
                <p className="text-[28px] font-black text-[#0A6C54] mt-1">₹{(payModal.amount || 0).toLocaleString()}</p>
                <p className="text-[11px] text-gray-500 mt-1">{payModal.invoiceNo}</p>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Payment Date</label>
                <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Payment Mode</label>
                <div className="relative">
                  <select value={payMode} onChange={e => setPayMode(e.target.value)}
                    className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {payModes.map(m => <option key={m}>{m}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setPayModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleMarkPaid} className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold transition-colors flex items-center justify-center gap-2">
                  <CheckCircle size={15} /> Confirm Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-gray-800">Invoice Details</h3>
                <p className="text-[12px] text-[#0A6C54] font-semibold mt-0.5">{viewItem.invoiceNo}</p>
              </div>
              <button onClick={() => setViewItem(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-5 text-center border border-orange-100">
                <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">Invoice Amount</p>
                <p className="text-[36px] font-black text-gray-900 mt-1">₹{(viewItem.amount || 0).toLocaleString()}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[11px] font-semibold ${statusColors[viewItem.status] || ''}`}>{viewItem.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Vendor',       viewItem.vendor],
                  ['Category',     viewItem.category || '—'],
                  ['Due Date',     formatDate(viewItem.dueDate)],
                  ['Paid On',      viewItem.datePaid ? formatDate(viewItem.datePaid) : '—'],
                  ['Payment Mode', viewItem.mode || '—'],
                  ['Description',  viewItem.description || '—'],
                ].map(([label, val]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
                    <p className="text-[13px] font-semibold text-gray-800 mt-0.5 break-words">{val}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                {viewItem.status !== 'Paid' && viewItem.status !== 'Cancelled' && (
                  <button onClick={() => { setViewItem(null); setPayModal(viewItem); setPayDate(new Date().toISOString().split('T')[0]); setPayMode('Bank Transfer'); }}
                    className="flex-1 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 text-[13px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                    <CheckCircle size={15} /> Mark Paid
                  </button>
                )}
                <button onClick={() => { setViewItem(null); openEdit(viewItem); }}
                  className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[13px] font-semibold rounded-lg transition-colors">
                  Edit Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorPayments;
