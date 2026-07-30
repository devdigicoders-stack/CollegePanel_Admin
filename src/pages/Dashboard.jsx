import { useState, useEffect } from 'react';
import { 
  Users, SquareUser, 
  Clock, ShieldAlert, 
  BookOpen, BookMarked, 
  UserCheck, AlertCircle
} from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axios from 'axios';
import SkeletonLoader from '../components/SkeletonLoader';

const HCReact = HighchartsReact.default || HighchartsReact;

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/dashboard/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(res.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dashboardData) {
    return <SkeletonLoader type="cards" />;
  }

  // Line Chart Options
  const lineChartOptions = {
    chart: { type: 'line', height: 260, style: { fontFamily: 'Inter' }, backgroundColor: 'transparent' },
    title: { text: '' },
    xAxis: { 
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      gridLineWidth: 0, lineWidth: 0, tickWidth: 0, 
      labels: { style: { color: '#6B7280', fontSize: '11px' }, y: 20 }
    },
    yAxis: { 
      title: { text: '' }, 
      gridLineDashStyle: 'Dash', gridLineColor: '#E5E7EB', 
      labels: { style: { color: '#6B7280', fontSize: '11px' } }
    },
    series: [{ 
      name: 'Students Added', 
      data: dashboardData.monthlyStudents || Array(12).fill(0), 
      color: '#3B82F6', 
      lineWidth: 3,
      marker: { symbol: 'circle', fillColor: '#fff', lineWidth: 2, lineColor: '#3B82F6', radius: 4 } 
    }],
    legend: { enabled: false },
    credits: { enabled: false },
    tooltip: {
      backgroundColor: '#fff',
      borderColor: '#eee',
      borderRadius: 8,
      shadow: true,
      style: { fontWeight: 'bold', color: '#374151' }
    }
  };

  const feeDataRaw = [
    { name: 'Collected', value: dashboardData.fees.collected, color: '#0A6C54' },
    { name: 'Pending', value: dashboardData.fees.pending, color: '#F59E0B' },
    { name: 'Overdue', value: dashboardData.fees.overdue, color: '#EF4444' },
  ];
  
  const totalFees = feeDataRaw.reduce((acc, f) => acc + f.value, 0);

  const pieChartOptions = {
    chart: { type: 'pie', height: 180, style: { fontFamily: 'Inter' }, backgroundColor: 'transparent', margin: [0, 0, 0, 0] },
    title: { text: '' },
    plotOptions: {
      pie: {
        innerSize: '70%',
        dataLabels: { enabled: false },
        borderWidth: 2,
        borderColor: '#fff'
      }
    },
    series: [{
      name: 'Amount',
      data: feeDataRaw.map(d => ({ name: d.name, y: d.value || 0, color: d.color }))
    }],
    tooltip: {
      pointFormatter: function() { return '<b>₹' + this.y.toLocaleString() + '</b>'; },
      backgroundColor: '#fff',
      borderRadius: 8,
      shadow: true
    },
    credits: { enabled: false }
  };

  return (
    <div className="space-y-4 font-['Inter']">
      
      {/* Top 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center gap-4 border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
            <Users size={24} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] text-gray-500 font-medium">Total Students</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-[20px] font-bold text-gray-800">{dashboardData.totalStudents}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center gap-4 border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
            <SquareUser size={24} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] text-gray-500 font-medium">Total Faculty</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-[20px] font-bold text-gray-800">{dashboardData.totalFaculty}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center gap-4 border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
            <BookOpen size={24} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] text-gray-500 font-medium">Total Classes</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-[20px] font-bold text-gray-800">{dashboardData.totalClasses}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center gap-4 border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
            <BookMarked size={24} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] text-gray-500 font-medium">Total Subjects</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-[20px] font-bold text-gray-800">{dashboardData.totalSubjects}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center gap-4 border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <Clock size={24} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] text-gray-500 font-medium">Student Attendance</p>
            <h3 className="text-[20px] font-bold text-gray-800">{dashboardData.attendance.percent}%</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center gap-4 border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <UserCheck size={24} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] text-gray-500 font-medium">Faculty Attendance</p>
            <h3 className="text-[20px] font-bold text-gray-800">{dashboardData.attendance.facultyPercent}%</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center gap-4 border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
            <ShieldAlert size={24} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] text-gray-500 font-medium">Upcoming Exams</p>
            <h3 className="text-[20px] font-bold text-red-500">{dashboardData.upcomingExams}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center gap-4 border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
            <AlertCircle size={24} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] text-gray-500 font-medium">Pending Complaints</p>
            <h3 className="text-[20px] font-bold text-orange-600">{dashboardData.pendingComplaints}</h3>
          </div>
        </div>
      </div>

      {/* Middle Section - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:h-[340px]">
        
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 flex flex-col h-full">
          <h3 className="text-[14px] font-bold text-gray-800 mb-2 font-['Outfit']">Students Registration Overview</h3>
          <div className="flex-1 w-full min-h-0">
            <HCReact highcharts={Highcharts} options={lineChartOptions} containerProps={{ style: { height: "100%", width: "100%" } }} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 flex flex-col h-full">
          <h3 className="text-[14px] font-bold text-gray-800 mb-1 font-['Outfit']">Fee Collection</h3>
          
          <div className="flex-1 flex flex-col relative mt-2 min-h-0">
            <div className="h-[180px] relative flex justify-center">
              <HCReact highcharts={Highcharts} options={pieChartOptions} containerProps={{ style: { height: "100%", width: "100%" } }} />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-2">
                <span className="text-[14px] font-bold text-gray-800">₹{totalFees.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-auto space-y-3 px-2">
              {feeDataRaw.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-[12px] text-gray-500 font-medium">{item.name}</span>
                  </div>
                  <span className="text-[12px] font-bold text-gray-800">₹{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Attendance */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 flex flex-col justify-between">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4 font-['Outfit']">Attendance Overview <span className="font-normal text-gray-400">(Today)</span></h3>
          
          <div className="flex justify-between items-end mb-6 px-4">
            <div className="text-center">
              <p className="text-[12px] text-gray-500 mb-1">Present</p>
              <h4 className="text-[22px] font-bold text-gray-800">{dashboardData.attendance.present}</h4>
            </div>
            <div className="text-center">
              <p className="text-[12px] text-gray-500 mb-1">Absent</p>
              <h4 className="text-[22px] font-bold text-red-500">{dashboardData.attendance.absent}</h4>
            </div>
            <div className="text-center">
              <p className="text-[12px] text-gray-500 mb-1">Total Tracked</p>
              <h4 className="text-[22px] font-bold text-gray-800">{dashboardData.attendance.present + dashboardData.attendance.absent}</h4>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 rounded-full overflow-hidden flex">
              <div className="bg-[#0A6C54] h-full" style={{ width: `${dashboardData.attendance.percent}%` }}></div>
              <div className="bg-gray-100 h-full" style={{ width: `${100 - dashboardData.attendance.percent}%` }}></div>
            </div>
            <span className="text-[14px] font-bold text-gray-800 w-10 text-right">{dashboardData.attendance.percent}%</span>
          </div>
        </div>

        {/* Notice Board */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 flex flex-col min-h-[200px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[14px] font-bold text-gray-800 font-['Outfit']">Notice / Announcements</h3>
          </div>
          
          <div className="flex-1 flex flex-col justify-between">
             <div className="p-3 bg-gray-50 rounded-lg text-[13px] border border-gray-100 text-gray-500">
               No active notices to display.
             </div>
          </div>
        </div>

      </div>
      
    </div>
  );
};

export default Dashboard;
