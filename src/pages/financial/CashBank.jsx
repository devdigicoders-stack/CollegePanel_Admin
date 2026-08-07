import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Wallet, Landmark, ArrowLeftRight, X, RefreshCw, ChevronDown, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const typeColors = {
  Cash:   { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', icon: 'bg-orange-50 text-orange-500', badge: 'bg-orange-50 text-orange-700 border border-orange-100' },
  Bank:   { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100',   icon: 'bg-blue-50 text-blue-500',   badge: 'bg-blue-50 text-blue-700 border border-blue-100' },
  Wallet: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', icon: 'bg-purple-50 text-purple-500', badge: 'bg-purple-50 text-purple-700 border border-purple-100' },
};

const AccountIcon = ({ type, size = 20 }) => {
  if (type === 'Cash')   return <Wallet size={size} />;
  if (type === 'Wallet') return <PiggyBank size={size} />;
  return <Landmark size={size} />;
};

const emptyAccount = { name: '', number: '', type: 'Bank', bankName: '', balance: '', status: 'Active' };
const emptyTransfer = { from: '', to: '', amount: '', date: new Date().toISOString().split('T')[0], desc: '' };

const CashBank = () => {
  if (!checkPermission('View Fee Reports')) {
    return <AccessDenied />;
  }
  const [activeTab, setActiveTab]           = useState('Accounts');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAccountModal, setShowAccountModal]   = useState(false);
  const [editAccount, setEditAccount]             = useState(null);
  const [accounts, setAccounts]                   = useState([]);
  const [transactions, setTransactions]           = useState([]);
  const [loadingAccounts, setLoadingAccounts]     = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [submitting, setSubmitting]               = useState(false);
  const [accountForm, setAccountForm]             = useState(emptyAccount);
  const [transfer, setTransfer]                   = useState(emptyTransfer);
  const [searchTxn, setSearchTxn]                 = useState('');
  const [filterAcc, setFilterAcc]                 = useState('All');

  const fetchAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const res = await axiosInstance.get('/fees/cash-bank');
      setAccounts(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to fetch accounts');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const fetchTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const params = {};
      if (searchTxn) params.search = searchTxn;
      const res = await axiosInstance.get('/fees/transactions', { params });
      setTransactions(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);
  useEffect(() => { if (activeTab === 'Contra Entries') fetchTransactions(); }, [activeTab, searchTxn]);

  /* ─── open add account modal ─── */
  const openAddAccount = () => { setEditAccount(null); setAccountForm(emptyAccount); setShowAccountModal(true); };
  const openEditAccount = (acc) => {
    setEditAccount(acc);
    setAccountForm({ name: acc.name, number: acc.number, type: acc.type, bankName: acc.bankName || '', balance: acc.balance, status: acc.status });
    setShowAccountModal(true);
  };

  /* ─── save account ─── */
  const handleSaveAccount = async (e) => {
    e.preventDefault();
    if (!accountForm.name.trim()) return toast.error('Account name is required');
    setSubmitting(true);
    try {
      if (editAccount) {
        await axiosInstance.put(`/fees/cash-bank/${editAccount._id || editAccount.id}`, accountForm);
        toast.success('Account updated');
      } else {
        await axiosInstance.post('/fees/cash-bank', accountForm);
        toast.success('Account created');
      }
      setShowAccountModal(false);
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save account');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── transfer ─── */
  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!transfer.from || !transfer.to) return toast.error('Select both source and destination accounts');
    if (transfer.from === transfer.to) return toast.error('Source and destination cannot be same');
    if (!transfer.amount || Number(transfer.amount) <= 0) return toast.error('Enter a valid transfer amount');
    setSubmitting(true);
    try {
      await axiosInstance.post('/fees/transactions', transfer);
      toast.success('Contra entry recorded successfully');
      setShowTransferModal(false);
      setTransfer(emptyTransfer);
      fetchAccounts();
      if (activeTab === 'Contra Entries') fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── stats ─── */
  const totalBalance = accounts.filter(a => a.status === 'Active').reduce((s, a) => s + (a.balance || 0), 0);
  const bankBalance  = accounts.filter(a => a.type === 'Bank' && a.status === 'Active').reduce((s, a) => s + (a.balance || 0), 0);
  const cashBalance  = accounts.filter(a => a.type === 'Cash' && a.status === 'Active').reduce((s, a) => s + (a.balance || 0), 0);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';

  // Filter transactions by account
  const filteredTxn = transactions.filter(t =>
    (filterAcc === 'All' || t.account === filterAcc) &&
    (!searchTxn || (t.particulars || '').toLowerCase().includes(searchTxn.toLowerCase()) || (t.account || '').toLowerCase().includes(searchTxn.toLowerCase()))
  );

  const af = (key) => (e) => setAccountForm({ ...accountForm, [key]: e.target.value });
  const tf = (key) => (e) => setTransfer({ ...transfer, [key]: e.target.value });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">

      {/* Header */}
      <div className="border-b border-gray-100 px-6 pt-5 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Cash & Bank</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Monitor accounts, balances and inter-account transfers</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="flex border border-gray-200 rounded-lg p-0.5 bg-gray-50">
            {['Accounts', 'Contra Entries'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-[12px] font-semibold transition-all ${activeTab === tab ? 'bg-[#0A6C54] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
                {tab}
              </button>
            ))}
          </div>
          <button onClick={() => setShowTransferModal(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <ArrowLeftRight size={15} /> Contra Entry
          </button>
          <button onClick={openAddAccount} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-4 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={15} /> Add Account
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Balance',  value: `₹${totalBalance.toLocaleString()}`,  color: 'bg-[#0A6C54]/5 text-[#0A6C54]',  sub: `${accounts.filter(a=>a.status==='Active').length} active accounts` },
          { label: 'Bank Accounts',  value: `₹${bankBalance.toLocaleString()}`,   color: 'bg-blue-50 text-blue-700',          sub: `${accounts.filter(a=>a.type==='Bank').length} bank accounts` },
          { label: 'Cash in Hand',   value: `₹${cashBalance.toLocaleString()}`,   color: 'bg-orange-50 text-orange-700',      sub: `${accounts.filter(a=>a.type==='Cash').length} cash books` },
        ].map(c => (
          <div key={c.label} className={`${c.color} rounded-xl p-4`}>
            <p className="text-[11px] font-medium opacity-70 mb-1">{c.label}</p>
            <p className="text-[22px] font-black">{c.value}</p>
            <p className="text-[10px] opacity-60 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Accounts' ? (
        <div className="flex-1 overflow-y-auto p-6">
          {loadingAccounts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
                <Landmark size={22} className="text-gray-300" />
              </div>
              <p className="text-gray-500 text-[14px] font-medium">No accounts added yet</p>
              <p className="text-gray-400 text-[12px] mt-1">Click "Add Account" to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {accounts.map(acc => {
                const c = typeColors[acc.type] || typeColors.Bank;
                return (
                  <div key={acc._id || acc.id} className={`relative p-5 rounded-2xl border ${c.border} ${c.bg} flex flex-col justify-between group hover:shadow-md transition-shadow`}>
                    {/* Status dot */}
                    <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${acc.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`} title={acc.status} />

                    <div className="flex items-start gap-3 mb-4">
                      <div className={`p-2.5 rounded-xl ${c.icon}`}>
                        <AccountIcon type={acc.type} size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${c.badge}`}>
                          {acc.type}
                        </span>
                        <h4 className="font-bold text-gray-800 text-[14px] mt-1.5 truncate">{acc.name}</h4>
                        {acc.bankName && <p className="text-[11px] text-gray-500 truncate">{acc.bankName}</p>}
                        {acc.number && <p className="text-[12px] text-gray-600 font-mono mt-0.5">A/C: {acc.number}</p>}
                      </div>
                    </div>

                    <div className="border-t border-black/10 pt-3 flex justify-between items-baseline">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Balance</span>
                      <span className={`text-[20px] font-black ${c.text}`}>₹{(acc.balance || 0).toLocaleString()}</span>
                    </div>

                    {/* Edit on hover */}
                    <button onClick={() => openEditAccount(acc)}
                      className="absolute bottom-3 left-4 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-white/80 hover:bg-white rounded-lg shadow-sm text-gray-600"
                      title="Edit Account">
                      <Edit2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Contra Entries Tab */
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input type="text" placeholder="Search transactions..."
                value={searchTxn} onChange={e => setSearchTxn(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
            </div>
            <div className="relative">
              <select value={filterAcc} onChange={e => setFilterAcc(e.target.value)}
                className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
                <option value="All">All Accounts</option>
                {accounts.map(a => <option key={a._id} value={a.name}>{a.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
            <button onClick={fetchTransactions} className="p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50" title="Refresh">
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="overflow-x-auto flex-1 p-4">
            {loadingTransactions ? (
              <SkeletonLoader type="table" rows={5} cols={7} />
            ) : filteredTxn.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <p className="text-gray-500 text-[14px] font-medium">No contra entries found</p>
                <p className="text-gray-400 text-[12px] mt-1">Use "Contra Entry" button to record a transfer</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 border-y border-gray-100">
                    {['Date', 'Account', 'Particulars', 'Debit (Dr)', 'Credit (Cr)', 'Balance', 'Reference'].map(h => (
                      <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-600 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTxn.map(item => (
                    <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 text-[13px] text-gray-500 whitespace-nowrap">{formatDate(item.date)}</td>
                      <td className="py-3 px-4 text-[13px] font-semibold text-gray-800 whitespace-nowrap">{item.account}</td>
                      <td className="py-3 px-4 text-[13px] text-gray-700 max-w-[200px] truncate">{item.particulars}</td>
                      <td className="py-3 px-4 text-[13px] font-semibold whitespace-nowrap">
                        {item.dr > 0 ? <span className="flex items-center gap-1 text-red-600"><TrendingDown size={13} />₹{item.dr.toLocaleString()}</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="py-3 px-4 text-[13px] font-semibold whitespace-nowrap">
                        {item.cr > 0 ? <span className="flex items-center gap-1 text-green-600"><TrendingUp size={13} />₹{item.cr.toLocaleString()}</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="py-3 px-4 text-[13px] font-bold text-gray-900 whitespace-nowrap">₹{(item.balance || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-[11px] text-gray-400 font-mono">{item.reference || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-gray-800">{editAccount ? 'Edit Account' : 'Add New Account'}</h3>
                <p className="text-[12px] text-gray-500 mt-0.5">Cash, Bank or Wallet account</p>
              </div>
              <button onClick={() => setShowAccountModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveAccount} className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Account Name <span className="text-red-500">*</span></label>
                <input type="text" required placeholder="e.g. SBI Main Account" value={accountForm.name} onChange={af('name')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Account Type</label>
                <div className="relative">
                  <select value={accountForm.type} onChange={af('type')}
                    className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {['Bank', 'Cash', 'Wallet'].map(t => <option key={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Account Number</label>
                <input type="text" placeholder="A/C no. or identifier" value={accountForm.number} onChange={af('number')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Bank Name</label>
                <input type="text" placeholder="e.g. State Bank of India" value={accountForm.bankName} onChange={af('bankName')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Opening Balance (₹)</label>
                <input type="number" min="0" placeholder="0" value={accountForm.balance} onChange={af('balance')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div className="col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Status</label>
                <div className="flex gap-3">
                  {['Active', 'Inactive'].map(s => (
                    <button key={s} type="button" onClick={() => setAccountForm({ ...accountForm, status: s })}
                      className={`flex-1 py-2 rounded-lg text-[12px] font-semibold border transition-colors ${accountForm.status === s ? 'bg-[#0A6C54] text-white border-[#0A6C54]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-2 flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setShowAccountModal(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="bg-[#0A6C54] hover:bg-[#085a46] disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-colors">
                  {submitting ? 'Saving...' : (editAccount ? 'Save Changes' : 'Create Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contra Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-gray-800">Contra Entry</h3>
                <p className="text-[12px] text-gray-500 mt-0.5">Transfer between cash and bank accounts</p>
              </div>
              <button onClick={() => setShowTransferModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleTransfer} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Transfer From (Source) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={transfer.from} onChange={tf('from')}
                    className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    <option value="">Select source account</option>
                    {accounts.filter(a => a.status === 'Active').map(acc => (
                      <option key={acc._id} value={acc.name}>{acc.name} — ₹{(acc.balance || 0).toLocaleString()}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Transfer To (Destination) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={transfer.to} onChange={tf('to')}
                    className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    <option value="">Select destination account</option>
                    {accounts.filter(a => a.status === 'Active' && a.name !== transfer.from).map(acc => (
                      <option key={acc._id} value={acc.name}>{acc.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Amount (₹) <span className="text-red-500">*</span></label>
                  <input type="number" min="1" required placeholder="0" value={transfer.amount} onChange={tf('amount')}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Transfer Date</label>
                  <input type="date" value={transfer.date} onChange={tf('date')}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Description / Memo</label>
                <textarea rows={2} placeholder="e.g. Deposit petty cash to SBI current account..."
                  value={transfer.desc} onChange={tf('desc')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] resize-none focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              {transfer.amount && transfer.from && transfer.to && (
                <div className="bg-[#0A6C54]/5 rounded-xl p-3 border border-[#0A6C54]/10 text-center">
                  <p className="text-[12px] text-[#0A6C54] font-semibold">
                    ₹{Number(transfer.amount).toLocaleString()} will move from <strong>{transfer.from}</strong> → <strong>{transfer.to}</strong>
                  </p>
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowTransferModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] disabled:opacity-50 text-white rounded-lg text-[13px] font-semibold transition-colors flex items-center justify-center gap-2">
                  <ArrowLeftRight size={14} /> {submitting ? 'Processing...' : 'Complete Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashBank;
