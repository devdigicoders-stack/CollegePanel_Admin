import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Download, Calendar, Filter, FileSpreadsheet, FileText,
  Users, BookOpen, Home, ShieldAlert,
  GraduationCap, Briefcase, Loader2, RefreshCw, AlertCircle,
  ChevronRight, BarChart2, Table2, Search, X,
  ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { checkPermission } from '../utils/checkPermission';

// ── Role / Module Config (Active, Real Modules Only) ─────────────────────────
const MODULES = [
  {
    id: 'admissions',
    name: 'Admissions',
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    endpoint: '/reports/admissions',
    reports: [
      { id: 'Applications Overview', name: 'Applications Overview', filters: ['course', 'status', 'stage', 'date', 'search'] },
      { id: 'Course-wise Registrations', name: 'Course-wise Registrations', filters: ['course', 'date'] },
      { id: 'Pending Verifications', name: 'Pending Verifications', filters: ['course', 'date', 'search'] }
    ]
  },
  {
    id: 'academic',
    name: 'Academic',
    icon: GraduationCap,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    endpoint: '/reports/academic',
    reports: [
      { id: 'Student Directory', name: 'Student Directory', filters: ['course', 'year', 'status', 'date', 'search'] },
      { id: 'Faculty Directory', name: 'Faculty Directory', filters: ['department', 'status', 'search'] },
      { id: 'Assignments', name: 'Assignments', filters: ['course', 'status', 'date', 'search'] },
      { id: 'Student Attendance', name: 'Student Attendance', filters: ['course', 'status', 'date', 'search'] },
      { id: 'Study Materials', name: 'Study Materials', filters: ['course', 'date', 'search'] }
    ]
  },
  {
    id: 'hr',
    name: 'HR & Admin',
    icon: Briefcase,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    endpoint: '/reports/hr',
    reports: [
      { id: 'Employee Directory', name: 'Employee Directory', filters: ['role', 'department', 'status', 'date', 'search'] },
      { id: 'Complaints Log', name: 'Complaints Log', filters: ['category', 'priority', 'status', 'date', 'search'] },
      { id: 'Notices & Circulars', name: 'Notices & Circulars', filters: ['status', 'date', 'search'] }
    ]
  },
  {
    id: 'library',
    name: 'Library',
    icon: BookOpen,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    endpoint: '/reports/library',
    reports: [
      { id: 'Issued Books', name: 'Issued Books', filters: ['status', 'date', 'search'] },
      { id: 'Overdue Books', name: 'Overdue Books', filters: ['search'] },
      { id: 'Book Catalog', name: 'Book Catalog', filters: ['category', 'status', 'search'] },
      { id: 'Lost & Damaged Books', name: 'Lost & Damaged Books', filters: ['status', 'date', 'search'] }
    ]
  },
  {
    id: 'hostel',
    name: 'Hostel Warden',
    icon: Home,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    endpoint: '/reports/hostel',
    reports: [
      { id: 'Room Occupancy', name: 'Room Occupancy', filters: ['block', 'type', 'status', 'search'] },
      { id: 'Student Allotments', name: 'Student Allotments', filters: ['status', 'date', 'search'] },
      { id: 'Leave & Outings', name: 'Leave & Outings', filters: ['type', 'status', 'date', 'search'] },
      { id: 'Hostel Incidents', name: 'Hostel Incidents', filters: ['status', 'date', 'search'] },
      { id: 'Hostel Visitors', name: 'Hostel Visitors', filters: ['date', 'search'] }
    ]
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
  if (preset === 'All Time') return { start: '', end: '' };
  return { start: '', end: '' };
};

const downloadCSV = (columns, data, filename) => {
  if (!data.length) { toast.error('No data to export'); return; }
  const header = columns.map(c => `"${c.replace(/"/g, '""')}"`).join(',');
  const rows = data.map(row =>
    columns.map(col => `"${(row[col] ?? '').toString().replace(/"/g, '""')}"`).join(',')
  );
  // Add BOM for proper UTF-8 handling in Microsoft Excel
  const csv = '\uFEFF' + [header, ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
  toast.success('Report exported as CSV!');
};

const downloadHTML = (columns, data, title, collegeName, filtersApplied = '') => {
  if (!data.length) { toast.error('No data to export'); return; }
  const rows = data.map(row =>
    `<tr>${columns.map(col => {
      const val = row[col] ?? '-';
      const isStatus = col.toLowerCase().includes('status');
      let colorStyle = '';
      if (isStatus) {
        const v = String(val).toLowerCase();
        if (['active', 'approved', 'present', 'returned', 'admitted', 'closed'].includes(v)) colorStyle = 'background:#def7ec;color:#03543f;padding:2px 8px;border-radius:9999px;font-weight:600;display:inline-block;font-size:11px;';
        else if (['pending', 'upcoming', 'overdue'].includes(v)) colorStyle = 'background:#fef08a;color:#854d0e;padding:2px 8px;border-radius:9999px;font-weight:600;display:inline-block;font-size:11px;';
        else if (['rejected', 'inactive', 'lost', 'absent'].includes(v)) colorStyle = 'background:#fde8e8;color:#9b1c1c;padding:2px 8px;border-radius:9999px;font-weight:600;display:inline-block;font-size:11px;';
      }
      return `<td><span style="${colorStyle}">${val}</span></td>`;
    }).join('')}</tr>`
  ).join('');

  const html = `
<!DOCTYPE html><html><head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  body{font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;padding:24px;color:#1f2937;background:#fff}
  .header{border-bottom:2px solid #0A6C54;padding-bottom:12px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:flex-end}
  .clg-title{font-size:20px;font-weight:700;color:#0A6C54;margin:0 0 4px 0}
  .rep-title{font-size:15px;font-weight:600;color:#374151;margin:0}
  .meta{font-size:11px;color:#6b7280;text-align:right}
  .filter-box{font-size:11px;background:#f3f4f6;padding:6px 12px;border-radius:6px;margin-bottom:16px;color:#4b5563}
  table{width:100%;border-collapse:collapse;font-size:12px}
  th{background:#0A6C54;color:#fff;padding:8px 10px;text-align:left;font-weight:600}
  td{padding:8px 10px;border-bottom:1px solid #e5e7eb}
  tr:nth-child(even) td{background:#f9fafb}
  .print-btn{background:#0A6C54;color:#fff;padding:8px 16px;border:none;border-radius:6px;cursor:pointer;font-weight:600;font-size:13px;margin-bottom:16px}
  @media print{.print-btn{display:none} body{padding:0}}
</style>
</head><body>
<button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
<div class="header">
  <div>
    <h1 class="clg-title">${collegeName || 'COLLEGE ERP REPORT'}</h1>
    <h2 class="rep-title">${title}</h2>
  </div>
  <div class="meta">
    <div><strong>Generated:</strong> ${new Date().toLocaleString('en-IN')}</div>
    <div><strong>Total Records:</strong> ${data.length}</div>
  </div>
</div>
${filtersApplied ? `<div class="filter-box"><strong>Filters:</strong> ${filtersApplied}</div>` : ''}
<table>
  <thead><tr>${columns.map(c => `<th>${c}</th>`).join('')}</tr></thead>
  <tbody>${rows}</tbody>
</table>
</body></html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  toast.success('Report generated for Print / PDF preview!');
};

// ── Component ─────────────────────────────────────────────────────────────────
const Reports = () => {
  if (!checkPermission('View All Reports') && !checkPermission('Export Reports') && !checkPermission('Generate Custom Reports')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
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

  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
  const collegeName = adminInfo.collegeName || 'College Admin';

  const [selectedModule, setSelectedModule] = useState(MODULES[0]);
  const [selectedReportId, setSelectedReportId] = useState(MODULES[0].reports[0].id);

  // Dynamic filter states
  const [datePreset, setDatePreset] = useState('This Month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [filterCourse, setFilterCourse] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterStage, setFilterStage] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterRole, setFilterRole] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterBlock, setFilterBlock] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Options loaded dynamically from backend
  const [options, setOptions] = useState({
    departments: [],
    courses: [],
    designations: [],
    complaintCategories: [],
    hostelBlocks: [],
    libraryCategories: []
  });

  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null); // { columns, data }
  const [hasGenerated, setHasGenerated] = useState(false);

  // Sorting & Pagination
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Fetch filter options once
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axiosInstance.get('/reports/options');
        setOptions(res.data || {});
      } catch (err) {
        console.error('Error fetching dynamic filter options:', err);
      }
    };
    fetchOptions();
  }, []);

  const currentReportObj = useMemo(() => {
    return selectedModule.reports.find(r => r.id === selectedReportId) || selectedModule.reports[0];
  }, [selectedModule, selectedReportId]);

  const handleModuleChange = (mod) => {
    setSelectedModule(mod);
    setSelectedReportId(mod.reports[0].id);
    resetFilters();
    setReportData(null);
    setHasGenerated(false);
  };

  const handleReportChange = (repId) => {
    setSelectedReportId(repId);
    setReportData(null);
    setHasGenerated(false);
  };

  const resetFilters = () => {
    setDatePreset('This Month');
    setCustomStart('');
    setCustomEnd('');
    setFilterCourse('All');
    setFilterStatus('All');
    setFilterStage('All');
    setFilterYear('All');
    setFilterDepartment('All');
    setFilterRole('All');
    setFilterCategory('All');
    setFilterBlock('All');
    setFilterType('All');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const generate = useCallback(async () => {
    setLoading(true);
    setHasGenerated(true);
    setCurrentPage(1);
    setSortColumn(null);

    try {
      let { start, end } = datePreset === 'Custom' ? { start: customStart, end: customEnd } : getDateRange(datePreset);
      const params = new URLSearchParams({ reportType: selectedReportId });
      
      if (start) params.set('startDate', start);
      if (end) params.set('endDate', end);
      if (filterCourse !== 'All') params.set('course', filterCourse);
      if (filterStatus !== 'All') params.set('status', filterStatus);
      if (filterStage !== 'All') params.set('stage', filterStage);
      if (filterYear !== 'All') params.set('year', filterYear);
      if (filterDepartment !== 'All') params.set('department', filterDepartment);
      if (filterRole !== 'All') params.set('role', filterRole);
      if (filterCategory !== 'All') params.set('category', filterCategory);
      if (filterBlock !== 'All') params.set('block', filterBlock);
      if (filterType !== 'All') params.set('type', filterType);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());

      const res = await axiosInstance.get(`${selectedModule.endpoint}?${params}`);
      setReportData(res.data);
      if (!res.data.data.length) {
        toast('No records found for the selected filters.', { icon: 'ℹ️' });
      } else {
        toast.success(`Found ${res.data.data.length} records!`);
      }
    } catch (err) {
      toast.error('Failed to generate report: ' + (err.response?.data?.message || err.message));
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [
    selectedModule, selectedReportId, datePreset, customStart, customEnd,
    filterCourse, filterStatus, filterStage, filterYear, filterDepartment,
    filterRole, filterCategory, filterBlock, filterType, searchTerm
  ]);

  // Client-side Sorting & Pagination
  const processedData = useMemo(() => {
    if (!reportData || !reportData.data) return [];
    let items = [...reportData.data];

    // Client-side quick filter
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      items = items.filter(row =>
        Object.values(row).some(v => String(v ?? '').toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortColumn) {
      items.sort((a, b) => {
        const valA = a[sortColumn] ?? '';
        const valB = b[sortColumn] ?? '';
        const isNum = !isNaN(valA) && !isNaN(valB) && valA !== '' && valB !== '';
        if (isNum) {
          return sortDirection === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
        }
        return sortDirection === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }
    return items;
  }, [reportData, searchTerm, sortColumn, sortDirection]);

  const totalPages = Math.ceil(processedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  const handleSort = (col) => {
    if (sortColumn === col) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  const reportTitle = `${selectedModule.name} — ${currentReportObj.name}`;
  const canExport = processedData.length > 0;

  // Active filters summary string for PDF/Print
  const activeFiltersStr = [
    datePreset !== 'Custom' ? `Date: ${datePreset}` : (customStart && customEnd ? `Date: ${customStart} to ${customEnd}` : ''),
    filterCourse !== 'All' ? `Course: ${filterCourse}` : '',
    filterStatus !== 'All' ? `Status: ${filterStatus}` : '',
    filterDepartment !== 'All' ? `Dept: ${filterDepartment}` : '',
    filterRole !== 'All' ? `Role: ${filterRole}` : '',
    searchTerm ? `Search: "${searchTerm}"` : ''
  ].filter(Boolean).join(' | ');

  // Status badge styling helper
  const renderCell = (col, val) => {
    if (val === null || val === undefined || val === '') return '—';
    const isStatus = col.toLowerCase().includes('status') || col.toLowerCase() === 'stage';
    if (isStatus) {
      const v = String(val).toLowerCase();
      let badgeClass = 'bg-gray-100 text-gray-700';
      if (['active', 'approved', 'present', 'returned', 'admitted', 'published', 'closed', 'book cost recovered'].includes(v)) {
        badgeClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      } else if (['pending', 'upcoming', 'overdue', 'open', 'draft', 'pending cost recovery'].includes(v)) {
        badgeClass = 'bg-amber-50 text-amber-700 border border-amber-200';
      } else if (['rejected', 'inactive', 'lost', 'absent', 'damaged'].includes(v)) {
        badgeClass = 'bg-rose-50 text-rose-700 border border-rose-200';
      }
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${badgeClass}`}>
          {val}
        </span>
      );
    }
    return String(val);
  };

  const hasFilter = (fName) => currentReportObj.filters?.includes(fName);

  return (
    <div className="flex flex-col lg:flex-row gap-5 font-['Inter'] h-full min-h-0">
      {/* ── Left: Module Sidebar ─────────────────────────────────────────────── */}
      <div className="w-full lg:w-[250px] bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 flex flex-col gap-1.5 flex-shrink-0">
        <div className="flex items-center justify-between px-3 py-1 mb-1">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Active Modules</p>
          <span className="text-[10px] bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">
            {MODULES.length}
          </span>
        </div>

        {MODULES.map((mod) => {
          const Icon = mod.icon;
          const isActive = selectedModule.id === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => handleModuleChange(mod)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left ${
                isActive ? 'bg-[#0A6C54] text-white shadow-md shadow-[#0A6C54]/20' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className={`p-2 rounded-lg flex-shrink-0 ${isActive ? 'bg-white/20 text-white' : `${mod.bg} ${mod.color}`}`}>
                <Icon size={16} />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[13px] font-semibold truncate leading-tight">{mod.name}</span>
                <span className={`text-[10px] mt-0.5 truncate ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                  {mod.reports.length} report templates
                </span>
              </div>
              {isActive && <ChevronRight size={15} className="ml-auto flex-shrink-0" />}
            </button>
          );
        })}

        <div className="mt-auto pt-4 px-3 border-t border-gray-100 text-[11px] text-gray-400">
          <p className="font-medium">Clean, fully dynamic reports for active college operations.</p>
        </div>
      </div>

      {/* ── Right: Report Panel ───────────────────────────────────────────────── */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-3.5">
            <div className={`p-2.5 rounded-xl ${selectedModule.bg}`}>
              {React.createElement(selectedModule.icon, { size: 22, className: selectedModule.color })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-bold text-gray-800">{selectedModule.name} Report Center</h2>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2 py-0.5 rounded-full">
                  Live Data
                </span>
              </div>
              <p className="text-[12px] text-gray-400 font-medium mt-0.5">{currentReportObj.name}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              disabled={!canExport}
              onClick={() => downloadHTML(reportData.columns, processedData, reportTitle, collegeName, activeFiltersStr)}
              className="px-3.5 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-[12px] font-semibold text-gray-700 flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              title="Print formatted report or save as PDF"
            >
              <FileText size={14} className="text-gray-500" /> PDF / Print
            </button>
            <button
              disabled={!canExport}
              onClick={() => downloadCSV(reportData.columns, processedData, reportTitle.replace(/[^a-z0-9]/gi, '_'))}
              className="px-4 py-2 bg-[#0A6C54] hover:bg-[#085542] text-white rounded-lg text-[12px] font-semibold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              title="Export table as CSV for Excel"
            >
              <FileSpreadsheet size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* ── Dynamic Filter Bar ─────────────────────────────────────────────── */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
            {/* Report Type Selector */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                <Table2 size={11} className="inline mr-1 text-[#0A6C54]" />Report Type
              </label>
              <select
                value={selectedReportId}
                onChange={(e) => handleReportChange(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg text-[12.5px] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20"
              >
                {selectedModule.reports.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Date Range Preset */}
            {hasFilter('date') && (
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  <Calendar size={11} className="inline mr-1 text-[#0A6C54]" />Date Range
                </label>
                <select
                  value={datePreset}
                  onChange={(e) => setDatePreset(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-[12.5px] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20"
                >
                  {['Today', 'Yesterday', 'This Week', 'This Month', 'Last Month', 'All Time', 'Custom'].map(d => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Dynamic Course Filter */}
            {hasFilter('course') && (
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Course
                </label>
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-[12.5px] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20"
                >
                  <option value="All">All Courses</option>
                  {options.courses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Dynamic Department Filter */}
            {hasFilter('department') && (
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Department
                </label>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-[12.5px] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20"
                >
                  <option value="All">All Departments</option>
                  {options.departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Dynamic Status Filter */}
            {hasFilter('status') && (
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-[12.5px] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20"
                >
                  <option value="All">All Status</option>
                  {selectedModule.id === 'admissions' && (
                    <>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </>
                  )}
                  {selectedModule.id === 'academic' && (
                    <>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                    </>
                  )}
                  {selectedModule.id === 'hr' && (
                    <>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Open">Open</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Published">Published</option>
                    </>
                  )}
                  {selectedModule.id === 'library' && (
                    <>
                      <option value="Issued">Issued</option>
                      <option value="Returned">Returned</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Available">Available</option>
                    </>
                  )}
                  {selectedModule.id === 'hostel' && (
                    <>
                      <option value="Active">Active</option>
                      <option value="Vacated">Vacated</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Open">Open</option>
                      <option value="Closed">Closed</option>
                    </>
                  )}
                </select>
              </div>
            )}

            {/* Dynamic Stage Filter (Admissions) */}
            {hasFilter('stage') && (
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Admission Stage
                </label>
                <select
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-[12.5px] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20"
                >
                  <option value="All">All Stages</option>
                  <option value="Lead">Lead</option>
                  <option value="Registration">Registration</option>
                  <option value="Document Verification">Document Verification</option>
                  <option value="Fee Payment">Fee Payment</option>
                  <option value="Admitted">Admitted</option>
                </select>
              </div>
            )}

            {/* Dynamic Role Filter (HR) */}
            {hasFilter('role') && (
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Employee Role
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-[12.5px] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20"
                >
                  <option value="All">All Roles</option>
                  <option value="Teacher">Teacher</option>
                  <option value="HOD">HOD</option>
                  <option value="Hostel">Hostel Warden</option>
                  <option value="Librarian">Librarian</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            )}

            {/* Dynamic Category Filter (Complaints / Library) */}
            {hasFilter('category') && (
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-[12.5px] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20"
                >
                  <option value="All">All Categories</option>
                  {selectedModule.id === 'library'
                    ? options.libraryCategories.map(c => <option key={c} value={c}>{c}</option>)
                    : options.complaintCategories.map(c => <option key={c} value={c}>{c}</option>)
                  }
                </select>
              </div>
            )}

            {/* Dynamic Block Filter (Hostel) */}
            {hasFilter('block') && (
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Hostel Block
                </label>
                <select
                  value={filterBlock}
                  onChange={(e) => setFilterBlock(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-[12.5px] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20"
                >
                  <option value="All">All Blocks</option>
                  {options.hostelBlocks.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            )}

            {/* Dynamic Type Filter (Hostel Outing / Room) */}
            {hasFilter('type') && (
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-[12.5px] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20"
                >
                  <option value="All">All Types</option>
                  {selectedReportId === 'Leave & Outings' ? (
                    <>
                      <option value="Leave">Leave</option>
                      <option value="Outing">Outing</option>
                    </>
                  ) : (
                    <>
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Triple">Triple</option>
                      <option value="Dormitory">Dormitory</option>
                    </>
                  )}
                </select>
              </div>
            )}

            {/* Search Box */}
            {hasFilter('search') && (
              <div className="relative">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type to filter..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-7 py-2 border border-gray-200 rounded-lg text-[12.5px] bg-white focus:outline-none focus:ring-2 focus:ring-[#0A6C54]/20"
                  />
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Custom Date Inputs (when selected) */}
          {datePreset === 'Custom' && hasFilter('date') && (
            <div className="flex flex-wrap items-center gap-3 p-2.5 bg-white border border-gray-200 rounded-xl">
              <span className="text-[12px] font-bold text-gray-600 flex items-center gap-1">
                <Calendar size={13} className="text-[#0A6C54]" /> Custom Range:
              </span>
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-semibold text-gray-500">From:</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={e => setCustomStart(e.target.value)}
                  className="p-1.5 border border-gray-200 rounded-lg text-[12px] bg-gray-50"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-semibold text-gray-500">To:</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={e => setCustomEnd(e.target.value)}
                  className="p-1.5 border border-gray-200 rounded-lg text-[12px] bg-gray-50"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={resetFilters}
              className="text-[11.5px] text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1 hover:underline"
            >
              <RefreshCw size={11} /> Reset all filters
            </button>

            <button
              onClick={generate}
              disabled={loading}
              className="px-5 py-2.5 bg-[#0A6C54] hover:bg-[#085542] text-white rounded-xl text-[12.5px] font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#0A6C54]/20 disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Generating...</>
              ) : (
                <><BarChart2 size={15} /> Generate Report</>
              )}
            </button>
          </div>
        </div>

        {/* ── Data Table / Results Area ────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto flex flex-col min-h-0 bg-white">
          {!hasGenerated && !loading && (
            <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mb-3 shadow-sm">
                <BarChart2 size={32} className="opacity-40" />
              </div>
              <p className="text-[15px] font-bold text-gray-700">Ready to Generate Report</p>
              <p className="text-[12px] text-gray-400 mt-1 max-w-sm text-center">
                Configure your desired report type and dynamic filters above, then click <strong>Generate Report</strong> to fetch live records.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-full py-24 text-gray-400">
              <Loader2 size={36} className="animate-spin mb-3 text-[#0A6C54]" />
              <p className="text-[13px] font-semibold text-gray-700">Querying live database records...</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Please wait a moment</p>
            </div>
          )}

          {!loading && hasGenerated && reportData && (
            <>
              {/* Summary bar */}
              <div className="px-5 py-2.5 border-b border-gray-100 bg-gray-50/40 flex flex-wrap items-center justify-between gap-2 text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800 text-[13px]">{processedData.length}</span>
                  <span className="text-gray-500">records found</span>
                  {activeFiltersStr && (
                    <span className="text-[11px] text-gray-400 italic">({activeFiltersStr})</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <span>Show:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                      className="border border-gray-200 rounded px-1.5 py-0.5 bg-white text-gray-700 text-[11px]"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  <button
                    onClick={generate}
                    className="text-[11px] text-[#0A6C54] font-semibold flex items-center gap-1 hover:underline"
                  >
                    <RefreshCw size={11} /> Refresh
                  </button>
                </div>
              </div>

              {processedData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <AlertCircle size={36} className="mb-2.5 opacity-40 text-amber-500" />
                  <p className="text-[14px] font-bold text-gray-700">No records found matching filters</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">Try widening the date range or clearing specific filter criteria.</p>
                  <button
                    onClick={resetFilters}
                    className="mt-3 text-[12px] font-semibold text-[#0A6C54] hover:underline"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                <div className="flex-1 overflow-auto">
                  <table className="w-full border-collapse text-[12.5px] text-left">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gray-50/95 backdrop-blur-sm border-b border-gray-200 text-gray-600">
                        <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-10 text-center">#</th>
                        {reportData.columns.map((col) => {
                          const isSorted = sortColumn === col;
                          return (
                            <th
                              key={col}
                              onClick={() => handleSort(col)}
                              className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100/70 transition-colors select-none text-gray-600"
                            >
                              <div className="flex items-center gap-1.5">
                                <span>{col}</span>
                                {isSorted ? (
                                  sortDirection === 'asc' ? <ArrowUp size={12} className="text-[#0A6C54]" /> : <ArrowDown size={12} className="text-[#0A6C54]" />
                                ) : (
                                  <ArrowUpDown size={11} className="opacity-30 hover:opacity-100" />
                                )}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedData.map((row, idx) => {
                        const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                        return (
                          <tr key={idx} className="hover:bg-emerald-50/20 transition-colors">
                            <td className="px-4 py-3 text-gray-400 font-medium text-center text-[11px]">{globalIdx}</td>
                            {reportData.columns.map((col) => (
                              <td key={col} className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                                {renderCell(col, row[col])}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination footer */}
              {processedData.length > pageSize && (
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between text-[12px]">
                  <p className="text-gray-500 font-medium">
                    Showing <span className="font-bold text-gray-700">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                    <span className="font-bold text-gray-700">{Math.min(currentPage * pageSize, processedData.length)}</span> of{' '}
                    <span className="font-bold text-gray-700">{processedData.length}</span> entries
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed text-[12px] flex items-center gap-1 font-medium transition-colors"
                    >
                      <ChevronLeft size={13} /> Prev
                    </button>
                    <span className="px-2 py-1 text-gray-700 font-semibold text-[11.5px]">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed text-[12px] flex items-center gap-1 font-medium transition-colors"
                    >
                      Next <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && hasGenerated && !reportData && (
            <div className="flex flex-col items-center justify-center h-full py-20 text-red-400">
              <AlertCircle size={36} className="mb-2" />
              <p className="text-[14px] font-bold">Failed to load report data</p>
              <button
                onClick={generate}
                className="mt-3 px-4 py-2 bg-[#0A6C54] text-white rounded-lg text-[12px] font-semibold hover:bg-[#085542] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw size={13} /> Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
