import React, { useState } from 'react';
import { Search, Download, Calendar, BarChart3, PieChart, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const HCReact = HighchartsReact.default || HighchartsReact;

const LibraryReports = () => {
  const [reportType, setReportType] = useState('Most Issued Books');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const monthlyCirculationOptions = {
    chart: { type: 'column', height: 260, backgroundColor: 'transparent' },
    title: { text: '' },
    xAxis: { categories: ['Mechanical', 'Computer Science', 'Civil', 'Electrical', 'Physics', 'Chemistry'] },
    yAxis: { title: { text: '' } },
    series: [
      { name: 'Total Issues', data: [340, 520, 210, 180, 150, 110], color: '#0A6C54' },
      { name: 'Unreturned Copies', data: [45, 92, 28, 19, 12, 5], color: '#EF4444' }
    ],
    credits: { enabled: false }
  };

  const reportOptions = [
    'Book Inventory Report',
    'Issued Books Report',
    'Returned Books Report',
    'Overdue Books Report',
    'Fine Collection Report',
    'Lost Books Report',
    'Damaged Books Report',
    'Member Activity Report',
    'Most Issued Books',
    'Department-wise Usage',
    'Stock Verification Report',
    'Daily Transaction Report'
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Library Logs & Reports</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Generate book circulation audits, fine collection summaries, and category stats</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold transition-colors">
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
              <span className="text-[12px] text-gray-500 font-medium font-semibold uppercase tracking-wider">Total Book Copies</span>
              <h4 className="text-[20px] font-bold text-green-700">24,800</h4>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="bg-red-50/50 border border-red-100 rounded-xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[12px] text-gray-500 font-medium font-semibold uppercase tracking-wider">Overdue Issues</span>
              <h4 className="text-[20px] font-bold text-red-700">340</h4>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <TrendingDown size={20} />
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[12px] text-gray-500 font-medium font-semibold uppercase tracking-wider">Active Library Members</span>
              <h4 className="text-[20px] font-bold text-blue-700">2,890</h4>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <BarChart3 size={20} />
            </div>
          </div>
        </div>

        {/* Charts and Data Visualizations */}
        <div className="bg-gray-50/40 p-4 border border-gray-100 rounded-xl">
          <h4 className="font-bold text-gray-800 text-[14px] mb-4 font-semibold uppercase tracking-wider">Department-wise Library Utilization</h4>
          <HCReact highcharts={Highcharts} options={monthlyCirculationOptions} />
        </div>
      </div>
    </div>
  );
};

export default LibraryReports;
