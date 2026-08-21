import { Menu, Plus, Maximize, Bell } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

export const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
  const userRole = adminInfo.role || 'college_admin';
  const isStudent = userRole.toLowerCase() === 'student';
  const isTeacher = userRole.toLowerCase() === 'teacher' || userRole.toLowerCase() === 'teacher role';

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      let url = '';
      if (isStudent) url = '/student-portal/live-notifications';
      else if (isTeacher) url = '/teacher-portal/live-notifications';
      
      if (url) {
        const res = await axiosInstance.get(url);
        setNotifications(res.data);
      }
    } catch (error) {
      console.error('Error fetching live notifications', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleNewNotification = (e) => {
      // Prepend new notification to state
      setNotifications(prev => [e.detail, ...prev]);
    };

    window.addEventListener('live-notification', handleNewNotification);
    return () => {
      window.removeEventListener('live-notification', handleNewNotification);
    };
  }, []);

  const handleMarkAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      let url = '';
      if (isStudent) url = '/student-portal/live-notifications';
      else if (isTeacher) url = '/teacher-portal/live-notifications';
      
      if (url) {
        await axiosInstance.put(url);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error('Error marking as read', error);
    }
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
          <p className={`text-[11px] md:text-[12px] font-['Inter'] mt-0.5 truncate ${isBreadcrumb ? 'text-primary font-semibold' : 'text-gray-500'}`}>
            {subtitle}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
        {actionButton && (
          <button className="bg-primary hover:bg-primary-hover text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[12px] md:text-[13px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm font-['Inter']">
            <Plus size={16} />
            <span className="hidden sm:inline">{actionButton}</span>
          </button>
        )}


        <button 
          onClick={toggleFullScreen}
          className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-50"
          title="Toggle Fullscreen"
        >
          <Maximize size={20} strokeWidth={1.8} />
        </button>

        {/* Notifications Dropdown */}
        {(isStudent || isTeacher) && (
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) handleMarkAsRead();
              }}
              className="relative text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-50"
            >
              <Bell size={20} strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.1)] border border-gray-100 overflow-hidden z-50">
                <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-bold text-gray-800 text-[14px]">Notifications</h3>
                  {unreadCount > 0 && <span className="text-[11px] bg-primary text-white px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-[13px]">No notifications yet</div>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={i} className={`p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-[13px] text-gray-800 ${!n.isRead ? 'font-bold' : 'font-semibold'}`}>{n.title}</h4>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[12px] text-gray-500 leading-snug line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 pl-4 border-l border-gray-100 cursor-pointer group"
        >
          {(() => {
            const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
            const userName = adminInfo.name || 'Admin User';
            const userRole = adminInfo.role || 'college_admin';
            const displayRole = adminInfo.designation === 'HOD' ? 'HOD' : (userRole === 'college_admin' ? 'College Admin' : userRole);
            const initial = userName.charAt(0).toUpperCase();
            return (
              <>
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary text-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
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
