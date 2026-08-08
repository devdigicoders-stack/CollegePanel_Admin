import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, X as XIcon } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const Timetable = () => {
  const [schedule, setSchedule] = useState([]);
  const [rawEntries, setRawEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState('calendar');
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const res = await axiosInstance.get('/student-portal/timetable');
      const data = res.data || [];
      
      const parsedData = data.map(item => ({
        ...item,
        time: item.timeSlot || `${item.startTime} - ${item.endTime}`,
        subject: item.subject || item.subjectId?.name || 'Unknown Subject',
        room: item.roomNo,
        faculty: item.teacherName || item.teacherId?.name || 'Unknown Faculty'
      }));

      setRawEntries(parsedData);

      // Group by day for Grid View
      const grouped = {};
      parsedData.forEach(item => {
        if (!grouped[item.day]) {
          grouped[item.day] = [];
        }
        grouped[item.day].push(item);
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

  const getEntriesForDay = (dayName) => {
    return rawEntries.filter(entry => entry.day === dayName).sort((a, b) => a.time.localeCompare(b.time));
  };

  const navigateMonth = (delta) => {
    const newMonth = calendarMonth + delta;
    if (newMonth < 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else if (newMonth > 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(newMonth);
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    // JS getDay() returns 0 for Sunday, 1 for Monday
    // Since our DAYS array starts with Monday, we need to map JS getDay() to our index.
    let dayIndex = new Date(year, month, 1).getDay();
    // In our DAYS: 0=Monday, 6=Sunday
    // JS: 0=Sunday, 1=Monday
    return dayIndex === 0 ? 6 : dayIndex - 1;
  };

  const getEntriesForDate = (date) => {
    // date is a Date object. Find the day of week.
    let dayIndex = date.getDay(); 
    // Map JS index to our DAYS array name
    const jsToDays = { 0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' };
    const dayName = jsToDays[dayIndex];
    return getEntriesForDay(dayName);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
    const firstDayIndex = getFirstDayOfMonth(calendarMonth, calendarYear);
    const today = new Date();
    const cells = [];

    // Empty padding days before the first day of the month
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className="h-24 sm:h-28 border border-gray-100 bg-gray-50/30"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(calendarYear, calendarMonth, day);
      const entries = getEntriesForDate(date);
      const isToday = date.toDateString() === today.toDateString();
      const isSunday = date.getDay() === 0;

      cells.push(
        <div
          key={day}
          className={`h-24 sm:h-28 border border-gray-100 p-1 sm:p-2 cursor-pointer hover:bg-gray-50 transition-colors flex flex-col overflow-hidden ${isSunday ? 'bg-gray-50/80' : 'bg-white'} ${isToday ? 'ring-2 ring-[#0A6C54] ring-inset' : ''}`}
          onClick={() => { if (!isSunday && entries.length > 0) setSelectedDay(date); else if (isSunday) setSelectedDay(null); else setSelectedDay(date); }}
        >
          <div className={`text-[12px] sm:text-[13px] font-bold mb-1 ${isToday ? 'text-[#0A6C54]' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar">
            {entries.slice(0, 3).map((entry, idx) => (
              <div
                key={idx}
                className={`text-[9px] sm:text-[10px] px-1.5 py-1 rounded font-medium truncate ${
                  entry.eventType === 'Meeting' ? 'bg-yellow-100 text-yellow-800' :
                  entry.eventType === 'Event' ? 'bg-purple-100 text-purple-800' :
                  entry.type === 'Lab' ? 'bg-purple-50 text-purple-700' :
                  'bg-blue-50 text-blue-700'
                }`}
                title={`${entry.subject} (${entry.time})`}
              >
                {entry.subject}
              </div>
            ))}
            {entries.length > 3 && (
              <div className="text-[10px] font-bold text-gray-500 pl-1">+{entries.length - 3} more</div>
            )}
          </div>
        </div>
      );
    }

    return cells;
  };
  
  if (loading) {
    return (
      <div className="p-6 h-full flex flex-col gap-6">
        <SkeletonLoader type="card" count={1} />
        <SkeletonLoader type="table" rows={6} cols={7} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Header & Toggle */}
      <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 rounded-t-[16px]">
        <div>
          <h2 className="text-xl font-black text-gray-800 font-['Outfit']">My Class Timetable</h2>
          <p className="text-[13px] text-gray-500 mt-0.5 font-medium">Verify your daily class schedules and lab sessions.</p>
        </div>
        <div className="flex bg-gray-200/60 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 text-[13px] font-bold rounded-md transition-all duration-200 ${
              viewMode === 'calendar' 
                ? 'bg-white text-gray-800 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Calendar View
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 text-[13px] font-bold rounded-md transition-all duration-200 ${
              viewMode === 'grid' 
                ? 'bg-white text-gray-800 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Weekly Grid
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="p-4 sm:p-6 pb-20">
            <div className="flex items-center justify-between mb-6 bg-white border border-gray-100 rounded-xl p-2 shadow-sm">
              <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600 border border-transparent hover:border-gray-200">
                <ChevronLeft size={20} />
              </button>
              <h3 className="text-[16px] sm:text-lg font-black text-gray-800 font-['Outfit'] tracking-wide">
                {MONTHS[calendarMonth]} {calendarYear}
              </h3>
              <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600 border border-transparent hover:border-gray-200">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              {DAYS.map(day => (
                <div key={day} className="text-center text-[11px] sm:text-[13px] font-bold text-gray-700 py-3 bg-gray-50/90 backdrop-blur-sm uppercase tracking-wider">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.slice(0, 3)}</span>
                </div>
              ))}
              {renderCalendar()}
            </div>

            {selectedDay && (
              <div className="mt-6 bg-white rounded-xl p-5 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 transform translate-y-0 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#0A6C54]"></div>
                <div className="flex items-center justify-between mb-4 pl-3">
                  <h4 className="text-[15px] font-black text-gray-800 font-['Outfit']">
                    Schedule for {selectedDay.getDate()} {MONTHS[selectedDay.getMonth()]} {selectedDay.getFullYear()}
                  </h4>
                  <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50">
                    <XIcon size={18} />
                  </button>
                </div>
                
                {getEntriesForDate(selectedDay).length === 0 ? (
                  <p className="text-[13px] text-gray-500 font-medium pl-3 py-4">Enjoy your day off! No classes scheduled.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-3">
                    {getEntriesForDate(selectedDay).map((entry, idx) => (
                      <div key={idx} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-bold text-gray-800 text-[14px] line-clamp-1 pr-2">{entry.subject}</h5>
                          <span className={`px-2 py-1 rounded text-[10px] font-bold flex-shrink-0 ${
                            entry.type === 'Lab' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {entry.type}
                          </span>
                        </div>
                        <div className="space-y-1.5 mt-3">
                          <div className="flex items-center gap-2 text-[12px] text-gray-600 font-medium">
                            <Clock size={14} className="text-gray-400" />
                            {entry.time}
                          </div>
                          <div className="flex items-center gap-2 text-[12px] text-gray-600 font-medium">
                            <MapPin size={14} className="text-gray-400" />
                            {entry.room}
                          </div>
                          <div className="flex items-center gap-2 text-[12px] text-gray-600 font-medium border-t border-gray-100 pt-1.5 mt-1.5">
                            <div className="w-5 h-5 rounded-full bg-[#0A6C54]/10 text-[#0A6C54] flex items-center justify-center text-[9px] font-bold">
                              {(entry.faculty || 'F').charAt(0)}
                            </div>
                            {entry.faculty}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Weekly Grid View */}
        {viewMode === 'grid' && (
          <div className="p-4 sm:p-6 space-y-6">
            {schedule.length > 0 ? schedule.map((dayPlan, idx) => (
              <div key={idx} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-gray-50/80 px-5 py-3 border-b border-gray-100">
                  <h3 className="font-black text-gray-800 text-[15px] font-['Outfit'] uppercase tracking-wide">{dayPlan.day}</h3>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dayPlan.lectures.map((lec, lIdx) => (
                    <div key={lIdx} className="p-4 border border-gray-100 rounded-xl hover:border-[#0A6C54]/30 transition-colors bg-white group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 text-[#0A6C54] text-[12px] font-bold bg-[#0A6C54]/5 px-2.5 py-1 rounded-md">
                          <Clock size={14} /> {lec.time}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            lec.type === 'Lab' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                            {lec.type || 'Theory'}
                        </span>
                      </div>
                      <div className="mb-3">
                        <h4 className="font-bold text-gray-800 text-[14px] leading-tight line-clamp-2">{lec.subject}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-[12px] font-medium mb-1.5">
                         <div className="w-4 h-4 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[8px] font-bold">
                           {(lec.faculty || 'F').charAt(0)}
                         </div>
                         <span className="truncate">{lec.faculty}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-[11px] font-bold">
                        <MapPin size={13} className="text-gray-400" /> Room: {lec.room}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )) : (
              <div className="text-gray-500 text-[14px] font-medium p-10 text-center bg-gray-50 rounded-2xl border border-gray-100">
                <Calendar size={40} className="mx-auto mb-3 text-gray-300" />
                No class timetable is available currently.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Timetable;
