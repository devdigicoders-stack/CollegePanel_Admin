import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Eye, Download, Trash2, X, RefreshCw, ChevronDown, TrendingUp } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const categories = ['All', 'Rental Income', 'Training Income', 'Seminar Fees', 'Donations', 'Grants', 'Scrap Sale', 'Other Income'];
const payModes = ['Cash', 'Cheque', 'Bank Transfer', 'UPI', 'Online'];
const statusList = ['All', 'Received', 'Pending', 'Cancelled'];

const statusColors = {
  Received: 'bg-green-50 text-green-700 border border-green-100',
  Pending: 'bg-yellow-50 text-yellow-700 border border-yellow-100',
  Cancelled: 'bg-red-50 text-red-600 border border-red-100',
};

const catColors = {
  'Rental Income':   'bg-blue-50 text-blue-700',
  'Training Income': 'bg-purple-50 text-purple-700',
  'Seminar Fees':    'bg-indigo-50 text-indigo-700',
  'Donations':       'bg-pink-50 text-pink-700',
  'Grants':          'bg-teal-50 text-teal-700',
  'Scrap Sale':      'bg-orange-50 text-orange-700',
  'Other Income':    'bg-gray-50 text-gray-700',
};

const emptyForm = {
  category: 'Training Income',
  source: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  mode: 'Bank Transfer',
  status: 'Received',
  description: '',
};

