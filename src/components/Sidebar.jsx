import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, UserPlus, Users, GraduationCap, 
  UserSquare2, UsersRound, Settings, 
  FileText, 
  PieChart,
  ClipboardList, AlertCircle, LogOut,
  DollarSign, BookOpen, ShoppingCart,
  Bed, ShieldAlert, CheckSquare, Bell,
  ChevronDown, ChevronRight, Sparkles, Lock,
  UtensilsCrossed, CalendarDays, DoorOpen, TrendingUp,
  Landmark, Library, Megaphone
} from 'lucide-react';
import { isModuleUnlocked } from '../utils/moduleAccess';

export const Sidebar = ({ isOpen = true, setIsSidebarOpen, onLogoutClick }) => {
  const location = useLocation();
  const [, setModuleUpdateTick] = useState(0);

  useEffect(() => {
    const handleModuleUpdate = () => setModuleUpdateTick(t => t + 1);
    window.addEventListener('college_modules_updated', handleModuleUpdate);
    return () => window.removeEventListener('college_modules_updated', handleModuleUpdate);
  }, []);
  const [pendingAdmissionsCount, setPendingAdmissionsCount] = useState(0);
  const [pendingHostelLeavesCount, setPendingHostelLeavesCount] = useState(0);
  const [unreadNotices, setUnreadNotices] = useState(0);
  const [unreadAssignments, setUnreadAssignments] = useState(0);
  const [unreadMaterials, setUnreadMaterials] = useState(0);
  const [openMenus, setOpenMenus] = useState({});

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

    const fetchPendingHostelLeaves = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return;
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/hostel/leaves/pending-count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPendingHostelLeavesCount(res.data?.count || 0);
      } catch (error) {
        // Silently catch if not authorized or not a hostel role
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
        
        if (location.pathname === '/student/notices') {
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

        const [statsRes, matRes] = await Promise.allSettled([
          axios.get(`${import.meta.env.VITE_API_URL}/student-portal/dashboard/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/student-portal/study-materials`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (statsRes.status === 'fulfilled') {
          const totalAssignments = statsRes.value.data?.totalAssignments || 0;
          const lastSeen = parseInt(localStorage.getItem('last_seen_assignments_count') || '0', 10);
          
          if (location.pathname === '/student/assignments') {
            localStorage.setItem('last_seen_assignments_count', totalAssignments.toString());
            setUnreadAssignments(0);
          } else if (totalAssignments > lastSeen) {
            setUnreadAssignments(totalAssignments - lastSeen);
          } else {
            setUnreadAssignments(0);
          }
        }

        if (matRes.status === 'fulfilled') {
          const materialsList = Array.isArray(matRes.value.data) ? matRes.value.data : [];
          const totalMaterials = materialsList.length;
          const lastSeenMat = parseInt(localStorage.getItem('last_seen_materials_count') || '0', 10);

          if (location.pathname === '/student/materials' || location.pathname === '/student-portal/materials') {
            localStorage.setItem('last_seen_materials_count', totalMaterials.toString());
            setUnreadMaterials(0);
          } else if (totalMaterials > lastSeenMat) {
            setUnreadMaterials(totalMaterials - lastSeenMat);
          } else {
            setUnreadMaterials(0);
          }
        }
      } catch (error) {
        console.error('Error fetching student stats:', error);
      }
    };
    
    fetchPendingAdmissions();
    fetchPendingHostelLeaves();
    fetchNoticesCount();
    fetchStudentStats();

    const handleLeaveUpdate = () => fetchPendingHostelLeaves();
    const handleAdmissionUpdate = () => fetchPendingAdmissions();
    const handleStudentUpdate = () => fetchStudentStats();
    const handleNoticeUpdate = () => fetchNoticesCount();

    window.addEventListener('hostel_leave_updated', handleLeaveUpdate);
    window.addEventListener('admissions_updated', handleAdmissionUpdate);
    window.addEventListener('assignments_updated', handleStudentUpdate);
    window.addEventListener('materials_updated', handleStudentUpdate);
    window.addEventListener('notices_updated', handleNoticeUpdate);
    window.addEventListener('student_content_updated', handleStudentUpdate);
    window.addEventListener('live-notification', handleStudentUpdate);
    
    const intervalId = setInterval(() => {
      fetchPendingAdmissions();
      fetchPendingHostelLeaves();
      fetchNoticesCount();
      fetchStudentStats();
    }, 4000);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('hostel_leave_updated', handleLeaveUpdate);
      window.removeEventListener('admissions_updated', handleAdmissionUpdate);
      window.removeEventListener('assignments_updated', handleStudentUpdate);
      window.removeEventListener('materials_updated', handleStudentUpdate);
      window.removeEventListener('notices_updated', handleNoticeUpdate);
      window.removeEventListener('student_content_updated', handleStudentUpdate);
      window.removeEventListener('live-notification', handleStudentUpdate);
    };
  }, [location.pathname]);

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
    '/complaints': ['View Complaints', 'Manage Complaints', 'View Students', 'View Employees'],
    '/library/dashboard': ['View Books'],
    '/library/books': ['View Books', 'Add Book', 'Edit Book'],
    '/library/issue-return': ['Issue Book', 'Return Book'],
    '/library/fines': ['Issue Book', 'Return Book', 'Collect Fine'],
    '/library/lost-damaged': ['View Books', 'Edit Book'],
    '/library/reports': ['View Books', 'View All Reports'],
    '/hostel-warden/dashboard': ['View Hostels'],
    '/hostel-warden/rooms': ['Manage Rooms'],
    '/hostel-warden/allotment': ['Manage Allocations'],
    '/hostel-warden/check-in-out': ['View Hostels', 'Manage Allocations'],
    '/hostel-warden/attendance': ['View Hostels'],
    '/hostel-warden/leave-outing': ['View Hostels', 'Approve Leave Outing'],
    '/hostel-warden/visitors': ['View Hostels'],
    '/hostel-warden/complaints': ['View Hostels', 'View Complaints'],
    '/hostel-warden/incidents': ['View Hostels'],
    '/hostel-warden/inventory': ['Manage Rooms', 'Manage Hostel Inventory'],
    '/hostel-warden/notices': ['View Hostels', 'Add Hostel Notice'],
    '/hostel-warden/reports': ['View Hostel Reports'],
    '/reports': ['View All Reports', 'Export Reports', 'Generate Custom Reports'],
    '/admissions/dashboard': ['View Admissions'],
    '/admissions/applications': ['View Admissions', 'Approve Admission'],
    '/admissions/approved': ['View Admissions'],
    '/admissions/rejected': ['View Admissions'],
    '/admissions/new': ['Add Admission'],
    '/admissions/reports': ['View Admissions'],
    '/mess/dashboard': ['View Mess', 'Manage Rooms', 'View Hostels'],
    '/mess/menu': ['View Mess', 'Manage Rooms', 'View Hostels'],
    '/mess/students': ['View Mess', 'Manage Rooms', 'View Hostels'],
    '/mess/stock': ['View Mess', 'Manage Rooms', 'View Hostels'],
    '/mess/consumption': ['View Mess', 'Manage Rooms', 'View Hostels'],
    '/mess/purchases': ['View Mess', 'Manage Rooms', 'View Hostels'],
    '/mess/reports': ['View Mess', 'View All Reports', 'View Hostel Reports'],
    '/fees': ['View Fees', 'Collect Fees', 'View Dashboard'],
  };

  const hasItemPermission = (path) => {
    if (userRole === 'college_admin' || userRole === 'Principal' || userRole === 'Super Admin') return true;
    const required = itemPermissionMap[path];
    if (!required) return true;
    return required.some(p => userPermissions.includes(p));
  };

  const isItemActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/' || location.pathname === '/dashboard';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isParentActive = (item) => {
    if (item.path && isItemActive(item.path)) return true;
    if (item.subItems) {
      return item.subItems.some(sub => isItemActive(sub.path));
    }
    return false;
  };

  // Section 1: CORE FEATURES (Matching Image 1)
  const coreFeaturesSection = {
    sectionId: 'core',
    sectionTitle: 'Core Features',
    badgeText: null,
    icon: Settings,
    items: [
      {
        name: 'Student Management',
        icon: GraduationCap,
        path: '/students',
      },
      {
        name: 'Teacher Management',
        icon: UserSquare2,
        path: '/teachers',
        subItems: [
          { name: 'Teachers Directory', path: '/teachers', icon: UserSquare2 },
          { name: 'HOD Management', path: '/hod', icon: UsersRound },
        ]
      },
      {
        name: 'Student Onboarding System',
        icon: UserPlus,
        path: '/admissions/dashboard',
        badge: pendingAdmissionsCount,
        subItems: [
          { name: 'Admissions Dashboard', path: '/admissions/dashboard', icon: LayoutDashboard },
          { name: 'Share Registration Link', path: '/admissions/new', icon: UserPlus },
          { name: 'Pending Applications', path: '/admissions/applications', icon: FileText, badge: pendingAdmissionsCount },
          { name: 'Approved Students', path: '/admissions/approved', icon: GraduationCap },
          { name: 'Rejected Students', path: '/admissions/rejected', icon: AlertCircle },
          { name: 'Admission Reports', path: '/admissions/reports', icon: PieChart },
        ]
      },
      {
        name: 'Academic Management',
        icon: Landmark,
        path: '/academics',
      },
      {
        name: 'Assignment & Study Material',
        icon: BookOpen,
        path: '/assignments',
        subItems: [
          { name: 'Assignments', path: '/assignments', icon: FileText },
          { name: 'Study Materials', path: '/study-materials', icon: BookOpen },
        ]
      },
      {
        name: 'Notice & Communication',
        icon: Megaphone,
        path: '/notice',
      },
      {
        name: 'Dashboard & Reports',
        icon: LayoutDashboard,
        path: '/dashboard',
        subItems: [
          { name: 'Overview Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Master Reports & Analytics', path: '/reports', icon: PieChart },
        ]
      },
      {
        name: 'Staff & Administration',
        icon: Settings,
        path: '/employees',
        subItems: [
          { name: 'Employees Directory', path: '/employees', icon: Users },
          { name: 'Users & Roles (RBAC)', path: '/roles', icon: Settings },
          // { name: 'Fee Management', path: '/fees', icon: DollarSign },
        ]
      }
    ]
  };

  // Section 2: PREMIUM CAMPUS FEATURES (Matching Image 2)
  const premiumFeaturesSection = {
    sectionId: 'premium',
    sectionTitle: 'Premium Campus',
    badgeText: isModuleUnlocked('all') ? '✨ UNLOCKED' : '🔒 PAID',
    icon: Sparkles,
    items: [
      {
        name: 'Hostel Management',
        moduleKey: 'hostel',
        icon: Bed,
        path: '/hostel-warden/dashboard',
        subItems: [
          { name: 'Hostel Dashboard', path: '/hostel-warden/dashboard', icon: LayoutDashboard },
          { name: 'Rooms & Beds', path: '/hostel-warden/rooms', icon: Bed },
          { name: 'Student Allotment', path: '/hostel-warden/allotment', icon: UserPlus },
          { name: 'Assets & Inventory', path: '/hostel-warden/inventory', icon: ShoppingCart },
          { name: 'Hostel Notices', path: '/hostel-warden/notices', icon: ClipboardList },
        ]
      },
      {
        name: 'Mess Management',
        moduleKey: 'mess',
        icon: UtensilsCrossed,
        path: '/mess/dashboard',
        subItems: [
          { name: 'Mess Dashboard', path: '/mess/dashboard', icon: LayoutDashboard },
          { name: 'Weekly Meal Menu', path: '/mess/menu', icon: UtensilsCrossed },
          { name: 'Mess Enrolled Students', path: '/mess/students', icon: Users },
          { name: 'Stock & Inventory', path: '/mess/stock', icon: ShoppingCart },
          { name: 'Daily Consumption Log', path: '/mess/consumption', icon: ClipboardList },
          { name: 'Purchase Requests', path: '/mess/purchases', icon: FileText },
        ]
      },
      {
        name: 'Student In / Out Management',
        moduleKey: 'hostel',
        icon: DoorOpen,
        path: '/hostel-warden/check-in-out',
      },
      {
        name: 'Leave & Outing Management',
        moduleKey: 'hostel',
        icon: CalendarDays,
        path: '/hostel-warden/leave-outing',
        badge: pendingHostelLeavesCount,
      },
      {
        name: 'Visitor Management',
        moduleKey: 'security',
        icon: Users,
        path: '/hostel-warden/visitors',
      },
      {
        name: 'Complaint & Discipline',
        moduleKey: 'complaints',
        icon: ShieldAlert,
        path: '/complaints',
        subItems: [
          { name: 'General Complaints', path: '/complaints', icon: AlertCircle },
          { name: 'Hostel Room Complaints', path: '/hostel-warden/complaints', icon: AlertCircle },
          { name: 'Discipline Incidents', path: '/hostel-warden/incidents', icon: ShieldAlert },
        ]
      },
      {
        name: 'Library Management',
        moduleKey: 'library',
        icon: Library,
        path: '/library/dashboard',
        subItems: [
          { name: 'Library Dashboard', path: '/library/dashboard', icon: LayoutDashboard },
          { name: 'Books Catalog', path: '/library/books', icon: BookOpen },
          { name: 'Issue & Return Desk', path: '/library/issue-return', icon: ClipboardList },
          { name: 'Penalties & Fines', path: '/library/fines', icon: DollarSign },
          { name: 'Lost & Damaged Books', path: '/library/lost-damaged', icon: AlertCircle },
        ]
      },
      {
        name: 'Hostel & Library Reports',
        moduleKey: 'hostel',
        icon: TrendingUp,
        path: '/hostel-warden/reports',
        subItems: [
          { name: 'Hostel Analytics Reports', path: '/hostel-warden/reports', icon: PieChart },
          { name: 'Library Analytics Reports', path: '/library/reports', icon: PieChart },
          { name: 'Mess Analytics Reports', path: '/mess/reports', icon: PieChart },
        ]
      }
    ]
  };

  // Dedicated Student Portal Section
  const studentPortalSection = {
    sectionId: 'student_portal',
    sectionTitle: 'Student Portal',
    badgeText: 'PORTAL',
    icon: GraduationCap,
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
      { name: 'My Profile', icon: Users, path: '/student/profile' },
      { name: 'Study Materials', icon: BookOpen, path: '/student/materials', badge: unreadMaterials },
      { name: 'Assignments', icon: FileText, path: '/student/assignments', badge: unreadAssignments },
      { name: 'Hostel Room', icon: Bed, path: '/student/hostel' },
      { name: 'Notices', icon: ClipboardList, path: '/student/notices', badge: unreadNotices },
    ]
  };

  // Dedicated Teacher Portal Section
  const teacherPortalSection = {
    sectionId: 'teacher_portal',
    sectionTitle: 'Teacher Portal',
    badgeText: 'PORTAL',
    icon: UserSquare2,
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/teacher-portal/dashboard' },
      { name: 'My Classes', icon: BookOpen, path: '/teacher-portal/my-classes' },
      { name: 'Students', icon: Users, path: '/teacher-portal/students' },
      { name: 'Attendance', icon: CheckSquare, path: '/teacher-portal/attendance' },
      { name: 'Study Materials', icon: FileText, path: '/teacher-portal/study-materials' },
      { name: 'Assignments', icon: ClipboardList, path: '/teacher-portal/assignments' },
      { name: 'Notices', icon: Bell, path: '/teacher-portal/notices' },
      { name: 'Complaints', icon: AlertCircle, path: '/teacher-portal/complaints' },
    ]
  };

  // Automatically expand active menu item when route changes
  useEffect(() => {
    const allSections = [coreFeaturesSection, premiumFeaturesSection, studentPortalSection, teacherPortalSection];
    allSections.forEach(section => {
      section.items.forEach(item => {
        if (item.subItems && item.subItems.some(sub => isItemActive(sub.path))) {
          setOpenMenus(prev => ({ ...prev, [item.name]: true }));
        }
      });
    });
  }, [location.pathname]);

  const toggleSubmenu = (itemName) => {
    setOpenMenus(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  // Role filtering logic
  const roleLower = (userRole || '').toLowerCase();

  let renderedSections = [];

  if (roleLower === 'student') {
    renderedSections = [studentPortalSection];
  } else if (roleLower === 'teacher' || roleLower === 'teacher role') {
    renderedSections = [teacherPortalSection];
  } else if (roleLower === 'hostel' || roleLower.includes('warden')) {
    // Warden sees Premium hostel features
    renderedSections = [{
      ...premiumFeaturesSection,
      items: premiumFeaturesSection.items.filter(item => 
        ['Hostel Management', 'Mess Management', 'Student In / Out Management', 'Leave & Outing Management', 'Visitor Management', 'Complaint & Discipline', 'Hostel & Library Reports'].includes(item.name)
      )
    }];
  } else if (roleLower === 'librarian') {
    // Librarian sees Library features
    renderedSections = [{
      ...premiumFeaturesSection,
      items: premiumFeaturesSection.items.filter(item => 
        ['Library Management', 'Hostel & Library Reports'].includes(item.name)
      )
    }];
  } else if (roleLower === 'hod' || adminInfo.designation === 'HOD') {
    renderedSections = [{
      ...coreFeaturesSection,
      items: coreFeaturesSection.items.filter(item =>
        ['Student Management', 'Teacher Management', 'Academic Management', 'Assignment & Study Material', 'Notice & Communication', 'Dashboard & Reports'].includes(item.name)
      )
    }];
  } else {
    // College Admin / Principal / Super Admin / Staff with granular permissions
    // Filter core items by permissions
    const filteredCoreItems = coreFeaturesSection.items.map(item => {
      if (item.subItems) {
        const validSubs = item.subItems.filter(sub => hasItemPermission(sub.path));
        if (validSubs.length === 0) return null;
        return { ...item, subItems: validSubs };
      }
      return hasItemPermission(item.path) ? item : null;
    }).filter(Boolean);

    // Filter premium items by permissions
    const filteredPremiumItems = premiumFeaturesSection.items.map(item => {
      if (item.subItems) {
        const validSubs = item.subItems.filter(sub => hasItemPermission(sub.path));
        if (validSubs.length === 0) return null;
        return { ...item, subItems: validSubs };
      }
      return hasItemPermission(item.path) ? item : null;
    }).filter(Boolean);

    if (filteredCoreItems.length > 0) {
      renderedSections.push({ ...coreFeaturesSection, items: filteredCoreItems });
    }
    if (filteredPremiumItems.length > 0) {
      renderedSections.push({ ...premiumFeaturesSection, items: filteredPremiumItems });
    }
  }

  return (
    <div className={`${isOpen ? 'w-[252px]' : 'w-[68px]'} bg-sidebar text-white flex flex-col h-full overflow-hidden flex-shrink-0 transition-all duration-300 select-none`}>
      
      {/* Brand Header */}
      <div className={`flex items-center ${isOpen ? 'justify-start px-4' : 'justify-center'} pt-5 pb-4 gap-3 flex-shrink-0 border-b border-white/5`}>
        <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-xl flex-shrink-0 shadow-inner">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12l10-6 10 6-10 6-10-6z" />
            <path d="M22 12v6" />
            <path d="M6 14.5V20c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-5.5" />
          </svg>
        </div>
        {isOpen && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-[14px] font-bold tracking-wider font-['Inter'] text-white leading-tight whitespace-nowrap">POLYTECHNIC</span>
            <span className="text-[11px] text-accent font-semibold tracking-wide">College ERP</span>
          </div>
        )}
      </div>

      {/* Main Navigation with Core & Premium sections */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 custom-scrollbar space-y-4">
        {renderedSections.map((section) => {
          const SectionIcon = section.icon;
          const isPremium = section.sectionId === 'premium';
          
          return (
            <div key={section.sectionId} className="space-y-1">
              {/* Section Header */}
              {isOpen ? (
                <div className={`px-2.5 pt-2 pb-1.5 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                      isPremium 
                        ? 'bg-amber-400/20 text-amber-300' 
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      <SectionIcon size={12} className="stroke-[2.5]" />
                    </div>
                    <span className={`text-[11px] font-bold uppercase tracking-[0.14em] font-['Inter'] ${
                      isPremium ? 'text-amber-300' : 'text-blue-200/80'
                    }`}>
                      {section.sectionTitle}
                    </span>
                  </div>
                  {section.badgeText && (
                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-amber-300 rounded border border-amber-400/30 shadow-xs">
                      {section.badgeText}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex justify-center py-2">
                  <div className={`w-8 h-[2px] rounded-full ${isPremium ? 'bg-amber-400/40' : 'bg-blue-400/30'}`} />
                </div>
              )}

              {/* Items in this Section */}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const hasSubs = Array.isArray(item.subItems) && item.subItems.length > 0;
                  const isExpanded = !!openMenus[item.name];
                  const parentActive = isParentActive(item);
                  const Icon = item.icon;

                  const isItemLocked = isPremium && !isModuleUnlocked(item.moduleKey);

                  // ── A. Item with Dropdown / Sub-Items ────────────────────────
                  if (hasSubs) {
                    return (
                      <div key={item.name} className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => {
                            if (!isOpen && setIsSidebarOpen) {
                              setIsSidebarOpen(true);
                              setOpenMenus(prev => ({ ...prev, [item.name]: true }));
                            } else {
                              toggleSubmenu(item.name);
                            }
                          }}
                          className={`relative w-full flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-xl transition-all text-[13px] font-medium text-left ${
                            parentActive
                              ? 'bg-white/10 text-white font-semibold'
                              : 'text-gray-300 hover:bg-white/10 hover:text-white'
                          }`}
                          title={!isOpen ? item.name : undefined}
                        >
                          <Icon 
                            size={18} 
                            className={`flex-shrink-0 ${
                              parentActive 
                                ? (isPremium ? (isItemLocked ? 'text-amber-400' : 'text-emerald-400') : 'text-accent') 
                                : 'text-gray-400'
                            }`} 
                            strokeWidth={parentActive ? 2.5 : 2} 
                          />
                          
                          {isOpen && (
                            <>
                              <span className="flex-1 truncate">{item.name}</span>
                              
                              {/* Locked Indicator for Premium Suite if not unlocked */}
                              {isItemLocked && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-1.5 py-0.5 rounded shadow-2xs mr-1">
                                  <Lock size={9} className="stroke-[3]" />
                                  PAID
                                </span>
                              )}

                              {/* Parent Badge if any */}
                              {item.badge > 0 && !isItemLocked && (
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-500 text-white shadow-xs mr-1">
                                  {item.badge}
                                </span>
                              )}

                              {/* Dropdown Chevron */}
                              <div className="text-gray-400 hover:text-white transition-transform duration-200">
                                {isExpanded ? (
                                  <ChevronDown size={14} className="stroke-[2.5]" />
                                ) : (
                                  <ChevronRight size={14} className="stroke-[2.5]" />
                                )}
                              </div>
                            </>
                          )}

                          {/* Collapsed view lock indicator */}
                          {!isOpen && isItemLocked && (
                            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center text-[8px] font-black border border-sidebar shadow-xs">
                              <Lock size={8} className="stroke-[3]" />
                            </span>
                          )}

                          {/* Collapsed view badge indicator */}
                          {!isOpen && item.badge > 0 && !isItemLocked && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-sidebar" />
                          )}
                        </button>

                        {/* Collapsible Submenu list */}
                        {isOpen && isExpanded && (
                          <div className="ml-5 pl-3 border-l border-white/15 my-1 space-y-0.5">
                            {item.subItems.map((sub) => {
                              const subActive = isItemActive(sub.path);
                              const SubIcon = sub.icon || FileText;
                              
                              return (
                                <Link
                                  key={sub.path}
                                  to={sub.path}
                                  onClick={() => {
                                    if (window.innerWidth < 768 && setIsSidebarOpen) setIsSidebarOpen(false);
                                  }}
                                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] transition-all font-medium ${
                                    subActive
                                      ? 'bg-primary text-white font-semibold shadow-xs shadow-primary/30'
                                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                  }`}
                                >
                                  <SubIcon size={14} className={subActive ? 'text-white' : 'text-gray-400'} strokeWidth={subActive ? 2.5 : 2} />
                                  <span className="flex-1 truncate">{sub.name}</span>
                                  {isItemLocked ? (
                                    <Lock size={11} className="text-amber-400/80 stroke-[2] flex-shrink-0" />
                                  ) : sub.badge > 0 && (
                                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                      subActive ? 'bg-white text-primary' : 'bg-red-500 text-white'
                                    }`}>
                                      {sub.badge}
                                    </span>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // ── B. Direct Link Item ─────────────────────────────────────
                  const active = isItemActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => {
                        if (window.innerWidth < 768 && setIsSidebarOpen) setIsSidebarOpen(false);
                      }}
                      className={`relative flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-xl transition-all text-[13px] font-medium ${
                        active
                          ? 'bg-primary text-white font-semibold shadow-lg shadow-primary/20'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                      title={!isOpen ? item.name : undefined}
                    >
                      <Icon 
                        size={18} 
                        className={`flex-shrink-0 ${
                          active 
                            ? 'text-white' 
                            : (isPremium ? (isItemLocked ? 'text-amber-400/90' : 'text-emerald-400/90') : 'text-accent opacity-90')
                        }`} 
                        strokeWidth={active ? 2.5 : 2} 
                      />

                      {isOpen && (
                        <>
                          <span className="flex-1 truncate">{item.name}</span>
                          {isItemLocked ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-1.5 py-0.5 rounded shadow-2xs mr-1">
                              <Lock size={9} className="stroke-[3]" />
                              PAID
                            </span>
                          ) : item.badge > 0 && (
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                              active ? 'bg-white text-primary' : 'bg-red-500 text-white shadow-xs'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}

                      {/* Collapsed view lock indicator */}
                      {!isOpen && isItemLocked && (
                        <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center text-[8px] font-black border border-sidebar shadow-xs">
                          <Lock size={8} className="stroke-[3]" />
                        </span>
                      )}

                      {/* Collapsed view badge indicator */}
                      {!isOpen && item.badge > 0 && !isPremium && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-sidebar" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-3 flex-shrink-0 border-t border-white/10 bg-black/10">
        <button
          onClick={onLogoutClick}
          className={`flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 w-full rounded-xl transition-all text-[13px] font-medium text-[#ff7675] hover:text-white hover:bg-red-500/20`}
        >
          <LogOut size={17} strokeWidth={2} className="flex-shrink-0" />
          {isOpen && <span className="whitespace-nowrap font-semibold">Logout</span>}
        </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        .custom-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>
    </div>
  );
};

export default Sidebar;
