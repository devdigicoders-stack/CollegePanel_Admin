import React, { useState, useEffect } from 'react';
import { Search, Save, BookOpen, Clock, AlertTriangle } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const Library = () => {
  const [books, setBooks] = useState([]);
  const [totalFines, setTotalFines] = useState(0);
  const [activeIssues, setActiveIssues] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLibraryDetails();
  }, []);

  const fetchLibraryDetails = async () => {
    try {
      const res = await axiosInstance.get('/student-portal/library');
      const transactions = res.data;
      setBooks(transactions);
      
      let fines = 0;
      let active = 0;
      transactions.forEach(t => {
        if (t.fineAmount > t.paidAmount) fines += (t.fineAmount - t.paidAmount);
        if (t.status === 'Issued' || t.status === 'Overdue') active += 1;
      });
      
      setTotalFines(fines);
      setActiveIssues(active);
    } catch (error) {
      toast.error('Failed to fetch library details');
    } finally { setLoading(false); }
  };

  
  if (loading) {
    return (
      <div className="p-6">
        <SkeletonLoader type="table" rows={6} cols={5} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-[16px] font-bold text-gray-800">My Library Transactions</h2>
        <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify issued books, check due return dates, and view outstanding fine balances</p>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Outstanding Fines</span>
              <h4 className="text-[20px] font-bold text-red-700 mt-1">₹{totalFines.toLocaleString()}</h4>
            </div>
            <AlertTriangle className="text-red-500" size={24} />
          </div>

          <div className="p-4 bg-green-50/50 border border-green-100 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Active Book Issues</span>
              <h4 className="text-[20px] font-bold text-green-700 mt-1">{activeIssues} Books</h4>
            </div>
            <BookOpen className="text-green-600" size={24} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 text-[14px]">My Issued Books</h3>
          {books.length > 0 ? books.map(item => (
            <div key={item._id} className="p-4 border border-gray-100 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/20 shadow-sm text-[13px]">
              <div>
                <h4 className="font-bold text-gray-800">{item.bookId?.title || 'Book Title'}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Author: {item.bookId?.author} | Transaction ID: {item.transactionId}</p>
                <div className="flex gap-4 mt-2 text-[11px] font-semibold text-gray-600">
                  <span className="flex items-center gap-1"><Clock size={12} /> Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                  {(item.fineAmount - item.paidAmount) > 0 && <span className="text-red-500 font-bold">Fine: ₹{(item.fineAmount - item.paidAmount)}</span>}
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold md:self-center self-start ${
                item.status === 'Issued' ? 'bg-green-50 text-green-700 border border-green-100' : 
                item.status === 'Overdue' ? 'bg-red-50 text-red-700 border border-red-100' : 
                'bg-gray-50 text-gray-700 border border-gray-200'
              }`}>
                {item.status}
              </span>
            </div>
          )) : (
            <div className="text-gray-500 text-[13px] p-4 bg-gray-50 rounded-xl border border-gray-100">
              No library transactions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Library;
