import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const HCReact = HighchartsReact.default || HighchartsReact;

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [overallStats, setOverallStats] = useState({ attended: 0, absent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await axiosInstance.get('/student-portal/attendance');
      const records = res.data;
      
      const subjectMap = {};
      let totalAttended = 0;
      let totalAbsent = 0;

      records.forEach(record => {
        if (!record.sessionId || !record.sessionId.subject) return;
        
        const subId = record.sessionId.subject; // using subject name as id since it's a string
        if (!subjectMap[subId]) {
          subjectMap[subId] = {
            subject: record.sessionId.subject,
            code: record.sessionId.className || 'General',
            attended: 0,
            conducted: 0
          };
        }
        
        subjectMap[subId].conducted += 1;
        if (record.status === 'Present') {
          subjectMap[subId].attended += 1;
          totalAttended += 1;
        } else {
          totalAbsent += 1;
        }
      });

      const processedData = Object.values(subjectMap).map(item => {
        const percentage = item.conducted > 0 ? Math.round((item.attended / item.conducted) * 100) : 0;
        return {
          ...item,
          percentage,
          isShort: percentage < 75
        };
      });

      setAttendanceData(processedData);
      setOverallStats({ attended: totalAttended, absent: totalAbsent });

    } catch (error) {
      toast.error('Failed to fetch attendance');
    } finally { setLoading(false); }
  };

  const totalClasses = overallStats.attended + overallStats.absent;
  const attendedPerc = totalClasses > 0 ? (overallStats.attended / totalClasses) * 100 : 0;
  const absentPerc = totalClasses > 0 ? (overallStats.absent / totalClasses) * 100 : 0;

  const overallOptions = {
    chart: { type: 'pie', height: 260, backgroundColor: 'transparent' },
    title: { text: '' },
    series: [{
      name: 'Sessions',
      colorByPoint: true,
      data: [
        { name: 'Attended Classes', y: attendedPerc, color: '#0A6C54' },
        { name: 'Absent Classes', y: absentPerc, color: '#EF4444' }
      ]
    }],
    credits: { enabled: false }
  };

  
  if (loading) {
    return (
      <div className="p-6">
        <SkeletonLoader type="table" rows={6} cols={5} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-[16px] font-bold text-gray-800">My Attendance Overview</h2>
        <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify subject-wise attendance logs, check short attendance alerts, and track monthly parameters</p>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto">
        <div className="space-y-6 lg:col-span-2">
          {attendanceData.length > 0 ? attendanceData.map((item, idx) => (
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
          )) : (
            <div className="text-gray-500 text-[13px] p-4 bg-gray-50 rounded-xl border border-gray-100">
              No attendance records found.
            </div>
          )}
        </div>

        <div className="border border-gray-100 rounded-xl p-6 bg-white space-y-4 shadow-sm h-fit">
          <h3 className="font-bold text-gray-800 text-[14px]">Overall Average Attendance</h3>
          {totalClasses > 0 ? (
            <HCReact highcharts={Highcharts} options={overallOptions} />
          ) : (
            <p className="text-[12px] text-gray-500 text-center py-10">No data available yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
