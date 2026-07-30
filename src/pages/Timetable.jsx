import React, { useState } from 'react';
import { 
  Plus, ChevronDown, Edit2, Trash2, X as XIcon, Clock, User, BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

const Timetable = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    department: 'Computer Science',
    semester: '3rd',
    section: 'A'
  });

  // Form state for add/edit
  const [formData, setFormData] = useState({
    day: '',
    timeSlot: '',
    subject: '',
    teacher: '',
    roomNo: '',
    type: 'Theory'
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:15 AM - 12:15 PM',
    '12:15 PM - 01:15 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM'
  ];

  // Static timetable data
  const [timetable, setTimetable] = useState({
    'Monday-09:00 AM - 10:00 AM': { subject: 'Data Structures', teacher: 'Dr. Rajesh Kumar', roomNo: 'Lab-101', type: 'Lab' },
    'Monday-10:00 AM - 11:00 AM': { subject: 'Data Structures', teacher: 'Dr. Rajesh Kumar', roomNo: 'Lab-101', type: 'Lab' },
    'Monday-11:15 AM - 12:15 PM': { subject: 'Algorithms', teacher: 'Prof. Meena Sharma', roomNo: 'Room-203', type: 'Theory' },
    'Monday-12:15 PM - 01:15 PM': { subject: 'Database Management', teacher: 'Mr. Anil Verma', roomNo: 'Room-204', type: 'Theory' },
    
    'Tuesday-09:00 AM - 10:00 AM': { subject: 'Operating Systems', teacher: 'Dr. Priya Patel', roomNo: 'Room-201', type: 'Theory' },
    'Tuesday-10:00 AM - 11:00 AM': { subject: 'Computer Networks', teacher: 'Mr. Rohan Joshi', roomNo: 'Room-202', type: 'Theory' },
    'Tuesday-11:15 AM - 12:15 PM': { subject: 'Web Technologies', teacher: 'Ms. Sneha Singh', roomNo: 'Lab-102', type: 'Lab' },
    'Tuesday-12:15 PM - 01:15 PM': { subject: 'Web Technologies', teacher: 'Ms. Sneha Singh', roomNo: 'Lab-102', type: 'Lab' },
    
    'Wednesday-09:00 AM - 10:00 AM': { subject: 'Software Engineering', teacher: 'Dr. Rajesh Kumar', roomNo: 'Room-205', type: 'Theory' },
    'Wednesday-10:00 AM - 11:00 AM': { subject: 'Data Structures', teacher: 'Dr. Rajesh Kumar', roomNo: 'Room-203', type: 'Theory' },
    'Wednesday-12:15 PM - 01:15 PM': { subject: 'Mathematics', teacher: 'Prof. Meena Sharma', roomNo: 'Room-201', type: 'Theory' },

    'Thursday-09:00 AM - 10:00 AM': { subject: 'Database Management', teacher: 'Mr. Anil Verma', roomNo: 'Lab-103', type: 'Lab' },
    'Thursday-10:00 AM - 11:00 AM': { subject: 'Database Management', teacher: 'Mr. Anil Verma', roomNo: 'Lab-103', type: 'Lab' },
    'Thursday-11:15 AM - 12:15 PM': { subject: 'Algorithms', teacher: 'Prof. Meena Sharma', roomNo: 'Room-202', type: 'Theory' },
    
    'Friday-09:00 AM - 10:00 AM': { subject: 'Computer Networks', teacher: 'Mr. Rohan Joshi', roomNo: 'Room-204', type: 'Theory' },
    'Friday-10:00 AM - 11:00 AM': { subject: 'Operating Systems', teacher: 'Dr. Priya Patel', roomNo: 'Room-205', type: 'Theory' },
    'Friday-11:15 AM - 12:15 PM': { subject: 'Software Engineering', teacher: 'Dr. Rajesh Kumar', roomNo: 'Room-201', type: 'Theory' },
  });

  const handleAddClass = () => {
    setFormData({ day: '', timeSlot: '', subject: '', teacher: '', roomNo: '', type: 'Theory' });
    setShowAddModal(true);
  };

  const handleEditClass = (day, time, data) => {
    setSelectedSlot({ day, time });
    setFormData({ day, timeSlot: time, ...data });
    setShowEditModal(true);
  };

  const handleDeleteClass = (day, time) => {
    const key = `${day}-${time}`;
    const newTimetable = { ...timetable };
    delete newTimetable[key];
    setTimetable(newTimetable);
    toast.success('Class deleted successfully');
  };

  const handleSaveAdd = () => {
    if (!formData.day || !formData.timeSlot || !formData.subject || !formData.teacher || !formData.roomNo) {
      toast.error('Please fill all required fields');
      return;
    }
    const key = `${formData.day}-${formData.timeSlot}`;
    if (timetable[key]) {
      toast.error('A class already exists in this slot');
      return;
    }
    setTimetable({
      ...timetable,
      [key]: { subject: formData.subject, teacher: formData.teacher, roomNo: formData.roomNo, type: formData.type }
    });
    toast.success('Class added successfully');
    setShowAddModal(false);
  };

  const handleSaveEdit = () => {
    if (!formData.subject || !formData.teacher || !formData.roomNo) {
      toast.error('Please fill all required fields');
      return;
    }
    const key = `${selectedSlot.day}-${selectedSlot.time}`;
    setTimetable({
      ...timetable,
      [key]: { subject: formData.subject, teacher: formData.teacher, roomNo: formData.roomNo, type: formData.type }
    });
    toast.success('Class updated successfully');
    setShowEditModal(false);
  };

  const getCellData = (day, time) => {
    const key = `${day}-${time}`;
    return timetable[key];
  };

  const getClassTypeColor = (type) => {
    return type === 'Lab' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 pt-4 pb-3 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Class Timetable</h2>
          <p className="text-[13px] text-gray-500 mt-1">Manage weekly class schedule</p>
        </div>
        <button 
          onClick={handleAddClass}
          className="flex items-center gap-2 bg-[#0A6C54] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#085a46] transition-colors"
        >
          <Plus size={16} />
          Add Class
        </button>
      </div>

      {/* Filters */}
      <div className="px-6 pb-4 flex gap-3 border-b border-gray-100">
        <div className="relative">
          <select 
            value={filters.department}
            onChange={(e) => setFilters({...filters, department: e.target.value})}
            className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer"
          >
            <option>Computer Science</option>
            <option>Electronics</option>
            <option>Mechanical</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="relative">
          <select 
            value={filters.semester}
            onChange={(e) => setFilters({...filters, semester: e.target.value})}
            className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer"
          >
            <option>1st</option>
            <option>2nd</option>
            <option>3rd</option>
            <option>4th</option>
            <option>5th</option>
            <option>6th</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="relative">
          <select 
            value={filters.section}
            onChange={(e) => setFilters({...filters, section: e.target.value})}
            className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer"
          >
            <option>A</option>
            <option>B</option>
            <option>C</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Info Banner */}
      <div className="mx-6 mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
        <Clock size={18} className="text-blue-600 flex-shrink-0" />
        <p className="text-[13px] text-blue-800 font-semibold">
          Viewing timetable for {filters.department} | Semester {filters.semester} - Section {filters.section}
        </p>
      </div>

      {/* Timetable Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="min-w-[1200px]">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-200 bg-[#F9FAFB] p-3 text-[13px] font-bold text-gray-800 w-[140px] sticky left-0 z-10">
                  Time / Day
                </th>
                {days.map(day => (
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
                  {days.map(day => {
                    const cellData = getCellData(day, time);
                    return (
                      <td key={`${day}-${time}`} className="border border-gray-200 p-2 align-top">
                        {cellData ? (
                          <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow h-full min-h-[100px] flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getClassTypeColor(cellData.type)}`}>
                                {cellData.type}
                              </span>
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => handleEditClass(day, time, cellData)}
                                  className="w-6 h-6 rounded flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteClass(day, time)}
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
                                <p className="text-[13px] font-bold text-gray-800 line-clamp-1">{cellData.subject}</p>
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <User size={13} className="text-gray-500" />
                                <p className="text-[12px] text-gray-600 line-clamp-1">{cellData.teacher}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock size={13} className="text-gray-500" />
                                <p className="text-[12px] text-gray-500 font-medium">{cellData.roomNo}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full min-h-[100px] flex items-center justify-center text-gray-300 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer" onClick={() => {
                            setFormData({ ...formData, day, timeSlot: time });
                            setShowAddModal(true);
                          }}>
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
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Add New Class</h3>
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
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
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
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="e.g., Data Structures"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Teacher *</label>
                <input 
                  type="text"
                  value={formData.teacher}
                  onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                  placeholder="e.g., Dr. Rajesh Kumar"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Room No *</label>
                  <input 
                    type="text"
                    value={formData.roomNo}
                    onChange={(e) => setFormData({...formData, roomNo: e.target.value})}
                    placeholder="e.g., Room-201"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Class Type *</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Lab">Lab</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={handleSaveAdd}
                className="flex-1 bg-[#0A6C54] text-white py-2.5 rounded-lg hover:bg-[#085a46] transition-colors font-medium text-sm"
              >
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
              <h3 className="text-lg font-bold text-gray-800">Edit Class</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <XIcon size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                <p className="text-[12px] text-gray-600">
                  <strong>{formData.day}</strong> | {formData.timeSlot}
                </p>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Subject *</label>
                <input 
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="e.g., Data Structures"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Teacher *</label>
                <input 
                  type="text"
                  value={formData.teacher}
                  onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                  placeholder="e.g., Dr. Rajesh Kumar"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Room No *</label>
                  <input 
                    type="text"
                    value={formData.roomNo}
                    onChange={(e) => setFormData({...formData, roomNo: e.target.value})}
                    placeholder="e.g., Room-201"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Class Type *</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Lab">Lab</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={handleSaveEdit}
                className="flex-1 bg-[#0A6C54] text-white py-2.5 rounded-lg hover:bg-[#085a46] transition-colors font-medium text-sm"
              >
                Update Class
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
    </div>
  );
};

export default Timetable;
