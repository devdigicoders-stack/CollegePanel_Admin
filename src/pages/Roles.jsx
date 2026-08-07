import { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Edit, Trash2, X, Shield, Check, ChevronLeft, ArrowLeft,
  LayoutDashboard, GraduationCap, Users, UserCheck, ClipboardList,
  BookOpen, DollarSign, Calendar, FileText, BookMarked, Home, 
  BarChart3, Settings, ShieldAlert} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';
import { checkPermission } from '../utils/checkPermission';
import AccessDenied from '../components/AccessDenied';

const permissionCategories = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    color: 'blue',
    permissions: ['View Dashboard', 'View Analytics', 'View Reports Summary']
  },
  {
    name: 'Students',
    icon: GraduationCap,
    color: 'indigo',
    permissions: ['View Students', 'Add Student', 'Edit Student', 'Delete Student', 'Export Students']
  },
  {
    name: 'Teachers',
    icon: UserCheck,
    color: 'purple',
    permissions: ['View Teachers', 'Add Teacher', 'Edit Teacher', 'Delete Teacher', 'Assign Subjects']
  },
  {
    name: 'Employees',
    icon: Users,
    color: 'pink',
    permissions: ['View Employees', 'Add Employee', 'Edit Employee', 'Delete Employee', 'View Credentials']
  },
  {
    name: 'Admissions',
    icon: ClipboardList,
    color: 'rose',
    permissions: ['View Admissions', 'Add Admission', 'Edit Admission', 'Delete Admission', 'Approve Admission']
  },
  {
    name: 'Academics — Departments',
    icon: BookOpen,
    color: 'orange',
    permissions: ['View Departments', 'Add Department', 'Edit Department', 'Delete Department']
  },
  {
    name: 'Academics — Courses',
    icon: BookOpen,
    color: 'orange',
    permissions: ['View Courses', 'Add Course', 'Edit Course', 'Delete Course']
  },
  {
    name: 'Academics — Subjects',
    icon: BookOpen,
    color: 'orange',
    permissions: ['View Subjects', 'Add Subject', 'Edit Subject', 'Delete Subject']
  },
  {
    name: 'Academics — Sections',
    icon: BookOpen,
    color: 'orange',
    permissions: ['View Sections', 'Add Section', 'Edit Section', 'Delete Section']
  },
  {
    name: 'Academics — Timetable',
    icon: Calendar,
    color: 'orange',
    permissions: ['View Timetable', 'Manage Timetable']
  },
  {
    name: 'Academics — Lesson Plans',
    icon: BookOpen,
    color: 'orange',
    permissions: ['View Lesson Plans', 'Add Lesson Plan', 'Edit Lesson Plan', 'Delete Lesson Plan']
  },
  {
    name: 'Academics — Assignments',
    icon: FileText,
    color: 'orange',
    permissions: ['View Assignments', 'Add Assignment', 'Edit Assignment', 'Delete Assignment', 'Grade Assignment']
  },
  {
    name: 'Fees',
    icon: DollarSign,
    color: 'green',
    permissions: ['View Fees', 'Collect Fees', 'Generate Receipt', 'View Fee Reports', 'Manage Fee Structure', 'Add Discount', 'Approve Refund', 'View Payroll', 'Manage Payroll']
  },
  {
    name: 'Attendance',
    icon: Calendar,
    color: 'teal',
    permissions: ['View Attendance', 'Mark Attendance', 'Edit Attendance', 'View Attendance Reports', 'View Faculty Attendance', 'Mark Faculty Attendance']
  },
  {
    name: 'Examinations',
    icon: FileText,
    color: 'cyan',
    permissions: ['View Exams', 'Create Exam', 'Edit Exam', 'Delete Exam', 'Enter Marks', 'View Results', 'Export Results']
  },
  {
    name: 'Library — Books',
    icon: BookMarked,
    color: 'amber',
    permissions: ['View Books', 'Add Book', 'Edit Book', 'Delete Book']
  },
  {
    name: 'Library — Circulation',
    icon: BookMarked,
    color: 'amber',
    permissions: ['Issue Book', 'Return Book', 'View Reservations', 'Manage Reservations', 'Collect Fine']
  },
  {
    name: 'Hostel',
    icon: Home,
    color: 'lime',
    permissions: ['View Hostels', 'Manage Rooms', 'Manage Allocations', 'View Hostel Reports', 'Approve Leave Outing', 'Reject Leave Outing', 'Mark Hostel Attendance', 'Log Check In', 'Log Check Out', 'Manage Hostel Inventory', 'Add Hostel Notice']
  },
  {
    name: 'Security & Gate',
    icon: ShieldAlert,
    color: 'red',
    permissions: ['View Security Dashboard', 'Log Student Entry/Exit', 'Scan Gate Pass', 'Log Vehicle Registry', 'Log Security Incident', 'Manage Visitors']
  },
  {
    name: 'Student Portal',
    icon: GraduationCap,
    color: 'emerald',
    permissions: ['View Portal Dashboard', 'Submit Course Assignments', 'View Semester Results', 'Pay Fees Online', 'Apply For Outings']
  },
  {
    name: 'Reports',
    icon: BarChart3,
    color: 'emerald',
    permissions: ['View All Reports', 'Export Reports', 'Generate Custom Reports']
  },
  {
    name: 'HR & Communication',
    icon: Settings,
    color: 'indigo',
    permissions: ['View Notices', 'Add Notice', 'Edit Notice', 'Delete Notice', 'View Complaints', 'Manage Complaints', 'View Meetings', 'Add Meeting', 'View Leave Requests', 'Approve Leave Request']
  },
  {
    name: 'Settings',
    icon: Settings,
    color: 'slate',
    permissions: ['View Settings', 'Edit Settings', 'Manage Roles', 'Manage Permissions', 'System Configuration']
  }
];

