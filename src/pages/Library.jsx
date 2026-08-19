import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

const Library = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    issuedBooks: 0,
    availableBooks: 0,
    overdueBooks: 0
  });
  const [recentIssues, setRecentIssues] = useState([]);
  const [overdueTransactions, setOverdueTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      const [statsRes, transactionsRes] = await Promise.all([
        axiosInstance.get('/library/stats'),
        axiosInstance.get('/library/transactions')
      ]);

      const statsData = statsRes.data;
      setStats({
        totalBooks: statsData.totalBooks || 0,
        issuedBooks: statsData.issuedBooks || 0,
        availableBooks: statsData.availableBooks || 0,
        overdueBooks: statsData.overdueBooks || 0
      });

      const transactions = transactionsRes.data || [];
      const overdueList = transactions.filter(t => t.status === 'Overdue');
      const recentList = [...transactions]
        .sort((a, b) => new Date(b.createdAt || b.issueDate) - new Date(a.createdAt || a.issueDate))
        .slice(0, 5);

      setOverdueTransactions(overdueList.slice(0, 5));
      setRecentIssues(recentList);
    } catch (error) {
      console.error('Error fetching library data:', error);
      toast.error('Failed to load library data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full font-['Inter']">
      
      {/* Title area */}
      <div className="mb-6">
        <h2 className="text-[20px] font-bold text-sidebar font-['Outfit']">Library Dashboard</h2>
        <p className="text-[13px] text-gray-500 mt-1">Library &gt; Dashboard</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
        
        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-center h-[100px]">
            <div className="text-[12px] font-semibold text-gray-500 mb-1 tracking-wide">Total Books</div>
            <div className="text-[24px] font-bold text-sidebar">{loading ? '-' : stats.totalBooks}</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-center h-[100px]">
            <div className="text-[12px] font-semibold text-gray-500 mb-1 tracking-wide">Issued Books</div>
            <div className="text-[24px] font-bold text-sidebar">{loading ? '-' : stats.issuedBooks}</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-center h-[100px]">
            <div className="text-[12px] font-semibold text-gray-500 mb-1 tracking-wide">Available Books</div>
            <div className="text-[24px] font-bold text-sidebar">{loading ? '-' : stats.availableBooks}</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-center h-[100px]">
            <div className="text-[12px] font-semibold text-gray-500 mb-1 tracking-wide">Overdue Books</div>
            <div className="text-[24px] font-bold text-red-500">{loading ? '-' : stats.overdueBooks}</div>
          </div>
        </div>

        {/* Lists Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Books Issued This Week Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col h-full min-h-[300px]">
            <h3 className="text-[14px] font-bold text-sidebar mb-6">Books Issued Recently</h3>
            
            <div className="flex-1 flex flex-col gap-5">
              {recentIssues.length > 0 ? (
                recentIssues.map((issue, idx) => (
                  <div key={issue._id || idx} className="flex items-start gap-3">
                    <span className="text-[13px] text-gray-500 font-medium">{idx + 1}.</span>
                    <span className="text-[13px] text-gray-700 font-medium">
                      {issue.bookId?.title || 'Unknown Book'} by {issue.bookId?.author || 'Unknown'} (to {issue.memberName || issue.studentId?.studentName || 'Unknown'})
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-[13px] text-gray-500 font-medium">No recent issues found.</div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button className="text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors">
                View All
              </button>
            </div>
          </div>

          {/* Overdue Books Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col h-full min-h-[300px]">
            <h3 className="text-[14px] font-bold text-sidebar mb-6">Overdue Books</h3>
            
            <div className="flex-1 flex flex-col gap-5">
              {overdueTransactions.length > 0 ? (
                overdueTransactions.map((overdue, idx) => (
                  <div key={overdue._id || idx} className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-[13px] text-gray-500 font-medium">{idx + 1}.</span>
                      <span className="text-[13px] text-gray-700 font-medium">
                        {overdue.memberName || overdue.studentId?.studentName || 'Unknown'} ({overdue.bookId?.title})
                      </span>
                    </div>
                    <span className="text-[13px] font-semibold text-red-500">
                      {Math.ceil((new Date() - new Date(overdue.dueDate)) / (1000 * 60 * 60 * 24))} Days
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-[13px] text-gray-500 font-medium">No overdue books found.</div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button className="text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors">
                View All
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Library;
