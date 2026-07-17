import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, UserPlus, Users, GraduationCap, 
  UserSquare2, UsersRound, Settings, Fingerprint,
  FileText, Wallet, Library,
  Building2, PieChart,
  ClipboardList, AlertCircle, LogOut
} from 'lucide-react';

export const Sidebar = ({ isOpen = true }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Admissions', icon: UserPlus, path: '/admissions' },
    { name: 'Students', icon: Users, path: '/students' },
    { name: 'Academics', icon: GraduationCap, path: '/academics' },
    { name: 'Teachers', icon: UserSquare2, path: '/teachers' },
    { name: 'HOD Management', icon: UsersRound, path: '/hod' },
    { name: 'Employees', icon: Users, path: '/employees' },
    { name: 'Users & Roles', icon: Settings, path: '/roles' },
    { name: 'Attendance', icon: Fingerprint, path: '/attendance' },
    { name: 'Examinations', icon: FileText, path: '/exams' },
    { name: 'Fees & Accounts', icon: Wallet, path: '/fees' },
    { name: 'Library', icon: Library, path: '/library' },
    { name: 'Hostel', icon: Building2, path: '/hostel' },
    { name: 'Reports', icon: PieChart, path: '/reports' },
    { name: 'Notice Board', icon: ClipboardList, path: '/notice' },
    { name: 'Complaints', icon: AlertCircle, path: '/complaints' },
  ];

  return (
    <div className={`${isOpen ? 'w-[260px]' : 'w-[80px]'} bg-[#022A36] text-white flex flex-col h-full overflow-hidden flex-shrink-0 transition-all duration-300`}>
      <div className={`h-22 flex items-center ${isOpen ? 'justify-start px-5' : 'justify-center px-0'} flex-shrink-0 pt-6 pb-4 gap-3`}>
        <div className="flex items-center justify-center w-11 h-11 bg-white/10 rounded-xl relative flex-shrink-0">
          {/* Logo icon matching the image */}
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
      
      <nav className="flex-1 overflow-y-auto py-2 px-4 space-y-1 custom-scrollbar overflow-x-hidden">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center ${isOpen ? 'gap-3 px-4' : 'justify-center px-0'} py-3 rounded-xl transition-all font-medium text-[14px] ${
                isActive 
                  ? 'bg-[#0A6C54] text-white shadow-md' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
              title={!isOpen ? item.name : undefined}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} className="flex-shrink-0" />
              {isOpen && <span className="whitespace-nowrap">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className={`p-4 flex-shrink-0 border-t border-white/10 mt-auto ${!isOpen ? 'px-2' : ''}`}>
        <button 
          onClick={() => navigate('/login')}
          className={`flex items-center ${isOpen ? 'gap-3 px-4' : 'justify-center px-0'} py-3 w-full rounded-xl transition-all font-medium text-[14px] text-[#ff6b6b] hover:text-white hover:bg-red-500/20`}
          title={!isOpen ? 'Logout' : undefined}
        >
          <LogOut size={18} strokeWidth={1.5} className="flex-shrink-0" />
          {isOpen && <span className="whitespace-nowrap">Logout</span>}
        </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
