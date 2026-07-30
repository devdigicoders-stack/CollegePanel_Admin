import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronDown, Check, X as XIcon, Save, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, UserCheck, Clock, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const FacultyAttendance = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState({});
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Filters
  const [filters, setFilters] = useState({
    department: 'All Departments',
    designation: 'All Designations',
    search: ''
  });

  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });

  // Static faculty data
  const staticFaculty = [
    {
      _id: '1',
      employeeId: 'EMP20240001',
      name: 'Dr. Rajesh Kumar',
      department: 'Computer Science',
      designation: 'Professor',
      contactNo: '+91 9876543210',
      photo: null
    },
    {
      _id: '2',
      employeeId: 'EMP20240015',
      name: 'Prof. Meena Sharma',
      department: 'Electronics',
      designation: 'Associate Professor',
      contactNo: '+91 9876543211',
      photo: null
    },
    {
      _id: '3',
      employeeId: 'EMP20240032',
      name: 'Mr. Anil Verma',
      department: 'Mechanical',
      designation: 'Assistant Professor',
      contactNo: '+91 9876543212',
      photo: null
    },
    {
      _id: '4',
      employeeId: 'EMP20240045',
      name: 'Dr. Priya Patel',
      department: 'Computer Science',
      designation: 'Associate Professor',
      contactNo: '+91 9876543213',
      photo: null
    },
    {
      _id: '5',
      employeeId: 'EMP20240056',
      name: 'Mr. Rohan Joshi',
      department: 'Electronics',
      designation: 'Lecturer',
      contactNo: '+91 9876543214',
      photo: null
    },
    {
      _id: '6',
      employeeId: 'EMP20240067',
      name: 'Ms. Sneha Singh',
      department: 'Computer Science',
      designation: 'Lecturer',
      contactNo: '+91 9876543215',
      photo: null
    }
  ];

  useEffect(() => {
    fetchFaculty();
  }, [filters, selectedDate]);

  const fetchFaculty = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    let filtered = staticFaculty;
    if (filters.department !== 'All Departments') {
      filtered = filtered.filter(f => f.department === filters.department);
    }
    if (filters.department !== 'All Designations') {
      filtered = filtered.filter(f => f.designation === filters.designation);
    }
    if (filters.search) {
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        f.employeeId.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    setFaculty(filtered);
    setPagination(prev => ({ ...prev, total: filtered.length, pages: Math.ceil(filtered.length / prev.limit) }));
    setLoading(false);
  };

  const handleAttendanceChange = (facultyId, status) => {
    setAttendance({ ...attendance, [facultyId]: status });
  };

  const handleMarkAllPresent = () => {
    const allPresent = {};
    faculty.forEach(f => {
      allPresent[f._id] = 'Present';
    });
    setAttendance(allPresent);
    toast.success('Marked all faculty as present');
  };

  const handleMarkAllAbsent = () => {
    const allAbsent = {};
    faculty.forEach(f => {
      allAbsent[f._id] = 'Absent';
    });
    setAttendance(allAbsent);
    toast.success('Marked all faculty as absent');
  };

  const handleSaveAttendance = () => {
    const markedCount = Object.keys(attendance).length;
    if (markedCount === 0) {
      toast.error('Please mark attendance for at least one faculty member');
      return;
    }
    setShowSaveModal(true);
  };

  const handleSaveConfirm = async () => {
    try {
      // TODO: API call to save attendance
      toast.success(`Attendance saved successfully for ${Object.keys(attendance).length} faculty members`);
      setShowSaveModal(false);
      setAttendance({});
    } catch (error) {
      toast.error('Failed to save attendance');
    }
  };

  const getAttendanceStats = () => {
    const total = faculty.length;
    const marked = Object.keys(attendance).length;
    const present = Object.values(attendance).filter(s => s === 'Present').length;
    const absent = Object.values(attendance).filter(s => s === 'Absent').length;
    const onLeave = Object.values(attendance).filter(s => s === 'On Leave').length;
    return { total, marked, present, absent, onLeave };
  };

  const stats = getAttendanceStats();

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 pt-4 pb-2 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Faculty Attendance</h2>
          <p className="text-[13px] text-gray-500 mt-1">Mark and manage daily faculty attendance</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSaveAttendance}
            className="flex items-center gap-2 bg-[#0A6C54] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#085a46] transition-colors"
          >
            <Save size={16} />
            Save Attendance
          </button>
        </div>
      </div>

      {/* Date & Stats */}
      <div className="px-6 pt-3 pb-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Date Picker */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-2.5">
              <CalendarIcon size={16} className="text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-[13px] font-medium text-gray-700 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-3 flex-1">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-2">
              <UserCheck size={18} className="text-blue-600" />
              <div>
                <p className="text-[11px] text-blue-600 font-medium">Total Faculty</p>
                <p className="text-[16px] font-bold text-blue-800">{stats.total}</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center gap-2">
              <Check size={18} className="text-green-600" />
              <div>
                <p className="text-[11px] text-green-600 font-medium">Present</p>
                <p className="text-[16px] font-bold text-green-800">{stats.present}</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 flex items-center gap-2">
              <XIcon size={18} className="text-red-600" />
              <div>
                <p className="text-[11px] text-red-600 font-medium">Absent</p>
                <p className="text-[16px] font-bold text-red-800">{stats.absent}</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 flex items-center gap-2">
              <Clock size={18} className="text-amber-600" />
              <div>
                <p className="text-[11px] text-amber-600 font-medium">On Leave</p>
                <p className="text-[16px] font-bold text-amber-800">{stats.onLeave}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="px-6 pb-4 flex flex-wrap gap-3 items-center justify-between border-b border-gray-100">
        <div className="flex gap-3 flex-wrap">
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
            <select 
              value={filters.designation}
              onChange={(e) => setFilters({...filters, designation: e.target.value})}
              className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer"
            >
              <option>All Designations</option>
              <option>Professor</option>
              <option>Associate Professor</option>
              <option>Assistant Professor</option>
              <option>Lecturer</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Search by name or ID" 
              className="w-[240px] bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleMarkAllPresent}
            className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded-lg text-[13px] font-semibold hover:bg-green-100 transition-colors"
          >
            <Check size={14} />
            Mark All Present
          </button>
          <button 
            onClick={handleMarkAllAbsent}
            className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded-lg text-[13px] font-semibold hover:bg-red-100 transition-colors"
          >
            <XIcon size={14} />
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-[#F9FAFB] border-y border-gray-100">
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[12%]">Employee ID</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[20%]">Faculty Name</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[18%]">Department</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[18%]">Designation</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%]">Contact</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[17%] text-center">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="py-8 text-center text-gray-500">Loading...</td></tr>
            ) : faculty.length === 0 ? (
              <tr><td colSpan="6" className="py-8 text-center text-gray-500">No faculty found</td></tr>
            ) : (
              faculty.map((member) => (
                <tr key={member._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{member.employeeId}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0A6C54] text-white flex items-center justify-center font-bold text-[13px]">
                        {member.name.charAt(0)}
                      </div>
                      <span className="text-[13px] text-gray-800 font-medium">{member.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{member.department}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{member.designation}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{member.contactNo}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleAttendanceChange(member._id, 'Present')}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all border ${
                          attendance[member._id] === 'Present' 
                            ? 'bg-green-500 text-white border-green-600' 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-green-500 hover:text-green-600'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => handleAttendanceChange(member._id, 'Absent')}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all border ${
                          attendance[member._id] === 'Absent' 
                            ? 'bg-red-500 text-white border-red-600' 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-red-500 hover:text-red-600'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        onClick={() => handleAttendanceChange(member._id, 'On Leave')}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all border ${
                          attendance[member._id] === 'On Leave' 
                            ? 'bg-amber-500 text-white border-amber-600' 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-amber-500 hover:text-amber-600'
                        }`}
                      >
                        Leave
                      </button>
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
          Showing {faculty.length} of {pagination.total} entries | Marked: {stats.marked}/{stats.total}
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

      {/* SAVE CONFIRMATION MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <AlertCircle size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Save Attendance</h3>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-[13px] text-gray-600 mb-2">Attendance Summary for <strong>{selectedDate}</strong>:</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-[11px] text-gray-500">Present</p>
                  <p className="text-[18px] font-bold text-green-600">{stats.present}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500">Absent</p>
                  <p className="text-[18px] font-bold text-red-600">{stats.absent}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500">On Leave</p>
                  <p className="text-[18px] font-bold text-amber-600">{stats.onLeave}</p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-6 text-[13px]">
              Are you sure you want to save attendance for <strong>{stats.marked}</strong> faculty members? This will be recorded permanently.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={handleSaveConfirm}
                className="flex-1 bg-[#0A6C54] text-white py-2 rounded-lg hover:bg-[#085a46] transition-colors font-medium text-sm"
              >
                Save Attendance
              </button>
              <button 
                onClick={() => setShowSaveModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
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

export default FacultyAttendance;
