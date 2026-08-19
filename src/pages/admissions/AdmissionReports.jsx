import React, { useState, useEffect } from 'react';
import { Download, FileText, BarChart3, ChevronDown } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const reportTypes = [
  'Applications Overview',
  'Course-wise Registrations',
  'Pending Verifications'
];

const AdmissionReports = () => {
  if (!checkPermission('View Admissions')) {
    return <AccessDenied />;
  }
  const [selectedReport, setSelectedReport] = useState('Applications Overview');
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [summaryData, setSummaryData] = useState(null);
  const [reportData, setReportData] = useState({ columns: [], data: [] });
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Fetch summary stats on load
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/admissions/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.stats) {
          const stats = res.data.stats;
          setSummaryData([
            { label: 'Total Applications', value: stats.totalApplications || 0 },
            { label: 'Approved Admissions', value: stats.approvedAdmissions || 0 },
            { label: 'Cancelled Admissions', value: stats.rejectedAdmissions || 0 },
          ]);
        }
      } catch (error) {
        console.error('Error fetching summary stats', error);
      } finally {
        setSummaryLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const generateReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/reports/admissions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          reportType: selectedReport,
          startDate: fromDate,
          endDate: toDate,
          status: statusFilter
        }
      });
      setReportData({
        columns: res.data.columns || [],
        data: res.data.data || []
      });
      if (res.data.data?.length === 0) {
        toast.error('No data found for the selected date range.');
      } else {
        toast.success('Report generated successfully!');
      }
    } catch (error) {
      console.error('Error generating report', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!reportData.data || reportData.data.length === 0) {
      toast.error('No data to export!');
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${selectedReport} Report`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Date Range: ${fromDate} to ${toDate}`, 14, 22);
    
    const tableColumn = reportData.columns;
    const tableRows = reportData.data.map(row => tableColumn.map(col => row[col] || '-'));
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [10, 108, 84] }
    });
    
    doc.save(`${selectedReport.replace(/\s+/g, '_')}_Report.pdf`);
    toast.success('PDF Exported Successfully!');
  };

  const exportExcel = () => {
    if (!reportData.data || reportData.data.length === 0) {
      toast.error('No data to export!');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(reportData.data, { header: reportData.columns });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, `${selectedReport.replace(/\s+/g, '_')}_Report.xlsx`);
    toast.success('Excel Exported Successfully!');
  };

  useEffect(() => {
    generateReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Admission Reports</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Generate and export dynamic admission reports</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportPDF} disabled={loading || reportData.data.length === 0} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
            <Download size={15} /> Export PDF
          </button>
          <button onClick={exportExcel} disabled={loading || reportData.data.length === 0} className="flex items-center gap-2 px-4 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-50">
            <Download size={15} /> Export Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-end gap-4">
        <div className="relative w-full md:w-auto md:flex-1">
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Report Type</label>
          <select value={selectedReport} onChange={e => setSelectedReport(e.target.value)}
            className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer md:min-w-[220px]">
            {reportTypes.map(r => <option key={r}>{r}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-9 text-gray-400 pointer-events-none" size={14} />
        </div>

        {selectedReport === 'Applications Overview' && (
          <div className="relative w-full md:w-auto md:flex-1">
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <ChevronDown className="absolute right-3 top-9 text-gray-400 pointer-events-none" size={14} />
          </div>
        )}

        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">From Date</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">To Date</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
          </div>
        </div>
        <button onClick={generateReport} disabled={loading} className="w-full md:w-auto bg-[#0A6C54] hover:bg-[#085a46] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold disabled:opacity-70">
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summaryLoading ? (
             <SkeletonLoader type="cards" rows={1} cols={4} />
          ) : (
            summaryData?.map(s => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-[12px] text-gray-500 mb-1">{s.label}</p>
                <p className="text-[24px] font-bold text-gray-800">{s.value.toLocaleString()}</p>
              </div>
            ))
          )}
        </div>

        {/* Dynamic Data Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 size={16} className="text-[#0A6C54]" /> 
              {selectedReport} Results
            </h3>
            <span className="text-[11px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-semibold">
              {reportData.data.length} Records
            </span>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6"><SkeletonLoader type="table" cols={5} rows={4} /></div>
            ) : reportData.data.length === 0 ? (
              <div className="py-12 text-center">
                <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-[13px]">No records found for the selected date range.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50">
                    {reportData.columns.map(col => (
                      <th key={col} className="py-3 px-5 text-[12px] font-bold text-gray-700 whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.map((row, idx) => (
                    <tr key={idx} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      {reportData.columns.map(col => (
                        <td key={col} className="py-3 px-5 text-[13px] text-gray-700 whitespace-nowrap">{row[col]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdmissionReports;
