import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronDown, Eye, Plus, Edit2, Trash2, X as XIcon,
  ChevronLeft, ChevronRight, Calendar, Users, Clock, MapPin, Check, XCircle
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';

const Meetings = () => {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  
  // Filters
  const [filters, setFilters] = useState({
    type: 'All Types',
    department: 'All Departments',
    search: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    type: 'Department Meeting',
    date: '',
    time: '',
    duration: '60',
    location: '',
    department: '',
    agenda: '',
    attendees: []
  });

  const tabs = [
    { name: 'Upcoming', status: 'Upcoming' },
    { name: 'Completed', status: 'Completed' },
    { name: 'Cancelled', status: 'Cancelled' },
    { name: 'All', status: 'All' }
  ];

  // Remove staticMeetings - will be fetched from API

  useEffect(() => {
    fetchMeetings();
  }, [activeTab, filters]);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: activeTab !== 'All' ? activeTab : '',
        type: filters.type === 'All Types' ? '' : filters.type,
        department: filters.department === 'All Departments' ? '' : filters.department,
        search: filters.search
      };
      const res = await axiosInstance.get('/meetings', { params });
      setMeetings(res.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: res.data.total || 0,
        pages: res.data.pages || 1
      }));
    } catch (error) {
      toast.error('Failed to fetch meetings');
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Upcoming': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMeetingTypeColor = (type) => {
    switch(type) {
      case 'Department Meeting': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Parent Meeting': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Academic Meeting': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Staff Meeting': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleAddMeeting = () => {
    setFormData({
      title: '',
      type: 'Department Meeting',
      date: '',
      time: '',
      duration: '60',
      location: '',
      department: '',
      agenda: '',
      attendees: []
    });
    setShowAddModal(true);
  };

  const handleSaveMeeting = async () => {
    if (!formData.title || !formData.date || !formData.time) {
      toast.error('Please fill all required fields');
      return;
    }
    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        attendees: parseInt(formData.attendees) || 0
      };
      if (isEditing) {
        await axiosInstance.put(`/meetings/${selectedMeeting._id}`, payload);
        toast.success('Meeting updated successfully');
        setShowEditModal(false);
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
        attendees: []
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
      fetchMeetings();
    } catch (error) {
      toast.error('Failed to delete meeting');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 pt-4 pb-2 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Meetings</h2>
          <p className="text-[13px] text-gray-500 mt-1">Schedule and manage meetings</p>
        </div>
        <button 
          onClick={handleAddMeeting}
          className="flex items-center gap-2 bg-[#0A6C54] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#085a46] transition-colors"
        >
          <Plus size={16} />
          Schedule Meeting
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-6 pt-2 border-b border-gray-100 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`whitespace-nowrap px-4 py-4 text-[14px] font-semibold transition-all relative flex items-center gap-2 ${
              activeTab === tab.name ? 'text-[#0A6C54]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.name}
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === tab.name ? 'bg-[#0A6C54] text-white' : 'bg-gray-100 text-gray-600'
            }`}>{tab.count}</span>
            {activeTab === tab.name && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0A6C54] rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="p-5 flex flex-wrap gap-3 bg-white border-b border-gray-100">
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
            className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer"
          >
            <option>All Departments</option>
            <option>Computer Science</option>
            <option>Electronics</option>
            <option>Mechanical</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

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
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-[#F9FAFB] border-y border-gray-100">
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[10%]">Meeting ID</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[22%]">Title</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[13%]">Type</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[12%]">Date & Time</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[12%]">Location</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[10%]">Attendees</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[10%]">Status</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[11%] text-center">Action</th>
            </tr>
          </thead>
          <tbody>
{loading ? (
              <tr><td colSpan="8" className="py-8"><SkeletonLoader type="table" rows={3} cols="8" /></td></tr>
            ) : meetings.length === 0 ? (
              <tr><td colSpan="8" className="py-8 text-center text-gray-500">No meetings found</td></tr>
            ) : (
              meetings.map((meeting) => (
                <tr key={meeting._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{meeting.meetingId || meeting._id}</td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-[13px] text-gray-800 font-medium">{meeting.title}</span>
                      <span className="text-[11px] text-gray-500">{meeting.organizer}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border ${getMeetingTypeColor(meeting.type)}`}>
                      {meeting.type}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-[12px] text-gray-800 font-medium">{formatDate(meeting.date)}</span>
                      <span className="text-[11px] text-gray-500">{meeting.time}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{meeting.location}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{meeting.attendees}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1.5 rounded-full text-[12px] font-bold ${getStatusColor(meeting.status)}`}>
                      {meeting.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => { setSelectedMeeting(meeting); setShowViewModal(true); }}
                        className="w-8 h-8 rounded-full border border-green-100 flex items-center justify-center text-[#0A6C54] hover:bg-green-50 transition-colors"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      {meeting.status === 'Upcoming' && (
                        <>
                          <button 
                            onClick={() => { setSelectedMeeting(meeting); setFormData({ title: meeting.title, type: meeting.type, date: meeting.date ? meeting.date.split('T')[0] : '', time: meeting.time, duration: String(meeting.duration), location: meeting.location, department: meeting.department, agenda: meeting.agenda, attendees: meeting.attendees }); setIsEditing(true); setShowAddModal(true); }}
                            className="w-8 h-8 rounded-full border border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteMeeting(meeting)}
                            className="w-8 h-8 rounded-full border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-gray-100 gap-4">
        <div className="text-[13px] text-gray-500 font-medium">
          Showing {meetings.length} of {pagination.total} entries | Page {pagination.page} of {pagination.pages}
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0A6C54] text-white text-[13px] font-medium">
            {pagination.page}
          </button>
          <button 
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
            disabled={pagination.page === pagination.pages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ADD MEETING MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Schedule New Meeting</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <XIcon size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Meeting Title *</label>
                <input 
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Parent-Teacher Meeting"
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="">All Departments</option>
                    <option>Computer Science</option>
                    <option>Electronics</option>
                    <option>Mechanical</option>
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
                  placeholder="Enter meeting agenda..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={handleSaveMeeting}
                className="flex-1 bg-[#0A6C54] text-white py-2.5 rounded-lg hover:bg-[#085a46] transition-colors font-medium text-sm"
              >
                Schedule Meeting
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

      {/* VIEW MEETING MODAL */}
      {showViewModal && selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Meeting Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <XIcon size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Meeting ID" value={selectedMeeting.meetingId} />
                <DetailRow label="Status" value={<span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(selectedMeeting.status)}`}>{selectedMeeting.status}</span>} />
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Meeting Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Title" value={selectedMeeting.title} />
                  <DetailRow label="Type" value={<span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getMeetingTypeColor(selectedMeeting.type)}`}>{selectedMeeting.type}</span>} />
                  <DetailRow label="Organizer" value={selectedMeeting.organizer} />
                  <DetailRow label="Department" value={selectedMeeting.department} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Schedule</h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Date" value={formatDate(selectedMeeting.date)} />
                  <DetailRow label="Time" value={selectedMeeting.time} />
                  <DetailRow label="Duration" value={`${selectedMeeting.duration} minutes`} />
                  <DetailRow label="Location" value={selectedMeeting.location} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-700 mb-2">Agenda</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedMeeting.agenda}</p>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <DetailRow label="Expected Attendees" value={`${selectedMeeting.attendees} participants`} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {selectedMeeting.status === 'Upcoming' && (
                <>
                  <button 
                    onClick={() => {
                      setFormData({ title: selectedMeeting.title, type: selectedMeeting.type, date: selectedMeeting.date ? selectedMeeting.date.split('T')[0] : '', time: selectedMeeting.time, duration: String(selectedMeeting.duration), location: selectedMeeting.location, department: selectedMeeting.department, agenda: selectedMeeting.agenda, attendees: selectedMeeting.attendees });
                      setIsEditing(true);
                      setShowViewModal(false);
                      setShowAddModal(true);
                    }}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
                  >
                    Edit Meeting
                  </button>
                  <button 
                    onClick={() => { handleDeleteMeeting(selectedMeeting); setShowViewModal(false); }}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                  >
                    Delete Meeting
                  </button>
                </>
              )}
              <button 
                onClick={() => setShowViewModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Component
const DetailRow = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs font-semibold text-gray-500 mb-1">{label}</span>
    <span className="text-sm text-gray-800 font-medium">{value}</span>
  </div>
);

export default Meetings;
