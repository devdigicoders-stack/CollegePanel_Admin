import React, { useState } from 'react';
import { Search, Download, Calendar, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const HCReact = HighchartsReact.default || HighchartsReact;

const WorkshopReports = () => {
  const [reportType, setReportType] = useState('Workshop Attendance Report');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const monthlyBreakdownsOptions = {
    chart: { type: 'area', height: 260, backgroundColor: 'transparent' },
    title: { text: '' },
    xAxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    yAxis: { title: { text: '' } },
    series: [
      { name: 'Machine Breakdowns Logged', data: [2, 4, 1, 3, 2, 1], color: '#EF4444', fillOpacity: 0.1 }
    ],
    credits: { enabled: false }
  };

  const reportOptions = [
    'Workshop Attendance Report',
    'Job Completion Report',
    'Machine Usage Report',
    'Tool Issue-Return Report',
    'Consumable Usage Report',
    'Breakdown Report',
    'Damage/Lost Report',
    'Safety Inspection Report'
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Workshop Audits & Reports</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium font-semibold">Generate tool wear reports, machine breakdown statistics, and safety check-off lists</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-[13px] font-semibold transition-colors">
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
            className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
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
            className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-gray-600 mb-1">To Date</label>
          <input 
            type="date" 
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none"
          />
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        {/* Dynamic Metric Cards based on report */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50/50 border border-green-100 rounded-xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[12px] text-gray-500 font-medium font-semibold uppercase tracking-wider">Total Practical Runs</span>
              <h4 className="text-[20px] font-bold text-green-700">84 Sessions</h4>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="bg-red-50/50 border border-red-100 rounded-xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[12px] text-gray-500 font-medium font-semibold uppercase tracking-wider">Breakdowns Reported</span>
              <h4 className="text-[20px] font-bold text-red-700">13 Issues</h4>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <TrendingDown size={20} />
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[12px] text-gray-500 font-medium font-semibold uppercase tracking-wider">Job Completion Ratio</span>
              <h4 className="text-[20px] font-bold text-blue-700">92.4%</h4>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <BarChart3 size={20} />
            </div>
          </div>
        </div>

        {/* Charts and Data Visualizations */}
        <div className="bg-gray-50/40 p-4 border border-gray-100 rounded-xl">
          <h4 className="font-bold text-gray-800 text-[14px] mb-4 font-semibold uppercase tracking-wider">Breakdowns Occurrence Rate</h4>
          <HCReact highcharts={Highcharts} options={monthlyBreakdownsOptions} />
        </div>
      </div>
    </div>
  );
};

export default WorkshopReports;
