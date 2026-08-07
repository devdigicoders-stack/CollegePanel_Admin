import React, { useState, useCallback } from 'react';
import {
  Download, Calendar, Filter, FileSpreadsheet, FileText,
  Users, DollarSign, BookOpen, Home, ShieldAlert,
  GraduationCap, Briefcase, Loader2, RefreshCw, AlertCircle,
  ChevronRight, BarChart2, Table2
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { checkPermission } from '../utils/checkPermission';

// ── Role / Module Config ─────────────────────────────────────────────────────
const MODULES = [
  {
    id: 'admissions',
    name: 'Admissions',
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    endpoint: '/reports/admissions',
    reports: ['Applications Overview', 'Course-wise Registrations', 'Pending Verifications']
  },
  {
    id: 'financial',
    name: 'Financial',
    icon: DollarSign,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    endpoint: '/reports/financial',
    reports: ['Fee Collections', 'Pending Dues', 'Collection Summary']
  },
  {
    id: 'academic',
    name: 'Academic',
    icon: GraduationCap,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    endpoint: '/reports/academic',
    reports: ['Student Directory', 'Faculty Directory', 'Exam Schedule', 'Leave Requests', 'Assignments']
  },
  {
    id: 'hr',
    name: 'HR & Admin',
    icon: Briefcase,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    endpoint: '/reports/hr',
    reports: ['Employee Directory', 'Complaints Log']
  },
  {
    id: 'library',
    name: 'Library',
    icon: BookOpen,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    endpoint: '/reports/library',
    reports: ['Issued Books', 'Overdue Books', 'Book Catalog']
  },
  {
    id: 'hostel',
    name: 'Hostel Warden',
    icon: Home,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    endpoint: '/reports/hostel',
    reports: ['Room Occupancy', 'Student Allotments', 'Leave & Outings']
  },
  {
    id: 'security',
    name: 'Security',
    icon: ShieldAlert,
    color: 'text-red-600',
    bg: 'bg-red-50',
    endpoint: '/reports/security',
    reports: ['Entry/Exit Log', 'Visitor Log', 'Vehicle Log', 'Incident Reports']
  }
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const getDateRange = (preset) => {
  const now = new Date();
  const fmt = (d) => d.toISOString().split('T')[0];
  if (preset === 'Today') return { start: fmt(now), end: fmt(now) };
  if (preset === 'Yesterday') {
    const y = new Date(now); y.setDate(y.getDate() - 1);
    return { start: fmt(y), end: fmt(y) };
  }
  if (preset === 'This Week') {
    const s = new Date(now); s.setDate(now.getDate() - now.getDay());
    return { start: fmt(s), end: fmt(now) };
  }
  if (preset === 'This Month') {
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: fmt(s), end: fmt(now) };
  }
  if (preset === 'Last Month') {
    const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const e = new Date(now.getFullYear(), now.getMonth(), 0);
    return { start: fmt(s), end: fmt(e) };
  }
  return { start: '', end: '' };
};

const downloadCSV = (columns, data, filename) => {
  if (!data.length) { toast.error('No data to export'); return; }
  const header = columns.join(',');
  const rows = data.map(row =>
    columns.map(col => `"${(row[col] ?? '').toString().replace(/"/g, '""')}"`).join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
  toast.success('Report exported as CSV!');
};

const downloadHTML = (columns, data, title) => {
  if (!data.length) { toast.error('No data to export'); return; }
  const rows = data.map(row =>
    `<tr>${columns.map(col => `<td>${row[col] ?? '-'}</td>`).join('')}</tr>`
  ).join('');
  const html = `
<!DOCTYPE html><html><head>
<title>${title}</title>
<style>
  body{font-family:Arial,sans-serif;padding:20px;color:#1a1a1a}
  h1{font-size:18px;margin-bottom:4px}
  p{font-size:12px;color:#666;margin-bottom:16px}
  table{width:100%;border-collapse:collapse;font-size:12px}
  th{background:#0A6C54;color:#fff;padding:8px 12px;text-align:left}
  td{padding:8px 12px;border-bottom:1px solid #e5e7eb}
  tr:nth-child(even) td{background:#f9fafb}
  @media print{button{display:none}}
</style>
</head><body>
<button onclick="window.print()" style="background:#0A6C54;color:#fff;padding:8px 16px;border:none;border-radius:6px;cursor:pointer;margin-bottom:16px">🖨️ Print / Save as PDF</button>
<h1>${title}</h1>
<p>Generated: ${new Date().toLocaleString('en-IN')}</p>
<table><thead><tr>${columns.map(c => `<th>${c}</th>`).join('')}</tr></thead>
<tbody>${rows}</tbody></table>
</body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  toast.success('Report opened — use browser Print to save as PDF!');
};

// ── Component ─────────────────────────────────────────────────────────────────
const Reports = () => {
  if (!checkPermission('View All Reports') && !checkPermission('Export Reports') && !checkPermission('Generate Custom Reports')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-2xl border border-gray-150 p-8 shadow-sm">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
        <p className="text-gray-500 mt-2 text-center max-w-md">
          Aapke paas is page ko view karne ki permission nahi hai. Please contact admin.
        </p>
      </div>
    );
  }

  const [selectedModule, setSelectedModule] = useState(MODULES[0]);
  const [selectedReport, setSelectedReport] = useState(MODULES[0].reports[0]);
  const [datePreset, setDatePreset] = useState('This Month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null); // { columns, data }
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleModuleChange = (mod) => {
    setSelectedModule(mod);
    setSelectedReport(mod.reports[0]);
    setReportData(null);
    setHasGenerated(false);
  };

  const generate = useCallback(async () => {
    setLoading(true);
    setHasGenerated(true);
    try {
      let { start, end } = datePreset === 'Custom' ? { start: customStart, end: customEnd } : getDateRange(datePreset);
      const params = new URLSearchParams({ reportType: selectedReport });
      if (start) params.set('startDate', start);
      if (end) params.set('endDate', end);

      const res = await axiosInstance.get(`${selectedModule.endpoint}?${params}`);
      setReportData(res.data);
      if (!res.data.data.length) toast('No records found for this period.', { icon: 'ℹ️' });
    } catch (err) {
      toast.error('Failed to generate report: ' + (err.response?.data?.message || err.message));
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedModule, selectedReport, datePreset, customStart, customEnd]);

  const reportTitle = `${selectedModule.name} — ${selectedReport}`;
  const canExport = reportData && reportData.data.length > 0;

  return (
    <div className="flex flex-col md:flex-row gap-5 font-['Inter'] h-full min-h-0">
      {/* ── Left: Module Sidebar ─────────────────────────────────────────────── */}
      <div className="w-full md:w-[240px] bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col gap-1 flex-shrink-0">
        <p className="text-[11px] font-bold text-gray-400 px-3 uppercase tracking-widest mb-1 mt-1">Modules</p>
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          const isActive = selectedModule.id === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => handleModuleChange(mod)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                isActive ? 'bg-[#0A6C54] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className={`p-1.5 rounded-lg flex-shrink-0 ${isActive ? 'bg-white/20 text-white' : `${mod.bg} ${mod.color}`}`}>
                <Icon size={15} />
              </div>
              <span className="text-[13px] font-semibold truncate">{mod.name}</span>
              {isActive && <ChevronRight size={14} className="ml-auto flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* ── Right: Report Panel ───────────────────────────────────────────────── */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col min-w-0">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${selectedModule.bg}`}>
              {React.createElement(selectedModule.icon, { size: 18, className: selectedModule.color })}
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-800">{selectedModule.name} Report Center</h2>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">{selectedReport}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              disabled={!canExport}
              onClick={() => downloadHTML(reportData.columns, reportData.data, reportTitle)}
              className="px-3.5 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-[12px] font-semibold text-gray-600 flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FileText size={13} /> PDF / Print
            </button>
            <button
              disabled={!canExport}
              onClick={() => downloadCSV(reportData.columns, reportData.data, reportTitle.replace(/[^a-z0-9]/gi, '_'))}
              className="px-3.5 py-2 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet size={13} /> Export CSV
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/40 grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Report Type */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              <Table2 size={11} className="inline mr-1" />Report Type
            </label>
            <select
              value={selectedReport}
              onChange={(e) => { setSelectedReport(e.target.value); setReportData(null); setHasGenerated(false); }}
              className="w-full p-2 border border-gray-200 rounded-lg text-[12px] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20"
            >
              {selectedModule.reports.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Date Preset */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              <Calendar size={11} className="inline mr-1" />Date Range
            </label>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg text-[12px] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20"
            >
              {['Today', 'Yesterday', 'This Week', 'This Month', 'Last Month', 'Custom'].map(d => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Custom dates */}
          {datePreset === 'Custom' && (
            <div className="sm:col-span-1 flex gap-2">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">From</label>
                <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-[12px] bg-white focus:outline-none" />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">To</label>
                <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-[12px] bg-white focus:outline-none" />
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className={`flex items-end ${datePreset !== 'Custom' ? 'sm:col-start-4' : ''}`}>
            <button
              onClick={generate}
              disabled={loading}
              className="w-full py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-[12px] font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> Generating...</>
              ) : (
                <><BarChart2 size={14} /> Generate Report</>
              )}
            </button>
          </div>
        </div>

        {/* Data Table / Empty State */}
        <div className="flex-1 overflow-auto p-0">
          {!hasGenerated && !loading && (
            <div className="flex flex-col items-center justify-center h-full py-16 text-gray-400">
              <BarChart2 size={40} className="mb-3 opacity-30" />
              <p className="text-[14px] font-semibold text-gray-500">Select a report and click Generate</p>
              <p className="text-[12px] mt-1">Configure filters above and generate your report</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-full py-16 text-gray-400">
              <Loader2 size={32} className="animate-spin mb-3 text-[#0A6C54]" />
              <p className="text-[13px] font-medium">Fetching live data from database...</p>
            </div>
          )}

          {!loading && hasGenerated && reportData && (
            <>
              {/* Summary bar */}
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
                <p className="text-[12px] text-gray-500 font-medium">
                  <span className="font-bold text-gray-800">{reportData.data.length}</span> records found
                  {datePreset !== 'Custom' && <span className="ml-1">· {datePreset}</span>}
                </p>
                <button onClick={generate} className="text-[11px] text-[#0A6C54] font-semibold flex items-center gap-1 hover:underline">
                  <RefreshCw size={11} /> Refresh
                </button>
              </div>

              {reportData.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <AlertCircle size={32} className="mb-3 opacity-40" />
                  <p className="text-[14px] font-semibold text-gray-500">No records found</p>
                  <p className="text-[12px] mt-1">Try changing the date range or report type</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[12.5px] text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-8">#</th>
                        {reportData.columns.map((col) => (
                          <th key={col} className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.data.map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-100/60 hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 text-gray-400 font-medium">{idx + 1}</td>
                          {reportData.columns.map((col) => (
                            <td key={col} className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                              {row[col] ?? '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {!loading && hasGenerated && !reportData && (
            <div className="flex flex-col items-center justify-center h-full py-16 text-red-400">
              <AlertCircle size={32} className="mb-3" />
              <p className="text-[14px] font-semibold">Failed to load report data</p>
              <button onClick={generate} className="mt-3 text-[12px] text-[#0A6C54] font-semibold hover:underline flex items-center gap-1">
                <RefreshCw size={12} /> Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