const Roles = () => {
  if (!checkPermission('Manage Roles') && !checkPermission('Manage Permissions')) {
    return <AccessDenied />;
  }
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('list');
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [formData, setFormData] = useState({ name: '', description: '', department: '', status: 'Active' });
  const [formLoading, setFormLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const searchTimeout = useRef(null);
  
  // Tab State
  const [activeTab, setActiveTab] = useState('roles'); // 'roles' or 'users'
  
  // Users (Employees) State
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const userSearchTimeout = useRef(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    if (userSearchTimeout.current) clearTimeout(userSearchTimeout.current);
    userSearchTimeout.current = setTimeout(() => {
      if (activeTab === 'users') fetchUsers();
    }, 400);
  }, [userSearchQuery]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await axiosInstance.get('/employees', { params: { search: userSearchQuery, limit: 100 } });
      setUsers(res.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch users');
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleAssignRole = async (userId, roleName) => {
    try {
      await axiosInstance.put(`/employees/${userId}`, { role: roleName });
      toast.success('Role assigned successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to assign role');
    }
  };

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchRoles();
    }, 400);
  }, [searchQuery]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery
      };
      const res = await axiosInstance.get('/roles', { params });
      setRoles(res.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: res.data.total || 0,
        pages: res.data.pages || 1
      }));
    } catch (error) {
      toast.error('Failed to fetch roles');
      console.error('Failed to fetch roles', error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleAddRole = () => {
    setIsEditing(false);
    setSelectedRole(null);
    setFormData({ name: '', description: '', department: '', status: 'Active' });
    setShowRoleModal(true);
  };

  const handleEditRole = (role) => {
    setIsEditing(true);
    setSelectedRole(role);
    setFormData({
      name: role.name || '',
      description: role.description || '',
      department: role.department || '',
      status: role.status || 'Active'
    });
    setShowRoleModal(true);
  };

  const handleDeleteRole = async (role) => {
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
    try {
      await axiosInstance.delete(`/roles/${role._id}`);
      toast.success('Role deleted successfully');
      fetchRoles();
    } catch (error) {
      toast.error('Failed to delete role');
    }
  };

  const handleSaveRole = async () => {
    if (!formData.name || !formData.department) {
      toast.error('Please fill all required fields');
      return;
    }
    setFormLoading(true);
    try {
      if (isEditing) {
        await axiosInstance.put(`/roles/${selectedRole._id}`, formData);
        toast.success('Role updated successfully');
      } else {
        await axiosInstance.post('/roles', formData);
        toast.success('Role created successfully');
      }
      setShowRoleModal(false);
      setFormData({ name: '', description: '', department: '', status: 'Active' });
      fetchRoles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save role');
    } finally {
      setFormLoading(false);
    }
  };

const handleManagePermissions = (role) => {
  setSelectedRole(role);
  const permMap = {};
  if (Array.isArray(role.permissions)) {
    role.permissions.forEach(p => {
      permMap[p] = true;
    });
  }
  setSelectedPermissions(permMap);
  setView('permissions');
};

const togglePermission = (permission) => {
  setSelectedPermissions(prev => ({
    ...prev,
    [permission]: !prev[permission]
  }));
};

const selectAllInCategory = (category) => {
  const allSelected = category.permissions.every(p => selectedPermissions[p]);
  const newState = {};
  category.permissions.forEach(permission => {
    newState[permission] = !allSelected;
  });
  setSelectedPermissions(prev => ({ ...prev, ...newState }));
};

const handleSavePermissions = async () => {
  if (!selectedRole) return;
  setFormLoading(true);
  try {
    const activePermissions = Object.keys(selectedPermissions).filter(
      k => selectedPermissions[k] === true
    );
    await axiosInstance.put(`/roles/${selectedRole._id}`, { permissions: activePermissions });
    toast.success('Permissions saved successfully');
    setView('list');
    fetchRoles();
  } catch (error) {
    toast.error('Failed to save permissions');
  } finally {
    setFormLoading(false);
  }
};

  const filteredRoles = roles;

  const totalPages = pagination.pages;
  const startIndex = (pagination.page - 1) * pagination.limit;

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (pagination.page <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (pagination.page >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', pagination.page - 1, pagination.page, pagination.page + 1, '...', totalPages];
  };

  if (view === 'permissions') {
    return (
      <div className="flex flex-col h-full font-['Inter']">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setView('list')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <h2 className="text-[20px] font-bold text-gray-900">Manage Permissions</h2>
            <p className="text-[13px] text-gray-500 mt-1">{selectedRole?.name} Role</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-gray-600">
              <span className="font-bold text-purple-600">
                {Object.values(selectedPermissions).filter(Boolean).length}
              </span> / {permissionCategories.reduce((acc, cat) => acc + cat.permissions.length, 0)} selected
            </span>
            <button
              onClick={handleSavePermissions}
              disabled={formLoading}
              className="px-5 py-2 text-[13px] font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {permissionCategories.map((category) => {
              const Icon = category.icon;
              const allSelected = category.permissions.every(p => selectedPermissions[p]);
              const selectedCount = category.permissions.filter(p => selectedPermissions[p]).length;

          return (
            <div key={category.name} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Icon size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-gray-900">{category.name}</h3>
                    <p className="text-[10px] text-gray-500">{selectedCount}/{category.permissions.length}</p>
                  </div>
                </div>
                <button
                  onClick={() => selectAllInCategory(category)}
                  className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                    allSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300 hover:border-purple-400'
                  }`}
                >
                  {allSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                </button>
              </div>

                  <div className="space-y-2">
                    {category.permissions.map((permission) => (
                      <label
                        key={permission}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                      >
                        <div
                          onClick={(e) => {
                            e.preventDefault();
                            togglePermission(permission);
                          }}
                          className={`w-4 h-4 border-2 rounded flex items-center justify-center flex-shrink-0 transition-all ${
                            selectedPermissions[permission]
                              ? 'bg-purple-600 border-purple-600'
                              : 'border-gray-300 group-hover:border-purple-400'
                          }`}
                        >
                          {selectedPermissions[permission] && <Check size={10} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-[12px] text-gray-700 font-medium leading-tight">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-['Inter'] bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[20px] font-bold text-[#022A36] font-['Outfit']">Users & Roles</h2>
          <p className="text-[13px] text-gray-500 mt-1">Manage system roles and assign them to users</p>
        </div>
        {activeTab === 'roles' && (
          <button
            onClick={handleAddRole}
            className="flex items-center gap-2 bg-[#022A36] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold hover:bg-[#022a36]/90 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Add New Role
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-6">
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-6 py-3 text-[14px] font-semibold transition-all relative ${
            activeTab === 'roles' ? 'text-[#0A6C54]' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Manage Roles
          {activeTab === 'roles' && (
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0A6C54] rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 text-[14px] font-semibold transition-all relative ${
            activeTab === 'users' ? 'text-[#0A6C54]' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Assign Roles to Users
          {activeTab === 'users' && (
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0A6C54] rounded-t-full"></div>
          )}
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search users by name or ID..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#022A36] focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {usersLoading ? (
              <SkeletonLoader type="table" rows={5} cols={4} />
            ) : (
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#F9FAFB] border-y border-gray-100">
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800">User Details</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800">Department</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800">Status</th>
                    <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[250px]">Assigned Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#0A6C54] text-white flex items-center justify-center font-bold">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-gray-900">{user.name}</p>
                            <p className="text-[11px] text-gray-500">{user.empId || user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[13px] text-gray-600">{user.department || 'N/A'}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {user.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={user.role || ''}
                          onChange={(e) => handleAssignRole(user._id, e.target.value)}
                          className="w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
                        >
                          <option value="">Select Role...</option>
                          {roles.map(r => (
                            <option key={r._id} value={r.name}>{r.name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-gray-500 text-[13px]">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search roles by name, description, or department..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#022A36] focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={4} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRoles.map(role => (
              <div key={role._id} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-purple-300 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <Shield className="text-purple-600" size={18} />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-gray-900">{role.name}</h3>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                        role.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {role.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditRole(role)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 mb-3">{role.department}</p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-[11px] text-gray-600">{role.permissions?.length || 0} permissions</span>
                  <button
                    onClick={() => handleManagePermissions(role)}
                    className="text-[11px] font-semibold text-purple-600 hover:text-purple-700"
                  >
                    Manage →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredRoles.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64">
            <Shield className="text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 text-[14px]">No roles found</p>
          </div>
        )}
      </div>

      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <div className="text-[13px] text-gray-500">
            Showing {startIndex + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setPagination(prev => ({ ...prev, page: page }))}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium ${
                    pagination.page === page
                      ? 'bg-[#022A36] text-white'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
              disabled={pagination.page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      )}

      </div>
      )}

      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-[17px] font-bold text-[#022A36]">
                  {isEditing ? 'Edit Role' : 'Add New Role'}
                </h3>
                <button onClick={() => setShowRoleModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                  Role Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., HOD, Teacher, Accountant"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#022A36] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the role and its responsibilities"
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#022A36] focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#022A36] focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  <option value="Administration">Administration</option>
                  <option value="Academic">Academic</option>
                  <option value="Finance">Finance</option>
                  <option value="Library">Library</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Active"
                      checked={formData.status === 'Active'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-4 h-4 text-[#022A36] focus:ring-[#022A36]"
                    />
                    <span className="text-[13px] text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Inactive"
                      checked={formData.status === 'Inactive'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-4 h-4 text-[#022A36] focus:ring-[#022A36]"
                    />
                    <span className="text-[13px] text-gray-700">Inactive</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-6 py-2.5 text-[13px] font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRole}
                disabled={formLoading}
                className="px-6 py-2.5 text-[13px] font-semibold text-white bg-[#022A36] hover:bg-[#022a36]/90 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {formLoading ? 'Saving...' : (isEditing ? 'Update Role' : 'Create Role')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;