import { useState, useEffect, useCallback } from 'react';
import { 
  ChevronDown, Plus, Edit2, Trash2, X as XIcon, Clock, User, BookOpen, 
  ChevronLeft, ChevronRight, Calendar, Filter, Save, RefreshCw, 
  Loader2, AlertCircle, MapPin, Users, ClipboardList, Search
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const Timetable = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [timetable, setTimetable] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);

  const [filters, setFilters] = useState({
    department: 'All Departments',
    semester: 'All Semesters',
    section: 'All Sections',
    eventType: 'All',
    search: ''
  });

  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
  const [viewMode, setViewMode] = useState('calendar');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    day: '',
    timeSlot: '',
    subject: '',
    teacherId: '',
    teacherName: '',
    roomNo: '',
    type: 'Theory',
    course: '',
    semester: '',
    section: '',
    eventType: 'Class'
  });

  const [editFormData, setEditFormData] = useState({});

  const timeSlots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:15 AM - 12:15 PM',
    '12:15 PM - 01:15 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM'
  ];

  const fetchStaticData = useCallback(async () => {
    try {
      const [deptRes, semRes, secRes, teacherRes] = await Promise.all([
        axiosInstance.get('/academics/departments'),
        axiosInstance.get('/academics/semesters'),
        axiosInstance.get('/academics/sections'),
        axiosInstance.get('/timetable/teachers')
      ]);
      setDepartments(deptRes.data.data || deptRes.data || []);
      setSemesters(semRes.data.data || semRes.data || []);
      setSections(secRes.data.data || secRes.data || []);
      setTeachers(teacherRes.data || []);
    } catch {
      toast.error('Failed to load filter options');
    }
  }, []);

  const fetchTimetable = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.department && filters.department !== 'All Departments') params.course = filters.department;
      if (filters.semester && filters.semester !== 'All Semesters') params.semester = filters.semester;
      if (filters.section && filters.section !== 'All Sections') params.section = filters.section;
      if (filters.eventType && filters.eventType !== 'All') params.eventType = filters.eventType;
      if (filters.search) params.search = filters.search;

      const res = await axiosInstance.get('/timetable', { params });
      const data = res.data.data || res.data;
      setTimetable(data);
    } catch {
      toast.error('Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStaticData(), fetchTimetable()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      handleFilterChange('search', e.target.value);
    }
  };

  const handleRefresh = () => {
    fetchTimetable();
  };

  const getEntriesForDay = (day) => {
    return timetable.filter(entry => entry.day === day);
  };

  const getEntriesForDate = (date) => {
    const dayName = DAYS[date.getDay()];
    if (!dayName || dayName === 'Sunday') return [];
    return timetable.filter(entry => entry.day === dayName);
  };

  const handleAddClass = () => {
    setFormData({
      day: '', timeSlot: '', subject: '', teacherId: '', teacherName: '',
      roomNo: '', type: 'Theory', course: '', semester: '', section: '', eventType: 'Class'
    });
    setShowAddModal(true);
  };

  const handleEditClass = (entry) => {
    setEditFormData({ ...entry });
    setShowEditModal(true);
  };

  const handleDeleteClick = (entry) => {
    setDeleteTarget(entry);
    setShowDeleteConfirm(true);
  };

  const handleSaveAdd = async () => {
    if (!formData.day || !formData.timeSlot || !formData.subject || !formData.teacherName || !formData.roomNo) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      setSaving(true);
      await axiosInstance.post('/timetable', formData);
      toast.success('Class added successfully!');
      setShowAddModal(false);
      fetchTimetable();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add class');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editFormData.subject || !editFormData.teacherName || !editFormData.roomNo) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      setSaving(true);
      await axiosInstance.put(`/timetable/${editFormData._id}`, editFormData);
      toast.success('Class updated successfully!');
      setShowEditModal(false);
      fetchTimetable();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update class');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await axiosInstance.delete(`/timetable/${deleteTarget._id}`);
      toast.success('Class deleted successfully!');
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchTimetable();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete class');
    } finally {
      setDeleting(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleTeacherSelect = (teacherId) => {
    const teacher = teachers.find(t => t._id === teacherId);
    if (teacher) {
      setFormData(prev => ({ ...prev, teacherId, teacherName: teacher.name }));
    }
  };

  const handleEditTeacherSelect = (teacherId) => {
    const teacher = teachers.find(t => t._id === teacherId);
    if (teacher) {
      setEditFormData(prev => ({ ...prev, teacherId, teacherName: teacher.name }));
    }
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
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
    const firstDay = getFirstDayOfMonth(calendarMonth, calendarYear);
    const today = new Date();
    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-24 border border-gray-100"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(calendarYear, calendarMonth, day);
      const dayName = DAYS[date.getDay()];
      const entries = dayName ? getEntriesForDay(dayName) : [];
      const isToday = date.toDateString() === today.toDateString();
      const isSunday = date.getDay() === 0;

      cells.push(
        <div
          key={day}
          className={`h-24 border border-gray-100 p-1 cursor-pointer hover:bg-gray-50 transition-colors ${isSunday ? 'bg-gray-50' : ''} ${isToday ? 'ring-2 ring-[#0A6C54] ring-inset' : ''}`}
          onClick={() => { if (!isSunday) setSelectedDay(date); }}
        >
          <div className={`text-[12px] font-semibold mb-1 ${isToday ? 'text-[#0A6C54]' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {entries.slice(0, 3).map((entry, idx) => (
              <div
                key={idx}
                className={`text-[10px] px-1 py-0.5 rounded truncate ${
                  entry.eventType === 'Meeting' ? 'bg-yellow-100 text-yellow-800' :
                  entry.eventType === 'Event' ? 'bg-purple-100 text-purple-800' :
                  entry.type === 'Lab' ? 'bg-purple-50 text-purple-700' :
                  'bg-blue-50 text-blue-700'
                }`}
              >
                {entry.subject}
              </div>
            ))}
            {entries.length > 3 && (
              <div className="text-[10px] text-gray-500">+{entries.length - 3} more</div>
            )}
          </div>
        </div>
      );
    }

    return cells;
  };

  const getClassTypeColor = (type) => {
    return type === 'Lab'
      ? 'bg-purple-50 text-purple-700 border-purple-200'
      : 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const getEventTypeColor = (eventType) => {
    switch(eventType) {
      case 'Meeting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Event': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return getClassTypeColor(formData.type);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
        <div className="p-6 border-b border-gray-50">
          <SkeletonLoader type="table" rows={3} cols={4} />
        </div>
        <div className="flex-1 p-6">
          <SkeletonLoader type="table" rows={8} cols={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 pt-4 pb-3 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Class Timetable</h2>
          <p className="text-[13px] text-gray-500 mt-1">Manage weekly class schedule and events</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'calendar' ? 'grid' : 'calendar')}
            className="px-3 py-2 text-[13px] font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {viewMode === 'calendar' ? 'Grid View' : 'Calendar View'}
          </button>
          <button
            onClick={handleAddClass}
            className="flex items-center gap-2 bg-[#0A6C54] text-white px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-[#085a46] transition-colors"
          >
            <Plus size={16} />
            Add Class
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 pb-4 flex flex-wrap gap-3 border-b border-gray-100">
        <div className="relative flex-1 min-w-[140px]">
          <select
            value={filters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option>All Departments</option>
            {departments.map(dept => (
              <option key={dept._id} value={dept.name}>{dept.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="relative flex-1 min-w-[140px]">
          <select
            value={filters.semester}
            onChange={(e) => handleFilterChange('semester', e.target.value)}
            className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option>All Semesters</option>
            {semesters.map(sem => (
              <option key={sem._id} value={`Sem ${sem.semesterNumber}`}>Sem {sem.semesterNumber}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="relative flex-1 min-w-[140px]">
          <select
            value={filters.section}
            onChange={(e) => handleFilterChange('section', e.target.value)}
            className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option>All Sections</option>
            {sections.map(sec => (
              <option key={sec._id} value={sec.name}>{sec.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="relative flex-1 min-w-[140px]">
          <select
            value={filters.eventType}
            onChange={(e) => handleFilterChange('eventType', e.target.value)}
            className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option>All</option>
            <option>Class</option>
            <option>Meeting</option>
            <option>Event</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search..."
            defaultValue={filters.search}
            onKeyDown={handleSearch}
            className="w-full sm:w-[200px] bg-white border border-gray-200 text-gray-700 py-2.5 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] placeholder:text-gray-400"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>

        <button
          onClick={handleRefresh}
          className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Info Banner */}
      <div className="mx-6 mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
        <Calendar size={18} className="text-blue-600 flex-shrink-0" />
        <p className="text-[13px] text-blue-800 font-semibold">
          {filters.department !== 'All Departments' && filters.department}
          {filters.semester !== 'All Semesters' && ` | ${filters.semester}`}
          {filters.section !== 'All Sections' && ` | Section ${filters.section}`}
          {filters.eventType !== 'All' && ` | ${filters.eventType}`}
          {filters.department === 'All Departments' && filters.semester === 'All Semesters' && filters.section === 'All Sections' && filters.eventType === 'All' && 'All entries'}
        </p>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-[16px] font-bold text-gray-800">
              {MONTHS[calendarMonth]} {calendarYear}
            </h3>
            <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {DAYS.map(day => (
              <div key={day} className="text-center text-[12px] font-bold text-gray-700 py-2 bg-gray-50 rounded-t-lg">
                {day.slice(0, 3)}
              </div>
            ))}
            {renderCalendar()}
          </div>

          {selectedDay && (
            <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[14px] font-bold text-gray-800">
                  {selectedDay.getDate()} {MONTHS[selectedDay.getMonth()]} {selectedDay.getFullYear()}
                </h4>
                <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-600">
                  <XIcon size={16} />
                </button>
              </div>
              {getEntriesForDate(selectedDay).length === 0 ? (
                <p className="text-[13px] text-gray-500">No classes scheduled for this day.</p>
              ) : (
                <div className="space-y-2">
                  {getEntriesForDate(selectedDay).map(entry => (
                    <div key={entry._id} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-[13px] font-semibold text-gray-800">{entry.subject}</p>
                        <p className="text-[12px] text-gray-600">{entry.teacherName} | {entry.roomNo} | {entry.type}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditClass(entry)} className="text-blue-500 hover:text-blue-700">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDeleteClick(entry)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <SkeletonLoader type="table" rows={8} cols={8} />
          ) : timetable.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Calendar size={40} className="mb-3 opacity-30" />
              <p className="text-[13px] font-medium">No timetable entries found.</p>
            </div>
          ) : (
            <div className="min-w-[1200px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-200 bg-[#F9FAFB] p-3 text-[13px] font-bold text-gray-800 w-[140px] sticky left-0 z-10">
                      Time / Day
                    </th>
                    {DAYS.map(day => (
                      <th key={day} className="border border-gray-200 bg-[#F9FAFB] p-3 text-[13px] font-bold text-gray-800">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time, idx) => (
                    <tr key={time}>
                      <td className="border border-gray-200 bg-[#F9FAFB] p-3 text-[12px] font-semibold text-gray-700 sticky left-0 z-10">
                        {time}
                        {idx === 2 && <div className="text-[10px] text-amber-600 font-bold mt-1">BREAK</div>}
                        {idx === 4 && <div className="text-[10px] text-amber-600 font-bold mt-1">LUNCH</div>}
                      </td>
                      {DAYS.map(day => {
                        const entries = timetable.filter(e => e.day === day && e.timeSlot === time);
                        return (
                          <td key={`${day}-${time}`} className="border border-gray-200 p-2 align-top">
                            {entries.length > 0 ? (
                              <div className="space-y-2">
                                {entries.map(entry => (
                                  <div
                                    key={entry._id}
                                    className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getEventTypeColor(entry.eventType)}`}>
                                        {entry.eventType}
                                      </span>
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => handleEditClass(entry)}
                                          className="w-6 h-6 rounded flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                                          title="Edit"
                                        >
                                          <Edit2 size={12} />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteClick(entry)}
                                          className="w-6 h-6 rounded flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                                          title="Delete"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                      <div className="flex items-center gap-2 mb-1">
                                        <BookOpen size={14} className="text-[#0A6C54]" />
                                        <p className="text-[13px] font-bold text-gray-800 line-clamp-1">{entry.subject}</p>
                                      </div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <User size={13} className="text-gray-500" />
                                        <p className="text-[12px] text-gray-600 line-clamp-1">{entry.teacherName}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <MapPin size={13} className="text-gray-500" />
                                        <p className="text-[12px] text-gray-500 font-medium">{entry.roomNo}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div
                                className="h-full min-h-[100px] flex items-center justify-center text-gray-300 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                                onClick={() => {
                                  setFormData({
                                    ...formData, day, timeSlot: time,
                                    course: filters.department !== 'All Departments' ? filters.department : '',
                                    semester: filters.semester !== 'All Semesters' ? filters.semester : '',
                                    section: filters.section !== 'All Sections' ? filters.section : ''
                                  });
                                  setShowAddModal(true);
                                }}
                              >
                                <Plus size={20} />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Add New Class / Event</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Day *</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({...formData, day: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="">Select Day</option>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Time Slot *</label>
                  <select
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({...formData, timeSlot: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="">Select Time</option>
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="e.g., Data Structures"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Teacher *</label>
                <select
                  value={formData.teacherId}
                  onChange={(e) => handleTeacherSelect(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(t => (
                    <option key={t._id} value={t._id}>{t.name} ({t.designation})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Room No *</label>
                  <input
                    type="text"
                    name="roomNo"
                    value={formData.roomNo}
                    onChange={handleInputChange}
                    placeholder="e.g., Room-201"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Class Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Lab">Lab</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Course</label>
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    placeholder="e.g., Diploma in CE"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Semester</label>
                  <input
                    type="text"
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    placeholder="e.g., 3rd"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Event Type</label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                >
                  <option value="Class">Class</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Event">Event</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveAdd}
                disabled={saving}
                className="flex-1 bg-[#0A6C54] text-white py-2.5 rounded-lg hover:bg-[#085a46] disabled:bg-gray-400 transition-colors font-medium text-sm flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Add Class
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Edit Class / Event</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                <p className="text-[12px] text-gray-600">
                  <strong>{editFormData.day}</strong> | {editFormData.timeSlot}
                </p>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={editFormData.subject || ''}
                  onChange={handleEditInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Teacher *</label>
                <select
                  value={editFormData.teacherId || ''}
                  onChange={(e) => handleEditTeacherSelect(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(t => (
                    <option key={t._id} value={t._id}>{t.name} ({t.designation})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Room No *</label>
                  <input
                    type="text"
                    name="roomNo"
                    value={editFormData.roomNo || ''}
                    onChange={handleEditInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Class Type *</label>
                  <select
                    name="type"
                    value={editFormData.type || 'Theory'}
                    onChange={handleEditInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Lab">Lab</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Event Type</label>
                <select
                  name="eventType"
                  value={editFormData.eventType || 'Class'}
                  onChange={handleEditInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                >
                  <option value="Class">Class</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Event">Event</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 bg-[#0A6C54] text-white py-2.5 rounded-lg hover:bg-[#085a46] disabled:bg-gray-400 transition-colors font-medium text-sm flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Update
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-gray-800">Delete Entry</h3>
                <p className="text-[13px] text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-[13px] text-gray-600 mb-6">
              Are you sure you want to delete <strong>{deleteTarget.subject}</strong> with {deleteTarget.teacherName} on {deleteTarget.day} at {deleteTarget.timeSlot}?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-[13px] font-semibold hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white text-[13px] font-semibold transition-colors">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Timetable;