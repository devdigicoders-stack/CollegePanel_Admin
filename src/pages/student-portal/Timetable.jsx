import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const Timetable = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const res = await axiosInstance.get('/student-portal/timetable');
      // Group by day
      const grouped = {};
      res.data.forEach(item => {
        if (!grouped[item.day]) {
          grouped[item.day] = [];
        }
        grouped[item.day].push({
          time: item.timeSlot || `${item.startTime} - ${item.endTime}`,
          subject: item.subject || item.subjectId?.name || 'Unknown Subject',
          room: item.roomNo,
          faculty: item.teacherName || item.teacherId?.name || 'Unknown Faculty'
        });
      });
      
      const formattedSchedule = Object.keys(grouped).map(day => ({
        day,
        lectures: grouped[day].sort((a,b) => a.time.localeCompare(b.time))
      }));
      
      // Sort days of week
      const daysOrder = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
      formattedSchedule.sort((a, b) => daysOrder[a.day] - daysOrder[b.day]);
      
      setSchedule(formattedSchedule);
    } catch (error) {
      toast.error('Failed to fetch timetable');
    } finally { setLoading(false); }
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
        <h2 className="text-[16px] font-bold text-gray-800">My Class Timetable</h2>
        <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify your daily class schedules, designated theory classrooms, and laboratory sessions</p>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        {schedule.length > 0 ? schedule.map((dayPlan, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="font-bold text-gray-800 text-[14px] border-b border-gray-100 pb-2">{dayPlan.day}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dayPlan.lectures.map((lec, lIdx) => (
                <div key={lIdx} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 shadow-sm space-y-3">
                  <div className="flex items-center gap-1.5 text-blue-600 text-[12px] font-semibold">
                    <Clock size={14} /> {lec.time}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-[13px]">{lec.subject}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Faculty: {lec.faculty}</p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-[11px] font-semibold">
                    <MapPin size={13} className="text-gray-400" /> Room: {lec.room}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )) : (
          <div className="text-gray-500 text-[13px] p-4 bg-gray-50 rounded-xl border border-gray-100">
            No class timetable is available currently.
          </div>
        )}
      </div>
    </div>
  );
};

export default Timetable;
