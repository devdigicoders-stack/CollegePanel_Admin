import React from 'react';
import { 
  Users, SquareUser, User, Building2, 
  Clock, Receipt, Coins, ShieldAlert, FileText,
  BookOpen, BookMarked, CalendarDays, ClipboardCheck,
  UserCheck, AlertCircle
} from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const HCReact = HighchartsReact.default || HighchartsReact;

const Dashboard = () => {
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
      labels: { formatter: function() { return this.value/1000 + 'k'; }, style: { color: '#6B7280', fontSize: '11px' } }
    },
    series: [{ 
      name: 'Students', 
      data: [1500, 1800, 2100, 1800, 2200, 2200, 2600, 2000, 2100, 2400, 2200, 2800], 
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
    { name: 'Collected', value: 3715000, color: '#0A6C54' },
    { name: 'Pending', value: 1528000, color: '#F59E0B' },
    { name: 'Overdue', value: 345200, color: '#EF4444' },
  ];

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
      data: feeDataRaw.map(d => ({ name: d.name, y: d.value, color: d.color }))
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
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center gap-4 border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
            <Users size={24} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] text-gray-500 font-medium">Total Students</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-[20px] font-bold text-gray-800">2,458</h3>
              <span className="text-[12px] text-green-500 font-medium">+5.2%</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center gap-4 border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
            <SquareUser size={24} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] text-gray-500 font-medium">Total Faculty</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-[20px] font-bold text-gray-800">156</h3>
              <span className="text-[12px] text-green-500 font-medium">+1.3%</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center gap-4 border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
            <BookOpen size={24} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] text-gray-500 font-medium">Total Classes</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-[20px] font-bold text-gray-800">42</h3>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center gap-4 border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
            <BookMarked size={24} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] text-gray-500 font-medium">Total Subjects</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-[20px] font-bold text-gray-800">125</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center gap-4 border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <Clock size={24} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] text-gray-500 font-medium">Student Attendance</p>
            <h3 className="text-[20px] font-bold text-gray-800">86.5%</h3>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center gap-4 border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <UserCheck size={24} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] text-gray-500 font-medium">Faculty Attendance</p>
            <h3 className="text-[20px] font-bold text-gray-800">94.2%</h3>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center gap-4 border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
            <ShieldAlert size={24} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] text-gray-500 font-medium">Upcoming Exams</p>
            <h3 className="text-[20px] font-bold text-red-500">6</h3>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center gap-4 border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
            <AlertCircle size={24} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] text-gray-500 font-medium">Pending Complaints</p>
            <h3 className="text-[20px] font-bold text-orange-600">5</h3>
          </div>
        </div>
      </div>

      {/* Middle Section - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:h-[340px]">
        
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 flex flex-col h-full">
          <h3 className="text-[14px] font-bold text-gray-800 mb-2 font-['Outfit']">Students Overview</h3>
          <div className="flex-1 w-full min-h-0">
            <HCReact highcharts={Highcharts} options={lineChartOptions} containerProps={{ style: { height: "100%", width: "100%" } }} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 flex flex-col h-full">
          <h3 className="text-[14px] font-bold text-gray-800 mb-1 font-['Outfit']">Fee Collection <span className="font-normal text-gray-400">(This Month)</span></h3>
          
          <div className="flex-1 flex flex-col relative mt-2 min-h-0">
            <div className="h-[180px] relative flex justify-center">
              <HCReact highcharts={Highcharts} options={pieChartOptions} containerProps={{ style: { height: "100%", width: "100%" } }} />
              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-2">
                <span className="text-[16px] font-bold text-gray-800">₹45,80,200</span>
              </div>
            </div>

            {/* Legend */}
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
              <h4 className="text-[22px] font-bold text-gray-800">1,980</h4>
            </div>
            <div className="text-center">
              <p className="text-[12px] text-gray-500 mb-1">Absent</p>
              <h4 className="text-[22px] font-bold text-red-500">478</h4>
            </div>
            <div className="text-center">
              <p className="text-[12px] text-gray-500 mb-1">Leave</p>
              <h4 className="text-[22px] font-bold text-gray-800">120</h4>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 rounded-full overflow-hidden flex">
              <div className="bg-[#0A6C54] h-full" style={{ width: '80%' }}></div>
              <div className="bg-gray-100 h-full" style={{ width: '20%' }}></div>
            </div>
            <span className="text-[14px] font-bold text-gray-800 w-10 text-right">86.5%</span>
          </div>
        </div>

        {/* Notice Board */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 flex flex-col min-h-[200px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[14px] font-bold text-gray-800 font-['Outfit']">Notice / Announcements</h3>
          </div>
          
          <div className="flex-1 flex flex-col justify-between">
            <ul className="space-y-3">
              <li className="flex gap-2 items-start text-[12px] text-gray-600">
                <span className="font-medium">1.</span>
                <span className="line-clamp-1 leading-snug">Internal Practical Exam Schedule 2024</span>
              </li>
              <li className="flex gap-2 items-start text-[12px] text-gray-600">
                <span className="font-medium">2.</span>
                <span className="line-clamp-1 leading-snug">Parent Teacher Meeting on 25 May 2024</span>
              </li>
              <li className="flex gap-2 items-start text-[12px] text-gray-600">
                <span className="font-medium">3.</span>
                <span className="line-clamp-1 leading-snug">Workshop on AI & ML - 30 May 2024</span>
              </li>
            </ul>
            <div className="text-right mt-2">
              <a href="#" className="text-[#0A6C54] text-[12px] font-semibold hover:underline">View All</a>
            </div>
          </div>
        </div>

      </div>
      
    </div>
  );
};

export default Dashboard;
