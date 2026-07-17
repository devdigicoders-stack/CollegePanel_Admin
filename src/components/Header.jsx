import { Menu, Heart, Bell, User, Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const Header = ({ onMenuClick }) => {
  const location = useLocation();

  const getHeaderContent = () => {
    switch (location.pathname) {
      case '/dashboard':
      case '/':
        return { title: 'Good Morning, Admin!', subtitle: "Here's what's happening in your college today." };
      case '/admissions':
        return { title: 'Admissions', subtitle: 'Home > Admissions', isBreadcrumb: true };
      case '/students':
        return { title: 'Students', subtitle: 'Home > Students', isBreadcrumb: true };
      case '/academics':
        return { title: 'Academic Setup', subtitle: 'Home > Academics > Setup', isBreadcrumb: true };
      case '/teachers':
        return { title: 'Teachers', subtitle: 'Home > Teachers', isBreadcrumb: true };
      case '/hod':
        return { title: 'HOD Management', subtitle: 'Home > Academics > HODs', isBreadcrumb: true };
      case '/roles':
        return { title: 'Users & Roles', subtitle: 'Home > Users & Roles', isBreadcrumb: true };
      case '/employees':
        return { title: 'Employees List', subtitle: 'Home > Employees', isBreadcrumb: true };
      case '/attendance':
        return { title: 'Student Attendance', subtitle: 'Attendance > Student Attendance', isBreadcrumb: true };
      case '/exams':
        return { title: 'Examinations', subtitle: 'Home > Examinations', isBreadcrumb: true };
      case '/fees':
        return { title: 'Fees & Accounts', subtitle: 'Home > Fees & Accounts', isBreadcrumb: true };
      case '/library':
        return { title: '', subtitle: '', isBreadcrumb: false };
      case '/hostel':
        return { title: '', subtitle: '', isBreadcrumb: false };
      case '/reports':
        return { title: '', subtitle: '', isBreadcrumb: false };
      case '/notice':
        return { title: '', subtitle: '', isBreadcrumb: false };
      case '/complaints':
        return { title: '', subtitle: '', isBreadcrumb: false };
      case '/profile':
        return { title: 'Admin Profile', subtitle: 'Home > Profile', isBreadcrumb: true };
      case '/notifications':
        return { title: 'Notifications', subtitle: 'Home > Notifications', isBreadcrumb: true };
      default:
        return { title: 'Dashboard', subtitle: 'Welcome to the panel' };
    }
  };

  const { title, subtitle, isBreadcrumb, actionButton } = getHeaderContent();

  return (
    <header className="h-[88px] bg-[#F8F9FA] flex items-center justify-between px-2 flex-shrink-0 pt-4 pb-2">
      <div className="flex items-center gap-2 md:gap-4 min-w-0 pr-2">
        <button onClick={onMenuClick} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 flex-shrink-0">
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-[16px] md:text-[22px] font-bold text-[#111827] font-['Outfit'] truncate">{title}</h1>
          <p className={`text-[11px] md:text-[13px] font-['Inter'] mt-0.5 truncate ${isBreadcrumb ? 'text-[#0A6C54] font-medium' : 'text-gray-500'}`}>
            {subtitle}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
        {actionButton && (
          <button className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[12px] md:text-[13px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm font-['Inter']">
            <Plus size={16} />
            <span className="hidden sm:inline">{actionButton}</span>
          </button>
        )}
        <button className="relative text-gray-500 hover:text-gray-700 transition-colors hidden sm:block">
          <Heart size={20} strokeWidth={1.5} />
        </button>
        <button 
          onClick={() => window.location.href = '/notifications'}
          className="relative text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Bell size={20} strokeWidth={1.5} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[#F8F9FA]"></span>
        </button>
        
        <div 
          onClick={() => window.location.href = '/profile'}
          className="flex items-center gap-3 pl-2 md:pl-4 border-l border-gray-200 cursor-pointer"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#0A6C54] text-white flex items-center justify-center overflow-hidden flex-shrink-0">
            <User size={18} />
          </div>
          <div className="hidden md:block">
            <div className="text-[14px] font-semibold text-gray-800 flex items-center gap-1">
              Admin
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            <div className="text-[12px] text-gray-500">Principal</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
