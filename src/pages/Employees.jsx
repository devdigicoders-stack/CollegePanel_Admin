import React, { useState, useEffect } from 'react';
import { Plus, Search, ChevronDown, Edit, Trash2, X, AlertTriangle, Eye, User, Lock, Upload, Copy } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';
import { checkPermission } from '../utils/checkPermission';
import Swal from 'sweetalert2';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({});
  
  // Filter options
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    role: 'All Roles',
    department: 'All Departments',
    status: 'All Status',
    search: ''
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchEmployees();
    fetchFilterOptions();
  }, [filters, pagination.page]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        role: filters.role === 'All Roles' ? '' : filters.role,
        department: filters.department === 'All Departments' ? '' : filters.department,
        status: filters.status === 'All Status' ? '' : filters.status,
        search: filters.search
      });

      const res = await axiosInstance.get(`/employees?${params}`);
      setEmployees(res.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: res.data.total,
        pages: res.data.pages
      }));
    } catch (error) {
      toast.error('Failed to fetch employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [rolesRes, deptsRes] = await Promise.all([
        axiosInstance.get('/roles/list/all'),
        axiosInstance.get('/academics/departments')
      ]);
      
      const rolesData = rolesRes.data?.data || [];
      const deptsData = Array.isArray(deptsRes.data) ? deptsRes.data : (deptsRes.data?.data || []);
      
      setRoles(rolesData);
      setDepartments(deptsData);
    } catch (error) {
      console.error('Failed to fetch filter options', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setSelectedEmployee(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEditClick = (employee) => {
    setIsEditing(true);
    setSelectedEmployee(employee);
    setFormData(employee);
    setShowModal(true);
  };

  const handleViewClick = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const handleDeleteClick = (employee) => {
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key]);
        }
      });
      
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };

      if (isEditing) {
        await axiosInstance.put(`/employees/${selectedEmployee._id}`, submitData, config);
        toast.success('Employee updated successfully');
      } else {
        const res = await axiosInstance.post('/employees', submitData, config);
        const newEmp = res.data.data;
        
        // Show credentials popup for new employee
        Swal.fire({
          title: 'Employee Created!',
          html: `
            <div style="text-align: left; margin-top: 15px;">
              <p style="margin-bottom: 8px;"><strong>Name:</strong> ${newEmp.name}</p>
              <p style="margin-bottom: 8px;"><strong>Role:</strong> ${newEmp.role}</p>
              <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 15px;">
                <p style="margin-bottom: 8px;"><strong>Username:</strong> <span style="color: #0A6C54; font-weight: 600;">${newEmp.username}</span></p>
                <p style="margin-bottom: 0;"><strong>Password:</strong> <span style="color: #0A6C54; font-weight: 600;">${newEmp.password}</span></p>
              </div>
              <p style="font-size: 12px; color: #64748b; margin-top: 10px;">Please copy and share these credentials securely.</p>
            </div>
          `,
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Copy Credentials',
          cancelButtonText: 'Close',
          confirmButtonColor: '#0A6C54'
        }).then((result) => {
          if (result.isConfirmed) {
            navigator.clipboard.writeText(`Login Details for ${newEmp.name}\nUsername: ${newEmp.username}\nPassword: ${newEmp.password}\nPortal URL: ${window.location.origin}`);
            toast.success('Credentials copied to clipboard!');
          }
        });
      }
      setShowModal(false);
      setFormData({});
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save employee');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/employees/${selectedEmployee._id}`);
      toast.success('Employee deleted successfully');
      setShowDeleteModal(false);
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete employee');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'text-[#15803d] bg-[#dcfce3]';
      case 'Inactive': return 'text-[#dc2626] bg-[#fee2e2]';
      case 'On Leave': return 'text-[#d97706] bg-[#fef3c7]';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Pagination
  const getPageNumbers = () => {
    const { pages, page } = pagination;
    if (pages <= 5) {
      return Array.from({ length: pages }, (_, i) => i + 1);
    }
    if (page <= 3) {
      return [1, 2, 3, 4, '...', pages];
    }
    if (page >= pages - 2) {
      return [1, '...', pages - 3, pages - 2, pages - 1, pages];
    }
    return [1, '...', page - 1, page, page + 1, '...', pages];
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        <h2 className="text-[20px] font-bold text-[#022A36] font-['Outfit']">All Employees List</h2>
      </div>

      {/* Filters Top Row */}
      <div className="p-5 flex flex-col md:flex-row gap-4 justify-between items-center border-b border-gray-50 pt-2">
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <div className="relative flex-1 md:flex-none">
            <select 
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
            >
              <option>All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          {/* Department Filter */}
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

          {/* Status Filter */}
          <div className="relative flex-1 md:flex-none">
            <select 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>On Leave</option>
              <option>Inactive</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        {checkPermission('Add Employee') && (
          <button 
            onClick={handleAddClick}
            className="w-full md:w-auto bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Employee
          </button>
        )}
      </div>

      {/* Search Row */}
      <div className="px-5 py-4 flex justify-between items-center bg-white border-b border-gray-50">
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by name or employee ID" 
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full bg-white border border-gray-200 text-gray-700 py-2 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] placeholder:text-gray-400 shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={8} />
        ) : employees.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 text-sm">No employees found</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">#</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Employee ID</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Name</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Role</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Department</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Mobile</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => (
                <tr key={employee._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-semibold">{(pagination.page - 1) * pagination.limit + index + 1}</td>
                  <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{employee.empId}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-medium whitespace-nowrap">{employee.name}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-medium whitespace-nowrap">{employee.role}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 whitespace-nowrap">{employee.department}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 whitespace-nowrap">{employee.mobile}</td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide inline-block ${getStatusColor(employee.status)}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                      <button 
                        onClick={() => handleViewClick(employee)}
                        className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm flex-shrink-0"
                        title="View"
                      >
                        <Eye size={14} strokeWidth={2} />
                      </button>
                      {checkPermission('Edit Employee') && (
                        <button 
                          onClick={() => handleEditClick(employee)}
                          className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm flex-shrink-0"
                          title="Edit"
                        >
                          <Edit size={14} strokeWidth={2} />
                        </button>
                      )}
                      {checkPermission('Delete Employee') && (
                        <button 
                          onClick={() => handleDeleteClick(employee)}
                          className="w-8 h-8 rounded border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm bg-red-50/50 flex-shrink-0"
                          title="Delete"
                        >
                          <Trash2 size={14} strokeWidth={2} />
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
      {!loading && pagination.pages > 1 && (
        <div className="flex items-center justify-between p-5 border-t border-gray-100">
          <div className="text-[13px] text-gray-500 font-medium">
            Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className={`px-3 py-1.5 text-[13px] font-medium rounded border transition-colors ${
                pagination.page === 1 
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>

            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setPagination(prev => ({ ...prev, page }))}
                  className={`min-w-[32px] px-3 py-1.5 text-[13px] font-medium rounded border transition-colors ${
                    pagination.page === page
                      ? 'bg-[#0A6C54] text-white border-[#0A6C54]'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              )
            ))}

            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
              disabled={pagination.page === pagination.pages}
              className={`px-3 py-1.5 text-[13px] font-medium rounded border transition-colors ${
                pagination.page === pagination.pages 
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <EmployeeModal
          title={isEditing ? 'Edit Employee' : 'Add New Employee'}
          formData={formData}
          setFormData={setFormData}
          roles={roles}
          departments={departments}
          onSubmit={handleFormSubmit}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* View Modal */}
      {showViewModal && selectedEmployee && (
        <ViewEmployeeModal
          employee={selectedEmployee}
          onClose={() => setShowViewModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEmployee && (
        <DeleteConfirmationModal
          title="Delete Employee"
          message={`Are you sure you want to delete ${selectedEmployee.name}?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

// Employee Modal Component
const EmployeeModal = ({ title, formData, setFormData, roles, departments, onSubmit, onClose }) => {
  const isNewEmployee = !formData._id;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50 sticky top-0">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A6C54] text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A6C54] text-sm"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.mobile || ''}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A6C54] text-sm"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role || ''}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A6C54] text-sm"
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A6C54] text-sm"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>

            {/* Date of Joining */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Joining
              </label>
              <input
                type="date"
                value={formData.dateOfJoining ? formData.dateOfJoining.split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A6C54] text-sm"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A6C54] text-sm"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={formData.gender || ''}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A6C54] text-sm"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status || 'Active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A6C54] text-sm"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Profile Photo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Photo
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-[13px] font-medium text-gray-600">
                  <Upload size={16} />
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData(prev => ({ ...prev, profilePhoto: file }));
                      }
                    }}
                  />
                </label>
                {formData.profilePhoto && (
                  <span className="text-[12px] text-gray-500">{formData.profilePhoto.name}</span>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A6C54] text-sm"
              />
            </div>
          </div>

          {/* Login Credentials Section */}
          <div className="mt-6 p-4 border-t border-gray-200 pt-6">
            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-purple-300 rounded-xl p-6">
              {/* Heading */}
              <div className="flex items-center gap-2 mb-4">
                <Lock size={18} className="text-purple-700" />
                <h4 className="text-[14px] font-bold text-gray-900">Login Credentials</h4>
              </div>

{isNewEmployee ? (
                 /* Message for new employees */
                 <div className="p-4 bg-blue-50 border border-blue-300 rounded-lg flex gap-3">
                   <svg 
                     className="w-5 h-5 text-blue-700 mt-0.5 flex-shrink-0" 
                     fill="currentColor" 
                     viewBox="0 0 20 20"
                   >
                     <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                   </svg>
                   <p className="text-[13px] text-blue-800 font-medium">
                     Credentials will be auto-generated on save. Username will be generated from employee name (firstname.lastname) and a unique secure password will be created automatically.
                   </p>
                 </div>
               ) : (
                 /* Info message for existing employees */
                 <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg flex gap-2">
                   <svg 
                     className="w-4 h-4 text-yellow-700 mt-0.5 flex-shrink-0" 
                     fill="currentColor" 
                     viewBox="0 0 20 20"
                   >
                     <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                   </svg>
                   <p className="text-[12px] text-yellow-800">
                     Login credentials are managed separately. Contact system administrator to reset credentials.
                   </p>
                 </div>
               )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 bg-[#0A6C54] text-white py-2 rounded-lg hover:bg-[#085a46] transition-colors font-medium text-sm"
            >
              {formData._id ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View Employee Modal Component
const ViewEmployeeModal = ({ employee, onClose }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'text-[#15803d] bg-[#dcfce3]';
      case 'Inactive': return 'text-[#dc2626] bg-[#fee2e2]';
      case 'On Leave': return 'text-[#d97706] bg-[#fef3c7]';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-[#0A6C54] to-[#0d8566] p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <h3 className="text-xl font-bold text-white">Employee Details</h3>
          <p className="text-white/80 text-sm mt-1">Complete information about the employee</p>
        </div>

        {/* Profile Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0A6C54] to-[#0d8566] flex items-center justify-center flex-shrink-0">
              <User size={40} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-800">{employee.name}</h4>
              <p className="text-sm text-[#0A6C54] font-medium">{employee.role} - {employee.department}</p>
              <p className="text-xs text-gray-500 mt-1">Employee ID: {employee.empId}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wide mt-2 ${getStatusColor(employee.status)}`}>
                {employee.status}
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div>
            <h5 className="text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200">Contact Information</h5>
            <div className="space-y-3">
              <InfoRow label="Email" value={employee.email || 'N/A'} />
              <InfoRow label="Mobile" value={employee.mobile || 'N/A'} />
              {employee.address && <InfoRow label="Address" value={employee.address} />}
            </div>

            {/* Login Credentials */}
            <h5 className="text-sm font-bold text-gray-700 mt-6 mb-4 pb-2 border-b border-gray-200">Login Credentials</h5>
            <div className="space-y-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <InfoRow label="Username" value={<span className="font-semibold text-[#0A6C54]">{employee.username || 'Not Generated'}</span>} />
              <InfoRow label="Password" value={<span className="font-semibold text-[#0A6C54]">{employee.password || 'Not Generated'}</span>} />
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h5 className="text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200">Personal Information</h5>
            <div className="space-y-3">
              {employee.dateOfBirth && <InfoRow label="Date of Birth" value={formatDate(employee.dateOfBirth)} />}
              {employee.gender && <InfoRow label="Gender" value={employee.gender} />}
              {employee.dateOfJoining && <InfoRow label="Date of Joining" value={formatDate(employee.dateOfJoining)} />}
              <InfoRow label="Created Date" value={formatDate(employee.createdAt)} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Info Row Component
const InfoRow = ({ label, value }) => (
  <div className="flex items-start">
    <span className="text-xs font-semibold text-gray-500 w-32 flex-shrink-0">{label}</span>
    <span className="text-sm text-gray-800 font-medium flex-1">{value}</span>
  </div>
);

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-red-50">
          <AlertTriangle size={24} className="text-red-600" />
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>

        <div className="px-6 py-6">
          <p className="text-gray-600 text-sm">{message}</p>
        </div>

        <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export { ViewEmployeeModal };
export default Employees;
