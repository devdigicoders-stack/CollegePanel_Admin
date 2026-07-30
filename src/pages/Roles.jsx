import { useState } from 'react';
import { 
  Plus, Search, Edit, Trash2, X, Shield, Check, ChevronLeft, ArrowLeft,
  LayoutDashboard, GraduationCap, Users, UserCheck, ClipboardList,
  BookOpen, DollarSign, Calendar, FileText, BookMarked, Home, 
  BarChart3, Settings, Coffee, FlaskConical, Hammer, Briefcase, Phone, ShieldAlert, Award
} from 'lucide-react';

const Roles = () => {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('list'); // 'list' or 'permissions'
  
  // Form data for role
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    department: '',
    status: 'Active'
  });

  // Static roles data (will be replaced with API later)
  const [roles, setRoles] = useState([
    { id: 1, name: 'Admin', description: 'Full system access with all permissions', department: 'Administration', status: 'Active', permissionsCount: 88, usersCount: 3 },
    { id: 2, name: 'Principal', description: 'Institutional oversight, review student approvals and financial stats', department: 'Administration', status: 'Active', permissionsCount: 72, usersCount: 1 },
    { id: 3, name: 'HOD', description: 'Head of Department with departmental and section controls', department: 'Academic', status: 'Active', permissionsCount: 54, usersCount: 6 },
    { id: 4, name: 'Teacher', description: 'Teaching staff with course and student attendance permissions', department: 'Academic', status: 'Active', permissionsCount: 24, usersCount: 42 },
    { id: 5, name: 'Accountant', description: 'Finance ledger, installments, receipts, and vendor records', department: 'Finance', status: 'Active', permissionsCount: 22, usersCount: 2 },
    { id: 6, name: 'Librarian', description: 'Library cataloging, book assets, members, and fine cards', department: 'Library', status: 'Active', permissionsCount: 12, usersCount: 2 },
    { id: 7, name: 'Hostel Warden', description: 'Room allocations, hostel attendance, visitor logs, and complaints', department: 'Hostel', status: 'Active', permissionsCount: 16, usersCount: 2 },
    { id: 8, name: 'Mess Manager', description: 'Mess attendance, daily meal menus, inventory logs, and complaints', department: 'Mess', status: 'Active', permissionsCount: 14, usersCount: 1 },
    { id: 9, name: 'Lab Assistant', description: 'Lab inventory assets, practical schedules, equipment checks', department: 'Academic', status: 'Active', permissionsCount: 12, usersCount: 4 },
    { id: 10, name: 'Workshop Instructor', description: 'Practical attendance sheets, job exercises, tool issue, and safety checklists', department: 'Academic', status: 'Active', permissionsCount: 14, usersCount: 3 },
    { id: 11, name: 'Placement Officer', description: 'Student placement profiles, drives, job openings, and selections ledger', department: 'Placement', status: 'Active', permissionsCount: 18, usersCount: 1 },
    { id: 12, name: 'Scholarship Coordinator', description: 'Verify schemes, check documents, eligibility verification, and renewals', department: 'Finance', status: 'Active', permissionsCount: 15, usersCount: 1 },
    { id: 13, name: 'Receptionist', description: 'Visitor logs, enquiries dispatch, call sheets, help desk ticketing, and gate passes', department: 'Administration', status: 'Active', permissionsCount: 16, usersCount: 2 },
    { id: 14, name: 'Security/Gate Operator', description: 'Student entry logs, visitor slips, gate pass scanners, and incident reporting', department: 'Security', status: 'Active', permissionsCount: 12, usersCount: 5 },
    { id: 15, name: 'Student', description: 'Read-only profile, assignments submit, fee payments, study materials downloads', department: 'Student', status: 'Active', permissionsCount: 17, usersCount: 1250 }
  ]);

  // Permission categories with granular permissions
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
      name: 'Academics',
      icon: BookOpen,
      color: 'orange',
      permissions: ['View Courses', 'Manage Courses', 'View Departments', 'Manage Departments', 'View Subjects', 'Manage Subjects', 'View Sections', 'Manage Sections']
    },
    {
      name: 'Fees',
      icon: DollarSign,
      color: 'green',
      permissions: ['View Fees', 'Collect Fees', 'Generate Receipt', 'View Fee Reports', 'Manage Fee Structure']
    },
    {
      name: 'Attendance',
      icon: Calendar,
      color: 'teal',
      permissions: ['View Attendance', 'Mark Attendance', 'Edit Attendance', 'View Attendance Reports']
    },
    {
      name: 'Examinations',
      icon: FileText,
      color: 'cyan',
      permissions: ['View Exams', 'Create Exam', 'Edit Exam', 'Delete Exam', 'Enter Marks', 'View Results']
    },
    {
      name: 'Library',
      icon: BookMarked,
      color: 'amber',
      permissions: ['View Books', 'Add Book', 'Edit Book', 'Delete Book', 'Issue Book', 'Return Book']
    },
    {
      name: 'Hostel',
      icon: Home,
      color: 'lime',
      permissions: ['View Hostels', 'Manage Rooms', 'Manage Allocations', 'View Hostel Reports']
    },
    {
      name: 'Mess Management',
      icon: Coffee,
      color: 'amber',
      permissions: ['View Mess Attendance', 'Manage Mess Menu', 'Manage Mess Stock', 'View Mess Reports']
    },
    {
      name: 'Lab Assistant',
      icon: FlaskConical,
      color: 'teal',
      permissions: ['View Lab Equipments', 'Manage Lab Equipments', 'Log Practical Attendance', 'Manage Lab Consumables']
    },
    {
      name: 'Workshop',
      icon: Hammer,
      color: 'orange',
      permissions: ['View Workshop Schedule', 'Mark Practical Attendance', 'Manage Workshop Tools', 'Log Maintenance Request']
    },
    {
      name: 'Placement',
      icon: Briefcase,
      color: 'blue',
      permissions: ['View Placement Dashboard', 'Verify Student Profiles', 'Manage Recruiters Directory', 'Manage Placement Drives', 'Manage Job Offers']
    },
    {
      name: 'Scholarship',
      icon: Award,
      color: 'indigo',
      permissions: ['View Scholarship Schemes', 'Verify Student Applications', 'Verify Documents', 'Disburse Scholarships', 'Approve Renewal Applications']
    },
    {
      name: 'Receptionist',
      icon: Phone,
      color: 'rose',
      permissions: ['View Visitor Logs', 'Register Visitor Entry', 'Manage Appointment Booking', 'Generate Gate Pass', 'Log Courier Parcels']
    },
    {
      name: 'Security & Gate',
      icon: ShieldAlert,
      color: 'red',
      permissions: ['View Security Dashboard', 'Log Student Entry/Exit', 'Scan Gate Pass', 'Log Vehicle Registry', 'Log Security Incident']
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
      name: 'Settings',
      icon: Settings,
      color: 'slate',
      permissions: ['View Settings', 'Edit Settings', 'Manage Roles', 'Manage Permissions', 'System Configuration']
    }
  ];

  // Selected permissions state (for permission modal)
  const [selectedPermissions, setSelectedPermissions] = useState({});

  // Handle Add Role
  const handleAddRole = () => {
    setIsEditing(false);
    setSelectedRole(null);
    setRoleFormData({ name: '', description: '', department: '', status: 'Active' });
    setShowRoleModal(true);
  };

  // Handle Edit Role
  const handleEditRole = (role) => {
    setIsEditing(true);
    setSelectedRole(role);
    setRoleFormData({
      name: role.name,
      description: role.description,
      department: role.department,
      status: role.status
    });
    setShowRoleModal(true);
  };

  // Handle Save Role
  const handleSaveRole = () => {
    // TODO: API call to save role
    console.log('Saving role:', roleFormData);
    setShowRoleModal(false);
  };

  // Handle Manage Permissions - Navigate to permissions page
  const handleManagePermissions = (role) => {
    setSelectedRole(role);
    // Initialize all permissions as checked (for demo)
    const initialPermissions = {};
    permissionCategories.forEach(category => {
      category.permissions.forEach(permission => {
        initialPermissions[permission] = true;
      });
    });
    setSelectedPermissions(initialPermissions);
    setView('permissions'); // Switch to permissions view
  };

  // Toggle permission
  const togglePermission = (permission) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  // Select all permissions in a category
  const selectAllInCategory = (category) => {
    const allSelected = category.permissions.every(p => selectedPermissions[p]);
    const newState = {};
    category.permissions.forEach(permission => {
      newState[permission] = !allSelected;
    });
    setSelectedPermissions(prev => ({ ...prev, ...newState }));
  };

  // Save permissions and go back
  const handleSavePermissions = () => {
    // TODO: API call to save permissions
    console.log('Saving permissions for role:', selectedRole, selectedPermissions);
    setView('list'); // Go back to list view
  };

  // Filtered roles based on search
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If permissions view, show dedicated permissions page
  if (view === 'permissions') {
    return (
      <div className="flex flex-col h-full">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setView('list')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <h2 className="text-[20px] font-bold text-gray-900">Manage Permissions</h2>
            <p className="text-[13px] text-gray-500 mt-0.5">{selectedRole?.name} Role</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-gray-600">
              <span className="font-bold text-purple-600">
                {Object.values(selectedPermissions).filter(Boolean).length}
              </span> / {permissionCategories.reduce((acc, cat) => acc + cat.permissions.length, 0)} selected
            </span>
            <button
              onClick={handleSavePermissions}
              className="px-5 py-2 text-[13px] font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {permissionCategories.map((category) => {
              const Icon = category.icon;
              const allSelected = category.permissions.every(p => selectedPermissions[p]);
              const selectedCount = category.permissions.filter(p => selectedPermissions[p]).length;

              return (
                <div key={category.name} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  {/* Category Header */}
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

                  {/* Permissions List */}
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

  // Main list view
  return (
    <div className="flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[20px] font-bold text-[#022A36] font-['Outfit']">Roles & Permissions</h2>
          <p className="text-[13px] text-gray-500 mt-1">Manage system roles and their permissions</p>
        </div>
        <button
          onClick={handleAddRole}
          className="flex items-center gap-2 bg-[#022A36] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold hover:bg-[#022a36]/90 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add New Role
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search roles by name, description, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#022A36] focus:border-transparent"
          />
        </div>
      </div>

      {/* Roles Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRoles.map(role => (
            <div key={role.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-purple-300 hover:shadow-md transition-all group">
              {/* Header */}
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
                  >
                    <Edit size={14} />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Department */}
              <p className="text-[11px] text-gray-500 mb-3">{role.department}</p>

              {/* Stats */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-[11px] text-gray-600">{role.permissionsCount} permissions</span>
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

        {/* Empty State */}
        {filteredRoles.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64">
            <Shield className="text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 text-[14px]">No roles found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-[17px] font-bold text-[#022A36]">
                  {isEditing ? 'Edit Role' : 'Add New Role'}
                </h3>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                  Role Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={roleFormData.name}
                  onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                  placeholder="e.g., HOD, Teacher, Accountant"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#022A36] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={roleFormData.description}
                  onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
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
                  value={roleFormData.department}
                  onChange={(e) => setRoleFormData({ ...roleFormData, department: e.target.value })}
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
                <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Active"
                      checked={roleFormData.status === 'Active'}
                      onChange={(e) => setRoleFormData({ ...roleFormData, status: e.target.value })}
                      className="w-4 h-4 text-[#022A36] focus:ring-[#022A36]"
                    />
                    <span className="text-[13px] text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Inactive"
                      checked={roleFormData.status === 'Inactive'}
                      onChange={(e) => setRoleFormData({ ...roleFormData, status: e.target.value })}
                      className="w-4 h-4 text-[#022A36] focus:ring-[#022A36]"
                    />
                    <span className="text-[13px] text-gray-700">Inactive</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-6 py-2.5 text-[13px] font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRole}
                className="px-6 py-2.5 text-[13px] font-semibold text-white bg-[#022A36] hover:bg-[#022a36]/90 rounded-lg transition-colors shadow-sm"
              >
                {isEditing ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
