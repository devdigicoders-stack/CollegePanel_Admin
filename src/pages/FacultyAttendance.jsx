import { useState, useEffect, useCallback } from 'react';
import { 
  Search, ChevronDown, Check, X as XIcon, Save, Calendar as CalendarIcon,
  UserCheck, Clock, AlertCircle} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';
import { checkPermission } from '../utils/checkPermission';
import AccessDenied from '../components/AccessDenied';

const FacultyAttendance = () => {
  if (!checkPermission('View Attendance') && !checkPermission('Mark Attendance')) {
    return <AccessDenied />;
  }
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attendance, setAttendance] = useState({}); // { facultyId: 'Present' | 'Absent' | 'On Leave' }
  const [remarks, setRemarks] = useState({});       // { facultyId: 'Some remarks' }
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Dropdown options
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    department: 'All Departments',
    designation: 'All Designations',
    search: ''
  });

  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });

  // 1. Fetch dropdown options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [deptRes, desigRes] = await Promise.all([
          axiosInstance.get('/academics/departments'),
          axiosInstance.get('/designations/list/all')
        ]);
        setDepartments(Array.isArray(deptRes.data) ? deptRes.data : (deptRes.data?.data || []));
        setDesignations(desigRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load filter options', err);
      }
    };
    fetchOptions();
  }, []);

  // 2. Fetch faculty and marked attendance whenever date or filters change
  const fetchFacultyAndAttendance = useCallback(async () => {
    setLoading(true);
    try {
      // Step A: Fetch all teachers (limit=1000 to avoid pagination truncating the list)
      const params = {
        limit: 1000,
        department: filters.department === 'All Departments' ? '' : filters.department,
        designation: filters.designation === 'All Designations' ? '' : filters.designation,
        search: filters.search
      };
      
      const [facRes, attRes] = await Promise.all([
        axiosInstance.get('/teachers', { params }),
        axiosInstance.get(`/attendance/faculty?date=${selectedDate}`)
      ]);

      const facList = facRes.data?.data || facRes.data || [];
      setFaculty(facList);

      // Step B: Set attendance states
      const savedAttendance = attRes.data?.data?.records || [];
      const newAttendanceMap = {};
      const newRemarksMap = {};

      if (savedAttendance.length > 0) {
        // Pre-populate with saved attendance
        savedAttendance.forEach(rec => {
          newAttendanceMap[rec.facultyId] = rec.status;
          newRemarksMap[rec.facultyId] = rec.remarks || '';
        });
      } else {
        // Pre-populate with default 'Present'
        facList.forEach(f => {
          newAttendanceMap[f._id] = 'Present';
          newRemarksMap[f._id] = '';
        });
      }

      setAttendance(newAttendanceMap);
      setRemarks(newRemarksMap);
      
      setPagination(prev => ({
        ...prev,
        total: facList.length,
        pages: Math.ceil(facList.length / prev.limit)
      }));

    } catch (err) {
      toast.error('Failed to load faculty details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, selectedDate]);

  useEffect(() => {
    fetchFacultyAndAttendance();
  }, [fetchFacultyAndAttendance]);

  const handleAttendanceChange = (facultyId, status) => {
    setAttendance(prev => ({ ...prev, [facultyId]: status }));
  };

  const handleRemarksChange = (facultyId, val) => {
    setRemarks(prev => ({ ...prev, [facultyId]: val }));
  };

  const handleMarkAllPresent = () => {
    const allPresent = {};
    faculty.forEach(f => { allPresent[f._id] = 'Present'; });
    setAttendance(allPresent);
    toast.success('Marked all as Present');
  };

  const handleMarkAllAbsent = () => {
    const allAbsent = {};
    faculty.forEach(f => { allAbsent[f._id] = 'Absent'; });
    setAttendance(allAbsent);
    toast.success('Marked all as Absent');
  };

  const handleSaveAttendance = () => {
    if (faculty.length === 0) {
      toast.error('No faculty members to mark attendance');
      return;
    }
    setShowSaveModal(true);
  };

  const handleSaveConfirm = async () => {
    setSaving(true);
    try {
      const records = faculty.map(f => ({
        facultyId: f._id,
        name: f.name,
        status: attendance[f._id] || 'Present',
        remarks: remarks[f._id] || ''
      }));

      await axiosInstance.post('/attendance/faculty', {
        date: selectedDate,
        records
      });

      toast.success('Faculty attendance saved successfully!');
      setShowSaveModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    total: faculty.length,
    present: faculty.filter(f => (attendance[f._id] || 'Present') === 'Present').length,
    absent: faculty.filter(f => (attendance[f._id] || 'Present') === 'Absent').length,
    onLeave: faculty.filter(f => (attendance[f._id] || 'Present') === 'On Leave').length,
  };

  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
  const userRole = adminInfo.role || 'college_admin';
  const canEdit = userRole === 'college_admin' || userRole === 'HR' || userRole === 'Principal';

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 pt-5 pb-2 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Faculty Attendance</h2>
          <p className="text-[13px] text-gray-500 mt-1">Mark and manage daily faculty attendance</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {canEdit && (
            <button 
              onClick={handleSaveAttendance}
              disabled={loading || faculty.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#0A6C54] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#085a46] disabled:opacity-50 transition-colors shadow-sm"
            >
              <Save size={16} />
              Save Attendance
            </button>
          )}
        </div>
      </div>

      {/* Date & Stats */}
      <div className="px-6 pt-3 pb-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Date Picker */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm">
              <CalendarIcon size={16} className="text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-[13px] font-semibold text-gray-700 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-3 flex-wrap flex-1 min-w-[280px]">
            {[
              { label: 'Total Faculty', value: stats.total, color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <UserCheck size={16} /> },
              { label: 'Present', value: stats.present, color: 'bg-green-50 text-green-700 border-green-200', icon: <Check size={16} /> },
              { label: 'Absent', value: stats.absent, color: 'bg-red-50 text-red-700 border-red-200', icon: <XIcon size={16} /> },
              { label: 'On Leave', value: stats.onLeave, color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock size={16} /> },
            ].map(c => (
              <div key={c.label} className={`flex-1 min-w-[120px] ${c.color} border rounded-xl px-4 py-2.5 flex items-center gap-3`}>
                <div className="opacity-80">{c.icon}</div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider opacity-75">{c.label}</p>
                  <p className="text-[18px] font-black">{c.value}</p>
                </div>
              </div>
            ))}
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
              className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer shadow-sm"
            >
              <option>All Departments</option>
              {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative">
            <select 
              value={filters.designation}
              onChange={(e) => setFilters({...filters, designation: e.target.value})}
              className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none cursor-pointer shadow-sm"
            >
              <option>All Designations</option>
              {designations.map(d => <option key={d}>{d}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Search by name or ID..." 
              className="w-[220px] bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none shadow-sm"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleMarkAllPresent}
            className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-3.5 py-2 rounded-lg text-[12px] font-bold hover:bg-green-100 transition-colors"
          >
            <Check size={14} />
            All Present
          </button>
          <button 
            onClick={handleMarkAllAbsent}
            className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-3.5 py-2 rounded-lg text-[12px] font-bold hover:bg-red-100 transition-colors"
          >
            <XIcon size={14} />
            All Absent
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto p-4">
        {loading ? (
          <SkeletonLoader type="table" rows={6} cols={6} />
        ) : faculty.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Search size={40} className="mb-3 opacity-30" />
            <p className="text-[13px] font-medium">No faculty members found</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#F9FAFB] border-y border-gray-100">
                <th className="py-3 px-4 text-[12px] font-bold text-gray-600 w-[12%]">Employee ID</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-600 w-[22%]">Faculty Name</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-600 w-[18%]">Department</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-600 w-[18%]">Designation</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-600 w-[15%]">Contact</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-600 w-[15%] text-center">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {faculty.map((member) => (
                <tr key={member._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{member.empId || member.employeeId}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0A6C54]/10 text-[#0A6C54] flex items-center justify-center font-bold text-[13px]">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[13px] text-gray-800 font-semibold">{member.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-gray-600 font-medium">{member.department}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600 font-medium">{member.designation}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600 font-medium">{member.mobile || member.contactNo || '—'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {['Present', 'Absent', 'On Leave'].map(status => {
                        const isSelected = attendance[member._id] === status;
                        const btnColors = {
                          Present: isSelected ? 'bg-green-500 text-white border-green-600' : 'hover:text-green-600 hover:border-green-400 text-gray-500 bg-white border-gray-200',
                          Absent: isSelected ? 'bg-red-500 text-white border-red-600' : 'hover:text-red-600 hover:border-red-400 text-gray-500 bg-white border-gray-200',
                          'On Leave': isSelected ? 'bg-amber-500 text-white border-amber-600' : 'hover:text-amber-600 hover:border-amber-400 text-gray-500 bg-white border-gray-200'
                        };
                        return (
                          <button
                            key={status}
                            onClick={() => handleAttendanceChange(member._id, status)}
                            className={`px-3 py-1 rounded-lg text-[12px] font-bold border transition-all ${btnColors[status]}`}
                          >
                            {status === 'On Leave' ? 'Leave' : status}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* SAVE CONFIRMATION MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <AlertCircle size={20} className="text-blue-600" />
              </div>
              <h3 className="text-[16px] font-bold text-gray-800">Save Attendance</h3>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
              <p className="text-[12px] text-gray-500 mb-2">Attendance Summary for <strong>{new Date(selectedDate).toLocaleDateString('en-IN')}</strong>:</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold">Present</p>
                  <p className="text-[18px] font-black text-green-600">{stats.present}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold">Absent</p>
                  <p className="text-[18px] font-black text-red-600">{stats.absent}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold">On Leave</p>
                  <p className="text-[18px] font-black text-amber-600">{stats.onLeave}</p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-6 text-[13px] leading-relaxed">
              Are you sure you want to save attendance for <strong>{stats.total}</strong> faculty members?
            </p>

            <div className="flex gap-3">
              <button 
                onClick={handleSaveConfirm}
                disabled={saving}
                className="flex-1 bg-[#0A6C54] hover:bg-[#085a46] text-white py-2.5 rounded-lg transition-colors font-semibold text-sm shadow-sm"
              >
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
              <button 
                onClick={() => setShowSaveModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
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
