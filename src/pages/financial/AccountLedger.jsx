import React, { useState, useEffect } from 'react';
import { Search, Download, Calendar, ArrowUpRight, ArrowDownLeft, RefreshCw, BookOpen, ChevronDown, Plus, X, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const emptyEntry = {
  date: new Date().toISOString().split('T')[0],
  account: '',
  particulars: '',
  dr: '',
  cr: '',
  reference: '',
};

const AccountLedger = () => {
  if (!checkPermission('View Fee Reports')) {
    return <AccessDenied />;
  }
  const [search, setSearch]               = useState('');
  const [filterAccount, setFilterAccount] = useState('All');
  const [startDate, setStartDate]         = useState('');
  const [endDate, setEndDate]             = useState('');
  const [loading, setLoading]             = useState(true);
  const [data, setData]                   = useState([]);
  const [accounts, setAccounts]           = useState([]);   // cash/bank accounts for filter
  const [showModal, setShowModal]         = useState(false);
  const [form, setForm]                   = useState(emptyEntry);
  const [submitting, setSubmitting]       = useState(false);

  /* ─── fetch ledger entries ─── */
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterAccount !== 'All') params.account = filterAccount;
      if (startDate)               params.startDate = startDate;
      if (endDate)                 params.endDate   = endDate;
      const res = await axiosInstance.get('/fees/ledger', { params });
      setData(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to fetch ledger');
    } finally {
      setLoading(false);
    }
  };

  /* ─── fetch accounts for filter dropdown ─── */
  const fetchAccounts = async () => {
    try {
      const res = await axiosInstance.get('/fees/cash-bank');
      setAccounts(res.data?.data || res.data || []);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchData(); fetchAccounts(); }, []);
  useEffect(() => { fetchData(); }, [filterAccount, startDate, endDate]);

  /* ─── client-side search filter ─── */
  const filtered = data.filter(item =>
    !search ||
    (item.particulars || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.account     || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.reference   || '').toLowerCase().includes(search.toLowerCase())
  );

  /* ─── summary stats ─── */
  const totalDr  = filtered.reduce((s, d) => s + (d.dr || 0), 0);
  const totalCr  = filtered.reduce((s, d) => s + (d.cr || 0), 0);
  const netBal   = totalCr - totalDr;

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';

  /* ─── add manual entry ─── */
  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!form.account.trim())     return toast.error('Account is required');
    if (!form.particulars.trim()) return toast.error('Particulars are required');
    if (!form.dr && !form.cr)     return toast.error('Enter either Debit or Credit amount');

    // Compute balance: get last balance for this account and add/subtract
    const lastEntry = [...data].filter(d => d.account === form.account).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const lastBalance = lastEntry ? (lastEntry.balance || 0) : 0;
    const balance = lastBalance + (Number(form.cr) || 0) - (Number(form.dr) || 0);

    setSubmitting(true);
    try {
      await axiosInstance.post('/fees/transactions', {
        date:        form.date,
        account:     form.account,
        particulars: form.particulars,
        dr:          Number(form.dr) || 0,
        cr:          Number(form.cr) || 0,
        balance,
        reference:   form.reference,
      });
      toast.success('Ledger entry added');
      setShowModal(false);
      setForm(emptyEntry);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add entry');
    } finally {
      setSubmitting(false);
    }
  };

  const fd = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // Get unique accounts from ledger data for dynamic filter
  const uniqueAccounts = ['All', ...new Set([
    ...accounts.map(a => a.name),
    ...data.map(d => d.account).filter(Boolean),
  ])];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">

      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Account Ledger</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Audit all debit / credit transactions by account head</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { fetchData(); fetchAccounts(); }} className="p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => { setForm({ ...emptyEntry, account: filterAccount !== 'All' ? filterAccount : '' }); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold transition-colors">
            <Plus size={15} /> Manual Entry
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-3 gap-4">
        <div className="bg-red-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingDown size={18} className="text-red-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wide">Total Debit</p>
            <p className="text-[20px] font-black text-red-700">₹{totalDr.toLocaleString()}</p>
            <p className="text-[10px] text-red-400">{filtered.filter(d => d.dr > 0).length} debit entries</p>
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wide">Total Credit</p>
            <p className="text-[20px] font-black text-green-700">₹{totalCr.toLocaleString()}</p>
            <p className="text-[10px] text-green-400">{filtered.filter(d => d.cr > 0).length} credit entries</p>
          </div>
        </div>
        <div className={`${netBal >= 0 ? 'bg-blue-50' : 'bg-orange-50'} rounded-xl p-4 flex items-center gap-3`}>
          <div className={`w-10 h-10 ${netBal >= 0 ? 'bg-blue-100' : 'bg-orange-100'} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Scale size={18} className={netBal >= 0 ? 'text-blue-600' : 'text-orange-600'} />
          </div>
          <div>
            <p className={`text-[10px] font-semibold uppercase tracking-wide ${netBal >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Net Balance</p>
            <p className={`text-[20px] font-black ${netBal >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              {netBal >= 0 ? '' : '-'}₹{Math.abs(netBal).toLocaleString()}
            </p>
            <p className={`text-[10px] ${netBal >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>{filtered.length} total entries</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[220px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by particulars, account or reference..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>

        {/* Account filter — dynamic from DB */}
        <div className="relative">
          <select value={filterAccount} onChange={e => setFilterAccount(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer min-w-[160px]">
            {uniqueAccounts.map(a => <option key={a}>{a}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white">
          <Calendar size={14} className="text-gray-400 flex-shrink-0" />
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="text-[12px] focus:outline-none cursor-pointer border-none py-0.5 w-28" />
          <span className="text-[11px] text-gray-400 font-medium">to</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="text-[12px] focus:outline-none cursor-pointer border-none py-0.5 w-28" />
          {(startDate || endDate) && (
            <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-gray-400 hover:text-gray-600 ml-1" title="Clear dates">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1 p-4">
        {loading ? (
          <SkeletonLoader type="table" rows={6} cols={6} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
              <BookOpen size={22} className="text-gray-300" />
            </div>
            <p className="text-gray-500 text-[14px] font-medium">No ledger entries found</p>
            <p className="text-gray-400 text-[12px] mt-1">
              {startDate || endDate ? 'Try adjusting the date range' : 'Transactions will appear here as they are recorded'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                <th className="py-3 px-4 text-[12px] font-bold text-gray-600 whitespace-nowrap">Date</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-600 whitespace-nowrap">Ledger Account</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-600">Particulars</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-600 text-right whitespace-nowrap">Debit (Dr)</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-600 text-right whitespace-nowrap">Credit (Cr)</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-600 text-right whitespace-nowrap">Balance</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-600 whitespace-nowrap">Reference</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item._id || idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-[13px] text-gray-500 whitespace-nowrap">{formatDate(item.date)}</td>
                  <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54] whitespace-nowrap">{item.account}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-700 font-medium max-w-[250px] truncate" title={item.particulars}>{item.particulars}</td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {(item.dr || 0) > 0 ? (
                      <span className="inline-flex items-center justify-end gap-1 text-[13px] font-semibold text-red-600">
                        <ArrowUpRight size={13} />₹{(item.dr || 0).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-[13px]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {(item.cr || 0) > 0 ? (
                      <span className="inline-flex items-center justify-end gap-1 text-[13px] font-semibold text-green-600">
                        <ArrowDownLeft size={13} />₹{(item.cr || 0).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-[13px]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <span className={`text-[13px] font-black ${(item.balance || 0) >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                      {(item.balance || 0) < 0 ? '-' : ''}₹{Math.abs(item.balance || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-gray-400 font-mono whitespace-nowrap">{item.reference || '—'}</td>
                </tr>
              ))}
            </tbody>
            {/* Totals footer */}
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td colSpan={3} className="py-3 px-4 text-[12px] font-bold text-gray-700">TOTALS ({filtered.length} entries)</td>
                <td className="py-3 px-4 text-right text-[13px] font-black text-red-700">₹{totalDr.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-[13px] font-black text-green-700">₹{totalCr.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-[13px] font-black text-gray-900">
                  <span className={netBal < 0 ? 'text-red-600' : 'text-blue-700'}>
                    {netBal < 0 ? '-' : ''}₹{Math.abs(netBal).toLocaleString()}
                  </span>
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Add Manual Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-gray-800">Add Manual Ledger Entry</h3>
                <p className="text-[12px] text-gray-500 mt-0.5">Enter either Debit or Credit — not both</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddEntry} className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Date</label>
                <input type="date" value={form.date} onChange={fd('date')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Reference No.</label>
                <input type="text" placeholder="e.g. VCH-001" value={form.reference} onChange={fd('reference')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div className="col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Account <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={form.account} onChange={fd('account')}
                    className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    <option value="">Select account</option>
                    {uniqueAccounts.filter(a => a !== 'All').map(a => <option key={a}>{a}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Particulars <span className="text-red-500">*</span></label>
                <input type="text" placeholder="e.g. Fee received for August batch" value={form.particulars} onChange={fd('particulars')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Debit (Dr) — ₹</label>
                <input type="number" min="0" placeholder="0" value={form.dr} onChange={fd('dr')}
                  disabled={!!form.cr}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-red-400 disabled:bg-gray-50 disabled:text-gray-300" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Credit (Cr) — ₹</label>
                <input type="number" min="0" placeholder="0" value={form.cr} onChange={fd('cr')}
                  disabled={!!form.dr}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-green-400 disabled:bg-gray-50 disabled:text-gray-300" />
              </div>
              <p className="col-span-2 text-[11px] text-gray-400 -mt-2">Once you enter Debit, Credit field is disabled (and vice versa).</p>
              <div className="col-span-2 flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="bg-[#0A6C54] hover:bg-[#085a46] disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-colors">
                  {submitting ? 'Saving...' : 'Post Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountLedger;
