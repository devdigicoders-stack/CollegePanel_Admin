import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit2, ChevronDown, X, RefreshCw, CheckCircle, XCircle, Receipt } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const statusColors = {
  Approved: 'bg-green-50 text-green-700 border border-green-100',
  Pending:  'bg-orange-50 text-orange-700 border border-orange-100',
  Rejected: 'bg-red-50 text-red-600 border border-red-100',
};

const catColors = {
  Electricity: 'bg-yellow-50 text-yellow-700',
  Maintenance: 'bg-orange-50 text-orange-700',
  Stationery:  'bg-blue-50 text-blue-700',
  'Lab Equipment': 'bg-purple-50 text-purple-700',
  Transport:   'bg-teal-50 text-teal-700',
  Salary:      'bg-green-50 text-green-700',
  Events:      'bg-pink-50 text-pink-700',
  Repairs:     'bg-red-50 text-red-600',
  Internet:    'bg-indigo-50 text-indigo-700',
  'Office Expenses': 'bg-gray-100 text-gray-700',
};

const categories  = ['Electricity', 'Maintenance', 'Stationery', 'Lab Equipment', 'Transport', 'Salary', 'Events', 'Repairs', 'Internet', 'Office Expenses'];
const payModes    = ['Cash', 'Bank Transfer', 'Cheque', 'UPI', 'Card'];
const departments = ['Admin', 'Civil Dept', 'IT Dept', 'Mechanical Dept', 'Electrical Dept', 'Library', 'Hostel', 'Sports'];
const approvalStatuses = ['Pending', 'Approved', 'Rejected'];

const emptyForm = {
  category: 'Electricity', vendor: '', amount: '',
  date: new Date().toISOString().split('T')[0],
  mode: 'Cash', invoiceNo: '', dept: 'Admin',
  description: '', approvedBy: '',
};

