import { Menu, Plus, Maximize, Bell, Volume2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { playNotificationSound } from '../context/SocketContext';


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
      let url = '/notifications/live';
      if (isStudent) url = '/student-portal/live-notifications';
      else if (isTeacher) url = '/teacher-portal/live-notifications';
      
      const res = await axiosInstance.get(url);
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching live notifications', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleNewNotification = () => {
      fetchNotifications();
    };

    window.addEventListener('live-notification', handleNewNotification);
    window.addEventListener('admissions_updated', handleNewNotification);
    window.addEventListener('materials_updated', handleNewNotification);
    window.addEventListener('assignments_updated', handleNewNotification);
    window.addEventListener('notices_updated', handleNewNotification);
    window.addEventListener('student_content_updated', handleNewNotification);

    // Synchronize unread badge periodically every 20 seconds
    const interval = setInterval(fetchNotifications, 20000);

    return () => {
      window.removeEventListener('live-notification', handleNewNotification);
      window.removeEventListener('admissions_updated', handleNewNotification);
      window.removeEventListener('materials_updated', handleNewNotification);
      window.removeEventListener('assignments_updated', handleNewNotification);
      window.removeEventListener('notices_updated', handleNewNotification);
      window.removeEventListener('student_content_updated', handleNewNotification);
      clearInterval(interval);
    };
  }, []);

  const resolveNotificationLink = (n, role = '') => {
    const roleLower = (role || '').toLowerCase();
    const isStudentUser = roleLower === 'student';
    const isTeacherUser = roleLower.includes('teacher');
    const type = (n.type || '').toLowerCase();

    if (type === 'assignment') {
      if (isStudentUser) return '/student/assignments';
      if (isTeacherUser) return '/teacher-portal/assignments';
      return '/assignments';
    }
    if (type === 'studymaterial' || type === 'material') {
      if (isStudentUser) return '/student/materials';
      if (isTeacherUser) return '/teacher-portal/study-materials';
      return '/study-materials';
    }
    if (type === 'notice') {
      if (isStudentUser) return '/student/notices';
      if (isTeacherUser) return '/teacher-portal/notices';
      if (roleLower.includes('warden')) return '/hostel-warden/notices';
      return '/notice';
    }
    if (type === 'admission') {
      if (isStudentUser) return '/student/dashboard';
      return '/admissions/applications';
    }
    if (type === 'complaint') {
      if (isStudentUser) return '/student/complaints';
      if (isTeacherUser) return '/teacher-portal/complaints';
      return '/complaints';
    }
    if (type.includes('hostel')) {
      if (isStudentUser) return '/student/hostel';
      if (roleLower.includes('warden')) return '/hostel-warden/leave-outing';
      return '/hostel';
    }

    if (n.link) {
      if (isStudentUser) {
        if (n.link.startsWith('/student-portal/')) return n.link.replace('/student-portal/', '/student/');
        if (!n.link.startsWith('/student')) {
          if (n.link.includes('assignment')) return '/student/assignments';
          if (n.link.includes('material')) return '/student/materials';
          if (n.link.includes('notice')) return '/student/notices';
          return '/student/dashboard';
        }
        return n.link;
      }
      if (isTeacherUser) {
        if (n.link.includes('assignment')) return '/teacher-portal/assignments';
        if (n.link.includes('material')) return '/teacher-portal/study-materials';
        if (n.link.includes('notice')) return '/teacher-portal/notices';
        return '/teacher-portal/dashboard';
      }
      if (n.link.includes('assignment')) return '/assignments';
      if (n.link.includes('material')) return '/study-materials';
      if (n.link.includes('notice')) return '/notice';
      if (n.link.includes('admission')) return '/admissions/applications';
      return n.link;
    }

    return isStudentUser ? '/student/dashboard' : '/dashboard';
  };

  const handleNotificationClick = async (n) => {
    setShowNotifications(false);
    const targetLink = resolveNotificationLink(n, userRole);

    // Optimistically mark as read in local UI state
    setNotifications(prev => prev.map(item => item._id === n._id ? { ...item, isRead: true } : item));

    // Persist single notification as read on backend
    try {
      let markUrl = '/notifications/live/mark-read';
      if (isStudent) markUrl = '/student-portal/live-notifications';
      else if (isTeacher) markUrl = '/teacher-portal/live-notifications';
      await axiosInstance.put(markUrl, { id: n._id });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }

    if (targetLink) {
      navigate(targetLink);
    }
  };

  const handleMarkAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      let url = '/notifications/live/mark-read';
      if (isStudent) url = '/student-portal/live-notifications';
      else if (isTeacher) url = '/teacher-portal/live-notifications';
      
      await axiosInstance.put(url);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
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
      case '/library/dashboard':
        return { title: 'Library Dashboard', subtitle: 'Library > Dashboard', isBreadcrumb: true };
      case '/library/books':
        return { title: 'Books Catalog', subtitle: 'Library > Books Catalog', isBreadcrumb: true };
      case '/library/issue-return':
        return { title: 'Issue & Return', subtitle: 'Library > Circulation', isBreadcrumb: true };
      case '/library/fines':
        return { title: 'Penalties & Fines', subtitle: 'Library > Fines Management', isBreadcrumb: true };
      case '/library/lost-damaged':
        return { title: 'Lost & Damaged Books', subtitle: 'Library > Lost / Damaged Registry', isBreadcrumb: true };
      case '/library/reports':
        return { title: 'Library Reports', subtitle: 'Library > Reports & Analytics', isBreadcrumb: true };
      case '/hostel':
      case '/hostel-warden':
      case '/hostel-warden/dashboard':
        return { title: 'Hostel Dashboard', subtitle: 'Hostel > Dashboard', isBreadcrumb: true };
      case '/hostel-warden/rooms':
        return { title: 'Rooms & Beds', subtitle: 'Hostel > Rooms & Beds', isBreadcrumb: true };
      case '/hostel-warden/inventory':
        return { title: 'Assets & Inventory', subtitle: 'Hostel > Inventory', isBreadcrumb: true };
      case '/hostel-warden/allotment':
        return { title: 'Student Allotment', subtitle: 'Hostel > Allotment', isBreadcrumb: true };
      case '/hostel-warden/check-in-out':
        return { title: 'Check-In / Check-Out', subtitle: 'Hostel > Check-In/Out', isBreadcrumb: true };
      case '/hostel-warden/leave-outing':
        return { title: 'Leave & Outing Requests', subtitle: 'Hostel > Leave & Outings', isBreadcrumb: true };
      case '/hostel-warden/visitors':
        return { title: 'Visitors Gate', subtitle: 'Hostel > Visitors', isBreadcrumb: true };
      case '/hostel-warden/complaints':
        return { title: 'Room Complaints', subtitle: 'Hostel > Complaints', isBreadcrumb: true };
      case '/hostel-warden/incidents':
        return { title: 'Discipline Incidents', subtitle: 'Hostel > Incidents', isBreadcrumb: true };
      case '/hostel-warden/notices':
        return { title: 'Hostel Notices', subtitle: 'Hostel > Notice Board', isBreadcrumb: true };
      case '/hostel-warden/reports':
        return { title: 'Hostel Reports', subtitle: 'Hostel > Reports Center', isBreadcrumb: true };
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
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-xl hover:bg-gray-100 cursor-pointer"
            title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'Notifications'}
          >
            <Bell size={20} strokeWidth={1.8} className={unreadCount > 0 ? 'text-gray-900' : ''} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[19px] h-[19px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-md animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-88 max-w-[90vw] bg-white rounded-2xl shadow-[0_10px_35px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/70">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800 text-[14px]">Live Alerts</h3>
                  {unreadCount > 0 && (
                    <span className="text-[11px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playNotificationSound();
                    }}
                    title="Test Notification Chime"
                    className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-primary transition-colors bg-white px-2 py-1 rounded-md border border-gray-200 shadow-2xs font-medium cursor-pointer"
                  >
                    <Volume2 size={13} className="text-primary" />
                    <span>Test Sound</span>
                  </button>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAsRead}
                      className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-84 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-[13px] flex flex-col items-center gap-2">
                    <Bell size={24} className="opacity-30" />
                    <span>No notifications right now</span>
                  </div>
                ) : (
                  notifications.map((n, i) => {
                    const iconEmoji = n.type === 'Admission' ? '🎓' : 
                      (n.type === 'StudyMaterial' ? '📚' : 
                      (n.type === 'Assignment' ? '📝' : 
                      (n.type === 'Notice' ? '📢' : 
                      (n.type === 'Complaint' ? '⚠️' : '🔔'))));
                    return (
                      <div 
                        key={n._id || i} 
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3.5 hover:bg-gray-50/80 transition-colors cursor-pointer flex gap-3 items-start ${!n.isRead ? 'bg-primary/5' : ''}`}
                      >
                        <span className="text-xl flex-shrink-0 mt-0.5">{iconEmoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-1 mb-0.5">
                            <h4 className={`text-[13px] leading-tight text-gray-900 ${!n.isRead ? 'font-bold' : 'font-semibold'}`}>
                              {n.title}
                            </h4>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[12px] text-gray-600 leading-snug line-clamp-2">{n.message}</p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(n);
                            }}
                            className="inline-flex items-center gap-1 mt-1.5 text-[11px] text-primary font-bold hover:text-primary-hover transition-colors group cursor-pointer"
                          >
                            <span>Click to view</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                          </button>
                        </div>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" title="Unread"></span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
        
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
