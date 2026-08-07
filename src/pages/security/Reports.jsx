import { useState, useEffect } from 'react';
import { Download, Calendar, BarChart3, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const HCReact = HighchartsReact.default || HighchartsReact;

const SecurityReports = () => {
  if (!checkPermission('View Security Dashboard')) {
    return <AccessDenied />;
  }
  const [reportType, setReportType] = useState('Daily Entry Report');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [stats, setStats] = useState({ 
    totalVisitors: 0, 
    vehiclesChecked: 0, 
    incidents: 0,
    studentsInside: 0,
    studentsOutside: 0,
    visitorsInside: 0,
    pendingOuting: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [reportType, dateRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/security/dashboard/stats');
      const data = res.data;
      setStats({
        totalVisitors: data.totalVisitors || 0,
        vehiclesChecked: data.vehiclesChecked || 0,
        incidents: data.incidents?.length || 0,
        studentsInside: data.studentsInsideCount || 0,
        studentsOutside: data.studentsOutsideCount || 0,
        visitorsInside: data.visitorsInside || 0,
        pendingOuting: data.pendingOuting || 0
      });
    } catch (error) {
      toast.error('Failed to load report stats');
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    chart: { type: 'column', height: 320, backgroundColor: 'transparent', style: { fontFamily: 'Inter' } },
    title: { text: 'Campus Security Occupancy', style: { fontWeight: 'bold', fontSize: '14px', color: '#374151' } },
    xAxis: { categories: ['Total Visitors (Today)', 'Active Visitors (Inside)', 'Students (Inside)', 'Students (Outside)'] },
    yAxis: { title: { text: 'Headcount' }, gridLineColor: '#f3f4f6' },
    plotOptions: {
      column: {
        borderRadius: 4,
        dataLabels: { enabled: true, style: { fontWeight: 'bold' } }
      }
    },
    series: [
      { 
        name: 'Headcount', 
        data: [
          { y: stats.totalVisitors, color: '#3b82f6' }, 
          { y: stats.visitorsInside, color: '#0ea5e9' },
          { y: stats.studentsInside, color: '#10b981' },
          { y: stats.studentsOutside, color: '#f59e0b' }
        ],
        showInLegend: false
      }
    ],
    credits: { enabled: false }
  };

  const reportOptions = [
    'Daily Entry Report',
    'Visitor Check-In Log',
    'Vehicle Outing Report',
    'Gate Pass Audit',
    'Security Incidents Report',
    'Hostel Late Entry Log'
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter'] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800 flex items-center gap-2">
            <PieChart className="text-[#0A6C54]" size={20} />
            Gate Security Audits & Reports
          </h2>
          <p className="text-[12px] text-gray-500 mt-1 font-medium">Generate vehicle checklogs, student outing logs, and dynamic gate count reports</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              const exportData = [{
                'Report Date': new Date().toLocaleDateString('en-IN'),
                'Total Visitors': stats.totalVisitors,
                'Active Visitors': stats.visitorsInside,
                'Students Inside': stats.studentsInside,
                'Students Outside': stats.studentsOutside,
                'Vehicles Logged': stats.vehiclesChecked,
                'Pending Gatepasses': stats.pendingOuting,
                'Total Incidents': stats.incidents
              }];
              const ws = XLSX.utils.json_to_sheet(exportData);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, 'Security Report');
              XLSX.writeFile(wb, `Security_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-bold transition-colors shadow-sm"
          >
            <Download size={15} /> Generate Excel
          </button>
        </div>
      </div>

      {/* Selector and Parameters */}
      <div className="p-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white">
        <div>
          <label className="block text-[12px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Select Report Type</label>
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 py-3 px-4 rounded-xl text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] cursor-pointer transition-all shadow-sm"
          >
            {reportOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Start Date</label>
          <input 
            type="date" 
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 py-3 px-4 rounded-xl text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all shadow-sm"
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">End Date</label>
          <input 
            type="date" 
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 py-3 px-4 rounded-xl text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20 focus:border-[#0A6C54] transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto bg-gray-50/30">
        {loading ? (
           <div className="flex items-center justify-center py-12 text-gray-400 text-[13px] font-semibold">Compiling security metrics...</div>
        ) : (
          <>
            {/* Dynamic Metric Cards based on report */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border-b-4 border-b-blue-500 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <TrendingUp size={24} />
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">Live</span>
                </div>
                <h4 className="text-[28px] font-black text-gray-800">{stats.totalVisitors}</h4>
                <span className="text-[13px] text-gray-500 font-medium">Total Visitors Logged</span>
              </div>

              <div className="bg-white border-b-4 border-b-[#0A6C54] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0A6C54]/10 flex items-center justify-center text-[#0A6C54]">
                    <BarChart3 size={24} />
                  </div>
                  <span className="text-[11px] font-bold text-[#0A6C54] bg-[#0A6C54]/10 px-2.5 py-1 rounded-full border border-[#0A6C54]/20">Today</span>
                </div>
                <h4 className="text-[28px] font-black text-gray-800">{stats.vehiclesChecked}</h4>
                <span className="text-[13px] text-gray-500 font-medium">Vehicles Authenticated</span>
              </div>

              <div className="bg-white border-b-4 border-b-orange-400 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                    <Calendar size={24} />
                  </div>
                  <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">Pending</span>
                </div>
                <h4 className="text-[28px] font-black text-gray-800">{stats.pendingOuting}</h4>
                <span className="text-[13px] text-gray-500 font-medium">Gate Pass Queue</span>
              </div>

              <div className="bg-white border-b-4 border-b-red-500 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                    <TrendingDown size={24} />
                  </div>
                  <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">Alerts</span>
                </div>
                <h4 className="text-[28px] font-black text-gray-800">{stats.incidents}</h4>
                <span className="text-[13px] text-gray-500 font-medium">Incidents Recorded</span>
              </div>
            </div>

            {/* Charts and Data Visualizations */}
            <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm mt-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="font-bold text-gray-800 text-[15px]">Real-time Campus Occupancy</h4>
                  <p className="text-[12px] text-gray-500 mt-0.5">Live breakdown of student and visitor presence inside campus walls</p>
                </div>
              </div>
              <div className="pt-2">
                <HCReact highcharts={Highcharts} options={chartOptions} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SecurityReports;
