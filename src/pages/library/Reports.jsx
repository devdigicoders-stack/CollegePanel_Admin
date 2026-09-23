import { useState, useEffect, useMemo } from 'react';
import { 
  Search, BarChart3, TrendingUp, TrendingDown, 
  FileText, Printer, 
  ChevronLeft, ChevronRight, Layers, FileSpreadsheet
} from 'lucide-react';
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

  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
  const collegeName = adminInfo.collegeName || adminInfo.name || 'DigiCampusPro Central Library';

  const [reportType, setReportType] = useState('Lost Books Report');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({ 
    metrics: [], 
    chartData: { title: '', categories: [], series: [] }, 
    columns: [], 
    records: [] 
  });
  const [tableSearch, setTableSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const reportOptions = [
    'Lost Books Report',
    'Damaged Books Report',
    'Overdue Books Report',
    'Fine Collection Report',
    'Issued Books Report',
    'Returned Books Report',
    'Book Inventory Report',
    'Most Issued Books',
    'Member Activity Report',
    'Department-wise Usage',
    'Stock Verification Report',
    'Daily Transaction Report'
  ];

  useEffect(() => {
    fetchData();
    setCurrentPage(1);
    setTableSearch('');
  }, [reportType, dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('reportType', reportType);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);

      const res = await axiosInstance.get(`/library/reports/custom?${params.toString()}`);
      setReportData({
        metrics: res.data.metrics || [],
        chartData: res.data.chartData || { title: '', categories: [], series: [] },
        columns: res.data.columns || [],
        records: res.data.records || []
      });
    } catch (error) {
      console.error('Report fetch error:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleDatePreset = (preset) => {
    const today = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];

    if (preset === 'today') {
      const t = formatDate(today);
      setDateRange({ start: t, end: t });
    } else if (preset === '7days') {
      const past = new Date();
      past.setDate(today.getDate() - 7);
      setDateRange({ start: formatDate(past), end: formatDate(today) });
    } else if (preset === '30days') {
      const past = new Date();
      past.setDate(today.getDate() - 30);
      setDateRange({ start: formatDate(past), end: formatDate(today) });
    } else if (preset === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setDateRange({ start: formatDate(firstDay), end: formatDate(today) });
    } else if (preset === 'all') {
      setDateRange({ start: '', end: '' });
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
      case 'up': return { bg: 'bg-emerald-50/60', border: 'border-emerald-200', text: 'text-emerald-800', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-700' };
      case 'down': return { bg: 'bg-rose-50/60', border: 'border-rose-200', text: 'text-rose-800', iconBg: 'bg-rose-100', iconColor: 'text-rose-700' };
      case 'chart': return { bg: 'bg-blue-50/60', border: 'border-blue-200', text: 'text-blue-800', iconBg: 'bg-blue-100', iconColor: 'text-blue-700' };
      default: return { bg: 'bg-indigo-50/60', border: 'border-indigo-200', text: 'text-indigo-800', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-700' };
    }
  };

  // Filter records based on table search
  const filteredRecords = useMemo(() => {
    if (!reportData.records) return [];
    if (!tableSearch.trim()) return reportData.records;

    const term = tableSearch.toLowerCase();
    return reportData.records.filter(row => {
      return Object.values(row).some(val => 
        val && String(val).toLowerCase().includes(term)
      );
    });
  }, [reportData.records, tableSearch]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  const handleExportExcel = () => {
    if (!reportData.records?.length && !reportData.metrics?.length) {
      toast.error('No data available to export');
      return;
    }

    const workbook = XLSX.utils.book_new();

    // 1. Export Metrics
    if (reportData.metrics?.length) {
      const metricsData = [
        { 'Report Type': reportType, 'Date Period': `${dateRange.start || 'Start'} to ${dateRange.end || 'Today'}` },
        {},
        ...reportData.metrics.map(m => ({
          'Metric': m.label,
          'Value': m.value
        }))
      ];
      const wsMetrics = XLSX.utils.json_to_sheet(metricsData);
      XLSX.utils.book_append_sheet(workbook, wsMetrics, 'Report Summary');
    }

    // 2. Export Detailed Records
    if (reportData.records?.length && reportData.columns?.length) {
      const tableData = reportData.records.map(row => {
        const obj = {};
        reportData.columns.forEach(col => {
          obj[col.header] = row[col.key] !== undefined ? row[col.key] : '—';
        });
        return obj;
      });
      const wsTable = XLSX.utils.json_to_sheet(tableData);
      XLSX.utils.book_append_sheet(workbook, wsTable, 'Detailed Audit Records');
    }

    XLSX.writeFile(workbook, `Library_${reportType.replace(/\s+/g, '_')}_Audit.xlsx`);
    toast.success('Excel report exported successfully');
  };  const handlePrintPDF = () => {
    if (!reportData.records?.length && !reportData.metrics?.length) {
      toast.error('No data available to print');
      return;
    }

    const recordsToPrint = filteredRecords.length > 0 ? filteredRecords : reportData.records;

    const getStatusBadgeHtml = (val) => {
      if (!val) return '—';
      const s = String(val).toLowerCase();
      let colorStyle = 'background: #F1F5F9; color: #334155; border: 1px solid #CBD5E1;';
      if (s.includes('lost') || s.includes('overdue') || s.includes('defaulter') || s.includes('unpaid') || s.includes('damaged')) {
        colorStyle = 'background: #FFE4E6; color: #9F1239; border: 1px solid #FECDD3;';
      } else if (s.includes('recovered') || s.includes('returned') || s.includes('paid') || s.includes('available') || s.includes('clear')) {
        colorStyle = 'background: #DCFCE7; color: #166534; border: 1px solid #BBF7D0;';
      } else if (s.includes('pending') || s.includes('issued') || s.includes('borrowing')) {
        colorStyle = 'background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A;';
      }
      return `<span style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 8.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3px; ${colorStyle}">${val}</span>`;
    };

    const metricsHtml = reportData.metrics?.map(m => `
      <div style="flex: 1; border: 1px solid #CBD5E1; border-radius: 6px; padding: 6px 12px; background: #F8FAFC;">
        <div style="font-size: 9px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.4px;">${m.label}</div>
        <div style="font-size: 16px; font-weight: 900; color: #0F172A; margin-top: 2px;">${m.value}</div>
      </div>
    `).join('') || '';

    const columnsHtml = reportData.columns?.map(c => `
      <th style="padding: 7px 8px; background: #9F1239; color: #FFFFFF; font-weight: 700; font-size: 9px; text-transform: uppercase; letter-spacing: 0.3px; border: 1px solid #881337; text-align: ${c.align || 'left'}; white-space: nowrap;">
        ${c.header}
      </th>
    `).join('') || '';

    const rowsHtml = recordsToPrint.map((row, idx) => `
      <tr style="background: ${idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'};">
        ${reportData.columns.map(c => {
          const val = row[c.key];
          const isStatus = ['status', 'fineStatus', 'stockStatus'].includes(c.key);
          let cellContent = (val !== undefined && val !== null && val !== '') ? String(val) : '—';
          if (isStatus && val) {
            cellContent = getStatusBadgeHtml(val);
          }
          const isBold = c.align === 'right' || c.key === 'accessionNo' || c.key === 'transactionId';
          return `
            <td style="padding: 5px 8px; font-size: 9.5px; border: 1px solid #CBD5E1; text-align: ${c.align || 'left'}; color: #1E293B; word-break: break-word; font-weight: ${isBold ? '700' : '500'};">
              ${cellContent}
            </td>
          `;
        }).join('')}
      </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${reportType} - Audit Report</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 8mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #FFFFFF;
      color: #0F172A;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      font-size: 10px;
      line-height: 1.3;
    }
    .header {
      border-bottom: 2.5px solid #9F1239;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }
    .header-title {
      font-size: 18px;
      font-weight: 900;
      color: #9F1239;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .header-sub {
      font-size: 12px;
      font-weight: 700;
      color: #334155;
      margin-top: 2px;
    }
    .metrics-container {
      display: flex;
      gap: 10px;
      margin-bottom: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: auto;
    }
    thead {
      display: table-header-group;
    }
    tr {
      page-break-inside: avoid;
    }
    .footer {
      margin-top: 18px;
      padding-top: 10px;
      border-top: 1px solid #CBD5E1;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 9.5px;
      color: #64748B;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="header">
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <h1 class="header-title">${collegeName}</h1>
        <div class="header-sub">CENTRAL LIBRARY • ${reportType.toUpperCase()}</div>
      </div>
      <div style="text-align: right; font-size: 10px; color: #64748B; line-height: 1.4;">
        <div><strong>Period:</strong> ${dateRange.start || 'Start'} to ${dateRange.end || 'Today'}</div>
        <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
        <div><strong>Total Records:</strong> ${recordsToPrint.length}</div>
      </div>
    </div>
  </div>

  ${metricsHtml ? `<div class="metrics-container">${metricsHtml}</div>` : ''}

  <div style="margin-bottom: 6px; font-size: 11px; font-weight: 700; color: #334155;">
    Itemized Audit Register (${recordsToPrint.length} Records):
  </div>

  <table>
    <thead>
      <tr>
        ${columnsHtml}
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="footer">
    <div>
      <strong>Certified Official Library Log</strong><br>
      System-generated record from DigiCampusPro Library ERP
    </div>
    <div style="text-align: right;">
      <div style="border-top: 1.5px solid #334155; width: 180px; margin-bottom: 5px; display: inline-block;"></div>
      <div style="font-weight: 700; color: #1E293B;">Authorized Librarian Signature</div>
    </div>
  </div>
</body>
</html>`;

    // Execute Print via hidden iframe (bypass popup blockers entirely)
    let printIframe = document.getElementById('library-report-print-iframe');
    if (printIframe) {
      document.body.removeChild(printIframe);
    }
    printIframe = document.createElement('iframe');
    printIframe.id = 'library-report-print-iframe';
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = '0';
    document.body.appendChild(printIframe);

    const frameDoc = printIframe.contentWindow.document;
    frameDoc.open();
    frameDoc.write(html);
    frameDoc.close();

    setTimeout(() => {
      try {
        printIframe.contentWindow.focus();
        printIframe.contentWindow.print();
      } catch (err) {
        console.error('Iframe print error, falling back to window.print():', err);
        window.print();
      }
    }, 400);
  };

  const chartOptions = {
    chart: { 
      type: reportData.chartData?.series?.length > 1 ? 'column' : 'column', 
      height: 270, 
      backgroundColor: 'transparent' 
    },
    title: { text: '' },
    xAxis: { 
      categories: reportData.chartData?.categories || [],
      labels: { style: { fontSize: '11px', fontFamily: 'Inter' } }
    },
    yAxis: { 
      title: { text: '' },
      labels: { style: { fontSize: '11px', fontFamily: 'Inter' } }
    },
    legend: {
      itemStyle: { fontSize: '12px', fontWeight: 'bold', fontFamily: 'Inter' }
    },
    tooltip: {
      borderRadius: 8,
      backgroundColor: '#1E293B',
      style: { color: '#F8FAFC' }
    },
    series: reportData.chartData?.series || [],
    credits: { enabled: false }
  };

  const getStatusBadge = (val) => {
    if (!val) return '—';
    const s = String(val).toLowerCase();
    if (s.includes('lost') || s.includes('overdue') || s.includes('defaulter') || s.includes('unpaid')) {
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-200">{val}</span>;
    }
    if (s.includes('recovered') || s.includes('returned') || s.includes('paid') || s.includes('available') || s.includes('clear')) {
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">{val}</span>;
    }
    if (s.includes('pending') || s.includes('issued') || s.includes('borrowing')) {
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-200">{val}</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">{val}</span>;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col font-['Inter']">
      
      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 8mm;
          }
          html, body {
            background: white !important;
            color: #0F172A !important;
            width: 100% !important;
            overflow: visible !important;
          }
          nav, aside, header, footer, .print\\:hidden, button, input, select {
            display: none !important;
          }
          *::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          * {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          .overflow-x-auto, .overflow-hidden, .overflow-y-auto {
            overflow: visible !important;
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          table {
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
            table-layout: auto !important;
            border-collapse: collapse !important;
            font-size: 9.5px !important;
          }
          th, td {
            padding: 4px 6px !important;
            border: 1px solid #CBD5E1 !important;
            white-space: normal !important;
            word-break: break-word !important;
          }
          th {
            background-color: #9F1239 !important;
            color: #FFFFFF !important;
            font-weight: 700 !important;
            font-size: 9.5px !important;
            text-transform: uppercase !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          tr {
            page-break-inside: avoid !important;
          }
        }
      `}</style>
      
      {/* Print-Only Header */}
      <div className="hidden print:block pb-4 mb-3 border-b-2 border-[#9F1239]">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black text-[#9F1239] uppercase tracking-wide">
              {collegeName}
            </h1>
            <div className="text-xs font-bold text-gray-800 mt-0.5">
              CENTRAL LIBRARY • {reportType.toUpperCase()}
            </div>
          </div>
          <div className="text-right text-[10px] text-gray-600 font-semibold space-y-0.5">
            <div><strong>Period:</strong> {dateRange.start || 'Start'} to {dateRange.end || 'Today'}</div>
            <div><strong>Generated:</strong> {new Date().toLocaleString()}</div>
            <div><strong>Total Records:</strong> {filteredRecords.length}</div>
          </div>
        </div>
      </div>

      {/* Screen Header Bar */}
      <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-[17px] font-black text-gray-800">Library Logs & Reports</h2>
            <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
              {reportType}
            </span>
          </div>
          <p className="text-[12px] text-gray-500 mt-1 font-medium">
            Dynamic analytics, loss & overdue audits, revenue summaries, and full transaction ledgers
          </p>
        </div>

        <div className="flex gap-2.5 flex-wrap">
          <button 
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-gray-300 rounded-xl text-[13px] font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-sm"
          >
            <Printer size={15} className="text-gray-600" /> Print / PDF
          </button>
          <button 
            onClick={handleExportExcel} 
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-[13px] font-semibold transition-all shadow-sm"
          >
            <FileSpreadsheet size={15} /> Export Excel
          </button>
        </div>
      </div>

      {/* Filter & Preset Controls */}
      <div className="p-6 border-b border-gray-100 bg-gray-50/40 space-y-4 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[12px] font-bold text-gray-700 mb-1">Select Report Type</label>
            <select 
              value={reportType} 
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-800 py-2.5 px-3.5 rounded-xl text-[13px] font-bold focus:outline-none focus:ring-1 focus:ring-primary shadow-sm cursor-pointer"
            >
              {reportOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-gray-700 mb-1">From Date</label>
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-3.5 rounded-xl text-[13px] font-semibold focus:outline-none focus:ring-1 focus:ring-primary shadow-sm cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-gray-700 mb-1">To Date</label>
            <input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-3.5 rounded-xl text-[13px] font-semibold focus:outline-none focus:ring-1 focus:ring-primary shadow-sm cursor-pointer"
            />
          </div>
        </div>

        {/* Quick Date Presets */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-gray-200/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Quick Presets:</span>
            <button onClick={() => handleDatePreset('today')} className="px-2.5 py-1 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold text-[11px]">Today</button>
            <button onClick={() => handleDatePreset('7days')} className="px-2.5 py-1 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold text-[11px]">Last 7 Days</button>
            <button onClick={() => handleDatePreset('30days')} className="px-2.5 py-1 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold text-[11px]">Last 30 Days</button>
            <button onClick={() => handleDatePreset('month')} className="px-2.5 py-1 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold text-[11px]">This Month</button>
            <button onClick={() => handleDatePreset('all')} className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[11px]">All Time</button>
          </div>

          <div className="text-[11px] font-semibold text-gray-500">
            Showing audit for: <span className="font-bold text-gray-800">{dateRange.start ? `${dateRange.start} to ${dateRange.end || 'Today'}` : 'All Recorded History'}</span>
          </div>
        </div>
      </div>

      {/* Main Report Content */}
      <div className="p-6 space-y-6 flex-1 print:p-0 print:space-y-3">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 text-gray-500 space-y-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-sm">Generating {reportType}...</p>
          </div>
        ) : (
          <>
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
              {reportData.metrics?.map((metric, idx) => {
                const style = getStyle(metric.iconType);
                return (
                  <div 
                    key={idx} 
                    className={`${style.bg} border ${style.border} rounded-2xl p-5 flex items-center justify-between transition-all shadow-xs print:p-2.5 print:rounded-lg print:border print:shadow-none`}
                  >
                    <div className="space-y-1 print:space-y-0">
                      <span className="text-[11px] print:text-[8.5px] text-gray-500 font-bold uppercase tracking-wider">{metric.label}</span>
                      <h4 className={`text-[22px] print:text-[14px] font-black ${style.text}`}>{metric.value}</h4>
                    </div>
                    <div className={`w-11 h-11 rounded-xl ${style.iconBg} flex items-center justify-center ${style.iconColor} shadow-xs print:hidden`}>
                      {getIcon(metric.iconType)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Highcharts Visual */}
            {reportData.chartData?.series?.length > 0 && (
              <div className="bg-gray-50/50 p-5 border border-gray-100 rounded-2xl print:hidden">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[13px] font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 size={16} className="text-primary" />
                    {reportData.chartData.title || 'Circulation & Audit Analytics'}
                  </h4>
                  <span className="text-[11px] text-gray-400 font-medium">Interactive Highcharts Visual</span>
                </div>
                <HCReact highcharts={Highcharts} options={chartOptions} />
              </div>
            )}

            {/* Detailed Audit Table Section */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
                <div>
                  <h3 className="font-black text-gray-800 text-[15px] flex items-center gap-2">
                    <Layers size={16} className="text-primary" /> Detailed Audit Records ({filteredRecords.length})
                  </h3>
                  <p className="text-[11px] text-gray-500">Itemized line-by-line audit trail for {reportType}</p>
                </div>

                {/* Table Search */}
                <div className="relative w-full sm:w-72">
                  <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search in audit records..."
                    value={tableSearch}
                    onChange={(e) => { setTableSearch(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-9 pr-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-xs bg-white print:border-none print:shadow-none print:overflow-visible">
                <div className="overflow-x-auto print:overflow-visible">
                  <table className="w-full text-left border-collapse min-w-[800px] print:min-w-0 print:w-full">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-black text-gray-700 uppercase tracking-wider print:bg-[#9F1239] print:text-white">
                        {reportData.columns?.map(col => (
                          <th 
                            key={col.key} 
                            className={`py-3.5 px-4 print:py-1.5 print:px-2 print:text-[9px] print:border print:border-[#881337] print:text-white ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                          >
                            {col.header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-[12px] print:divide-gray-200">
                      {paginatedRecords.length > 0 ? (
                        paginatedRecords.map((row, idx) => (
                          <tr key={row._id || idx} className="hover:bg-gray-50/60 transition-colors print:bg-white">
                            {reportData.columns.map(col => {
                              const val = row[col.key];
                              return (
                                <td 
                                  key={col.key} 
                                  className={`py-3.5 px-4 print:py-1.5 print:px-2 print:text-[9px] print:border print:border-gray-300 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right font-bold' : 'text-left font-medium text-gray-800'}`}
                                >
                                  {col.key === 'status' || col.key === 'fineStatus' || col.key === 'stockStatus'
                                    ? getStatusBadge(val)
                                    : (val !== undefined && val !== null && val !== '') ? String(val) : '—'}
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={reportData.columns?.length || 5} className="py-12 text-center text-gray-400 text-sm">
                            <FileText size={32} className="mx-auto mb-2 opacity-40 text-gray-300" />
                            No audit records found for this period and filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Print-Only Signature Footer */}
                <div className="hidden print:flex justify-between items-end pt-6 mt-6 border-t border-gray-300 text-[10px] text-gray-600">
                  <div>
                    Certified Official Library Log<br />
                    System-generated record from DigiCampusPro Library ERP
                  </div>
                  <div className="text-right">
                    <div className="border-t border-gray-800 w-44 mb-1 inline-block"></div>
                    <div className="font-bold text-gray-800">Authorized Librarian / Admin Signature</div>
                  </div>
                </div>

                {/* Table Pagination */}
                {filteredRecords.length > pageSize && (
                  <div className="p-3.5 border-t border-gray-100 flex items-center justify-between text-xs bg-gray-50/50 print:hidden">
                    <span className="text-gray-500 font-medium">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} records
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={`p-1.5 rounded-lg border text-gray-600 ${currentPage === 1 ? 'opacity-40 cursor-not-allowed bg-gray-100' : 'bg-white hover:bg-gray-50 border-gray-200'}`}
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg font-bold text-gray-700">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={`p-1.5 rounded-lg border text-gray-600 ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed bg-gray-100' : 'bg-white hover:bg-gray-50 border-gray-200'}`}
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default LibraryReports;
