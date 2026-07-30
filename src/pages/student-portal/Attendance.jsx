import React from 'react';
import { AlertCircle, CheckCircle, PieChart } from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const HCReact = HighchartsReact.default || HighchartsReact;

const Attendance = () => {
  const attendanceData = [
    { subject: 'Advanced Computer Networks', code: 'CS-401', attended: 36, conducted: 40, percentage: 90 },
    { subject: 'Software Engineering Concepts', code: 'CS-402', attended: 28, conducted: 40, percentage: 70, isShort: true },
    { subject: 'Web Technology Lab', code: 'CS-403L', attended: 18, conducted: 20, percentage: 90 },
  ];

  const overallOptions = {
    chart: { type: 'pie', height: 260, backgroundColor: 'transparent' },
    title: { text: '' },
    series: [{
      name: 'Sessions',
      colorByPoint: true,
      data: [
        { name: 'Attended Classes', y: 82, color: '#0A6C54' },
        { name: 'Absent Classes', y: 18, color: '#EF4444' }
      ]
    }],
    credits: { enabled: false }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-[16px] font-bold text-gray-800">My Attendance Overview</h2>
        <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify subject-wise attendance logs, check short attendance alerts, and track monthly parameters</p>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto">
        <div className="space-y-6 lg:col-span-2">
          {attendanceData.map((item, idx) => (
            <div key={idx} className="p-4 border border-gray-100 rounded-xl space-y-3 shadow-sm bg-gray-50/50">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-800 text-[14px]">{item.subject}</h4>
                  <p className="text-[12px] text-gray-500 font-mono mt-0.5">{item.code}</p>
                </div>
                <span className={`text-[15px] font-bold ${item.isShort ? 'text-red-500' : 'text-green-700'}`}>{item.percentage}%</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${item.isShort ? 'bg-red-500' : 'bg-green-700'}`} 
                  style={{ width: `${item.percentage}%` }}
                />
              </div>

              <div className="flex justify-between text-[12px] text-gray-500 font-semibold">
                <span>Classes Attended: {item.attended} / {item.conducted}</span>
                {item.isShort && (
                  <span className="text-red-500 flex items-center gap-1 font-bold">
                    <AlertCircle size={14} /> Short Attendance Alert! (Min 75% required)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border border-gray-100 rounded-xl p-6 bg-white space-y-4 shadow-sm h-fit">
          <h3 className="font-bold text-gray-800 text-[14px]">Overall Average Attendance</h3>
          <HCReact highcharts={Highcharts} options={overallOptions} />
        </div>
      </div>
    </div>
  );
};

export default Attendance;
