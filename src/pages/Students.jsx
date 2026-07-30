import { useState, useEffect, useCallback } from 'react';
import { 
  Search, ChevronDown, Eye, ChevronLeft, ChevronRight, Plus, X, 
  Edit2, Trash2, Download, RefreshCw, AlertTriangle, CheckCircle 
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';

const STATUS_OPTIONS = ['Active', 'Inactive', 'Graduated', 'Dropped'];
const COURSE_OPTIONS = ['Diploma', 'B.Tech', 'M.Tech'];
const BRANCH_OPTIONS = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering'];

const Students = () => {
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [filters, setFilters] = useState({
    department: 'All Departments',
    semester: 'All Semesters',
    status: 'All Status',
    search: '',
    page: 1,
    limit: 10
  });

  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  const initialFormState = {
    studentName: '',
    studentId: '',
    dob: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    course: '',
    branch: '',
    year: '',
    status: 'Active',
    enrollmentDate: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [editFormData, setEditFormData] = useState(initialFormState);

  const fetchStaticData = useCallback(async () => {
    try {
      const [deptRes, semRes, courseRes] = await Promise.all([
        axiosInstance.get('/academics/departments'),
        axiosInstance.get('/academics/semesters'),
        axiosInstance.get('/academics/courses')
      ]);
      setDepartments(deptRes.data.data || deptRes.data || []);
      setSemesters(semRes.data.data || semRes.data || []);
      setCourses(courseRes.data.data || courseRes.data || []);
    } catch {
      toast.error('Failed to load filter options');
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.department && filters.department !== 'All Departments') params.branch = filters.department;
      if (filters.semester && filters.semester !== 'All Semesters') params.year = filters.semester;
      if (filters.status && filters.status !== 'All Status') params.status = filters.status;
      if (filters.search) params.search = filters.search;
      params.page = filters.page;
      params.limit = filters.limit;

      const res = await axiosInstance.get('/students', { params });
      const data = res.data.data || res.data;
      setStudents(data);
      setPagination({
        page: res.data.page || 1,
        limit: res.data.limit || 10,
        total: res.data.total || data.length,
        pages: res.data.pages || 1
      });
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchStaticData(), fetchStudents()]);
    };
    init();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      handleFilterChange('search', e.target.value);
    }
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (e) => {
    setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }));
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axiosInstance.post('/students', formData);
      toast.success('Student added successfully!');
      setIsAddPanelOpen(false);
      setFormData(initialFormState);
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save student');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axiosInstance.put(`/students/${selectedStudent._id}`, editFormData);
      toast.success('Student updated successfully!');
      setIsEditPanelOpen(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update student');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await axiosInstance.delete(`/students/${deleteTarget._id}`);
      toast.success('Student deleted successfully!');
      setIsDeleteConfirmOpen(false);
      setDeleteTarget(null);
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete student');
    } finally {
      setDeleting(false);
    }
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setEditFormData({
      studentName: student.studentName || '',
      studentId: student.studentId || '',
      dob: student.dob ? student.dob.split('T')[0] : '',
      gender: student.gender || '',
      email: student.email || '',
      phone: student.phone || '',
      address: student.address || '',
      course: student.course || '',
      branch: student.branch || '',
      year: student.year || '',
      status: student.status || 'Active',
      enrollmentDate: student.enrollmentDate ? student.enrollmentDate.split('T')[0] : ''
    });
    setIsEditPanelOpen(true);
  };

  const handleExportCSV = () => {
    if (students.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Enrollment No.', 'Name', 'Department', 'Course', 'Year', 'Mobile', 'Email', 'Status'];
    const rows = students.map(s => [
      s.studentId || '',
      s.studentName || '',
      s.branch || '',
      s.course || '',
      s.year || '',
      s.phone || '',
      s.email || '',
      s.status || ''
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully!');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'text-green-700 bg-green-50';
      case 'Inactive': return 'text-red-700 bg-red-50';
      case 'Graduated': return 'text-blue-700 bg-blue-50';
      case 'Dropped': return 'text-gray-700 bg-gray-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">

      {/* Filters Top Row */}
      <div className="p-5 flex flex-col md:flex-row gap-4 justify-between items-center border-b border-gray-50">
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
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

          <div className="relative flex-1 md:flex-none">
            <select
              value={filters.semester}
              onChange={(e) => handleFilterChange('semester', e.target.value)}
              className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
            >
              <option>All Semesters</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative flex-1 md:flex-none">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
            >
              <option>All Status</option>
              {STATUS_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        <button
          onClick={() => { setIsAddPanelOpen(true); resetForm(); }}
          className="w-full md:w-auto bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Student
        </button>
      </div>

      {/* Filters Bottom Row */}
      <div className="px-5 py-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white border-b border-gray-50">
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by name or enrollment no."
            defaultValue={filters.search}
            onKeyDown={handleSearch}
            className="w-full bg-white border border-gray-200 text-gray-700 py-2 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] placeholder:text-gray-400 shadow-sm"
          />
        </div>

        <div className="relative w-full sm:w-auto">
          <select
            onChange={handleLimitChange}
            defaultValue={filters.limit}
            className="appearance-none w-full sm:w-auto bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm"
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        <div className="relative w-full sm:w-auto">
          <select
            onChange={(e) => {
              if (e.target.value === 'csv') handleExportCSV();
              else toast.error('Export feature coming soon');
            }}
            className="appearance-none w-full sm:w-auto bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm"
          >
            <option>Export</option>
            <option value="csv">Export to CSV</option>
            <option value="excel">Export to Excel</option>
            <option value="pdf">Export to PDF</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={9} />
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Search size={40} className="mb-3 opacity-30" />
            <p className="text-[13px] font-medium">No students found.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[5%]">#</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[15%]">Enrollment No.</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[18%]">Name</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[18%]">Department</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[10%]">Course</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[8%]">Year</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[12%]">Mobile</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[8%]">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[6%] text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((row, index) => (
                <tr key={row._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] text-gray-600">{index + 1}</td>
                  <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54] cursor-pointer hover:underline">{row.studentId}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-medium">{row.studentName}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{row.branch}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{row.course}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{row.year}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600">{row.phone}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${getStatusColor(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleViewStudent(row)}
                        className="text-gray-400 hover:text-[#0A6C54] transition-colors p-1"
                        title="View"
                      >
                        <Eye size={18} strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => handleEditStudent(row)}
                        className="text-gray-400 hover:text-[#0A6C54] transition-colors p-1"
                        title="Edit"
                      >
                        <Edit2 size={18} strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => { setDeleteTarget(row); setIsDeleteConfirmOpen(true); }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Delete"
                      >
                        <Trash2 size={18} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-5 border-t border-gray-100 gap-4">
        <div className="text-[13px] text-gray-500 font-medium">
          Showing {students.length} of {pagination.total} entries
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-semibold transition-colors ${
                  pageNum === pagination.page
                    ? 'bg-[#0A6C54] text-white'
                    : 'border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          {pagination.pages > 5 && (
            <span className="text-gray-400 text-[13px] px-1">...</span>
          )}
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 disabled:opacity-40 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Add Student Slide-over Panel */}
      {isAddPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => { setIsAddPanelOpen(false); resetForm(); }}></div>
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out font-['Inter']">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-[#F9FAFB]">
              <div>
                <h2 className="text-[18px] font-bold text-gray-800 font-['Outfit']">Add New Student</h2>
                <p className="text-[13px] text-gray-500 mt-1">Fill in the student details to create a new profile.</p>
              </div>
              <button onClick={() => { setIsAddPanelOpen(false); resetForm(); }} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <form id="add-student-form" onSubmit={handleSaveStudent} className="space-y-8">
                <div>
                  <h3 className="text-[14px] font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0A6C54]"></span>Basic Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Student Full Name <span className="text-red-500">*</span></label>
                      <input type="text" name="studentName" value={formData.studentName} onChange={handleInputChange} required placeholder="e.g. Rahul Sharma" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] placeholder:text-gray-400" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Enrollment No. <span className="text-red-500">*</span></label>
                      <input type="text" name="studentId" value={formData.studentId} onChange={handleInputChange} required placeholder="e.g. OP/23/CE/001" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] placeholder:text-gray-400" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Date of Birth</label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Gender</label>
                      <div className="relative">
                        <select name="gender" value={formData.gender} onChange={handleInputChange} className="appearance-none w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700 bg-white">
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0A6C54]"></span>Contact Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Email Address</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="student@example.com" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] placeholder:text-gray-400" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Phone Number</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 90000 00000" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] placeholder:text-gray-400" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Full Address</label>
                      <textarea rows="3" name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter complete address..." className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] placeholder:text-gray-400 resize-none"></textarea>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0A6C54]"></span>Academic Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Course <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <select name="course" value={formData.course} onChange={handleInputChange} required className="appearance-none w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700 bg-white">
                          <option value="">Select Course</option>
                          {COURSE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Branch / Department</label>
                      <div className="relative">
                        <select name="branch" value={formData.branch} onChange={handleInputChange} className="appearance-none w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700 bg-white">
                          <option value="">Select Branch</option>
                          {BRANCH_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Academic Year / Semester</label>
                      <div className="relative">
                        <select name="year" value={formData.year} onChange={handleInputChange} className="appearance-none w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700 bg-white">
                          <option value="">Select Year/Sem</option>
                          <option value="1st Year">1st Year / 1st Sem</option>
                          <option value="2nd Year">2nd Year / 3rd Sem</option>
                          <option value="3rd Year">3rd Year / 5th Sem</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Status</label>
                      <div className="relative">
                        <select name="status" value={formData.status} onChange={handleInputChange} className="appearance-none w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700 bg-white">
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Enrollment Date <span className="text-red-500">*</span></label>
                      <input type="date" name="enrollmentDate" value={formData.enrollmentDate} onChange={handleInputChange} required className="w-full md:w-1/2 border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700" />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button type="button" onClick={() => { setIsAddPanelOpen(false); resetForm(); }} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-[13px] font-semibold hover:bg-gray-100 transition-colors">Cancel</button>
              <button type="submit" form="add-student-form" disabled={saving} className="px-6 py-2.5 rounded-lg bg-[#0A6C54] hover:bg-[#085a46] disabled:bg-[#0A6C54]/70 text-white text-[13px] font-semibold transition-colors shadow-sm flex items-center">
                {saving ? 'Saving...' : 'Save Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Slide-over Panel */}
      {isEditPanelOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => { setIsEditPanelOpen(false); setSelectedStudent(null); }}></div>
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out font-['Inter']">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-[#F9FAFB]">
              <div>
                <h2 className="text-[18px] font-bold text-gray-800 font-['Outfit']">Edit Student</h2>
                <p className="text-[13px] text-gray-500 mt-1">Update the student details.</p>
              </div>
              <button onClick={() => { setIsEditPanelOpen(false); setSelectedStudent(null); }} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <form id="edit-student-form" onSubmit={handleUpdateStudent} className="space-y-8">
                <div>
                  <h3 className="text-[14px] font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0A6C54]"></span>Basic Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Student Full Name <span className="text-red-500">*</span></label>
                      <input type="text" name="studentName" value={editFormData.studentName} onChange={handleEditInputChange} required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] placeholder:text-gray-400" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Enrollment No. <span className="text-red-500">*</span></label>
                      <input type="text" name="studentId" value={editFormData.studentId} onChange={handleEditInputChange} required className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] placeholder:text-gray-400" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Date of Birth</label>
                      <input type="date" name="dob" value={editFormData.dob} onChange={handleEditInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Gender</label>
                      <div className="relative">
                        <select name="gender" value={editFormData.gender} onChange={handleEditInputChange} className="appearance-none w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700 bg-white">
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0A6C54]"></span>Contact Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Email Address</label>
                      <input type="email" name="email" value={editFormData.email} onChange={handleEditInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] placeholder:text-gray-400" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Phone Number</label>
                      <input type="tel" name="phone" value={editFormData.phone} onChange={handleEditInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] placeholder:text-gray-400" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Full Address</label>
                      <textarea rows="3" name="address" value={editFormData.address} onChange={handleEditInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] placeholder:text-gray-400 resize-none"></textarea>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0A6C54]"></span>Academic Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Course</label>
                      <div className="relative">
                        <select name="course" value={editFormData.course} onChange={handleEditInputChange} className="appearance-none w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700 bg-white">
                          <option value="">Select Course</option>
                          {COURSE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Branch / Department</label>
                      <div className="relative">
                        <select name="branch" value={editFormData.branch} onChange={handleEditInputChange} className="appearance-none w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700 bg-white">
                          <option value="">Select Branch</option>
                          {BRANCH_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Academic Year / Semester</label>
                      <div className="relative">
                        <select name="year" value={editFormData.year} onChange={handleEditInputChange} className="appearance-none w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700 bg-white">
                          <option value="">Select Year/Sem</option>
                          <option value="1st Year">1st Year / 1st Sem</option>
                          <option value="2nd Year">2nd Year / 3rd Sem</option>
                          <option value="3rd Year">3rd Year / 5th Sem</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Status</label>
                      <div className="relative">
                        <select name="status" value={editFormData.status} onChange={handleEditInputChange} className="appearance-none w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700 bg-white">
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Enrollment Date</label>
                      <input type="date" name="enrollmentDate" value={editFormData.enrollmentDate} onChange={handleEditInputChange} className="w-full md:w-1/2 border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700" />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button type="button" onClick={() => { setIsEditPanelOpen(false); setSelectedStudent(null); }} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-[13px] font-semibold hover:bg-gray-100 transition-colors">Cancel</button>
              <button type="submit" form="edit-student-form" disabled={saving} className="px-6 py-2.5 rounded-lg bg-[#0A6C54] hover:bg-[#085a46] disabled:bg-[#0A6C54]/70 text-white text-[13px] font-semibold transition-colors shadow-sm flex items-center">
                {saving ? 'Updating...' : 'Update Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {isViewModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setIsViewModalOpen(false); setSelectedStudent(null); }}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-gray-800 font-['Outfit']">Student Details</h2>
              <button onClick={() => { setIsViewModalOpen(false); setSelectedStudent(null); }} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Enrollment No.</p>
                  <p className="text-[13px] font-semibold text-[#0A6C54]">{selectedStudent.studentId}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Name</p>
                  <p className="text-[13px] font-medium text-gray-800">{selectedStudent.studentName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Course</p>
                  <p className="text-[13px] text-gray-600">{selectedStudent.course}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Branch</p>
                  <p className="text-[13px] text-gray-600">{selectedStudent.branch}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Year</p>
                  <p className="text-[13px] text-gray-600">{selectedStudent.year}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Status</p>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${getStatusColor(selectedStudent.status)}`}>{selectedStudent.status}</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Email</p>
                  <p className="text-[13px] text-gray-600">{selectedStudent.email}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Phone</p>
                  <p className="text-[13px] text-gray-600">{selectedStudent.phone}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Gender</p>
                  <p className="text-[13px] text-gray-600">{selectedStudent.gender}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Date of Birth</p>
                  <p className="text-[13px] text-gray-600">{selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString() : '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Address</p>
                  <p className="text-[13px] text-gray-600">{selectedStudent.address || '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Enrollment Date</p>
                  <p className="text-[13px] text-gray-600">{selectedStudent.enrollmentDate ? new Date(selectedStudent.enrollmentDate).toLocaleDateString() : '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setIsDeleteConfirmOpen(false); setDeleteTarget(null); }}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-gray-800">Delete Student</h3>
                <p className="text-[13px] text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-[13px] text-gray-600 mb-6">Are you sure you want to delete <strong>{deleteTarget.studentName}</strong> (Enrollment: {deleteTarget.studentId})?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setIsDeleteConfirmOpen(false); setDeleteTarget(null); }} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-[13px] font-semibold hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={handleDeleteStudent} disabled={deleting} className="px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white text-[13px] font-semibold transition-colors">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Students;