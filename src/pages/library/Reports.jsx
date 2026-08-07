import React, { useState, useEffect } from 'react';
import { Search, Download, Calendar, BarChart3, PieChart, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const HCReact = HighchartsReact.default || HighchartsReact;

const LibraryReports = () => {
  if (!checkPermission('View Books')) {
    return <AccessDenied />;
  }
  const [reportType, setReportType] = useState('Issued Books Report');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({ metrics: [], chartData: {} });

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

  useEffect(() => {
    fetchData();
  }, [reportType, dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('reportType', reportType);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);

      const res = await axiosInstance.get(`/library/reports/custom?${params.toString()}`);
      setReportData(res.data);
    } catch (error) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'up': return <TrendingUp size={20} />;
      case 'down': return <TrendingDown size={20} />;
      case 'chart': return <BarChart3 size={20} />;
      default: return <FileText size={20} />;
    }
  };

  const getStyle = (type) => {
    switch(type) {
      case 'up': return { bg: 'bg-green-50/50', border: 'border-green-100', text: 'text-green-700', iconBg: 'bg-green-100', iconColor: 'text-green-600' };
      case 'down': return { bg: 'bg-red-50/50', border: 'border-red-100', text: 'text-red-700', iconBg: 'bg-red-100', iconColor: 'text-red-600' };
      case 'chart': return { bg: 'bg-blue-50/50', border: 'border-blue-100', text: 'text-blue-700', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' };
      default: return { bg: 'bg-gray-50/50', border: 'border-gray-100', text: 'text-gray-700', iconBg: 'bg-gray-100', iconColor: 'text-gray-600' };
    }
  };

  const handleExportExcel = () => {
    if (!reportData.metrics?.length && !reportData.chartData?.categories?.length) {
      toast.error('No data to export');
      return;
    }

    const workbook = XLSX.utils.book_new();

    // Export Metrics
    if (reportData.metrics?.length) {
      const metricsData = reportData.metrics.map(m => ({
        'Metric': m.label,
        'Value': m.value
      }));
      const wsMetrics = XLSX.utils.json_to_sheet(metricsData);
      XLSX.utils.book_append_sheet(workbook, wsMetrics, 'Metrics');
    }

    // Export Chart Data
    if (reportData.chartData?.categories?.length && reportData.chartData?.series?.length) {
      const chartExportData = [];
      reportData.chartData.categories.forEach((cat, idx) => {
        const row = { 'Category / Date': cat };
        reportData.chartData.series.forEach(s => {
          row[s.name] = s.data[idx];
        });
        chartExportData.push(row);
      });
      const wsChart = XLSX.utils.json_to_sheet(chartExportData);
      XLSX.utils.book_append_sheet(workbook, wsChart, 'Chart Data');
    }

    XLSX.writeFile(workbook, `Library_${reportType.replace(/\s+/g, '_')}_Report.xlsx`);
  };

  const chartOptions = {
    chart: { type: reportData.chartData?.series?.length > 1 ? 'area' : 'column', height: 260, backgroundColor: 'transparent' },
    title: { text: '' },
    xAxis: { categories: reportData.chartData?.categories || [] },
    yAxis: { title: { text: '' } },
    series: reportData.chartData?.series || [],
    credits: { enabled: false }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Library Logs & Reports</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Generate book circulation audits, fine collection summaries, and category stats</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors opacity-50 cursor-not-allowed" title="PDF export coming soon">
            <Download size={15} /> Export PDF
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold transition-colors">
            <Download size={15} /> Export Excel
          </button>
        </div>
      </div>

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
        {loading ? (
          <div className="flex justify-center items-center h-48 text-gray-500 font-medium">Generating Report...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reportData.metrics?.map((metric, idx) => {
                const style = getStyle(metric.iconType);
                return (
                  <div key={idx} className={`${style.bg} border ${style.border} rounded-xl p-5 flex items-center justify-between transition-all hover:shadow-sm`}>
                    <div className="space-y-1">
                      <span className="text-[12px] text-gray-500 font-semibold uppercase tracking-wider">{metric.label}</span>
                      <h4 className={`text-[20px] font-bold ${style.text}`}>{metric.value}</h4>
                    </div>
                    <div className={`w-10 h-10 rounded-lg ${style.iconBg} flex items-center justify-center ${style.iconColor}`}>
                      {getIcon(metric.iconType)}
                    </div>
                  </div>
                );
              })}
            </div>

            {reportData.chartData?.series?.length > 0 ? (
              <div className="bg-gray-50/40 p-5 border border-gray-100 rounded-xl">
                <h4 className="font-bold text-gray-800 text-[14px] mb-4 font-semibold uppercase tracking-wider">{reportData.chartData.title}</h4>
                <HCReact highcharts={Highcharts} options={chartOptions} />
              </div>
            ) : (
               <div className="flex justify-center items-center h-48 border border-dashed border-gray-200 rounded-xl text-gray-500 font-medium">No data available for the selected range</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LibraryReports;
