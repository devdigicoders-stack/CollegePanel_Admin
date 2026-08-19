import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserSquare2, BookOpen, GraduationCap,
  Bed, ShieldAlert, AlertCircle,
  BookMarked,
  Megaphone, UserPlus,
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
const StatCard = ({ icon: Icon, label, value, sub, color, bg, to }) => (
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
    if (!checkPermission('View Dashboard') && !checkPermission('View Analytics')) {
      if (checkPermission('View Students')) navigate('/students', { replace: true });
      else if (checkPermission('View Teachers')) navigate('/teachers', { replace: true });
      else if (checkPermission('View Employees')) navigate('/employees', { replace: true });
      else if (checkPermission('View Admissions')) navigate('/admissions', { replace: true });
      else if (checkPermission('View Courses') || checkPermission('View Departments')) navigate('/academics', { replace: true });
      else if (checkPermission('View Books')) navigate('/library', { replace: true });
      else if (checkPermission('View Hostels')) navigate('/hostel', { replace: true });
      else if (checkPermission('View Security Dashboard')) navigate('/security/dashboard', { replace: true });
      else if (checkPermission('View All Reports')) navigate('/reports', { replace: true });
      else navigate('/profile', { replace: true });
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

  // ── Chart configs ─────────────────────────────────────────────────────────

  // Monthly Trend — Students vs Admissions
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

  // Course-wise Bar Chart
  const courseBarChart = baseChart({
    chart: { type: 'bar', height: 220 },
    xAxis: { categories: (d.courseDistribution || []).map(c => c.name), lineWidth: 0, tickWidth: 0, labels: { style: { color: '#6B7280', fontSize: '11px' } } },
    yAxis: { title: { text: '' }, gridLineDashStyle: 'Dash', gridLineColor: '#F3F4F6', labels: { style: { color: '#9CA3AF', fontSize: '11px' } } },
    plotOptions: { bar: { borderRadius: 4, colorByPoint: true, colors: CHART_COLORS, dataLabels: { enabled: true, style: { fontSize: '10px', fontWeight: '600', color: '#374151' } } } },
    series: [{ name: 'Students', data: (d.courseDistribution || []).map(c => c.count) }]
  });

  // Complaint Status Donut
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

  // Department-wise Employees Column
  const deptChart = baseChart({
    chart: { type: 'column', height: 190 },
    xAxis: { categories: (d.deptDistribution || []).map(x => x.name.length > 12 ? x.name.substring(0, 12) + '…' : x.name), lineWidth: 0, tickWidth: 0, labels: { style: { color: '#6B7280', fontSize: '10px' } } },
    yAxis: { title: { text: '' }, gridLineDashStyle: 'Dash', gridLineColor: '#F3F4F6', labels: { style: { color: '#9CA3AF', fontSize: '10px' } }, allowDecimals: false },
    plotOptions: { column: { borderRadius: 5, colorByPoint: true, colors: CHART_COLORS } },
    series: [{ name: 'Employees', data: (d.deptDistribution || []).map(x => x.count) }]
  });

  // Library Category Pie
  const libCategoryChart = baseChart({
    chart: { type: 'pie', height: 160, margin: [0, 0, 0, 0] },
    plotOptions: { pie: { dataLabels: { enabled: true, distance: -24, style: { fontSize: '9px', fontWeight: '700', color: '#fff', textOutline: 'none' } }, borderWidth: 2, borderColor: '#fff' } },
    series: [{
      name: 'Books',
      data: (d.library?.byCategory || []).map((c, i) => ({ name: c.name, y: c.count, color: CHART_COLORS[i] }))
    }]
  });

  const hostelOccupancyPct = d.hostel?.capacity > 0
    ? Math.round((d.hostel.occupied / d.hostel.capacity) * 100) : 0;

  return (
    <div className="space-y-5 font-['Inter']">

      {/* ── Row 1: Core Stats ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users}        label="Total Students"      value={d.totalStudents}    sub={`${d.totalStudents} enrolled`}   color="text-blue-600"    bg="bg-blue-50"    to="/students" />
        <StatCard icon={UserSquare2}  label="Total Employees"     value={d.totalEmployees}   sub={`${d.facultyCount} faculty`}     color="text-violet-600"  bg="bg-violet-50"  to="/employees" />
        <StatCard icon={GraduationCap} label="Active Sections"   value={d.totalClasses}     sub="Classes / Sections"              color="text-emerald-600" bg="bg-emerald-50" to="/academics" />
        <StatCard icon={BookMarked}   label="Registered Subjects" value={d.totalSubjects}    sub="Subjects"                        color="text-amber-600"   bg="bg-amber-50"   to="/academics" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={UserPlus}     label="Total Admissions"    value={d.totalAdmissions}  sub="All stages"                      color="text-cyan-600"    bg="bg-cyan-50"    to="/admissions/dashboard" />
        <StatCard icon={Activity}     label="New Applications"    value={d.newApplications}  sub="This month"                      color="text-pink-600"    bg="bg-pink-50"    to="/admissions/applications" />
        <StatCard icon={Bed}          label="Hostel Occupancy"    value={`${hostelOccupancyPct}%`} sub="Beds occupied"            color="text-indigo-600"  bg="bg-indigo-50"  to="/hostel-warden/dashboard" />
        <StatCard icon={AlertCircle}  label="Open Complaints"     value={d.pendingComplaints} sub="Pending / In-Progress"         color="text-orange-600"  bg="bg-orange-50"  to="/complaints" />
      </div>

      {/* ── Row 2: Monthly Trend + Complaint Donut ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[14px] font-bold text-gray-800">Enrollment & Admissions Trend</h3>
            <span className="text-[11px] font-semibold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">This Year ({new Date().getFullYear()})</span>
          </div>
          <p className="text-[11px] text-gray-400 mb-3">Monthly student enrollments vs new admissions</p>
          <HCReact highcharts={Highcharts} options={monthlyTrendChart} containerProps={{ style: { width: '100%' } }} />
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

      {/* ── Row 3: Course Distribution + Dept Chart ─────────────────────── */}
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

      {/* ── Row 4: Library + Hostel + Security ──────────────────────────── */}
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
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <p className="text-[24px] font-bold text-emerald-600">{d.security?.todayVisitors ?? 0}</p>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">Today's Visitors</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <p className="text-[24px] font-bold text-amber-600">{d.security?.activeGatepasses ?? 0}</p>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">Active Gatepasses</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 5: Recent Notices ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50"><Megaphone size={16} className="text-emerald-600" /></div>
            <h3 className="text-[14px] font-bold text-gray-800">Recent Notices</h3>
          </div>
          <span className="text-[11px] text-gray-400 font-semibold">Latest Published</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
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
            <div className="col-span-3 text-center py-8 text-gray-300 text-[13px]">No published notices</div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
