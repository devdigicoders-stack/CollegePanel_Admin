import React, { useState, useEffect } from 'react';
import { Search, Download, Calendar, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const AccountLedger = () => {
  const [search, setSearch] = useState('');
  const [filterAccount, setFilterAccount] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterAccount !== 'All') params.account = filterAccount;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await axiosInstance.get('/fees/ledger', { params });
      setData(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Failed to fetch ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterAccount, startDate, endDate]);

  const filtered = data.filter(item => {
    const matchesSearch = item.particulars?.toLowerCase().includes(search.toLowerCase()) || 
                          item.account?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Account Ledgers</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Audit transaction details by individual accounts and heads</p>
        </div>
        <button onClick={() => toast.success('Exporting ledger...')} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={15} /> Export Ledger
        </button>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 flex-wrap">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by particulars or account head..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
            />
          </div>

          <div className="flex gap-3">
            <select 
              value={filterAccount} 
              onChange={(e) => setFilterAccount(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
            >
              <option>All</option>
              <option>Bank (SBI A/C)</option>
              <option>Tuition Fee A/C</option>
              <option>Salary A/C</option>
              <option>Refund A/C</option>
              <option>Stationery Expense A/C</option>
              <option>Library Development A/C</option>
            </select>

            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 bg-white">
              <Calendar size={14} className="text-gray-400" />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-[12px] focus:outline-none cursor-pointer border-none py-1 w-28"
              />
              <span className="text-[11px] text-gray-400 font-medium">to</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-[12px] focus:outline-none cursor-pointer border-none py-1 w-28"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={6} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Date</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Ledger Account</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Particulars</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Debit (Dr)</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Credit (Cr)</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id || item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] text-gray-500">{item.date}</td>
                  <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.account}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-700 font-medium">{item.particulars}</td>
                  <td className="py-4 px-6 text-[13px] text-right font-semibold text-red-600">
                    {(item.dr || 0) > 0 ? `₹${(item.dr || 0).toLocaleString()}` : '-'}
                  </td>
                  <td className="py-4 px-6 text-[13px] text-right font-semibold text-green-600">
                    {(item.cr || 0) > 0 ? `₹${(item.cr || 0).toLocaleString()}` : '-'}
                  </td>
                  <td className="py-4 px-6 text-[13px] text-right font-bold text-gray-900">
                    ₹{(item.balance || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500 text-[13px]">No ledger entries found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AccountLedger;