const Expenses = () => {
  if (!checkPermission('View Fee Reports')) {
    return <AccessDenied />;
  }
  const [search, setSearch]                   = useState('');
  const [filterCategory, setFilterCategory]   = useState('All');
  const [filterStatus, setFilterStatus]       = useState('All');
  const [filterDept, setFilterDept]           = useState('All');
  const [showModal, setShowModal]             = useState(false);
  const [editItem, setEditItem]               = useState(null);
  const [viewItem, setViewItem]               = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [submitting, setSubmitting]           = useState(false);
  const [data, setData]                       = useState([]);
  const [form, setForm]                       = useState(emptyForm);

  /* ─── fetch ─── */
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)                      params.search         = search;
      if (filterCategory !== 'All')    params.category       = filterCategory;
      if (filterStatus   !== 'All')    params.approvalStatus = filterStatus;
      const res = await axiosInstance.get('/fees/expenses', { params });
      let rows = res.data?.data || res.data || [];
      if (filterDept !== 'All') rows = rows.filter(r => r.dept === filterDept);
      setData(rows);
    } catch {
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [search, filterCategory, filterStatus, filterDept]);

  /* ─── open add modal ─── */
  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  /* ─── open edit modal ─── */
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      category:   item.category,
      vendor:     item.vendor,
      amount:     item.amount,
      date:       item.date ? new Date(item.date).toISOString().split('T')[0] : '',
      mode:       item.mode,
      invoiceNo:  item.invoiceNo || '',
      dept:       item.dept || 'Admin',
      description: item.description || '',
      approvedBy: item.approvedBy || '',
    });
    setShowModal(true);
  };

  /* ─── submit ─── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vendor.trim()) return toast.error('Vendor name is required');
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter a valid amount');

    setSubmitting(true);
    try {
      if (editItem) {
        await axiosInstance.put(`/fees/expenses/${editItem._id || editItem.id}`, form);
        toast.success('Expense updated successfully');
      } else {
        await axiosInstance.post('/fees/expenses', form);
        toast.success('Expense added successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── approval status quick-change ─── */
  const handleApproval = async (id, status) => {
    try {
      await axiosInstance.put(`/fees/expenses/${id}`, { approvalStatus: status });
      toast.success(`Expense ${status}`);
      fetchData();
    } catch {
      toast.error('Failed to update approval status');
    }
  };

  /* ─── stats ─── */
  const now = new Date();
  const thisMonth = data.filter(d => {
    const dt = new Date(d.date);
    return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
  });
  const approved      = data.filter(d => d.approvalStatus === 'Approved');
  const pending       = data.filter(d => d.approvalStatus === 'Pending');
  const totalExpense  = data.reduce((s, d) => s + (d.amount || 0), 0);
  const thisMonthAmt  = thisMonth.reduce((s, d) => s + (d.amount || 0), 0);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';
  const fd = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">

      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Expenses</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Track, approve and manage all college expenses</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold transition-colors">
            <Plus size={15} /> Add Expense
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Expenses',    value: `₹${totalExpense.toLocaleString()}`,   color: 'bg-red-50 text-red-700',    sub: `${data.length} records` },
          { label: 'Approved',          value: `₹${approved.reduce((s,d)=>s+(d.amount||0),0).toLocaleString()}`, color: 'bg-green-50 text-green-700', sub: `${approved.length} entries` },
          { label: 'Pending Approval',  value: pending.length,                         color: 'bg-orange-50 text-orange-700', sub: 'Awaiting action' },
          { label: 'This Month',        value: `₹${thisMonthAmt.toLocaleString()}`,   color: 'bg-blue-50 text-blue-700',  sub: `${thisMonth.length} entries` },
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
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by vendor, invoice no..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
        {[
          { label: 'Category', val: filterCategory, set: setFilterCategory, opts: ['All', ...categories] },
          { label: 'Status',   val: filterStatus,   set: setFilterStatus,   opts: ['All', ...approvalStatuses] },
          { label: 'Dept',     val: filterDept,     set: setFilterDept,     opts: ['All', ...departments] },
        ].map(f => (
          <div key={f.label} className="relative">
            <select value={f.val} onChange={e => f.set(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
              {f.opts.map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={10} />
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
              <Receipt size={22} className="text-gray-300" />
            </div>
            <p className="text-gray-500 text-[14px] font-medium">No expense records found</p>
            <p className="text-gray-400 text-[12px] mt-1">Click "Add Expense" to create one</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                {['Exp No.', 'Category', 'Vendor', 'Amount', 'Date', 'Mode', 'Invoice No.', 'Department', 'Approval', 'Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item._id || item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-[13px] font-bold text-[#0A6C54] whitespace-nowrap">{item.expNo}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${catColors[item.category] || 'bg-gray-50 text-gray-600'}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <p className="text-[13px] font-semibold text-gray-800">{item.vendor}</p>
                    {item.description && <p className="text-[11px] text-gray-400 max-w-[140px] truncate">{item.description}</p>}
                  </td>
                  <td className="py-3 px-4 text-[13px] font-bold text-red-600 whitespace-nowrap">₹{(item.amount || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-500 whitespace-nowrap">{formatDate(item.date)}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600 whitespace-nowrap">{item.mode}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600 whitespace-nowrap">{item.invoiceNo || '—'}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600 whitespace-nowrap">{item.dept || '—'}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <select
                      value={item.approvalStatus}
                      onChange={e => handleApproval(item._id || item.id, e.target.value)}
                      className={`text-[11px] font-semibold px-2 py-1 rounded-full border cursor-pointer focus:outline-none ${statusColors[item.approvalStatus] || 'bg-gray-50 text-gray-600'}`}>
                      {approvalStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex gap-1">
                      <button onClick={() => setViewItem(item)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500" title="View">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500" title="Edit">
                        <Edit2 size={14} />
                      </button>
                      {item.approvalStatus === 'Pending' && (
                        <>
                          <button onClick={() => handleApproval(item._id || item.id, 'Approved')} className="p-1.5 hover:bg-green-50 rounded-lg" title="Approve">
                            <CheckCircle size={14} className="text-green-600" />
                          </button>
                          <button onClick={() => handleApproval(item._id || item.id, 'Rejected')} className="p-1.5 hover:bg-red-50 rounded-lg" title="Reject">
                            <XCircle size={14} className="text-red-500" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-[16px] font-bold text-gray-800">{editItem ? 'Edit Expense' : 'Add New Expense'}</h3>
                <p className="text-[12px] text-gray-500 mt-0.5">{editItem ? `Editing ${editItem.expNo}` : 'Fill in all required fields'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={form.category} onChange={fd('category')}
                    className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Department</label>
                <div className="relative">
                  <select value={form.dept} onChange={fd('dept')}
                    className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {departments.map(d => <option key={d}>{d}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>

              {/* Vendor */}
              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Vendor / Payee Name <span className="text-red-500">*</span></label>
                <input type="text" required placeholder="e.g. ABC Electrical Supplies" value={form.vendor} onChange={fd('vendor')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Amount (₹) <span className="text-red-500">*</span></label>
                <input type="number" min="1" required placeholder="0" value={form.amount} onChange={fd('amount')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>

              {/* Date */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Expense Date <span className="text-red-500">*</span></label>
                <input type="date" required value={form.date} onChange={fd('date')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>

              {/* Invoice No */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Invoice Number</label>
                <input type="text" placeholder="e.g. INV-2024-001" value={form.invoiceNo} onChange={fd('invoiceNo')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>

              {/* Mode */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Payment Mode</label>
                <div className="relative">
                  <select value={form.mode} onChange={fd('mode')}
                    className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {payModes.map(m => <option key={m}>{m}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>

              {/* Approved By */}
              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Approved By</label>
                <input type="text" placeholder="Authorizing person's name" value={form.approvedBy} onChange={fd('approvedBy')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Description / Remarks</label>
                <textarea rows={2} placeholder="Describe the purpose of this expense..."
                  value={form.description} onChange={fd('description')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] resize-none focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="bg-[#0A6C54] hover:bg-[#085a46] disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-colors">
                  {submitting ? 'Saving...' : (editItem ? 'Save Changes' : 'Save Expense')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-gray-800">Expense Details</h3>
                <p className="text-[12px] text-[#0A6C54] font-semibold mt-0.5">{viewItem.expNo}</p>
              </div>
              <button onClick={() => setViewItem(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Amount Hero */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-5 text-center border border-red-100">
                <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">Amount</p>
                <p className="text-[36px] font-black text-red-600 mt-1">₹{(viewItem.amount || 0).toLocaleString()}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[11px] font-semibold ${statusColors[viewItem.approvalStatus] || ''}`}>
                  {viewItem.approvalStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Category',    viewItem.category],
                  ['Vendor',      viewItem.vendor],
                  ['Date',        formatDate(viewItem.date)],
                  ['Payment Mode',viewItem.mode],
                  ['Invoice No.', viewItem.invoiceNo || '—'],
                  ['Department',  viewItem.dept || '—'],
                  ['Approved By', viewItem.approvedBy || '—'],
                  ['Description', viewItem.description || '—'],
                ].map(([label, val]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
                    <p className="text-[13px] font-semibold text-gray-800 mt-0.5 break-words">{val}</p>
                  </div>
                ))}
              </div>

              {viewItem.approvalStatus === 'Pending' && (
                <div className="flex gap-2">
                  <button onClick={() => { handleApproval(viewItem._id, 'Approved'); setViewItem(null); }}
                    className="flex-1 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 text-[13px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                    <CheckCircle size={15} /> Approve
                  </button>
                  <button onClick={() => { handleApproval(viewItem._id, 'Rejected'); setViewItem(null); }}
                    className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-[13px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              )}
              <button onClick={() => { setViewItem(null); openEdit(viewItem); }}
                className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[13px] font-semibold rounded-lg transition-colors">
                Edit Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
