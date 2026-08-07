import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserSquare2, BookOpen, GraduationCap,
  Bed, ShieldAlert, AlertCircle,
  Clock, BookMarked, 
  CalendarDays, Megaphone, UserPlus, 
  ArrowUpRight, Activity
} from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axiosInstance from '../utils/axiosInstance';
import SkeletonLoader from '../components/SkeletonLoader';

const HCReact = HighchartsReact.default || HighchartsReact;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CHART_COLORS = ['#0A6C54', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

// ── Reusable Stat Card ───────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, bg, trend, to }) => (
  <Link
    to={to || '#'}
    className="group bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all flex items-center gap-3.5 cursor-pointer"
  >
    <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
      <Icon size={20} className={color} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] text-gray-400 font-semibold leading-tight">{label}</p>
      <h3 className="text-[24px] font-bold text-gray-800 leading-tight mt-0.5">{value ?? 0}</h3>
      {sub && <p className="text-[11px] text-gray-400 font-medium">{sub}</p>}
    </div>
    <ArrowUpRight size={15} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
  </Link>
);

// ── Highcharts common defaults ────────────────────────────────────────────────
const baseChart = (overrides = {}) => ({
  chart: { backgroundColor: 'transparent', style: { fontFamily: 'Inter' }, ...overrides.chart },
  title: { text: '' },
  credits: { enabled: false },
  legend: { enabled: false },
  tooltip: {
    backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: 10,
    shadow: { color: 'rgba(0,0,0,.08)', offsetX: 0, offsetY: 4, width: 8 },
    style: { color: '#374151', fontSize: '12px', fontWeight: '600' }
  },
  ...overrides
});

import { checkPermission } from '../utils/checkPermission';
import { useNavigate } from 'react-router-dom';

