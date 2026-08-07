import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronDown, Eye, Plus, Edit2, Trash2, X as XIcon,
  Calendar, Users, Clock, MapPin, Check, XCircle
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';
import MeetingCalendar from '../components/MeetingCalendar';
import { checkPermission } from '../utils/checkPermission';
import AccessDenied from '../components/AccessDenied';

const Meetings = () => {
  if (!checkPermission('View Employees')) {
    return <AccessDenied />;
  }
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [departments, setDepartments] = useState([]);
  
  const [filters, setFilters] = useState({
    type: 'All Types',
    department: 'All Departments',
    search: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    type: 'Department Meeting',
    date: '',
    time: '',
    duration: '60',
    location: '',
    department: '',
    agenda: '',
    attendees: [],
    organizer: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [filters]);

  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get('/academics/departments');
      setDepartments(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch departments', error);
    }
  };

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const params = {
        limit: 5000, // Fetch enough to cover all history
        type: filters.type === 'All Types' ? '' : filters.type,
        department: filters.department === 'All Departments' ? '' : filters.department,
        search: filters.search
      };
      const response = await axiosInstance.get('/meetings', { params });
      setMeetings(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeeting = () => {
    setIsEditing(false);
    setFormData({
      title: '',
      type: 'Department Meeting',
      date: '',
      time: '',
      duration: '60',
      location: '',
      department: '',
      agenda: '',
      attendees: [],
      organizer: ''
    });
    setShowAddModal(true);
  };

  const handleSaveMeeting = async () => {
    if (!formData.title || !formData.date || !formData.time || !formData.organizer) {
      toast.error('Please fill all required fields');
      return;
    }
    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        meetingId: isEditing ? selectedMeeting.meetingId : `MTG-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        attendees: parseInt(formData.attendees) || 0
      };
      if (isEditing) {
        await axiosInstance.put(`/meetings/${selectedMeeting._id}`, payload);
        toast.success('Meeting updated successfully');
        setShowAddModal(false);
      } else {
        await axiosInstance.post('/meetings', payload);
        toast.success('Meeting scheduled successfully');
        setShowAddModal(false);
      }
      setFormData({
        title: '',
        type: 'Department Meeting',
        date: '',
        time: '',
        duration: '60',
        location: '',
        department: '',
        agenda: '',
        attendees: [],
        organizer: ''
      });
      fetchMeetings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save meeting');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteMeeting = async (meeting) => {
    if (!window.confirm(`Delete meeting "${meeting.title}"?`)) return;
    try {
      await axiosInstance.delete(`/meetings/${meeting._id}`);
      toast.success('Meeting deleted successfully');
      setShowViewModal(false);
      fetchMeetings();
    } catch (error) {
      toast.error('Failed to delete meeting');
    }
  };

  const getMeetingTypeColor = (type) => {
    switch (type) {
      case 'Department Meeting': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Parent Meeting': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Academic Meeting': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Staff Meeting': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Upcoming': return 'bg-blue-100 text-blue-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 pt-4 pb-2 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Meetings</h2>
          <p className="text-[13px] text-gray-500 mt-1">Schedule and manage meetings via calendar</p>
        </div>
        {checkPermission('Add Meeting') && (
          <button 
            onClick={handleAddMeeting}
            className="flex items-center gap-2 bg-[#0A6C54] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#085a46] transition-colors"
          >
            <Plus size={16} />
            Schedule Meeting
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-6 gap-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            placeholder="Search by title or organizer" 
            className="w-[260px] bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <select 
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer"
            >
              <option>All Types</option>
              <option>Department Meeting</option>
              <option>Parent Meeting</option>
              <option>Academic Meeting</option>
              <option>Staff Meeting</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative">
            <select 
              value={filters.department}
              onChange={(e) => setFilters({...filters, department: e.target.value})}
              className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer bg-white"
            >
              <option>All Departments</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 bg-[#F9FAFB] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-8"><SkeletonLoader type="table" rows={6} cols={1} /></div>
        ) : (
          <MeetingCalendar 
            meetings={meetings} 
            onDateClick={(dateStr) => {
              handleAddMeeting();
              setFormData(prev => ({...prev, date: dateStr}));
            }}
            onMeetingClick={(meeting) => {
              setSelectedMeeting(meeting);
              setShowViewModal(true);
            }}
          />
        )}
      </div>

      {/* ADD/EDIT MEETING MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">{isEditing ? 'Edit Meeting' : 'Schedule New Meeting'}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <XIcon size={20} />
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Meeting Title *</label>
                <input 
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Q3 Planning Session"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Meeting Type *</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option>Department Meeting</option>
                    <option>Parent Meeting</option>
                    <option>Academic Meeting</option>
                    <option>Staff Meeting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Department</label>
                  <select 
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] bg-white"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Date *</label>
                  <input 
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Time *</label>
                  <input 
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Duration (min)</label>
                  <input 
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="60"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Organizer *</label>
                <input 
                  type="text"
                  value={formData.organizer}
                  onChange={(e) => setFormData({...formData, organizer: e.target.value})}
                  placeholder="E.g., Dr. Smith"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] mb-4"
                />
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Location *</label>
                <input 
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., Conference Room A"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Agenda *</label>
                <textarea
                  value={formData.agenda}
                  onChange={(e) => setFormData({...formData, agenda: e.target.value})}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveMeeting}
                  disabled={formLoading}
                  className="px-6 py-2.5 rounded-lg bg-[#0A6C54] text-white text-sm font-semibold hover:bg-[#085a46] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {formLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {isEditing ? 'Update Meeting' : 'Schedule Meeting'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MEETING MODAL */}
      {showViewModal && selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-gray-800">{selectedMeeting.title}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getStatusColor(selectedMeeting.status)}`}>
                    {selectedMeeting.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">ID: {selectedMeeting.meetingId}</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <DetailRow icon={<Calendar size={16}/>} label="Date" value={formatDate(selectedMeeting.date)} />
                <DetailRow icon={<Clock size={16}/>} label="Time" value={`${selectedMeeting.time} (${selectedMeeting.duration} mins)`} />
                <DetailRow icon={<MapPin size={16}/>} label="Location" value={selectedMeeting.location} />
                <DetailRow icon={<Users size={16}/>} label="Organizer" value={selectedMeeting.organizer} />
              </div>

              <div>
                <span className="block text-xs font-semibold text-gray-500 mb-2">Agenda</span>
                <p className="text-[13px] text-gray-800 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {selectedMeeting.agenda}
                </p>
              </div>

              <div className="flex gap-2">
                <span className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border ${getMeetingTypeColor(selectedMeeting.type)}`}>
                  {selectedMeeting.type}
                </span>
                {selectedMeeting.department && (
                  <span className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border bg-gray-50 border-gray-200 text-gray-600">
                    {selectedMeeting.department}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <button 
                onClick={() => handleDeleteMeeting(selectedMeeting)}
                className="px-4 py-2.5 rounded-lg border border-red-100 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                Cancel Meeting
              </button>
              <button 
                onClick={() => {
                  setFormData({
                    title: selectedMeeting.title,
                    type: selectedMeeting.type,
                    date: selectedMeeting.date ? selectedMeeting.date.split('T')[0] : '',
                    time: selectedMeeting.time,
                    duration: String(selectedMeeting.duration),
                    location: selectedMeeting.location,
                    department: selectedMeeting.department,
                    agenda: selectedMeeting.agenda,
                    attendees: selectedMeeting.attendees,
                    organizer: selectedMeeting.organizer || ''
                  });
                  setIsEditing(true);
                  setShowViewModal(false);
                  setShowAddModal(true);
                }}
                className="px-6 py-2.5 rounded-lg bg-[#0A6C54] text-white text-sm font-semibold hover:bg-[#085a46] transition-colors flex items-center gap-2"
              >
                <Edit2 size={16} />
                Edit Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Component
const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mt-0.5">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-xs font-semibold text-gray-500 mb-0.5">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value}</span>
    </div>
  </div>
);

export default Meetings;
