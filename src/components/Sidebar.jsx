import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, UserPlus, Users, GraduationCap, 
  UserSquare2, UsersRound, Settings, 
  FileText, 
  PieChart,
  ClipboardList, AlertCircle, LogOut,
  DollarSign, BookOpen, RotateCcw, ShoppingCart,
  Bed, ShieldAlert, CheckSquare
} from 'lucide-react';

export const Sidebar = ({ isOpen = true, setIsSidebarOpen, onLogoutClick }) => {
  const location = useLocation();
  const [pendingAdmissionsCount, setPendingAdmissionsCount] = useState(0);
  const [unreadNotices, setUnreadNotices] = useState(0);
  const [unreadAssignments, setUnreadAssignments] = useState(0);

  useEffect(() => {
    const fetchPendingAdmissions = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return;
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/admissions/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPendingAdmissionsCount(res.data.stats?.pendingApplications || 0);
      } catch (error) {
        console.error('Error fetching pending applications count:', error);
      }
    };
    const fetchNoticesCount = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return;
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/notices/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const publishedCount = res.data.data?.published || 0;
        const lastSeen = parseInt(localStorage.getItem('last_seen_notices_count') || '0', 10);
        
        // If currently on notices page, auto-update the seen count
        if (location.pathname.includes('/notices')) {
          localStorage.setItem('last_seen_notices_count', publishedCount.toString());
          setUnreadNotices(0);
        } else if (publishedCount > lastSeen) {
          setUnreadNotices(publishedCount - lastSeen);
        } else {
          setUnreadNotices(0);
        }
      } catch (error) {
        console.error('Error fetching notices count:', error);
      }
    };
    
    const fetchStudentStats = async () => {
      try {
        const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
        if (adminInfo.role !== 'Student') return;
        
        const token = localStorage.getItem('admin_token');
        if (!token) return;
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/student-portal/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const totalAssignments = res.data.totalAssignments || 0;
        const lastSeen = parseInt(localStorage.getItem('last_seen_assignments_count') || '0', 10);
        
        if (location.pathname.includes('/assignments')) {
          localStorage.setItem('last_seen_assignments_count', totalAssignments.toString());
          setUnreadAssignments(0);
        } else if (totalAssignments > lastSeen) {
          setUnreadAssignments(totalAssignments - lastSeen);
        } else {
          setUnreadAssignments(0);
        }
      } catch (error) {
        console.error('Error fetching student stats:', error);
      }
    };
    
    // Fetch immediately
    fetchPendingAdmissions();
    fetchNoticesCount();
    fetchStudentStats();
    
    // Set up an interval to check periodically
    const intervalId = setInterval(() => {
      fetchPendingAdmissions();
      fetchNoticesCount();
      fetchStudentStats();
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, [location.pathname]);

  const menuGroups = [
    {
      name: 'Main',
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      ]
    },
    {
      name: 'Admissions',
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admissions/dashboard' },
        { name: 'Share Registration Link', icon: UserSquare2, path: '/admissions/new' },
        { name: 'Pending Applications', icon: FileText, path: '/admissions/applications', badge: pendingAdmissionsCount },
        { name: 'Approved Students', icon: GraduationCap, path: '/admissions/approved' },
        { name: 'Rejected Students', icon: AlertCircle, path: '/admissions/rejected' },
        { name: 'Reports', icon: PieChart, path: '/admissions/reports' },
      ]
    },
    {
      name: 'Academic',
      items: [
        { name: 'Academics', icon: GraduationCap, path: '/academics' },
        { name: 'HOD Management', icon: UsersRound, path: '/hod' },
        { name: 'Teachers', icon: UserSquare2, path: '/teachers' },
        { name: 'Students', icon: Users, path: '/students' },
        { name: 'Assignments', icon: FileText, path: '/assignments' },
        { name: 'Study Materials', icon: BookOpen, path: '/study-materials' },
      ]
    },
    {
      name: 'HR & Admin',
      items: [
        { name: 'Employees', icon: Users, path: '/employees' },
        { name: 'Users & Roles', icon: Settings, path: '/roles' },
        { name: 'Notice Board', icon: ClipboardList, path: '/notice' },
        { name: 'Complaints', icon: AlertCircle, path: '/complaints' },
      ]
    },
    {
      name: 'Library',
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/library/dashboard' },
        { name: 'Books Catalog', icon: BookOpen, path: '/library/books' },
        { name: 'Issue & Return', icon: ClipboardList, path: '/library/issue-return' },
        { name: 'Penalties & Fines', icon: DollarSign, path: '/library/fines' },
        { name: 'Lost/Damaged Books', icon: AlertCircle, path: '/library/lost-damaged' },
        { name: 'Library Reports', icon: PieChart, path: '/library/reports' },
      ]
    },
    {
      name: 'Hostel',
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/hostel-warden/dashboard' },
        { name: 'Rooms & Beds', icon: Bed, path: '/hostel-warden/rooms' },
        { name: 'Assets & Inventory', icon: ShoppingCart, path: '/hostel-warden/inventory' },
        { name: 'Student Allotment', icon: UserPlus, path: '/hostel-warden/allotment' },
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
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
        { name: 'My Profile', icon: Users, path: '/student/profile' },
        { name: 'Study Materials', icon: BookOpen, path: '/student/materials' },
        { name: 'Assignments', icon: FileText, path: '/student/assignments', badge: unreadAssignments },
        { name: 'Hostel Room', icon: Bed, path: '/student/hostel' },
        { name: 'Notices', icon: ClipboardList, path: '/student/notices', badge: unreadNotices },
      ]
    },
    {
      name: 'Reports',
      items: [
        { name: 'Reports', icon: PieChart, path: '/reports' },
      ]
    },
  ];

  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
  const userRole = adminInfo.role || 'college_admin';
  const userPermissions = adminInfo.permissions || [];

  const itemPermissionMap = {
    '/dashboard': ['View Dashboard', 'View Analytics'],
    '/students': ['View Students', 'Add Student', 'Edit Student'],
    '/teachers': ['View Teachers', 'Add Teacher', 'Edit Teacher'],
    '/hod': ['View Departments', 'Manage Departments'],
    '/academics': ['View Courses', 'Manage Courses', 'View Departments', 'View Subjects', 'View Sections', 'View Study Materials'],
    '/assignments': ['View Assignments', 'Create Assignment', 'Edit Assignment', 'Delete Assignment', 'Evaluate Assignment'],
    '/study-materials': ['View Assignments', 'Create Assignment', 'Edit Assignment', 'Delete Assignment'],
    '/internal-marks': ['Enter Marks', 'View Results'],
    '/employees': ['View Employees', 'Add Employee', 'Edit Employee'],
    '/roles': ['Manage Roles', 'Manage Permissions'],
    '/notice': ['View Notices', 'Manage Notices'],
    '/complaints': ['View Students', 'View Employees'],
    '/library/dashboard': ['View Books'],
    '/library/books': ['View Books', 'Add Book', 'Edit Book'],
    '/library/issue-return': ['Issue Book', 'Return Book'],
    '/library/fines': ['Issue Book', 'Return Book'],
    '/library/lost-damaged': ['View Books', 'Edit Book'],
    '/library/reports': ['View Books'],
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
    '/security/dashboard': ['View Security Dashboard'],
    '/security/movement': ['Log Student Entry/Exit'],
    '/security/visitors': ['View Security Dashboard'],
    '/security/gatepass': ['Scan Gate Pass'],
    '/security/vehicles': ['Log Vehicle Registry'],
    '/security/hostel-movement': ['View Security Dashboard'],
    '/security/incidents': ['Log Security Incident'],
    '/security/reports': ['View Security Dashboard'],
    '/reports': ['View All Reports', 'Export Reports', 'Generate Custom Reports'],
    '/admissions/dashboard': ['View Admissions'],
    '/admissions/applications': ['View Admissions', 'Approve Admission'],
    '/admissions/approved': ['View Admissions'],
    '/admissions/rejected': ['View Admissions'],
    '/admissions/new': ['Add Admission'],
    '/admissions/reports': ['View Admissions'],
  };

  const hasItemPermission = (path) => {
    const required = itemPermissionMap[path];
    if (!required) return true;
    return required.some(p => userPermissions.includes(p));
  };

  const groupPermissionCategories = {
    'Main': ['View Dashboard', 'View Analytics'],
    'Admissions': ['View Admissions', 'Add Admission', 'Edit Admission', 'Delete Admission', 'Approve Admission'],
    'Academic': ['View Students', 'Add Student', 'Edit Student', 'Delete Student', 'View Teachers', 'Add Teacher', 'Edit Teacher', 'View Courses', 'Manage Courses', 'View Departments', 'View Subjects', 'View Sections', 'Enter Marks', 'View Results'],
    'HR & Admin': ['View Employees', 'Add Employee', 'Edit Employee', 'Delete Employee', 'Manage Roles', 'Manage Permissions', 'View Notices', 'Manage Notices'],
    'Library': ['View Books', 'Add Book', 'Edit Book', 'Delete Book', 'Issue Book', 'Return Book'],
    'Hostel': ['View Hostels', 'Manage Rooms', 'Manage Allocations', 'View Hostel Reports'],
    'Security': ['View Security Dashboard', 'Log Student Entry/Exit', 'Scan Gate Pass', 'Log Vehicle Registry', 'Log Security Incident'],
    'Student Portal': ['View Portal Dashboard', 'Submit Course Assignments', 'View Semester Results', 'Apply For Outings'],
    'Reports': ['View All Reports', 'Export Reports', 'Generate Custom Reports'],
  };

  const filteredMenuGroups = menuGroups.map(group => {
    if (userRole === 'college_admin' || userRole === 'Principal') return group;
    if (userRole === 'Student') {
      return group.name === 'Student Portal' ? group : null;
    }
    const categoryPermissions = groupPermissionCategories[group.name];
    if (categoryPermissions) {
      const hasPermission = categoryPermissions.some(p => userPermissions.includes(p));
      if (hasPermission) {
        const filteredItems = group.items.filter(item => hasItemPermission(item.path));
        if (filteredItems.length === 0) return null;
        return { ...group, items: filteredItems };
      }
    }
    return null;
  }).filter(Boolean);

  const isItemActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/' || location.pathname === '/dashboard';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className={`${isOpen ? 'w-[240px]' : 'w-[64px]'} bg-[#022A36] text-white flex flex-col h-full overflow-hidden flex-shrink-0 transition-all duration-300`}>
      
      {/* Logo */}
      <div className={`flex items-center ${isOpen ? 'justify-start px-4' : 'justify-center'} pt-5 pb-4 gap-3 flex-shrink-0`}>
        <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-xl flex-shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12l10-6 10 6-10 6-10-6z" />
            <path d="M22 12v6" />
            <path d="M6 14.5V20c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-5.5" />
          </svg>
        </div>
        {isOpen && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-[14px] font-bold tracking-wider font-['Inter'] text-white leading-tight whitespace-nowrap">POLYTECHNIC</span>
            <span className="text-[11px] text-[#2DD4BF] font-medium">College ERP</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-4 custom-scrollbar">
        {filteredMenuGroups.map((group) => (
          <div key={group.name} className="mb-3">
            {/* Section Heading — hidden for 'Main' group */}
            {isOpen && group.name !== 'Main' && (
              <div className="px-3 pt-3 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2DD4BF]/70">
                  {group.name}
                </span>
              </div>
            )}

            {/* Items */}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isItemActive(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => { if (window.innerWidth < 768 && setIsSidebarOpen) setIsSidebarOpen(false); }}
                    className={`relative flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-xl transition-all text-[13.5px] font-medium ${
                      active
                        ? 'bg-[#0A6C54] text-white font-semibold shadow-lg shadow-[#0A6C54]/20'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon size={20} className={active ? 'text-white' : 'text-[#2DD4BF] opacity-80'} strokeWidth={active ? 2.5 : 2} />
                    {isOpen && (
                      <>
                        <span className="flex-1 truncate">{item.name}</span>
                        {item.badge > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            active 
                              ? 'bg-white text-[#0A6C54]' 
                              : 'bg-red-500 text-white shadow-sm'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    
                    {/* Badge for Pending Applications */}
                    {item.path === '/admissions/applications' && pendingAdmissionsCount > 0 && isOpen && !item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-in zoom-in duration-300">
                        {pendingAdmissionsCount}
                      </span>
                    )}
                    {/* Dot for collapsed sidebar */}
                    {((item.path === '/admissions/applications' && pendingAdmissionsCount > 0) || (item.badge > 0)) && !isOpen && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#022A36]"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className={`p-3 flex-shrink-0 border-t border-white/10`}>
        <button
          onClick={onLogoutClick}
          className={`flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 w-full rounded-xl transition-all text-[13.5px] font-medium text-[#ff6b6b] hover:text-white hover:bg-red-500/20`}
        >
          <LogOut size={17} strokeWidth={1.5} className="flex-shrink-0" />
          {isOpen && <span className="whitespace-nowrap">Logout</span>}
        </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
};

export default Sidebar;
