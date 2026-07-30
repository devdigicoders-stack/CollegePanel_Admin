import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Eye, Download, Wallet, Landmark, ArrowLeftRight, CheckCircle, Clock } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const CashBank = () => {
  const [activeTab, setActiveTab] = useState('Accounts');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [newTransfer, setNewTransfer] = useState({
    from: '', to: '', amount: '', date: new Date().toISOString().split('T')[0], desc: ''
  });

  const fetchAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const res = await axiosInstance.get('/fees/cash-bank');
      setAccounts(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Failed to fetch accounts');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const fetchTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const res = await axiosInstance.get('/fees/transactions');
      setTransactions(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, []);

  const handleAddTransfer = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/fees/transactions', newTransfer);
      toast.success('Transfer completed successfully');
      setShowTransferModal(false);
      setNewTransfer({ from: '', to: '', amount: '', date: new Date().toISOString().split('T')[0], desc: '' });
      fetchTransactions();
      fetchAccounts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete transfer');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Tabs / Header */}
      <div className="border-b border-gray-100 px-6 pt-6 pb-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Cash & Bank Accounts</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Monitor physical cash boxes and bank accounts ledger status</p>
        </div>
        <div className="flex gap-3">
          <div className="flex border border-gray-200 rounded-lg p-0.5 bg-gray-50">
            {['Accounts', 'Contra Entries'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-[12px] font-semibold transition-all ${
                  activeTab === tab ? 'bg-[#0A6C54] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button onClick={() => setShowTransferModal(true)} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-4 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <ArrowLeftRight size={15} /> Cash Deposit / Transfer
          </button>
        </div>
      </div>

      {activeTab === 'Accounts' ? (
        <div className="overflow-x-auto flex-1 p-6">
          {loadingAccounts ? (
            <SkeletonLoader type="cards" rows={4} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {accounts.map(acc => (
                <div key={acc._id || acc.id} className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                        acc.type === 'Cash Book' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {acc.type}
                      </span>
                      <h4 className="font-bold text-gray-800 text-[14px] mt-2">{acc.name}</h4>
                      <p className="text-[11px] text-gray-500">{acc.bankName}</p>
                      <p className="text-[12px] text-gray-600 font-semibold mt-1">{acc.number}</p>
                    </div>
                    <div className={`p-2.5 rounded-lg ${acc.type === 'Cash Book' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                      {acc.type === 'Cash Book' ? <Wallet size={18} /> : <Landmark size={18} />}
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-3 mt-4 flex justify-between items-baseline">
                    <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Balance</span>
                    <span className="text-[18px] font-bold text-gray-900">₹{(acc.balance || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {!loadingAccounts && accounts.length === 0 && (
                <div className="col-span-full py-8 text-center text-gray-500 text-[13px]">No accounts found</div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          {loadingTransactions ? (
            <SkeletonLoader type="table" rows={5} cols={7} />
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Date</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Description</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Transfer From</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Transfer To</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Amount</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Type</th>
                  <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(item => (
                  <tr key={item._id || item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-[13px] text-gray-500">{item.date}</td>
                    <td className="py-4 px-6 text-[13px] font-medium text-gray-800">{item.desc}</td>
                    <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.from}</td>
                    <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.to}</td>
                    <td className="py-4 px-6 text-[13px] font-bold text-gray-900">₹{(item.amount || 0).toLocaleString()}</td>
                    <td className="py-4 px-6 text-[13px] text-gray-500">{item.type}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-100">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!loadingTransactions && transactions.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-500 text-[13px]">No transactions found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Contra Deposit / Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">New Cash/Bank Transfer (Contra)</h3>
              <button onClick={() => setShowTransferModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddTransfer} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Transfer From (Source Account)</label>
                <select 
                  value={newTransfer.from} 
                  onChange={(e) => setNewTransfer({...newTransfer, from: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                >
                  <option value="">Select account</option>
                  {accounts.map(acc => <option key={acc._id || acc.id} value={acc.name}>{acc.name} (Bal: ₹{(acc.balance || 0).toLocaleString()})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Transfer To (Destination Account)</label>
                <select 
                  value={newTransfer.to} 
                  onChange={(e) => setNewTransfer({...newTransfer, to: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                >
                  <option value="">Select account</option>
                  {accounts.map(acc => <option key={acc._id || acc.id} value={acc.name}>{acc.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Amount to Transfer (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={newTransfer.amount}
                    onChange={(e) => setNewTransfer({...newTransfer, amount: e.target.value})}
                    placeholder="0"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Transfer Date</label>
                  <input 
                    type="date" 
                    required
                    value={newTransfer.date}
                    onChange={(e) => setNewTransfer({...newTransfer, date: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Description / Memo</label>
                <textarea 
                  value={newTransfer.desc}
                  onChange={(e) => setNewTransfer({...newTransfer, desc: e.target.value})}
                  placeholder="e.g. Deposit cash to SBI Current Account..."
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-20 resize-none focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold"
                >
                  Complete Transfer
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

