import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  LayoutDashboard, UserPlus, Users, GraduationCap, 
  UserSquare2, UsersRound, Settings, Fingerprint,
  FileText, Wallet, Library,
  Building2, PieChart,
  ClipboardList, AlertCircle, LogOut, ChevronDown, ChevronRight,
  DollarSign, Receipt, CreditCard, TrendingDown, TrendingUp,
  BookOpen, Award, RotateCcw, ShoppingCart, Landmark, BookMarked
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
        { name: 'Enquiries', icon: FileText, path: '/admissions/enquiries' },
        { name: 'Follow-ups', icon: ClipboardList, path: '/admissions/followups' },
        { name: 'Applications', icon: BookOpen, path: '/admissions/applications' },
        { name: 'New Admission', icon: UserPlus, path: '/admissions/new' },
        { name: 'Document Verification', icon: FileText, path: '/admissions/documents' },
        { name: 'Student Registration', icon: Users, path: '/admissions/registration' },
        { name: 'Seat Management', icon: BookMarked, path: '/admissions/seats' },
        { name: 'Admission Approval', icon: Award, path: '/admissions/approval' },
        { name: 'Admission Cancellation', icon: RotateCcw, path: '/admissions/cancellation' },
        { name: 'Admission Reports', icon: PieChart, path: '/admissions/reports' },
      ]
    },
    {
      name: 'Financial',
      icon: Wallet,
      items: [
        { name: 'Fee Structure', icon: DollarSign, path: '/financial/fee-structure' },
        { name: 'Student Fees', icon: Users, path: '/financial/student-fees' },
        { name: 'Fee Collection', icon: Receipt, path: '/financial/fee-collection' },
        { name: 'Pending Dues', icon: AlertCircle, path: '/financial/pending-dues' },
        { name: 'Installments', icon: ClipboardList, path: '/financial/installments' },
        { name: 'Discounts', icon: TrendingDown, path: '/financial/discounts' },
        { name: 'Scholarships', icon: Award, path: '/financial/scholarships' },
        { name: 'Refunds', icon: RotateCcw, path: '/financial/refunds' },
        { name: 'Expenses', icon: CreditCard, path: '/financial/expenses' },
        { name: 'Income', icon: TrendingUp, path: '/financial/income' },
        { name: 'Vendor Payments', icon: ShoppingCart, path: '/financial/vendor-payments' },
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
      name: 'Other',
      items: [
        { name: 'Library', icon: Library, path: '/library' },
        { name: 'Hostel', icon: Building2, path: '/hostel' },
        { name: 'Reports', icon: PieChart, path: '/reports' },
      ]
    },
  ];

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
        {menuGroups.map((group) => {
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
