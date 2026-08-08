import { useState,useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, UserPlus, Users, GraduationCap, 
  UserSquare2, UsersRound, Settings, Fingerprint,
  FileText, Wallet, Library,
  Building2, PieChart,
  ClipboardList, AlertCircle, LogOut, ChevronDown, ChevronRight,
  DollarSign, Receipt, CreditCard, TrendingDown, TrendingUp,
  BookOpen, Award, RotateCcw, ShoppingCart, Landmark,  CheckSquare, Wrench, Shield, Home, Briefcase, 
  MapPin, CheckCircle, UserCircle2, Calculator, Bed, BookMarked, ShieldAlert, Calendar, Clock
} from 'lucide-react';

export const Sidebar = ({ isOpen = true, setIsSidebarOpen, onLogoutClick }) => {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState([]);

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev =>
      prev.includes(groupName)
        ? prev.filter(g => g !== groupName)
        : [...prev, groupName]
    );
  };

  const menuGroups = [
    {
      name: 'MySpace',
      icon: UserCircle2,
      items: [
        { name: 'My Attendance', icon: MapPin, path: '/my-attendance' }
      ]
    },
    {
      name: 'Academic Management',
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      ]
    },
    {
      name: 'Self Service',
      icon: UserSquare2,
      items: [
        { name: 'My Payroll', icon: FileText, path: '/payroll/my-payroll' },
      ]
    },
    {
      name: 'Admissions',
      icon: UserPlus,
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admissions/dashboard' },
        { name: 'Enquiries', icon: UserPlus, path: '/admissions/enquiries' },
        { name: 'Follow-ups', icon: ClipboardList, path: '/admissions/followups' },
        { name: 'New Admission', icon: UserSquare2, path: '/admissions/new' },
        { name: 'Applications', icon: FileText, path: '/admissions/applications' },
        { name: 'Document Verification', icon: Fingerprint, path: '/admissions/documents' },
        { name: 'Admission Approval', icon: GraduationCap, path: '/admissions/approval' },
        { name: 'Student Registration', icon: UsersRound, path: '/admissions/registration' },
        { name: 'Admission Cancellation', icon: AlertCircle, path: '/admissions/cancellation' },
        { name: 'Seat Management', icon: Settings, path: '/admissions/seats' },
        { name: 'Admission Reports', icon: PieChart, path: '/admissions/reports' },
      ]
    },
    {
      name: 'Financial',
      icon: Wallet,
      items: [
        { name: 'Financial Dashboard', icon: PieChart, path: '/financial/reports' },
        { name: 'Fee Structure', icon: Wallet, path: '/financial/fee-structure' },
        { name: 'Discounts', icon: TrendingDown, path: '/financial/discounts' },
        { name: 'Scholarships', icon: Award, path: '/financial/scholarships' },
        { name: 'Student Fees', icon: DollarSign, path: '/financial/student-fees' },
        { name: 'Pending Dues', icon: AlertCircle, path: '/financial/pending-dues' },
        { name: 'Installments', icon: CreditCard, path: '/financial/installments' },
        { name: 'Fee Collection', icon: Receipt, path: '/financial/fee-collection' },
        { name: 'Receipts', icon: Receipt, path: '/financial/receipts' },
        { name: 'Refunds', icon: RotateCcw, path: '/financial/refunds' },
        { name: 'Income', icon: TrendingDown, path: '/financial/income' },
        { name: 'Expenses', icon: TrendingUp, path: '/financial/expenses' },
        { name: 'Vendor Payments', icon: ShoppingCart, path: '/financial/vendor-payments' },
        { name: 'Payroll', icon: Landmark, path: '/financial/payroll' },
        { name: 'Cash & Bank', icon: Landmark, path: '/financial/cash-bank' },
        { name: 'Account Ledger', icon: BookOpen, path: '/financial/ledger' },
      ]
    },
    {
      name: 'Academic',
      icon: GraduationCap,
      items: [
        { name: 'Academics', icon: GraduationCap, path: '/academics' },
        { name: 'HOD Management', icon: UsersRound, path: '/hod' },
        { name: 'Teachers', icon: UserSquare2, path: '/teachers' },
        { name: 'Students', icon: Users, path: '/students' },
        { name: 'Timetable', icon: ClipboardList, path: '/timetable' },
        { name: 'Attendance', icon: Fingerprint, path: '/attendance' },
        { name: 'Faculty Attendance', icon: UserSquare2, path: '/faculty-attendance' },
        { name: 'Lesson Plans', icon: FileText, path: '/lesson-plans' },
        { name: 'Assignments', icon: FileText, path: '/assignments' },
        { name: 'Study Materials', icon: BookOpen, path: '/study-materials' },
        { name: 'Examinations', icon: FileText, path: '/exams' },
        { name: 'Internal Marks', icon: FileText, path: '/internal-marks' },
        { name: 'Leave Requests', icon: ClipboardList, path: '/leave-requests' },
      ]
    },
    {
      name: 'HR & Admin',
      icon: Users,
      items: [
        { name: 'Employees', icon: Users, path: '/employees' },
        { name: 'Users & Roles', icon: Settings, path: '/roles' },
        { name: 'Punch Logs', icon: MapPin, path: '/punch-logs' },
        { name: 'Attendance Settings', icon: Clock, path: '/attendance-settings' },
        { name: 'Meetings', icon: Users, path: '/meetings' },
        { name: 'Notice Board', icon: ClipboardList, path: '/notice' },
        { name: 'Complaints', icon: AlertCircle, path: '/complaints' },
      ]
    },
    {
      name: 'Payroll',
      icon: DollarSign,
      items: [
        { name: 'Salary Structures', icon: Settings, path: '/payroll/structures' },
        { name: 'Employee Salary', icon: Users, path: '/payroll/employee-salary' },
        { name: 'Generate Payroll', icon: Calculator, path: '/payroll/generate' },
        { name: 'Payroll History', icon: FileText, path: '/payroll/history' },
      ]
    },
    {
      name: 'Library',
      icon: Library,
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/library/dashboard' },
        { name: 'Books Catalog', icon: BookOpen, path: '/library/books' },
        { name: 'Members Card', icon: Users, path: '/library/members' },
        { name: 'Issue & Return', icon: ClipboardList, path: '/library/issue-return' },
        { name: 'Reservations', icon: BookMarked, path: '/library/reservations' },
        { name: 'Penalties & Fines', icon: DollarSign, path: '/library/fines' },
        { name: 'Lost/Damaged Books', icon: AlertCircle, path: '/library/lost-damaged' },
        { name: 'Stock Verification', icon: CheckSquare, path: '/library/stock' },
        { name: 'Library Reports', icon: PieChart, path: '/library/reports' },
      ]
    },
    {
      name: 'Hostel Warden',
      icon: Building2,
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/hostel-warden/dashboard' },
        { name: 'Rooms & Beds', icon: Bed, path: '/hostel-warden/rooms' },
        { name: 'Assets & Inventory', icon: ShoppingCart, path: '/hostel-warden/inventory' },
        { name: 'Student Allotment', icon: UserPlus, path: '/hostel-warden/allotment' },
        { name: 'Hostel Attendance', icon: CheckSquare, path: '/hostel-warden/attendance' },
        { name: 'Check-In/Out', icon: RotateCcw, path: '/hostel-warden/check-in-out' },
        { name: 'Leave & Outing', icon: ClipboardList, path: '/hostel-warden/leave-outing' },
        { name: 'Visitors Gate', icon: Users, path: '/hostel-warden/visitors' },
        { name: 'Room Complaints', icon: AlertCircle, path: '/hostel-warden/complaints' },
        { name: 'Discipline Incidents', icon: ShieldAlert, path: '/hostel-warden/incidents' },
        { name: 'Hostel Notices', icon: ClipboardList, path: '/hostel-warden/notices' },
        { name: 'Hostel Reports', icon: PieChart, path: '/hostel-warden/reports' },
      ]
    },
    {
      name: 'Security',
      icon: ShieldAlert,
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/security/dashboard' },
        { name: 'Student Movement', icon: CheckSquare, path: '/security/movement' },
        { name: 'Visitors', icon: Users, path: '/security/visitors' },
        { name: 'Gatepass Check', icon: CheckSquare, path: '/security/gatepass' },
        { name: 'Vehicle Logs', icon: CheckSquare, path: '/security/vehicles' },
        { name: 'Hostel Outings', icon: Bed, path: '/security/hostel-movement' },
        { name: 'Incident Reports', icon: AlertCircle, path: '/security/incidents' },
        { name: 'Security Reports', icon: PieChart, path: '/security/reports' },
      ]
    },
    {
      name: 'Student Portal',
      icon: GraduationCap,
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
        { name: 'My Profile', icon: Users, path: '/student/profile' },
        { name: 'Timetable', icon: Calendar, path: '/student/timetable' },
        { name: 'Attendance', icon: CheckSquare, path: '/student/attendance' },
        { name: 'Registered Subjects', icon: BookOpen, path: '/student/subjects' },
        { name: 'Study Materials', icon: BookOpen, path: '/student/materials' },
        { name: 'Assignments', icon: FileText, path: '/student/assignments' },
        { name: 'Exam Schedules', icon: Calendar, path: '/student/exams' },
        { name: 'Semester Results', icon: Award, path: '/student/results' },
        { name: 'Fees & Receipts', icon: DollarSign, path: '/student/fees' },
        { name: 'Scholarships', icon: Award, path: '/student/scholarships' },
        { name: 'Library Card', icon: BookOpen, path: '/student/library' },
        { name: 'Hostel Room', icon: Bed, path: '/student/hostel' },
        { name: 'Leave Requests', icon: Calendar, path: '/student/leave-requests' },
        { name: 'Downloads', icon: FileText, path: '/student/downloads' },
        // { name: 'Placements', icon: Briefcase, path: '/student/placement' },
        // { name: 'IT & Infra Complaints', icon: AlertCircle, path: '/student/complaints' },
      ]
    },
    {
      name: 'Other',
      items: [
        { name: 'Reports', icon: PieChart, path: '/reports' },
      ]
    },
  ];

  useEffect(() => {
    const activeGroup = menuGroups.find(group => 
      group.items && group.items.some(item => {
        if (item.path === '/dashboard' && location.pathname === '/') return true;
        if (item.path !== '/' && item.path !== '/dashboard') {
           return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
        }
        return location.pathname === item.path;
      })
    );
    if (activeGroup && !expandedGroups.includes(activeGroup.name)) {
      setExpandedGroups(prev => [...prev, activeGroup.name]);
    }
  }, [location.pathname]);

  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
  const userRole = adminInfo.role || 'college_admin';
  const userPermissions = adminInfo.permissions || [];

  // Item-level permission mapping: sidebar item path -> required permissions (any one is enough)
  const itemPermissionMap = {
    // Main items
    '/dashboard': ['View Dashboard', 'View Analytics'],
    // Academic items
    '/students': ['View Students', 'Add Student', 'Edit Student'],
    '/teachers': ['View Teachers', 'Add Teacher', 'Edit Teacher'],
    '/hod': ['View Departments', 'Manage Departments'],
    '/academics': ['View Courses', 'Manage Courses', 'View Departments', 'View Subjects', 'View Sections', 'View Study Materials'],
    '/attendance': ['View Attendance', 'Mark Attendance', 'Edit Attendance'],
    '/faculty-attendance': ['View Attendance', 'Mark Attendance'],
    '/timetable': ['View Courses', 'Manage Courses'],
    '/lesson-plans': ['View Lesson Plans', 'Manage Lesson Plans'],
    '/assignments': ['View Assignments', 'Create Assignment', 'Edit Assignment', 'Delete Assignment', 'Evaluate Assignment'],
    '/study-materials': ['View Assignments', 'Create Assignment', 'Edit Assignment', 'Delete Assignment'],
    '/exams': ['View Exams', 'Create Exam', 'Edit Exam'],
    '/internal-marks': ['Enter Marks', 'View Results'],
    '/leave-requests': ['View Students', 'View Attendance'],
    // Financial items
    '/financial/fee-structure': ['Manage Fee Structure', 'View Fees'],
    '/financial/student-fees': ['View Fees', 'Collect Fees'],
    '/financial/fee-collection': ['Collect Fees', 'Generate Receipt'],
    '/financial/pending-dues': ['View Fee Reports', 'View Fees'],
    '/financial/installments': ['View Fees', 'Collect Fees'],
    '/financial/discounts': ['Manage Fee Structure', 'View Fees'],
    '/financial/scholarships': ['Manage Fee Structure', 'View Fees'],
    '/financial/refunds': ['View Fee Reports', 'Collect Fees'],
    '/financial/income': ['View Fee Reports'],
    '/financial/expenses': ['View Fee Reports'],
    '/financial/vendor-payments': ['View Fee Reports'],
    '/financial/payroll': ['View Fee Reports', 'Manage Fee Structure'],
    '/financial/receipts': ['Generate Receipt', 'View Fees'],
    '/financial/cash-bank': ['View Fee Reports'],
    '/financial/ledger': ['View Fee Reports'],
    '/financial/ledger': ['View Fee Reports'],
    '/financial/reports': ['View Fee Reports'],
    // Payroll items
    '/payroll/structures': ['Manage Salary Structure'],
    '/payroll/employee-salary': ['Assign Salary'],
    '/payroll/generate': ['Generate Payroll'],
    '/payroll/history': ['Approve Payroll', 'View Payroll'],
    // HR & Admin items
    '/employees': ['View Employees', 'Add Employee', 'Edit Employee'],
    '/roles': ['Manage Roles', 'Manage Permissions'],
    '/meetings': ['View Employees'],
    '/notice': ['View Employees', 'View Students'],
    '/complaints': ['View Students', 'View Employees'],
    // Library items
    '/library/dashboard': ['View Books'],
    '/library/books': ['View Books', 'Add Book', 'Edit Book'],
    '/library/members': ['View Books', 'Issue Book'],
    '/library/issue-return': ['Issue Book', 'Return Book'],
    '/library/reservations': ['View Books', 'Issue Book'],
    '/library/fines': ['Issue Book', 'Return Book'],
    '/library/lost-damaged': ['View Books', 'Edit Book'],
    '/library/stock': ['View Books'],
    '/library/reports': ['View Books'],
    // Hostel items
    '/hostel-warden/dashboard': ['View Hostels'],
    '/hostel-warden/rooms': ['Manage Rooms'],
    '/hostel-warden/allotment': ['Manage Allocations'],
    '/hostel-warden/check-in-out': ['View Hostels', 'Manage Allocations'],
    '/hostel-warden/attendance': ['View Hostels'],
    '/hostel-warden/leave-outing': ['View Hostels'],
    '/hostel-warden/visitors': ['View Hostels'],
    '/hostel-warden/complaints': ['View Hostels'],
    '/hostel-warden/incidents': ['View Hostels'],
    '/hostel-warden/inventory': ['Manage Rooms'],
    '/hostel-warden/notices': ['View Hostels'],
    '/hostel-warden/reports': ['View Hostel Reports'],
    // Security items
    '/security/dashboard': ['View Security Dashboard'],
    '/security/movement': ['Log Student Entry/Exit'],
    '/security/visitors': ['View Security Dashboard'],
    '/security/gatepass': ['Scan Gate Pass'],
    '/security/vehicles': ['Log Vehicle Registry'],
    '/security/hostel-movement': ['View Security Dashboard'],
    '/security/incidents': ['Log Security Incident'],
    '/security/reports': ['View Security Dashboard'],
    // Reports
    '/reports': ['View All Reports', 'Export Reports', 'Generate Custom Reports'],
    // Admissions
    '/admissions/dashboard': ['View Admissions'],
    '/admissions/enquiries': ['View Admissions'],
    '/admissions/followups': ['View Admissions', 'Edit Admission'],
    '/admissions/applications': ['View Admissions'],
    '/admissions/new': ['Add Admission'],
    '/admissions/documents': ['View Admissions', 'Approve Admission'],
    '/admissions/registration': ['Add Admission', 'Edit Admission'],
    '/admissions/seats': ['View Admissions'],
    '/admissions/approval': ['Approve Admission'],
    '/admissions/cancellation': ['Delete Admission'],
    '/admissions/reports': ['View Admissions'],
  };

  const hasItemPermission = (path) => {
    const required = itemPermissionMap[path];
    if (!required) return true; // No mapping = accessible by all
    return required.some(p => userPermissions.includes(p));
  };

  const filteredMenuGroups = menuGroups.map(group => {
    if (userRole === 'college_admin' || userRole === 'Principal') {
      return group;
    }

    // Students see Student Portal only
    if (userRole === 'Student') {
      if (group.name === 'Student Portal') return group;
      return null;
    }

    // Group to Permission mapping
    const groupPermissionCategories = {
      'Main': ['View Dashboard', 'View Analytics'],
      'Self Service': ['*'], // Accessible to any logged in non-student user
      'Admissions': ['View Admissions', 'Add Admission', 'Edit Admission', 'Delete Admission', 'Approve Admission'],
      'Financial': ['View Fees', 'Collect Fees', 'Generate Receipt', 'View Fee Reports', 'Manage Fee Structure'],
      'Academic': ['View Students', 'Add Student', 'Edit Student', 'Delete Student', 'Export Students', 'View Teachers', 'Add Teacher', 'Edit Teacher', 'Delete Teacher', 'Assign Subjects', 'View Courses', 'Manage Courses', 'View Departments', 'Manage Departments', 'View Subjects', 'Manage Subjects', 'View Sections', 'Manage Sections', 'View Attendance', 'Mark Attendance', 'Edit Attendance', 'View Attendance Reports', 'View Exams', 'Create Exam', 'Edit Exam', 'Delete Exam', 'Enter Marks', 'View Results'],
      'HR & Admin': ['View Employees', 'Add Employee', 'Edit Employee', 'Delete Employee', 'View Credentials', 'Manage Roles', 'Manage Permissions', 'System Configuration'],
      'Payroll': ['View Payroll', 'Manage Salary Structure', 'Assign Salary', 'Generate Payroll', 'Approve Payroll'],
      'Library': ['View Books', 'Add Book', 'Edit Book', 'Delete Book', 'Issue Book', 'Return Book'],
      'Hostel Warden': ['View Hostels', 'Manage Rooms', 'Manage Allocations', 'View Hostel Reports'],
      'Security': ['View Security Dashboard', 'Log Student Entry/Exit', 'Scan Gate Pass', 'Log Vehicle Registry', 'Log Security Incident'],
      'Student Portal': ['View Portal Dashboard', 'Submit Course Assignments', 'View Semester Results', 'Pay Fees Online', 'Apply For Outings'],
      'Other': ['View All Reports', 'Export Reports', 'Generate Custom Reports']
    };

    const categoryPermissions = groupPermissionCategories[group.name];
    if (categoryPermissions) {
      const hasPermission = categoryPermissions.includes('*') || categoryPermissions.some(p => userPermissions.includes(p));
      if (hasPermission) {
        // Filter individual items within the group
        const filteredItems = group.items.filter(item => hasItemPermission(item.path));
        if (filteredItems.length === 0) return null;
        return { ...group, items: filteredItems };
      }
    }

    return null;
  }).filter(Boolean);

  return (
    <div className={`${isOpen ? 'w-[260px]' : 'w-[80px]'} bg-[#022A36] text-white flex flex-col h-full overflow-hidden flex-shrink-0 transition-all duration-300`}>
      <div className={`h-22 flex items-center ${isOpen ? 'justify-start px-5' : 'justify-center px-0'} flex-shrink-0 pt-6 pb-4 gap-3`}>
        <div className="flex items-center justify-center w-11 h-11 bg-white/10 rounded-xl relative flex-shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12l10-6 10 6-10 6-10-6z" />
            <path d="M22 12v6" />
            <path d="M6 14.5V20c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-5.5" />
          </svg>
        </div>
        {isOpen && (
          <div className="flex flex-col whitespace-nowrap overflow-hidden">
            <span className="text-[15px] font-bold tracking-wider font-['Inter'] text-white leading-tight">POLYTECHNIC</span>
            <span className="text-[12px] text-[#2DD4BF] font-medium">College ERP</span>
          </div>
        )}
      </div>
      
      <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1 custom-scrollbar overflow-x-hidden">
        {filteredMenuGroups.map((group) => {
          if (group.name === 'Main') {
            return group.items.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/') || (item.path !== '/' && item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/'));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center ${isOpen ? 'gap-3 px-4' : 'justify-center px-0'} py-3 rounded-xl transition-all font-medium text-[14px] ${
                    isActive ? 'bg-[#0A6C54] text-white shadow-md' : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2 : 1.5} className="flex-shrink-0" />
                  {isOpen && <span className="whitespace-nowrap">{item.name}</span>}
                </Link>
              );
            });
          }

          if (group.name === 'Other') {
            return group.items.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center ${isOpen ? 'gap-3 px-4' : 'justify-center px-0'} py-3 rounded-xl transition-all font-medium text-[14px] ${
                    isActive ? 'bg-[#0A6C54] text-white shadow-md' : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2 : 1.5} className="flex-shrink-0" />
                  {isOpen && <span className="whitespace-nowrap">{item.name}</span>}
                </Link>
              );
            });
          }

          const isExpanded = expandedGroups.includes(group.name);
          const GroupIcon = group.icon;
          const isGroupActive = group.items.some(item => {
            if (item.path === '/dashboard' && location.pathname === '/') return true;
            if (item.path !== '/' && item.path !== '/dashboard') {
               return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            }
            return location.pathname === item.path;
          });

          return (
            <div key={group.name}>
              <button
                onClick={() => isOpen && toggleGroup(group.name)}
                className={`w-full flex items-center ${isOpen ? 'gap-3 px-4 justify-between' : 'justify-center px-0'} py-3 rounded-xl transition-all font-medium text-[14px] ${
                  isGroupActive ? 'text-[#2DD4BF]' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  {GroupIcon && <GroupIcon size={18} strokeWidth={1.5} className="flex-shrink-0" />}
                  {isOpen && <span className="whitespace-nowrap text-[13px] font-bold uppercase tracking-wider">{group.name}</span>}
                </div>
                {isOpen && (
                  isExpanded
                    ? <ChevronDown size={14} className="flex-shrink-0" />
                    : <ChevronRight size={14} className="flex-shrink-0" />
                )}
              </button>

              {isExpanded && isOpen && (
                <div className="ml-3 pl-3 border-l border-white/10 space-y-0.5 mb-1">
                  {group.items.map((item) => {
                    const isItemActive = location.pathname === item.path || (item.path !== '/' && item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/'));
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium text-[13px] ${
                          isItemActive ? 'bg-[#0A6C54] text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon size={15} strokeWidth={isItemActive ? 2 : 1.5} className="flex-shrink-0" />
                        <span className="whitespace-nowrap">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className={`p-4 flex-shrink-0 border-t border-white/10 mt-auto ${!isOpen ? 'px-2' : ''}`}>
        <button 
          onClick={onLogoutClick}
          className={`flex items-center ${isOpen ? 'gap-3 px-4' : 'justify-center px-0'} py-3 w-full rounded-xl transition-all font-medium text-[14px] text-[#ff6b6b] hover:text-white hover:bg-red-500/20`}
        >
          <LogOut size={18} strokeWidth={1.5} className="flex-shrink-0" />
          {isOpen && <span className="whitespace-nowrap">Logout</span>}
        </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
};

export default Sidebar;
