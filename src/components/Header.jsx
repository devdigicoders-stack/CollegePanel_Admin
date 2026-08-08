import { useState, useEffect } from 'react';
import { Menu, Plus, Maximize, MapPin, CheckCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [punchStatus, setPunchStatus] = useState(null); // null = loading, 'none', 'punched-in', 'punched-out'
  const [isPunching, setIsPunching] = useState(false);
  
  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
  const userRole = adminInfo.role || 'college_admin';
  const isStudent = userRole.toLowerCase() === 'student';

  useEffect(() => {
    if (!isStudent) {
      fetchPunchStatus();
    }
  }, [isStudent]);

  const fetchPunchStatus = async () => {
    try {
      const res = await axiosInstance.get('/punch/today');
      const log = res.data.data;
      if (!log) {
        setPunchStatus('none');
      } else if (log.punchInTime && !log.punchOutTime) {
        setPunchStatus('punched-in');
      } else if (log.punchOutTime) {
        setPunchStatus('punched-out');
      }
    } catch (err) {
      console.error('Failed to fetch punch status', err);
      // Fail silently for non-employees
      setPunchStatus('none');
    }
  };

  const handlePunch = async (type) => {
    setIsPunching(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setIsPunching(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const endpoint = type === 'in' ? '/punch/in' : '/punch/out';
        
        await axiosInstance.post(endpoint, {
          lat: latitude,
          lng: longitude
        });
        
        toast.success(`Successfully Punched ${type === 'in' ? 'In' : 'Out'}!`);
        fetchPunchStatus();
      } catch (err) {
        console.error(err);
        const errMsg = err.response?.data?.message || `Failed to punch ${type}`;
        
        if (errMsg.includes('too far') || errMsg.includes('Location is required') || errMsg.includes('already punched in') || errMsg.includes('punch in first')) {
          Swal.fire({
            icon: 'error',
            title: 'Action Failed',
            text: errMsg,
            confirmButtonColor: '#5a4bda'
          });
        } else {
          toast.error(errMsg);
        }
      } finally {
        setIsPunching(false);
      }
    }, (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Location Required',
        text: 'Location access denied. Please allow location access to punch in/out.',
        confirmButtonColor: '#5a4bda'
      });
      setIsPunching(false);
    }, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const getHeaderContent = () => {
    const roleStr = localStorage.getItem('role') || 'Admin';
    const formattedRole = roleStr.charAt(0).toUpperCase() + roleStr.slice(1);
    const userStr = localStorage.getItem('user');
    let userName = formattedRole;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userName = user.name || user.studentName || formattedRole;
      } catch (e) {}
    }

    switch (location.pathname) {
      case '/dashboard':
      case '/':
        return { title: `Good Morning, ${userName.split(' ')[0]}!`, subtitle: "Here's your latest overview." };
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
        return { title: `${formattedRole} Profile`, subtitle: 'Home > Profile', isBreadcrumb: true };
      case '/notifications':
        return { title: 'Notifications', subtitle: 'Home > Notifications', isBreadcrumb: true };
      case '/student-portal':
        return { title: `Welcome, ${userName}`, subtitle: 'Student Portal Dashboard', isBreadcrumb: true };
      default:
        return { title: 'Dashboard', subtitle: 'Welcome to the panel' };
    }
  };

  const { title, subtitle, isBreadcrumb, actionButton } = getHeaderContent();

  return (
    <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0 shadow-sm z-30">
      <div className="flex items-center gap-2 md:gap-4 min-w-0 pr-2">
        <button onClick={onMenuClick} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 flex-shrink-0 transition-colors">
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-[16px] md:text-[20px] font-bold text-[#111827] font-['Outfit'] truncate">{title}</h1>
          <p className={`text-[11px] md:text-[12px] font-['Inter'] mt-0.5 truncate ${isBreadcrumb ? 'text-[#0A6C54] font-semibold' : 'text-gray-500'}`}>
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

        {/* Geofence Punch In/Out Button */}
        {!isStudent && punchStatus !== 'punched-out' && (
          <button 
            onClick={() => handlePunch(punchStatus === 'none' ? 'in' : 'out')}
            disabled={isPunching || punchStatus === null}
            className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[12px] md:text-[13px] font-bold flex items-center gap-1.5 transition-colors shadow-sm font-['Inter']
              ${punchStatus === 'none' ? 'bg-[#5a4bda] hover:bg-[#4d3ecc] text-white' : 
                punchStatus === 'punched-in' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 
                'bg-gray-100 text-gray-400'}`}
          >
            {isPunching ? (
              <span className="animate-pulse">Locating...</span>
            ) : punchStatus === 'none' ? (
              <><MapPin size={16} /> <span className="hidden sm:inline">Punch In</span></>
            ) : punchStatus === 'punched-in' ? (
              <><CheckCircle size={16} /> <span className="hidden sm:inline">Punch Out</span></>
            ) : (
              'Loading...'
            )}
          </button>
        )}
        <button 
          onClick={toggleFullScreen}
          className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-50"
          title="Toggle Fullscreen"
        >
          <Maximize size={20} strokeWidth={1.8} />
        </button>

        {/* <button 
          onClick={() => navigate('/notifications')}
          className="relative text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Bell size={20} strokeWidth={1.5} />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button> */}
        
        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 pl-4 border-l border-gray-100 cursor-pointer group"
        >
          {(() => {
            const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
            const userName = adminInfo.name || 'Admin User';
            const userRole = adminInfo.role || 'college_admin';
            const displayRole = userRole === 'college_admin' ? 'College Admin' : userRole;
            const initial = userName.charAt(0).toUpperCase();
            return (
              <>
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#0A6C54] text-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                  <span className="font-bold text-[13px] font-['Outfit']">{initial}</span>
                </div>
                <div className="hidden md:block">
                  <div className="text-[13px] font-bold text-gray-800 flex items-center gap-1 font-['Inter']">
                    {userName}
                    {/* <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-gray-600 transition-colors"><path d="m6 9 6 6 6-6"/></svg> */}
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium font-['Inter']">{displayRole}</div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </header>
  );
};

export default Header;
