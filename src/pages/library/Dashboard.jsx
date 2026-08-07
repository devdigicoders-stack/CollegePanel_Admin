import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Book, AlertTriangle, CheckCircle, RotateCcw, Bookmark } from 'lucide-react';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const HCReact = HighchartsReact.default || HighchartsReact;

const LibraryDashboard = () => {
  if (!checkPermission('View Books')) {
    return <AccessDenied />;
  }
  const [stats, setStats] = useState({
    totalBooks: 0,
    issuedBooks: 0,
    availableBooks: 0,
    overdueBooks: 0,
    todayIssues: 0,
    todayReturns: 0,
    pendingFines: 0,
    activeMembers: 0
  });
  const [recentIssues, setRecentIssues] = useState([]);
  const [overdueTransactions, setOverdueTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockBooks, setLowStockBooks] = useState([]);
  const [paginationData, setPaginationData] = useState({ page: 1, totalPages: 1 });
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, reportsRes] = await Promise.all([
        axiosInstance.get('/library/stats'),
        axiosInstance.get('/library/reports')
      ]);

      const statsData = statsRes.data;
      setStats({
        totalBooks: statsData.totalBooks || 0,
        issuedBooks: statsData.issuedBooks || 0,
        availableBooks: statsData.availableBooks || 0,
        overdueBooks: statsData.overdueBooks || 0,
        todayIssues: statsData.todayIssues || 0,
        todayReturns: statsData.todayReturns || 0,
        pendingFines: statsData.pendingFines || 0,
        activeMembers: statsData.activeMembers || 0
      });

      setRecentIssues(statsRes.data?.recentIssues || []);
      setOverdueTransactions(statsRes.data?.overdueTransactions || []);
      setLowStockBooks(reportsRes.data?.lowStock || []);
      setPaginationData({
        page: 1,
        totalPages: reportsRes.data?.pages || 1
      });
      setReportData(reportsRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const circulationOptions = {
    chart: { type: 'area', height: 260, backgroundColor: 'transparent' },
    title: { text: '' },
    xAxis: { categories: reportData?.dailyTransactions?.map(t => t.date) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    yAxis: { title: { text: '' } },
    series: [
      { name: 'Books Issued', data: reportData?.dailyTransactions?.map(t => t.issues) || [0, 0, 0, 0, 0, 0], color: '#0A6C54', fillOpacity: 0.1 },
      { name: 'Books Returned', data: reportData?.dailyTransactions?.map(d => d.returns) || [0, 0, 0, 0, 0, 0], color: '#3B82F6', fillOpacity: 0.1 }
    ],
    credits: { enabled: false }
  };

  const statCards = [
    { label: 'Total Books', value: stats.totalBooks, icon: Book, iconColor: 'text-blue-500' },
    { label: 'Available', value: stats.availableBooks, icon: CheckCircle, iconColor: 'text-green-500' },
    { label: 'Issued Books', value: stats.issuedBooks, icon: Bookmark, iconColor: 'text-orange-500' },
    { label: 'Overdue Books', value: stats.overdueBooks, icon: AlertTriangle, iconColor: 'text-red-500' },
    { label: 'Today Issues', value: stats.todayIssues, icon: Book, iconColor: 'text-purple-500' },
    { label: 'Today Returns', value: stats.todayReturns, icon: RotateCcw, iconColor: 'text-teal-500' }
  ];

  return (
    <div className="space-y-6 font-['Inter']">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-gray-500 font-semibold tracking-wide">{stat.label}</span>
                    <span className="text-[18px] font-bold text-gray-800 mt-1">{stat.value}</span>
                  </div>
                  <div className="flex items-center">
                    <Icon className={stat.iconColor} size={20} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-[14px] font-bold text-gray-800 mb-4 font-semibold uppercase tracking-wider">Library Book Circulation Chart</h3>
            <HCReact highcharts={Highcharts} options={circulationOptions} />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-[14px] font-bold text-gray-800 mb-4 font-semibold uppercase tracking-wider">Low Stock Books</h3>
            {lowStockBooks.length > 0 ? (
              lowStockBooks.map((book, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-red-200 mb-2">
                  <div className="flex items-center">
                    <span className="text-[13px] font-bold text-gray-800">{book.title}</span>
                    <span className="text-[11px] text-gray-500 ml-2">{book.author}</span>
                  </div>
                  <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">{book.stock}</span>
                </div>
              ))
            ) : (
              <p className="text-[13px] text-gray-500">No low stock books.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-[14px] font-bold text-gray-800 mb-4 font-semibold uppercase tracking-wider">Overdue Members</h3>
            <div className="space-y-3">
              {overdueTransactions.length > 0 ? (
                overdueTransactions.map((item, idx) => (
                  <div key={idx} className="p-3 bg-red-50/30 rounded-lg border border-red-50">
                    <div className="flex justify-between items-start">
                      <div className="w-48">
                        <h4 className="text-[13px] font-bold text-gray-800">{item.name}</h4>
                        <p className="text-[11px] text-gray-600">{item.book}</p>
                      </div>
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">{item.days}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[13px] text-gray-500">No overdue members.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-[14px] font-bold text-gray-800 mb-4 font-semibold uppercase tracking-wider">Recent Transactions</h3>
            <div className="space-y-3">
              {recentIssues.length > 0 ? (
                recentIssues.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-[12px] font-bold">{item.book}</span>
                      <span className="text-[11px] text-gray-500 ml-2">{item.member}</span>
                      <span className="text-[10px] text-gray-500 ml-2">{item.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[13px] text-gray-500">No recent transactions.</p>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default LibraryDashboard;