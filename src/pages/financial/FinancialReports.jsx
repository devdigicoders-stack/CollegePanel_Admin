import React, { useState, useEffect } from 'react';
import { Search, Download, Calendar, BarChart3, PieChart, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const HCReact = HighchartsReact.default || HighchartsReact;

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const FinancialReports = () => {
  const [reportType, setReportType] = useState('Income vs Expense');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    totalFeeCollected: 0,
    totalExpenses: 0,
    totalIncome: 0,
    pendingDuesTotal: 0,
    netBalance: 0,
    monthlyCollections: [],
    monthlyExpenses: []
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;
      const res = await axiosInstance.get('/fees/reports', { params });
      setReportData(res.data?.data || res.data || {
        totalFeeCollected: 0,
        totalExpenses: 0,
        totalIncome: 0,
        pendingDuesTotal: 0,
        netBalance: 0,
        monthlyCollections: [],
        monthlyExpenses: []
      });
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange.start, dateRange.end]);

  const monthlyDataOptions = {
    chart: { type: 'area', height: 260, backgroundColor: 'transparent' },
    title: { text: '' },
    xAxis: { 
      categories: reportData.monthlyCollections?.length > 0 
        ? reportData.monthlyCollections.map(m => monthNames[(m._id || 1) - 1] || 'N/A')
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    },
    yAxis: { title: { text: '' } },
    series: [
      { 
        name: 'Income', 
        data: reportData.monthlyCollections?.length > 0 
          ? reportData.monthlyCollections.map(m => m.total || 0)
          : [0, 0, 0, 0, 0, 0], 
        color: '#10B981', 
        fillOpacity: 0.1 
      },
      { 
        name: 'Expense', 
        data: reportData.monthlyExpenses?.length > 0 
          ? reportData.monthlyExpenses.map(m => m.total || 0)
          : [0, 0, 0, 0, 0, 0], 
        color: '#EF4444', 
        fillOpacity: 0.1 
      }
    ],
    credits: { enabled: false }
  };

  const reportOptions = [
    'Daily Collection Report',
    'Date-wise Collection',
    'Payment-mode Report',
    'Course-wise Fee Report',
    'Pending Dues Report',
    'Installment Report',
    'Discount Report',
    'Scholarship Report',
    'Refund Report',
    'Expense Report',
    'Income Report',
    'Income vs Expense',
    'Monthly Financial Summary'
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Financial Reports</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Generate, view, and export accounting and ledger statements</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => toast.success('Exporting PDF...')} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export PDF
          </button>
          <button onClick={() => toast.success('Exporting Excel...')} className="flex items-center gap-2 px-4 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold transition-colors">
            <Download size={15} /> Export Excel
          </button>
        </div>
      </div>

      {/* Selector and Parameters */}
      <div className="p-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[12px] font-semibold text-gray-600 mb-1">Select Report Type</label>
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
            className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            {reportOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-gray-600 mb-1">From Date</label>
          <input 
            type="date" 
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-gray-600 mb-1">To Date</label>
          <input 
            type="date" 
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          />
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        {/* Dynamic Metric Cards based on report */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50/50 border border-green-100 rounded-xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[12px] text-gray-500 font-medium">Total Revenue / Income</span>
              <h4 className="text-[20px] font-bold text-green-700">₹{(reportData.totalIncome || reportData.totalFeeCollected || 0).toLocaleString()}</h4>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="bg-red-50/50 border border-red-100 rounded-xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[12px] text-gray-500 font-medium">Total Operating Expense</span>
              <h4 className="text-[20px] font-bold text-red-700">₹{(reportData.totalExpenses || 0).toLocaleString()}</h4>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <TrendingDown size={20} />
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[12px] text-gray-500 font-medium">Net Profit / Surplus</span>
              <h4 className="text-[20px] font-bold text-blue-700">₹{(reportData.netBalance || 0).toLocaleString()}</h4>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <BarChart3 size={20} />
            </div>
          </div>
        </div>

        {/* Charts and Data Visualizations */}
        <div className="bg-gray-50/40 p-4 border border-gray-100 rounded-xl">
          <h4 className="font-bold text-gray-800 text-[14px] mb-4">Financial Flow Graph</h4>
          {loading ? (
            <SkeletonLoader type="chart" rows={2} />
          ) : (
            <HCReact highcharts={Highcharts} options={monthlyDataOptions} />
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;

