import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, Clock, MapPin, User, Users } from 'lucide-react';
import axios from 'axios';

const MeetingCalendar = ({ meetings, onDateClick, onMeetingClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState([]);
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch Indian holidays for the current year
  useEffect(() => {
    const fetchHolidays = async () => {
      setIsLoadingHolidays(true);
      try {
        const response = await axios.get(`https://date.nager.at/api/v3/PublicHolidays/${year}/IN`);
        setHolidays(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Failed to fetch holidays:', error);
        setHolidays([]);
      } finally {
        setIsLoadingHolidays(false);
      }
    };
    fetchHolidays();
  }, [year]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Helper to format date as YYYY-MM-DD (local time)
  const formatDateString = (y, m, d) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const renderCells = () => {
    const cells = [];
    const todayStr = formatDateString(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    // Empty cells for days before start of month
    for (let i = 0; i < startDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="min-h-[70px] sm:min-h-[120px] bg-gray-50/50 border border-gray-100 rounded-xl" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDateString(year, month, d);
      const isToday = dateStr === todayStr;

      // Find holidays on this date
      const dayHolidays = holidays.filter(h => h.date === dateStr);
      
      // Find meetings on this date
      const dayMeetings = meetings.filter(m => {
        if (!m.date) return false;
        // Handle timezone issues by matching YYYY-MM-DD
        const mDate = new Date(m.date);
        const mDateStr = formatDateString(mDate.getFullYear(), mDate.getMonth(), mDate.getDate());
        return mDateStr === dateStr;
      });

      cells.push(
        <div 
          key={d} 
          onClick={() => onDateClick(dateStr)}
          className={`min-h-[70px] sm:min-h-[130px] p-1 sm:p-2 bg-white border border-gray-100 rounded-lg sm:rounded-xl transition-all duration-200 cursor-pointer flex flex-col relative group hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 z-10 hover:z-20
            ${isToday ? 'ring-2 ring-emerald-500 bg-emerald-50/10' : ''}`}
        >
          {/* Header of the cell */}
          <div className="flex justify-between items-start mb-2">
            <span className={`flex items-center justify-center w-7 h-7 text-sm font-semibold rounded-full
              ${isToday ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-700 group-hover:text-emerald-600'}`}>
              {d}
            </span>
            {dayHolidays.length > 0 && (
              <span className="flex items-center text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold truncate max-w-[70%] shadow-sm" title={dayHolidays[0].localName}>
                ✨ {dayHolidays[0].localName}
              </span>
            )}
          </div>

          {/* Meetings list */}
          <div className="flex-1 space-y-1.5 overflow-hidden">
            {dayMeetings.slice(0, 3).map((meeting, idx) => {
              const isPast = dateStr < todayStr;
              const statusLabel = isPast ? 'CLOSED' : 'UPCOMING';
              
              const tagColors = isPast 
                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
              
              const badgeColors = isPast
                ? 'bg-red-100 text-red-700 border-red-200'
                : 'bg-emerald-100 text-emerald-700 border-emerald-200';

              return (
              <div 
                key={idx}
                onClick={(e) => { e.stopPropagation(); onMeetingClick(meeting); }}
                className="relative group/meeting"
              >
                {/* Meeting Tag */}
                <div className={`text-[11px] leading-tight p-1.5 rounded-md truncate font-bold border transition-colors shadow-sm ${tagColors}`}>
                  <span className="opacity-75 mr-1">{meeting.time}</span>
                  {meeting.title}
                </div>
                
                {/* Dynamic Premium Hover Card */}
                <div className="absolute z-[100] invisible opacity-0 group-hover/meeting:visible group-hover/meeting:opacity-100 top-full left-1/2 -translate-x-1/2 mt-1.5 w-64 bg-white/95 backdrop-blur-xl border border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl p-4 cursor-default text-left transition-all duration-200 transform origin-top scale-95 group-hover/meeting:scale-100 ring-1 ring-black/5 pointer-events-none">
                  
                  {/* Little Arrow pointing up */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[7px] border-transparent border-b-white/95"></div>
                  
                  <div className="flex items-center justify-between mb-1.5">
                     <h4 className="font-bold text-gray-800 text-[13px] line-clamp-1">{meeting.title}</h4>
                     <span className={`text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border ${badgeColors}`}>
                        {statusLabel}
                     </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mb-3.5">
                    <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">{meeting.type}</span>
                    {meeting.department && (
                      <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-gray-50 text-gray-600 border border-gray-200">{meeting.department}</span>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-start gap-2.5 text-[11px] text-gray-600 font-medium">
                       <Clock size={13} className="text-gray-400 mt-0.5 shrink-0"/> 
                       <span><strong className="text-gray-800">{meeting.time}</strong> <span className="opacity-75">({meeting.duration}m)</span></span>
                    </div>
                    <div className="flex items-start gap-2.5 text-[11px] text-gray-600 font-medium">
                       <MapPin size={13} className="text-gray-400 mt-0.5 shrink-0"/> 
                       <span className="line-clamp-2">{meeting.location}</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-[11px] text-gray-600 font-medium">
                       <User size={13} className="text-gray-400 mt-0.5 shrink-0"/> 
                       <span className="line-clamp-1">{meeting.organizer || 'N/A'}</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-[11px] text-gray-600 font-medium">
                       <Users size={13} className="text-gray-400 mt-0.5 shrink-0"/> 
                       <span>{meeting.attendees} <span className="opacity-75">Attendees</span></span>
                    </div>
                  </div>
                  
                  {meeting.agenda && (
                    <div className="mt-3.5 pt-3.5 border-t border-gray-100/50">
                      <p className="text-[10px] text-gray-500 font-medium line-clamp-2 italic">"{meeting.agenda}"</p>
                    </div>
                  )}
                </div>
              </div>
            );
            })}
            {dayMeetings.length > 3 && (
              <div className="text-[10px] text-center font-bold text-gray-400 mt-1 hover:text-emerald-600 transition-colors">
                + {dayMeetings.length - 3} more
              </div>
            )}
          </div>
          
          {/* Hidden Add button that shows on hover */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl z-10 pointer-events-none">
             <span className="bg-emerald-500 text-white px-3 py-1.5 rounded-full text-[11px] font-bold shadow-lg flex items-center gap-1.5 pointer-events-auto hover:bg-emerald-600 transition-colors transform hover:scale-105">
                <CalendarIcon size={12} strokeWidth={3}/> Schedule
             </span>
          </div>
        </div>
      );
    }

    return cells;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-gray-100 font-['Inter']">
      
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
            {monthNames[month]} <span className="text-gray-400 font-medium text-xl">{year}</span>
          </h2>
          <button 
            onClick={handleToday}
            className="text-[11px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors shadow-sm"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-50/80 p-1 rounded-xl border border-gray-100/80 shadow-sm">
          <button 
            onClick={handlePrevMonth}
            className="p-2 text-gray-500 hover:bg-white hover:text-emerald-600 hover:shadow-sm rounded-lg transition-all"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1"></div>
          <button 
            onClick={handleNextMonth}
            className="p-2 text-gray-500 hover:bg-white hover:text-emerald-600 hover:shadow-sm rounded-lg transition-all"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-3 mb-1 sm:mb-3">
        {daysOfWeek.map((day, idx) => (
          <div key={day} className={`text-center text-[9px] sm:text-[11px] font-extrabold uppercase tracking-widest py-1 sm:py-2
            ${idx === 0 || idx === 6 ? 'text-orange-400' : 'text-gray-400'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-3">
        {renderCells()}
      </div>
      
      {/* Legend / Info */}
      <div className="mt-8 flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-100/80 pt-5">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-2 font-medium">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-100 border border-blue-300 shadow-sm"></div> Meetings
          </span>
          <span className="flex items-center gap-2 font-medium">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-100 border border-orange-300 shadow-sm"></div> Public Holidays
          </span>
        </div>
        <div className="flex items-center gap-1.5 opacity-80 font-medium">
          <Info size={13} className="text-emerald-500" /> Click any date to schedule a new meeting
        </div>
      </div>

    </div>
  );
};

export default MeetingCalendar;