const Income = () => {
  if (!checkPermission('View Fee Reports')) {
    return <AccessDenied />;
  }
  const [search, setSearch]               = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus]   = useState('All');
  const [filterMode, setFilterMode]       = useState('All');
  const [showModal, setShowModal]         = useState(false);
  const [editItem, setEditItem]           = useState(null);  // item being edited
  const [viewItem, setViewItem]           = useState(null);  // item being viewed
  const [loading, setLoading]             = useState(true);
  const [submitting, setSubmitting]       = useState(false);
  const [data, setData]                   = useState([]);
  const [form, setForm]                   = useState(emptyForm);

  /* ─── fetch ─── */
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)                       params.search   = search;
      if (filterCategory !== 'All')     params.category = filterCategory;
      if (filterStatus !== 'All')       params.status   = filterStatus;
      const res = await axiosInstance.get('/fees/income', { params });
      let rows = res.data?.data || res.data || [];
      // client-side mode filter (backend doesn't support it directly)
      if (filterMode !== 'All') rows = rows.filter(r => r.mode === filterMode);
      setData(rows);
    } catch {
      toast.error('Failed to fetch income records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [search, filterCategory, filterStatus, filterMode]);

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
      category:    item.category,
      source:      item.source,
      amount:      item.amount,
      date:        item.date ? new Date(item.date).toISOString().split('T')[0] : '',
      mode:        item.mode,
      status:      item.status,
      description: item.description || '',
    });
    setShowModal(true);
  };

  /* ─── submit (add / edit) ─── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.source.trim()) return toast.error('Source / Description is required');
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter a valid amount');

    setSubmitting(true);
    try {
      if (editItem) {
        await axiosInstance.put(`/fees/income/${editItem._id || editItem.id}`, form);
        toast.success('Income record updated');
      } else {
        await axiosInstance.post('/fees/income', form);
        toast.success('Income recorded successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save income record');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── quick status change ─── */
  const handleStatusChange = async (item, newStatus) => {
    try {
      await axiosInstance.put(`/fees/income/${item._id || item.id}`, { status: newStatus });
      toast.success(`Marked as ${newStatus}`);
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  /* ─── summary stats ─── */
  const totalReceived  = data.filter(d => d.status === 'Received').reduce((s, d) => s + (d.amount || 0), 0);
  const totalPending   = data.filter(d => d.status === 'Pending').reduce((s, d) => s + (d.amount || 0), 0);
  const totalAll       = data.reduce((s, d) => s + (d.amount || 0), 0);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">

      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Other Income</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Track and record all non-academic income sources</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={fetchData} className="p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button onClick={openAdd} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Record Income
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Income',    value: `₹${totalAll.toLocaleString()}`,       color: 'bg-blue-50 text-blue-700',    sub: `${data.length} records` },
          { label: 'Received',        value: `₹${totalReceived.toLocaleString()}`,   color: 'bg-green-50 text-green-700',  sub: `${data.filter(d=>d.status==='Received').length} entries` },
          { label: 'Pending',         value: `₹${totalPending.toLocaleString()}`,    color: 'bg-yellow-50 text-yellow-700',sub: `${data.filter(d=>d.status==='Pending').length} entries` },
          { label: 'Cancelled',       value: data.filter(d=>d.status==='Cancelled').length, color: 'bg-red-50 text-red-600', sub: 'Voided entries' },
        ].map(c => (
          <div key={c.label} className={`${c.color} rounded-xl p-4`}>
            <p className="text-[11px] font-medium opacity-70 mb-1">{c.label}</p>
            <p className="text-[22px] font-black">{c.value}</p>
            <p className="text-[10px] opacity-60 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by source or receipt no..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label:'Category', value:filterCategory, set:setFilterCategory, opts:categories },
            { label:'Status',   value:filterStatus,   set:setFilterStatus,   opts:statusList },
            { label:'Mode',     value:filterMode,     set:setFilterMode,     opts:['All', ...payModes] },
          ].map(f => (
            <div key={f.label} className="relative">
              <select value={f.value} onChange={e => f.set(e.target.value)}
                className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
                {f.opts.map(o => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1 p-4">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={8} />
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
              <TrendingUp size={22} className="text-gray-300" />
            </div>
            <p className="text-gray-500 text-[14px] font-medium">No income records found</p>
            <p className="text-gray-400 text-[12px] mt-1">Click "Record Income" to add an entry</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                {['Receipt No', 'Category', 'Source / Description', 'Amount', 'Date', 'Mode', 'Status', 'Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item._id || item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-[13px] font-bold text-[#0A6C54] whitespace-nowrap">{item.receiptNo}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${catColors[item.category] || 'bg-gray-50 text-gray-600'}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-gray-800 font-medium max-w-[200px]">
                    <p className="truncate" title={item.source}>{item.source}</p>
                    {item.description && <p className="text-[11px] text-gray-400 truncate">{item.description}</p>}
                  </td>
                  <td className="py-3 px-4 text-[13px] font-bold text-gray-900 whitespace-nowrap">₹{(item.amount || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-500 whitespace-nowrap">{formatDate(item.date)}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600 whitespace-nowrap">{item.mode}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <select
                      value={item.status}
                      onChange={e => handleStatusChange(item, e.target.value)}
                      className={`text-[11px] font-semibold px-2 py-1 rounded-full border cursor-pointer focus:outline-none ${statusColors[item.status] || 'bg-gray-50 text-gray-600'}`}>
                      {['Received', 'Pending', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
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
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-gray-800">{editItem ? 'Edit Income Record' : 'Record New Income'}</h3>
                <p className="text-[12px] text-gray-500 mt-0.5">{editItem ? `Editing ${editItem.receiptNo}` : 'All fields are live-synced to the database'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Category</label>
                <div className="relative">
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Status</label>
                <div className="relative">
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {['Received', 'Pending', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Source / Payer Name <span className="text-red-500">*</span></label>
                <input type="text" required placeholder="e.g. Auditorium Booking – ABC Corp"
                  value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Amount (₹) <span className="text-red-500">*</span></label>
                <input type="number" min="1" required placeholder="0"
                  value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Date <span className="text-red-500">*</span></label>
                <input type="date" required
                  value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Payment Mode</label>
                <div className="relative">
                  <select value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}
                    className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {payModes.map(m => <option key={m}>{m}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Remarks (optional)</label>
                <textarea rows={2} placeholder="Additional details..."
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] resize-none focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="bg-[#0A6C54] hover:bg-[#085a46] disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-colors">
                  {submitting ? 'Saving...' : (editItem ? 'Save Changes' : 'Save Entry')}
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
                <h3 className="text-[16px] font-bold text-gray-800">Income Details</h3>
                <p className="text-[12px] text-[#0A6C54] font-semibold mt-0.5">{viewItem.receiptNo}</p>
              </div>
              <button onClick={() => setViewItem(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Amount Hero */}
              <div className="bg-gradient-to-br from-[#0A6C54]/10 to-emerald-50 rounded-2xl p-5 text-center border border-[#0A6C54]/10">
                <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">Amount</p>
                <p className="text-[36px] font-black text-[#0A6C54] mt-1">₹{(viewItem.amount || 0).toLocaleString()}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[11px] font-semibold ${statusColors[viewItem.status] || ''}`}>{viewItem.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Category',     viewItem.category],
                  ['Source',       viewItem.source],
                  ['Date',         formatDate(viewItem.date)],
                  ['Payment Mode', viewItem.mode],
                  ['Receipt No',   viewItem.receiptNo],
                  ['Remarks',      viewItem.description || '—'],
                ].map(([label, val]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
                    <p className="text-[13px] font-semibold text-gray-800 mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setViewItem(null); openEdit(viewItem); }}
                  className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[13px] font-semibold rounded-lg transition-colors">
                  Edit Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Income;
