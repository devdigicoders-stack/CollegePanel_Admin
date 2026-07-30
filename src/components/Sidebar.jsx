import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, UserPlus, Users, GraduationCap, 
  UserSquare2, UsersRound, Settings, Fingerprint,
  FileText, Wallet, Library,
  Building2, PieChart,
  ClipboardList, AlertCircle, LogOut, ChevronDown, ChevronRight,
  DollarSign, Receipt, CreditCard, TrendingDown, TrendingUp,
  BookOpen, Award, RotateCcw, ShoppingCart, Landmark, BookMarked,CheckSquare ,Bed,ShieldAlert,
  Coffee, FlaskConical, Wrench, Briefcase, Hammer,Calendar, Phone
} from 'lucide-react';

export const Sidebar = ({ isOpen = true, setIsSidebarOpen, onLogoutClick }) => {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState(['Admissions', 'Financial']);

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev =>
      prev.includes(groupName)
        ? prev.filter(g => g !== groupName)
        : [...prev, groupName]
    );
  };

  const menuGroups = [
    {
      name: 'Main',
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      ]
    },
    {
      name: 'Admissions',
      icon: UserPlus,
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admissions/dashboard' },
        { name: 'Enquiries', icon: UserPlus, path: '/admissions/enquiries' },
        { name: 'Follow-ups', icon: ClipboardList, path: '/admissions/followups' },
        { name: 'Applications', icon: FileText, path: '/admissions/applications' },
        { name: 'New Admission', icon: UserSquare2, path: '/admissions/new' },
        { name: 'Document Verification', icon: Fingerprint, path: '/admissions/documents' },
        { name: 'Student Registration', icon: UsersRound, path: '/admissions/registration' },
        { name: 'Seat Management', icon: Settings, path: '/admissions/seats' },
        { name: 'Admission Approval', icon: GraduationCap, path: '/admissions/approval' },
        { name: 'Admission Cancellation', icon: AlertCircle, path: '/admissions/cancellation' },
        { name: 'Admission Reports', icon: PieChart, path: '/admissions/reports' },
      ]
    },
    {
      name: 'Financial',
      icon: Wallet,
      items: [
        { name: 'Fee Structure', icon: Wallet, path: '/financial/fee-structure' },
        { name: 'Student Fees', icon: DollarSign, path: '/financial/student-fees' },
        { name: 'Fee Collection', icon: Receipt, path: '/financial/fee-collection' },
        { name: 'Pending Dues', icon: AlertCircle, path: '/financial/pending-dues' },
        { name: 'Installments', icon: CreditCard, path: '/financial/installments' },
        { name: 'Discounts', icon: TrendingDown, path: '/financial/discounts' },
        { name: 'Scholarships', icon: Award, path: '/financial/scholarships' },
        { name: 'Refunds', icon: RotateCcw, path: '/financial/refunds' },
        { name: 'Expenses', icon: TrendingUp, path: '/financial/expenses' },
        { name: 'Income', icon: TrendingDown, path: '/financial/income' },
        { name: 'Vendor Payments', icon: ShoppingCart, path: '/financial/vendor-payments' },
        { name: 'Payroll', icon: Landmark, path: '/financial/payroll' },
        { name: 'Receipts', icon: Receipt, path: '/financial/receipts' },
        { name: 'Cash & Bank', icon: Landmark, path: '/financial/cash-bank' },
        { name: 'Account Ledger', icon: BookOpen, path: '/financial/ledger' },
        { name: 'Financial Reports', icon: PieChart, path: '/financial/reports' },
      ]
    },
    {
      name: 'Academic',
      icon: GraduationCap,
      items: [
        { name: 'Students', icon: Users, path: '/students' },
        { name: 'Teachers', icon: UserSquare2, path: '/teachers' },
        { name: 'HOD Management', icon: UsersRound, path: '/hod' },
        { name: 'Academics', icon: GraduationCap, path: '/academics' },
        { name: 'Attendance', icon: Fingerprint, path: '/attendance' },
        { name: 'Faculty Attendance', icon: UserSquare2, path: '/faculty-attendance' },
        { name: 'Internal Marks', icon: FileText, path: '/internal-marks' },
        { name: 'Examinations', icon: FileText, path: '/exams' },
        { name: 'Timetable', icon: ClipboardList, path: '/timetable' },
        { name: 'Lesson Plans', icon: FileText, path: '/lesson-plans' },
        { name: 'Assignments', icon: FileText, path: '/assignments' },
        { name: 'Leave Requests', icon: ClipboardList, path: '/leave-requests' },
      ]
    },
    {
      name: 'HR & Admin',
      icon: Users,
      items: [
        { name: 'Employees', icon: Users, path: '/employees' },
        { name: 'Users & Roles', icon: Settings, path: '/roles' },
        { name: 'Meetings', icon: Users, path: '/meetings' },
        { name: 'Notice Board', icon: ClipboardList, path: '/notice' },
        { name: 'Complaints', icon: AlertCircle, path: '/complaints' },
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
        { name: 'Student Allotment', icon: UserPlus, path: '/hostel-warden/allotment' },
        { name: 'Check-In/Out', icon: RotateCcw, path: '/hostel-warden/check-in-out' },
        { name: 'Hostel Attendance', icon: CheckSquare, path: '/hostel-warden/attendance' },
        { name: 'Leave & Outing', icon: ClipboardList, path: '/hostel-warden/leave-outing' },
        { name: 'Visitors Gate', icon: Users, path: '/hostel-warden/visitors' },
        { name: 'Room Complaints', icon: AlertCircle, path: '/hostel-warden/complaints' },
        { name: 'Discipline Incidents', icon: ShieldAlert, path: '/hostel-warden/incidents' },
        { name: 'Assets & Inventory', icon: ShoppingCart, path: '/hostel-warden/inventory' },
        { name: 'Hostel Notices', icon: ClipboardList, path: '/hostel-warden/notices' },
        { name: 'Hostel Reports', icon: PieChart, path: '/hostel-warden/reports' },
      ]
    },
    /* {
      name: 'Mess Manager',
      icon: Coffee,
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/mess/dashboard' },
        { name: 'Meal Menu', icon: BookOpen, path: '/mess/menu' },
        { name: 'Meal Attendance', icon: CheckSquare, path: '/mess/attendance' },
        { name: 'Mess Students', icon: Users, path: '/mess/students' },
        { name: 'Stock & Inventory', icon: ShoppingCart, path: '/mess/stock' },
        { name: 'Daily Consumption', icon: ClipboardList, path: '/mess/consumption' },
        { name: 'Purchase Requests', icon: ShoppingCart, path: '/mess/purchases' },
        { name: 'Food Complaints', icon: AlertCircle, path: '/mess/complaints' },
        { name: 'Mess Reports', icon: PieChart, path: '/mess/reports' },
      ]
    },
    {
      name: 'Lab Assistant',
      icon: FlaskConical,
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/lab/dashboard' },
        { name: 'Labs Management', icon: Building2, path: '/lab/units' },
        { name: 'Equipment Assets', icon: BookOpen, path: '/lab/equipment' },
        { name: 'Practical Schedule', icon: ClipboardList, path: '/lab/schedule' },
        { name: 'Practical Attendance', icon: CheckSquare, path: '/lab/attendance' },
        { name: 'Issue & Return', icon: RotateCcw, path: '/lab/issue-return' },
        { name: 'Consumable Stock', icon: ShoppingCart, path: '/lab/consumables' },
        { name: 'Maintenance & Repair', icon: Wrench, path: '/lab/maintenance' },
        { name: 'Damage & Lost', icon: AlertCircle, path: '/lab/damage-lost' },
        { name: 'Safety Checklist', icon: CheckSquare, path: '/lab/safety' },
        { name: 'Lab Reports', icon: PieChart, path: '/lab/reports' },
      ]
    },
    {
      name: 'Workshop',
      icon: Hammer,
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/workshop/dashboard' },
        { name: 'Schedule', icon: ClipboardList, path: '/workshop/schedule' },
        { name: 'Student Batches', icon: Users, path: '/workshop/batches' },
        { name: 'Attendance', icon: CheckSquare, path: '/workshop/attendance' },
        { name: 'Jobs & Exercises', icon: BookOpen, path: '/workshop/jobs' },
        { name: 'Machines & Tools', icon: Settings, path: '/workshop/machines' },
        { name: 'Tool Issue/Return', icon: RotateCcw, path: '/workshop/tool-issue-return' },
        { name: 'Consumable Stock', icon: ShoppingCart, path: '/workshop/stock' },
        { name: 'Maintenance', icon: Wrench, path: '/workshop/maintenance' },
        { name: 'Safety Checklist', icon: CheckSquare, path: '/workshop/safety' },
        { name: 'Workshop Reports', icon: PieChart, path: '/workshop/reports' },
      ]
    },
    {
      name: 'Placement',
      icon: Briefcase,
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/placement/dashboard' },
        { name: 'Student Profiles', icon: Users, path: '/placement/profiles' },
        { name: 'Companies Directory', icon: Building2, path: '/placement/companies' },
        { name: 'Job Opportunities', icon: Briefcase, path: '/placement/jobs' },
        { name: 'Placement Drives', icon: ClipboardList, path: '/placement/drives' },
        { name: 'Shortlisting', icon: CheckSquare, path: '/placement/shortlist' },
        { name: 'Applications', icon: FileText, path: '/placement/applications' },
        { name: 'Interviews', icon: Calendar, path: '/placement/interviews' },
        { name: 'Selections & Offers', icon: Award, path: '/placement/offers' },
        { name: 'Internships', icon: Award, path: '/placement/internships' },
        { name: 'Placement Reports', icon: PieChart, path: '/placement/reports' },
      ]
    },
    {
      name: 'Scholarship',
      icon: Award,
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/scholarship/dashboard' },
        { name: 'Schemes', icon: BookOpen, path: '/scholarship/schemes' },
        { name: 'Applications', icon: FileText, path: '/scholarship/applications' },
        { name: 'Doc Verification', icon: CheckSquare, path: '/scholarship/verification' },
        { name: 'Eligibility', icon: CheckSquare, path: '/scholarship/eligibility' },
        { name: 'Approvals', icon: CheckSquare, path: '/scholarship/approval' },
        { name: 'Disbursement', icon: DollarSign, path: '/scholarship/disbursement' },
        { name: 'Renewal', icon: RotateCcw, path: '/scholarship/renewal' },
        { name: 'Scholarship Reports', icon: PieChart, path: '/scholarship/reports' },
      ]
    },
    {
      name: 'Receptionist',
      icon: Phone,
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/receptionist/dashboard' },
        { name: 'Visitors', icon: Users, path: '/receptionist/visitors' },
        { name: 'Enquiries', icon: FileText, path: '/receptionist/enquiries' },
        { name: 'Calls Ledger', icon: Phone, path: '/receptionist/calls' },
        { name: 'Appointments', icon: Calendar, path: '/receptionist/appointments' },
        { name: 'Help Desk', icon: ClipboardList, path: '/receptionist/helpdesk' },
        { name: 'Gate Passes', icon: CheckSquare, path: '/receptionist/gatepass' },
        { name: 'Courier & Parcels', icon: FileText, path: '/receptionist/courier' },
        { name: 'Receptionist Reports', icon: PieChart, path: '/receptionist/reports' },
      ]
    }, */
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
        { name: 'Attendance', icon: CheckSquare, path: '/student/attendance' },
        { name: 'Timetable', icon: Calendar, path: '/student/timetable' },
        { name: 'Registered Subjects', icon: BookOpen, path: '/student/subjects' },
        { name: 'Assignments', icon: FileText, path: '/student/assignments' },
        { name: 'Study Materials', icon: BookOpen, path: '/student/materials' },
        { name: 'Exam Schedules', icon: Calendar, path: '/student/exams' },
        { name: 'Semester Results', icon: Award, path: '/student/results' },
        { name: 'Fees & Receipts', icon: DollarSign, path: '/student/fees' },
        { name: 'Scholarships', icon: Award, path: '/student/scholarships' },
        { name: 'Library Card', icon: BookOpen, path: '/student/library' },
        { name: 'Hostel Room', icon: Bed, path: '/student/hostel' },
        { name: 'Placements', icon: Briefcase, path: '/student/placement' },
        { name: 'IT & Infra Complaints', icon: AlertCircle, path: '/student/complaints' },
        { name: 'Leave Requests', icon: Calendar, path: '/student/leave-requests' },
        { name: 'Downloads', icon: FileText, path: '/student/downloads' },
      ]
    },
    {
      name: 'Other',
      items: [
        { name: 'Reports', icon: PieChart, path: '/reports' },
      ]
    },
  ];

  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
  const userRole = adminInfo.role || 'college_admin';

  const filteredMenuGroups = menuGroups.filter(group => {
    if (group.name === 'Main' || group.name === 'Other') {
      if (userRole === 'Student') {
        return group.name === 'Main';
      }
      return true;
    }
    if (userRole === 'college_admin' || userRole === 'Principal') {
      return true;
    }
    
    const roleMapping = {
      'HOD': ['Academic'],
      'Teacher': ['Academic'],
      'Accountant': ['Financial'],
      'Librarian': ['Library'],
      'Hostel Warden': ['Hostel Warden'],
      'Mess Manager': ['Mess'],
      'Lab Assistant': ['Lab'],
      'Workshop Instructor': ['Workshop'],
      'Placement Officer': ['Placement'],
      'Scholarship Coordinator': ['Scholarship'],
      'Receptionist': ['Receptionist'],
      'Security/Gate Operator': ['Security'],
      'Student': ['Student Portal']
    };
    
    const allowedGroups = roleMapping[userRole] || [];
    return allowedGroups.includes(group.name);
  });

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
              const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
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
          const isGroupActive = group.items.some(item => location.pathname === item.path);

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
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium text-[13px] ${
                          isActive ? 'bg-[#0A6C54] text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon size={15} strokeWidth={isActive ? 2 : 1.5} className="flex-shrink-0" />
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
