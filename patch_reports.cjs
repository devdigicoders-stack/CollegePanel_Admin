const fs = require('fs');
const path = require('path');

const filepath = path.join('d:', 'Desktop', 'DCT_CLG_CRM', 'admin', 'src', 'pages', 'hostel-warden', 'Reports.jsx');

const content = `import React, { useState, useEffect } from 'react';
import { Search, Download, Calendar, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axiosInstance from '../../../utils/axiosInstance';
import toast from 'react-hot-toast';

const HCReact = HighchartsReact.default || HighchartsReact;

const HostelReports = () => {
  const [reportType, setReportType] = useState('Hostel Occupancy Report');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [stats, setStats] = useState({
    totalCapacity: 0,
    totalOccupied: 0,
    available: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get('/hostel/dashboard');
      if (res.data && res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (error) {
      toast.error('Failed to load report stats');
    }
  };

  const occupancyRatio = stats.totalCapacity > 0 ? ((stats.totalOccupied / stats.totalCapacity) * 100).toFixed(1) : 0;

  const monthlyOccupancyOptions = {
    chart: { type: 'area', height: 260, backgroundColor: 'transparent' },
    title: { text: '' },
    xAxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    yAxis: { title: { text: '' } },
    series: [
      { name: 'Occupied Beds', data: [stats.totalOccupied - 20, stats.totalOccupied - 10, stats.totalOccupied - 5, stats.totalOccupied, stats.totalOccupied, stats.totalOccupied], color: '#0A6C54', fillOpacity: 0.1 }
    ],
    credits: { enabled: false }
  };

  const reportOptions = [
    'Hostel Occupancy Report',
    'Available Room Report',
    'Student Allotment Report',
    'Check-In/Check-Out Report',
    'Daily Attendance Report',
    'Leave and Outing Report',
    'Late-Return Report',
    'Visitor Report',
    'Complaint Report',
    'Maintenance Report',
    'Discipline Incident Report',
    'Fee Defaulter Report',
    'Asset Issue Report',
    'Damage Recovery Report'
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Hostel Audits & Reports</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium font-semibold">Generate occupancy ratios, curfew incident summaries, and asset reports</p>
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
      <div className="p-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/30">
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
            className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-gray-600 mb-1">To Date</label>
          <input 
            type="date" 
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50/50 border border-green-100 rounded-xl p-5 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[12px] text-gray-500 font-semibold uppercase tracking-wider">Total Hostel Beds</span>
              <h4 className="text-[20px] font-bold text-green-700">{stats.totalCapacity}</h4>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="bg-red-50/50 border border-red-100 rounded-xl p-5 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[12px] text-gray-500 font-semibold uppercase tracking-wider">Vacant Beds</span>
              <h4 className="text-[20px] font-bold text-red-700">{stats.available}</h4>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <TrendingDown size={20} />
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[12px] text-gray-500 font-semibold uppercase tracking-wider">Occupancy Ratio</span>
              <h4 className="text-[20px] font-bold text-blue-700">{occupancyRatio}%</h4>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <BarChart3 size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 border border-gray-100 rounded-xl shadow-sm">
          <h4 className="font-bold text-gray-800 text-[14px] mb-4 font-semibold uppercase tracking-wider">Bed Occupancy Growth Rate</h4>
          <HCReact highcharts={Highcharts} options={monthlyOccupancyOptions} />
        </div>
      </div>
    </div>
  );
};

export default HostelReports;
`;

fs.writeFileSync(filepath, content, 'utf-8');
console.log("Rewrote Reports.jsx");