// ── Main Component ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // If not authorized for the main dashboard, redirect to the first available module
    if (!checkPermission('View Dashboard') && !checkPermission('View Analytics')) {
      if (checkPermission('View Students')) navigate('/students', { replace: true });
      else if (checkPermission('View Teachers')) navigate('/teachers', { replace: true });
      else if (checkPermission('View Employees')) navigate('/employees', { replace: true });
      else if (checkPermission('View Admissions')) navigate('/admissions', { replace: true });
      else if (checkPermission('View Courses') || checkPermission('View Departments')) navigate('/academics', { replace: true });
      else if (checkPermission('View Fees')) navigate('/fees', { replace: true });
      else if (checkPermission('View Attendance')) navigate('/attendance', { replace: true });
      else if (checkPermission('View Exams')) navigate('/exams', { replace: true });
      else if (checkPermission('View Books')) navigate('/library', { replace: true });
      else if (checkPermission('View Hostels')) navigate('/hostel', { replace: true });
      else if (checkPermission('View Security Dashboard')) navigate('/security/dashboard', { replace: true });
      else if (checkPermission('View All Reports')) navigate('/reports', { replace: true });
      else navigate('/profile', { replace: true }); // Fallback to profile
      return;
    }
    
    fetchData(); 
  }, [navigate]);

  const fetchData = async () => {
    try {
      const res = await axiosInstance.get('/dashboard/overview');
      setD(res.data);
    } catch (e) {
      console.error('Dashboard error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <SkeletonLoader type="cards" />;
  if (!d) return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
      <AlertCircle size={40} className="mb-3 opacity-40" />
      <p className="font-semibold text-gray-500">Failed to load dashboard data</p>
      <button onClick={fetchData} className="mt-3 text-[#0A6C54] font-semibold text-sm hover:underline">Retry</button>
    </div>
  );

  const totalFee = (d.fees.collected || 0) + (d.fees.pending || 0) + (d.fees.overdue || 0);

  // ── Chart configs ─────────────────────────────────────────────────────────

  // 1. Dual-axis Spline — Students vs Admissions monthly
  const monthlyTrendChart = baseChart({
    chart: { type: 'spline', height: 240 },
    xAxis: { categories: MONTHS, lineWidth: 0, tickWidth: 0, labels: { style: { color: '#9CA3AF', fontSize: '11px' } } },
    yAxis: { title: { text: '' }, gridLineDashStyle: 'Dash', gridLineColor: '#F3F4F6', labels: { style: { color: '#9CA3AF', fontSize: '11px' } } },
    legend: { enabled: true, itemStyle: { color: '#374151', fontSize: '11px', fontWeight: '600' } },
    series: [
      {
        name: 'Students Enrolled', data: d.monthlyStudents || Array(12).fill(0),
        color: '#0A6C54', lineWidth: 3,
        marker: { symbol: 'circle', radius: 4, fillColor: '#fff', lineWidth: 2, lineColor: '#0A6C54' }
      },
      {
        name: 'Admissions', data: d.monthlyAdmissions || Array(12).fill(0),
        color: '#3B82F6', lineWidth: 3, dashStyle: 'Dash',
        marker: { symbol: 'circle', radius: 4, fillColor: '#fff', lineWidth: 2, lineColor: '#3B82F6' }
      }
    ]
  });

  // 2. Column — Monthly Fee Collections
  const feeBarChart = baseChart({
    chart: { type: 'column', height: 200 },
    xAxis: { categories: MONTHS, lineWidth: 0, tickWidth: 0, labels: { style: { color: '#9CA3AF', fontSize: '10px' } } },
    yAxis: { title: { text: '' }, gridLineDashStyle: 'Dash', gridLineColor: '#F3F4F6', labels: { formatter: function() { return '₹' + (this.value / 1000).toFixed(0) + 'k'; }, style: { color: '#9CA3AF', fontSize: '10px' } } },
    plotOptions: { column: { borderRadius: 5, pointPadding: 0.1, groupPadding: 0.1, color: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, '#0A6C54'], [1, '#14B8A6']] } } },
    series: [{ name: 'Fees Collected (₹)', data: d.feeByMonth || Array(12).fill(0) }]
  });

  // 3. Donut — Fee Status
  const feeDonutChart = baseChart({
    chart: { type: 'pie', height: 180, margin: [0, 0, 0, 0] },
    plotOptions: { pie: { innerSize: '68%', dataLabels: { enabled: false }, borderWidth: 3, borderColor: '#fff' } },
    series: [{
      name: 'Amount',
      data: [
        { name: 'Collected', y: d.fees.collected || 0, color: '#0A6C54' },
        { name: 'Pending', y: d.fees.pending || 0, color: '#F59E0B' },
        { name: 'Overdue', y: d.fees.overdue || 0, color: '#EF4444' }
      ]
    }]
  });

  // 4. Bar — Course-wise Student Distribution
  const courseBarChart = baseChart({
    chart: { type: 'bar', height: 220 },
    xAxis: { categories: (d.courseDistribution || []).map(c => c.name), lineWidth: 0, tickWidth: 0, labels: { style: { color: '#6B7280', fontSize: '11px' } } },
    yAxis: { title: { text: '' }, gridLineDashStyle: 'Dash', gridLineColor: '#F3F4F6', labels: { style: { color: '#9CA3AF', fontSize: '11px' } } },
    plotOptions: { bar: { borderRadius: 4, colorByPoint: true, colors: CHART_COLORS, dataLabels: { enabled: true, style: { fontSize: '10px', fontWeight: '600', color: '#374151' } } } },
    series: [{ name: 'Students', data: (d.courseDistribution || []).map(c => c.count) }]
  });

  // 5. Pie — Complaint Status
  const complaintPieChart = baseChart({
    chart: { type: 'pie', height: 180, margin: [0, 0, 0, 0] },
    plotOptions: { pie: { innerSize: '60%', dataLabels: { enabled: false }, borderWidth: 3, borderColor: '#fff' } },
    series: [{
      name: 'Complaints',
      data: Object.entries(d.complaints?.byStatus || {}).map(([k, v], i) => ({
        name: k, y: v, color: ['#F59E0B', '#3B82F6', '#0A6C54', '#EF4444'][i] || CHART_COLORS[i]
      }))
    }]
  });

  // 6. Spline — Attendance percent (use monthly if available, else show current)
  const attendanceGaugeOptions = baseChart({
    chart: { type: 'solidgauge', height: 160, margin: [0, 0, 0, 0],
      events: { render: function() {} }
    },
    pane: { startAngle: -120, endAngle: 120, background: [{ backgroundColor: '#F3F4F6', innerRadius: '70%', outerRadius: '100%', shape: 'arc', borderWidth: 0 }] },
    yAxis: { min: 0, max: 100, stops: [[0.1, '#EF4444'], [0.5, '#F59E0B'], [0.8, '#0A6C54']], lineWidth: 0, tickWidth: 0, labels: { enabled: false }, title: { text: '' } },
    series: [{ name: 'Attendance', data: [d.attendance.percent || 0], innerRadius: '70%', radius: '100%', dataLabels: { format: '<div style="text-align:center"><span style="font-size:22px;font-weight:700;color:#1F2937">{y}%</span><br><span style="font-size:11px;color:#6B7280;font-weight:600">Today</span></div>', borderWidth: 0, y: -30 } }]
  });

  // 7. Column — Department-wise employees
  const deptChart = baseChart({
    chart: { type: 'column', height: 190 },
    xAxis: { categories: (d.deptDistribution || []).map(x => x.name.length > 12 ? x.name.substring(0, 12) + '…' : x.name), lineWidth: 0, tickWidth: 0, labels: { style: { color: '#6B7280', fontSize: '10px' } } },
    yAxis: { title: { text: '' }, gridLineDashStyle: 'Dash', gridLineColor: '#F3F4F6', labels: { style: { color: '#9CA3AF', fontSize: '10px' } }, allowDecimals: false },
    plotOptions: { column: { borderRadius: 5, colorByPoint: true, colors: CHART_COLORS } },
    series: [{ name: 'Employees', data: (d.deptDistribution || []).map(x => x.count) }]
  });

  // 8. Library pie
  const libCategoryChart = baseChart({
    chart: { type: 'pie', height: 160, margin: [0, 0, 0, 0] },
    plotOptions: { pie: { dataLabels: { enabled: true, distance: -24, style: { fontSize: '9px', fontWeight: '700', color: '#fff', textOutline: 'none' } }, borderWidth: 2, borderColor: '#fff' } },
    series: [{
      name: 'Books',
      data: (d.library?.byCategory || []).map((c, i) => ({ name: c.name, y: c.count, color: CHART_COLORS[i] }))
    }]
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  const fmtCurrency = (n) => {
    if (!n) return '₹0';
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${n}`;
  };

  const hostelOccupancyPct = d.hostel?.capacity > 0
    ? Math.round((d.hostel.occupied / d.hostel.capacity) * 100) : 0;

  return (
    <div className="space-y-5 font-['Inter']">

      {/* ── Row 1: Core Stats — 2 rows of 4 ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users}       label="Total Students"      value={d.totalStudents}   sub={`${d.totalStudents} enrolled`}        color="text-blue-600"   bg="bg-blue-50"   to="/students" />
        <StatCard icon={UserSquare2} label="Total Employees"     value={d.totalEmployees}  sub={`${d.facultyCount} faculty`}           color="text-violet-600" bg="bg-violet-50" to="/employees" />
        <StatCard icon={GraduationCap} label="Active Sections"  value={d.totalClasses}    sub="Classes / Sections"                    color="text-emerald-600" bg="bg-emerald-50" to="/academics" />
        <StatCard icon={BookMarked}  label="Registered Subjects" value={d.totalSubjects}   sub="Subjects"                              color="text-amber-600"  bg="bg-amber-50"  to="/academics" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={UserPlus}    label="Total Admissions"    value={d.totalAdmissions} sub="All stages"                            color="text-cyan-600"   bg="bg-cyan-50"   to="/admissions/dashboard" />
        <StatCard icon={Activity}    label="Total Enquiries"     value={d.totalEnquiries}  sub="All time"                              color="text-pink-600"   bg="bg-pink-50"   to="/admissions/enquiries" />
        <StatCard icon={CalendarDays} label="Upcoming Exams"     value={d.upcomingExams}   sub="Scheduled"                            color="text-red-500"    bg="bg-red-50"    to="/exams" />
        <StatCard icon={AlertCircle} label="Open Complaints"     value={d.pendingComplaints} sub="Pending / In-Progress"              color="text-orange-600" bg="bg-orange-50" to="/complaints" />
      </div>

      {/* ── Row 2: Monthly Trend + Fee Donut ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[14px] font-bold text-gray-800">Enrollment & Admissions Trend</h3>
            <span className="text-[11px] font-semibold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">This Year ({new Date().getFullYear()})</span>
          </div>
          <p className="text-[11px] text-gray-400 mb-3">Monthly student enrollments vs new admissions</p>
          <HCReact highcharts={Highcharts} options={monthlyTrendChart} containerProps={{ style: { width: '100%' } }} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <h3 className="text-[14px] font-bold text-gray-800 mb-0.5">Fee Status Overview</h3>
          <p className="text-[11px] text-gray-400 mb-2">Total: <span className="font-bold text-gray-700">{fmtCurrency(totalFee)}</span></p>
          <div className="relative flex-shrink-0">
            <HCReact highcharts={Highcharts} options={feeDonutChart} containerProps={{ style: { width: '100%' } }} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-4">
              <span className="text-[13px] font-bold text-gray-800">{fmtCurrency(d.fees.collected)}</span>
            </div>
          </div>
          <div className="space-y-2.5 mt-auto pt-2">
            {[
              { label: 'Collected', value: d.fees.collected, color: '#0A6C54' },
              { label: 'Pending', value: d.fees.pending, color: '#F59E0B' },
              { label: 'Overdue', value: d.fees.overdue, color: '#EF4444' }
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[12px] text-gray-500 font-medium">{item.label}</span>
                </div>
                <span className="text-[12px] font-bold text-gray-800">{fmtCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Fee Bar + Attendance + Complaints ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Fee Monthly Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-[14px] font-bold text-gray-800 mb-0.5">Monthly Fee Collections</h3>
          <p className="text-[11px] text-gray-400 mb-3">Amount collected per month (₹)</p>
          <HCReact highcharts={Highcharts} options={feeBarChart} containerProps={{ style: { width: '100%' } }} />
        </div>

        {/* Attendance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <h3 className="text-[14px] font-bold text-gray-800 mb-0.5">Attendance — Today</h3>
          <p className="text-[11px] text-gray-400 mb-2">Live student attendance tracking</p>

          {/* Gauge */}
          <div className="relative flex justify-center">
            {typeof Highcharts.seriesTypes?.solidgauge !== 'undefined' || true ? (
              // Fallback to styled ring if solidgauge not available
              <div className="relative w-32 h-32 my-2 mx-auto">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#F3F4F6" strokeWidth="14" />
                  <circle cx="50" cy="50" r="38" fill="none"
                    stroke={d.attendance.percent >= 80 ? '#0A6C54' : d.attendance.percent >= 60 ? '#F59E0B' : '#EF4444'}
                    strokeWidth="14" strokeLinecap="round"
                    strokeDasharray={`${(d.attendance.percent / 100) * 239} 239`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[22px] font-bold text-gray-800">{d.attendance.percent}%</span>
                  <span className="text-[10px] text-gray-400 font-semibold">Today</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-auto">
            {[
              { label: 'Present', value: d.attendance.present, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Absent', value: d.attendance.absent, color: 'text-red-500', bg: 'bg-red-50' },
              { label: 'Total', value: d.attendance.present + d.attendance.absent, color: 'text-gray-700', bg: 'bg-gray-50' }
            ].map(item => (
              <div key={item.label} className={`${item.bg} rounded-xl p-3 text-center`}>
                <p className={`text-[16px] font-bold ${item.color}`}>{item.value}</p>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-[11px] font-semibold text-gray-500 mb-1.5">
              <span>Faculty Attendance</span>
              <span className="font-bold text-gray-700">{d.attendance.facultyPercent}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${d.attendance.facultyPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Complaints Donut */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <h3 className="text-[14px] font-bold text-gray-800 mb-0.5">Complaint Status</h3>
          <p className="text-[11px] text-gray-400 mb-1">Breakdown by resolution status</p>
          <div className="flex-shrink-0">
            <HCReact highcharts={Highcharts} options={complaintPieChart} containerProps={{ style: { width: '100%' } }} />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-auto">
            {Object.entries(d.complaints?.byStatus || {}).map(([status, count], i) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: ['#F59E0B', '#3B82F6', '#0A6C54', '#EF4444'][i] }} />
                <span className="text-[11px] text-gray-500 font-medium truncate">{status}</span>
                <span className="text-[11px] font-bold text-gray-700 ml-auto">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 4: Course Distribution + Dept Chart ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Course-wise Students */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-[14px] font-bold text-gray-800 mb-0.5">Course-wise Student Distribution</h3>
          <p className="text-[11px] text-gray-400 mb-3">Number of students enrolled per course</p>
          {d.courseDistribution?.length > 0 ? (
            <HCReact highcharts={Highcharts} options={courseBarChart} containerProps={{ style: { width: '100%' } }} />
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-300 text-[13px]">No course data available</div>
          )}
        </div>

        {/* Department-wise Employees */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-[14px] font-bold text-gray-800 mb-0.5">Department-wise Employees</h3>
          <p className="text-[11px] text-gray-400 mb-3">Employee count by department</p>
          {d.deptDistribution?.length > 0 ? (
            <HCReact highcharts={Highcharts} options={deptChart} containerProps={{ style: { width: '100%' } }} />
          ) : (
            <div className="flex items-center justify-center h-[180px] text-gray-300 text-[13px]">No department data available</div>
          )}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {Object.entries(d.employeeByStatus || {}).map(([s, c]) => (
              <div key={s} className={`rounded-xl p-2 text-center ${s === 'Active' ? 'bg-emerald-50' : s === 'Inactive' ? 'bg-red-50' : 'bg-amber-50'}`}>
                <p className={`text-[15px] font-bold ${s === 'Active' ? 'text-emerald-600' : s === 'Inactive' ? 'text-red-500' : 'text-amber-600'}`}>{c}</p>
                <p className="text-[10px] text-gray-400 font-semibold">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 5: Library + Hostel + Security ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Library */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-amber-50"><BookOpen size={16} className="text-amber-600" /></div>
            <h3 className="text-[14px] font-bold text-gray-800">Library</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { label: 'Total Books', value: d.library?.totalBooks, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Available', value: d.library?.availableCopies, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Issued (Month)', value: d.library?.issuedThisMonth, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Overdue', value: d.library?.overdueBooks, color: 'text-red-500', bg: 'bg-red-50' }
            ].map(item => (
              <div key={item.label} className={`${item.bg} rounded-xl p-3`}>
                <p className={`text-[18px] font-bold ${item.color}`}>{item.value ?? 0}</p>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
          {d.library?.byCategory?.length > 0 && (
            <>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">By Category</p>
              <HCReact highcharts={Highcharts} options={libCategoryChart} containerProps={{ style: { width: '100%' } }} />
            </>
          )}
        </div>

        {/* Hostel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-indigo-50"><Bed size={16} className="text-indigo-600" /></div>
            <h3 className="text-[14px] font-bold text-gray-800">Hostel</h3>
          </div>

          {/* Occupancy ring */}
          <div className="relative w-28 h-28 mx-auto my-3">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="38" fill="none" stroke="#EEF2FF" strokeWidth="14" />
              <circle cx="50" cy="50" r="38" fill="none" stroke="#6366F1" strokeWidth="14" strokeLinecap="round"
                strokeDasharray={`${(hostelOccupancyPct / 100) * 239} 239`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[20px] font-bold text-gray-800">{hostelOccupancyPct}%</span>
              <span className="text-[10px] text-gray-400 font-semibold">Occupied</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              { label: 'Total Rooms', value: d.hostel?.totalRooms, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Occupied', value: d.hostel?.occupied, color: 'text-red-500', bg: 'bg-red-50' },
              { label: 'Available Beds', value: d.hostel?.available, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Active Allotments', value: d.hostel?.activeAllocations, color: 'text-blue-600', bg: 'bg-blue-50' }
            ].map(item => (
              <div key={item.label} className={`${item.bg} rounded-xl p-3`}>
                <p className={`text-[18px] font-bold ${item.color}`}>{item.value ?? 0}</p>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-red-50"><ShieldAlert size={16} className="text-red-500" /></div>
            <h3 className="text-[14px] font-bold text-gray-800">Security Overview</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-[24px] font-bold text-blue-600">{d.security?.todayLogs ?? 0}</p>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">Today's Gate Logs</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-[24px] font-bold text-red-500">{d.security?.openIncidents ?? 0}</p>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">Open Incidents</p>
            </div>
          </div>

          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pending Leaves</p>
          <div className="bg-amber-50 rounded-xl p-3 flex items-center gap-3">
            <Clock size={20} className="text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-[20px] font-bold text-amber-600">{d.pendingLeaves ?? 0}</p>
              <p className="text-[10px] text-gray-400 font-semibold">Leave Requests Awaiting Approval</p>
            </div>
          </div>

          {/* Enquiry status */}
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4">Admission Enquiries</p>
          <div className="space-y-1.5">
            {Object.entries(d.enquiry?.byStatus || {}).slice(0, 4).map(([status, count]) => {
              const total = Object.values(d.enquiry?.byStatus || {}).reduce((a, b) => a + b, 0) || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={status} className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500 w-24 truncate font-medium">{status}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0A6C54] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-700 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 6: Notices + Upcoming Exams ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Notices */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50"><Megaphone size={16} className="text-emerald-600" /></div>
              <h3 className="text-[14px] font-bold text-gray-800">Recent Notices</h3>
            </div>
            <span className="text-[11px] text-gray-400 font-semibold">Latest Published</span>
          </div>
          <div className="space-y-2.5">
            {d.recentNotices?.length > 0 ? d.recentNotices.map((n, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-[11px] font-bold">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-800 truncate">{n.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-400">{n.targetAudience}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-[10px] text-gray-400">{new Date(n.dateOfPublishing).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-300 text-[13px]">No published notices</div>
            )}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-50"><CalendarDays size={16} className="text-red-500" /></div>
              <h3 className="text-[14px] font-bold text-gray-800">Upcoming Examinations</h3>
            </div>
            <span className="text-[11px] text-[#0A6C54] font-bold">{d.upcomingExams} Scheduled</span>
          </div>
          <div className="space-y-2.5">
            {d.upcomingExamList?.length > 0 ? d.upcomingExamList.map((exam, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex flex-col items-center justify-center text-red-500 flex-shrink-0">
                  <span className="text-[11px] font-bold leading-tight">{new Date(exam.date).toLocaleDateString('en-IN', { day: '2-digit' })}</span>
                  <span className="text-[9px] font-semibold">{new Date(exam.date).toLocaleDateString('en-IN', { month: 'short' })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-800 truncate">{exam.examName}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{exam.course} · {exam.subject}</p>
                </div>
                <span className="text-[10px] bg-red-50 text-red-500 font-semibold px-2 py-1 rounded-full flex-shrink-0">Upcoming</span>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-300 text-[13px]">No upcoming exams scheduled</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
