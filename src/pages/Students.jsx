import { useState, useEffect, useCallback } from 'react';
import { 
  Search, ChevronDown, Eye, ChevronLeft, ChevronRight, Plus, X, 
  Edit2, Trash2, AlertTriangle} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';
import { checkPermission } from '../utils/checkPermission';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  const [filterOptions, setFilterOptions] = useState({
    branches: [],
    years: [],
    sessions: [],
    courses: []
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTab, setViewTab] = useState('Personal');

  const [filters, setFilters] = useState({
    branch: 'All Branches',
    course: 'All Courses',
    year: 'All Years',
    session: 'All Sessions',
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
      const res = await axiosInstance.get('/students/filters');
      setFilterOptions({
        branches: res.data.branches || [],
        years: res.data.years || [],
        sessions: res.data.sessions || [],
        courses: res.data.courses || []
      });
    } catch {
      toast.error('Failed to load filter options');
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.branch && filters.branch !== 'All Branches') params.branch = filters.branch;
      if (filters.course && filters.course !== 'All Courses') params.course = filters.course;
      if (filters.year && filters.year !== 'All Years') params.year = filters.year;
      if (filters.session && filters.session !== 'All Sessions') params.session = filters.session;
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

  const handleExportExcel = () => {
    if (students.length === 0) {
      toast.error('No data to export');
      return;
    }
    const data = students.map(s => ({
      'Enrollment No.': s.studentId || '',
      'Name': s.studentName || '',
      'Department': s.branch || '',
      'Course': s.course || '',
      'Year': s.year || '',
      'Mobile': s.phone || '',
      'Email': s.email || '',
      'Status': s.status || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, `students_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel exported successfully!');
  };

  const handleExportPDF = () => {
    if (students.length === 0) {
      toast.error('No data to export');
      return;
    }
    const doc = new jsPDF();
    const tableColumn = ['Enrollment No.', 'Name', 'Department', 'Course', 'Year', 'Mobile', 'Status'];
    const tableRows = [];

    students.forEach(s => {
      const studentData = [
        s.studentId || '',
        s.studentName || '',
        s.branch || '',
        s.course || '',
        s.year || '',
        s.phone || '',
        s.status || ''
      ];
      tableRows.push(studentData);
    });

    doc.text('Students List', 14, 15);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [10, 108, 84] }
    });
    doc.save(`students_export_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF exported successfully!');
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
              value={filters.branch}
              onChange={(e) => handleFilterChange('branch', e.target.value)}
              className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
            >
              <option>All Branches</option>
              {filterOptions.branches.map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative flex-1 md:flex-none">
            <select
              value={filters.course}
              onChange={(e) => handleFilterChange('course', e.target.value)}
              className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
            >
              <option>All Courses</option>
              {filterOptions.courses.map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative flex-1 md:flex-none">
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
            >
              <option>All Years</option>
              {filterOptions.years.map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative flex-1 md:flex-none">
            <select
              value={filters.session}
              onChange={(e) => handleFilterChange('session', e.target.value)}
              className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
            >
              <option>All Sessions</option>
              {filterOptions.sessions.map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
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

        {checkPermission('Add Student') && (
          <button
            onClick={() => { setIsAddPanelOpen(true); resetForm(); }}
            className="w-full md:w-auto bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Student
          </button>
        )}
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

        {checkPermission('Export Students') && (
          <div className="relative w-full sm:w-auto">
            <select
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'csv') handleExportCSV();
                else if (val === 'excel') handleExportExcel();
                else if (val === 'pdf') handleExportPDF();
                
                e.target.value = 'Export'; // reset so it can be clicked again
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
        )}
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
                      {checkPermission('Edit Student') && (
                        <button
                          onClick={() => handleEditStudent(row)}
                          className="text-gray-400 hover:text-[#0A6C54] transition-colors p-1"
                          title="Edit"
                        >
                          <Edit2 size={18} strokeWidth={2} />
                        </button>
                      )}
                      {checkPermission('Delete Student') && (
                        <button
                          onClick={() => { setDeleteTarget(row); setIsDeleteConfirmOpen(true); }}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Delete"
                        >
                          <Trash2 size={18} strokeWidth={2} />
                        </button>
                      )}
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
                          {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Branch / Department</label>
                      <div className="relative">
                        <select name="branch" value={formData.branch} onChange={handleInputChange} className="appearance-none w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700 bg-white">
                          <option value="">Select Branch</option>
                          {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Academic Year / Semester</label>
                      <div className="relative">
                        <select name="year" value={formData.year} onChange={handleInputChange} className="appearance-none w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700 bg-white">
                          <option value="">Select Year/Sem</option>
                          {semesters.map(s => (
                            <option key={s._id} value={`Sem ${s.semesterNumber}`}>Sem {s.semesterNumber} ({s.courseName})</option>
                          ))}
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
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
                          {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Branch / Department</label>
                      <div className="relative">
                        <select name="branch" value={editFormData.branch} onChange={handleEditInputChange} className="appearance-none w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700 bg-white">
                          <option value="">Select Branch</option>
                          {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Academic Year / Semester</label>
                      <div className="relative">
                        <select name="year" value={editFormData.year} onChange={handleEditInputChange} className="appearance-none w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700 bg-white">
                          <option value="">Select Year/Sem</option>
                          {semesters.map(s => (
                            <option key={s._id} value={`Sem ${s.semesterNumber}`}>Sem {s.semesterNumber} ({s.courseName})</option>
                          ))}
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#0A6C54] to-[#085a46]">
              <h3 className="text-lg font-bold text-white">Student Details</h3>
              <button 
                onClick={() => { setIsViewModalOpen(false); setSelectedStudent(null); }}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Basic Info Card */}
              <div className="bg-gradient-to-br from-[#0A6C54]/5 to-[#0A6C54]/10 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-[#0A6C54] flex items-center justify-center text-white text-2xl font-bold border-2 border-[#0A6C54]/20 shadow-sm">
                    {selectedStudent.studentName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">{selectedStudent.studentName}</h4>
                    <p className="text-sm text-[#0A6C54] font-medium">{selectedStudent.course} - {selectedStudent.branch}</p>
                  </div>
                  <div className="ml-auto">
                    <span className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide inline-block ${getStatusColor(selectedStudent.status)}`}>
                      {selectedStudent.status}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm mt-4 pt-4 border-t border-[#0A6C54]/10">
                  <div>
                    <span className="text-gray-500 font-medium">Enrollment No:</span>
                    <span className="ml-2 font-bold text-gray-800">{selectedStudent.studentId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Year:</span>
                    <span className="ml-2 font-bold text-gray-800">{selectedStudent.year}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Enrollment Date:</span>
                    <span className="ml-2 font-bold text-gray-800">{selectedStudent.enrollmentDate ? new Date(selectedStudent.enrollmentDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Personal Information */}
                <div className="space-y-4">
                  <h5 className="text-[13px] font-bold text-[#0A6C54] uppercase tracking-wider border-b border-gray-200 pb-2">Personal Information</h5>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Email</label>
                      <p className="text-[13px] font-medium text-gray-800">{selectedStudent.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Mobile</label>
                      <p className="text-[13px] font-medium text-gray-800">{selectedStudent.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Date of Birth</label>
                      <p className="text-[13px] font-medium text-gray-800">{selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Gender</label>
                      <p className="text-[13px] font-medium text-gray-800">{selectedStudent.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Category</label>
                      <p className="text-[13px] font-medium text-gray-800">{selectedStudent.category || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Religion</label>
                      <p className="text-[13px] font-medium text-gray-800">{selectedStudent.religion || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Aadhaar No</label>
                      <p className="text-[13px] font-medium text-gray-800">{selectedStudent.aadhaar || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Nationality</label>
                      <p className="text-[13px] font-medium text-gray-800">{selectedStudent.nationality || 'Indian'}</p>
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Current Address</label>
                    <p className="text-[13px] font-medium text-gray-800">{selectedStudent.address || 'N/A'}</p>
                  </div>
                  <div className="pt-1">
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Permanent Address</label>
                    <p className="text-[13px] font-medium text-gray-800">{selectedStudent.permanentAddress ? `${selectedStudent.permanentAddress}, ${selectedStudent.permanentCity}, ${selectedStudent.permanentPincode}` : 'N/A'}</p>
                  </div>

                  {/* Portal Credentials */}
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <h6 className="text-[11px] font-semibold text-[#0A6C54] uppercase tracking-wider mb-3">Portal Credentials</h6>
                    <div className="flex gap-4">
                      <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Username</label>
                        <p className="text-[13px] font-bold text-gray-800">{selectedStudent.username || 'N/A'}</p>
                      </div>
                      <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Password</label>
                        <p className="text-[13px] font-bold text-gray-800">{selectedStudent.password || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Parent / Guardian Information */}
                  <div className="space-y-4">
                    <h5 className="text-[13px] font-bold text-[#0A6C54] uppercase tracking-wider border-b border-gray-200 pb-2">Parent & Guardian Details</h5>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Father's Name</label>
                        <p className="text-[13px] font-medium text-gray-800">{selectedStudent.fatherName || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Father's Mobile</label>
                        <p className="text-[13px] font-medium text-gray-800">{selectedStudent.fatherMobile || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Mother's Name</label>
                        <p className="text-[13px] font-medium text-gray-800">{selectedStudent.motherName || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Mother's Mobile</label>
                        <p className="text-[13px] font-medium text-gray-800">{selectedStudent.motherMobile || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Guardian Name</label>
                        <p className="text-[13px] font-medium text-gray-800">{selectedStudent.guardianName || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Guardian Mobile</label>
                        <p className="text-[13px] font-medium text-gray-800">{selectedStudent.guardianMobile || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Parent Occupation</label>
                        <p className="text-[13px] font-medium text-gray-800">{selectedStudent.fatherOccupation || selectedStudent.motherOccupation || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Annual Income</label>
                        <p className="text-[13px] font-medium text-gray-800">{selectedStudent.annualIncome ? `₹${selectedStudent.annualIncome}` : 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="space-y-4">
                    <h5 className="text-[13px] font-bold text-[#0A6C54] uppercase tracking-wider border-b border-gray-200 pb-2">Previous Education</h5>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">School / College</label>
                        <p className="text-[13px] font-medium text-gray-800">{selectedStudent.prevSchool || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Board / University</label>
                        <p className="text-[13px] font-medium text-gray-800">{selectedStudent.board || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Passing Year</label>
                        <p className="text-[13px] font-medium text-gray-800">{selectedStudent.passingYear || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Qualification</label>
                        <p className="text-[13px] font-medium text-gray-800">{selectedStudent.qualification || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Percentage</label>
                        <p className="text-[13px] font-bold text-gray-800">{selectedStudent.percentage ? `${selectedStudent.percentage}%` : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="mt-8">
                <h5 className="text-[13px] font-bold text-[#0A6C54] uppercase tracking-wider border-b border-gray-200 pb-2 mb-4">Uploaded Documents</h5>
                {(!selectedStudent.documents || selectedStudent.documents.length === 0) ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                    <p className="text-gray-500 text-[13px] font-medium">No documents uploaded for this student.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedStudent.documents.map((doc, idx) => (
                      <div key={idx} className="flex flex-col p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-gray-800 line-clamp-1" title={doc.name}>{doc.name}</p>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${doc.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {doc.status || 'Pending'}
                            </span>
                          </div>
                        </div>
                        {doc.url ? (
                          <a href={doc.url.startsWith('http') ? doc.url : `http://localhost:5000${doc.url.startsWith('/') ? doc.url : '/' + doc.url}`} target="_blank" rel="noopener noreferrer" className="mt-auto block w-full text-center px-3 py-2 text-[12px] font-bold text-[#0A6C54] bg-[#0A6C54]/5 border border-[#0A6C54]/20 rounded-lg hover:bg-[#0A6C54] hover:text-white transition-all">
                            View Document
                          </a>
                        ) : (
                          <div className="mt-auto block w-full text-center px-3 py-2 text-[12px] font-bold text-gray-400 bg-gray-50 border border-gray-100 rounded-lg cursor-not-allowed">
                            Not Uploaded
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50 rounded-b-2xl">
              <button 
                onClick={() => { setIsViewModalOpen(false); setSelectedStudent(null); }}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-[13px] font-bold hover:bg-gray-50 transition-colors shadow-sm"
              >
                Close
              </button>
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