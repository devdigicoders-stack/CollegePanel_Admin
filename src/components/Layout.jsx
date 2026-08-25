import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { X, AlertTriangle, MapPin, Compass } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [permissionsKey, setPermissionsKey] = useState('');
  
  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
  const isStudent = adminInfo.role === 'Student';
  const checkSessionLocation = () => sessionStorage.getItem('location_granted') === 'true';
  const [locationGranted, setLocationGranted] = useState(!isStudent ? true : checkSessionLocation());
  const [locationError, setLocationError] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [isInitializingLocation, setIsInitializingLocation] = useState(isStudent && !checkSessionLocation());

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Apply dynamic theme based on role
    const role = adminInfo.role || 'college_admin';
    let theme = 'admin';
    if (role === 'Student') theme = 'student';
    else if (role === 'Teacher Role' || role === 'Teacher') theme = 'teacher';
    else if (role === 'Security') theme = 'security';
    else if (role === 'Hostel Warden') theme = 'hostel_warden';
    
    document.documentElement.setAttribute('data-theme', theme);

    // Fully dynamic location check via browser system API
    if (isStudent && !checkSessionLocation() && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          // If already granted, silently fetch actual location to verify OS-level access
          navigator.geolocation.getCurrentPosition(
            () => {
              sessionStorage.setItem('location_granted', 'true');
              setLocationGranted(true);
              setIsInitializingLocation(false);
            },
            () => {
              setLocationGranted(false);
              setIsInitializingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
          );
        } else {
          // Prompt needed or denied
          setLocationGranted(false);
          setIsInitializingLocation(false);
        }
        
        result.addEventListener('change', () => {
          if (result.state === 'denied' || result.state === 'prompt') {
            sessionStorage.removeItem('location_granted');
            setLocationGranted(false);
          } else if (result.state === 'granted') {
             navigator.geolocation.getCurrentPosition(() => {
               sessionStorage.setItem('location_granted', 'true');
               setLocationGranted(true);
             });
          }
        });
      }).catch(() => {
        setIsInitializingLocation(false);
      });
    } else if (isStudent && !checkSessionLocation()) {
      setIsInitializingLocation(false);
    }

    const syncPermissions = async () => {
      try {
        const res = await axiosInstance.get('/college-admin/me');
        const latestData = res.data;
        const currentInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
        
        const latestPerms = latestData.permissions || [];
        const currentPerms = currentInfo.permissions || [];
        
        // Check if permissions have changed
        const isIdentical = latestPerms.length === currentPerms.length &&
          latestPerms.every((val, index) => val === currentPerms[index]);
          
        if (!isIdentical) {
          const updatedInfo = { ...currentInfo, permissions: latestPerms };
          localStorage.setItem('admin_info', JSON.stringify(updatedInfo));
          setPermissionsKey(JSON.stringify(latestPerms));
        }
      } catch (error) {
        console.error('Failed to sync permissions:', error);
      }
    };
    
    syncPermissions();
  }, [location.pathname]);

  const handleLogoutConfirm = () => {
    // Clear all auth data from localStorage
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
    
    // Show success message
    toast.success('Logged out successfully!');
    
    // Close modal
    setShowLogoutModal(false);
    
    // Redirect to login page
    navigate('/login', { replace: true });
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const requestLocation = () => {
    setGettingLocation(true);
    setLocationError(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location accessed:', position.coords.latitude, position.coords.longitude);
          sessionStorage.setItem('location_granted', 'true');
          setLocationGranted(true);
          setGettingLocation(false);
        },
        (error) => {
          console.error('Location error:', error);
          let errorMsg = 'Failed to get location.';
          if (error.code === 1) errorMsg = 'You must allow location access to continue.';
          else if (error.code === 2) errorMsg = 'Location unavailable.';
          else if (error.code === 3) errorMsg = 'Location request timed out.';
          setLocationError(errorMsg);
          setGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
      setGettingLocation(false);
    }
  };

  // Location Guard Screen for Students
  if (isStudent && !locationGranted) {
    if (isInitializingLocation) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-['Inter']">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            <p className="text-gray-500 font-medium text-sm">Verifying system location...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-['Inter']">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <MapPin className="text-blue-500 relative z-10" size={40} />
            {gettingLocation && (
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            )}
          </div>
          
          <h2 className="text-2xl font-black text-gray-800 mb-2">Location Required</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            For security and attendance verification, you must allow live location access to enter the Student Portal.
          </p>

          {locationError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium mb-6 flex items-center gap-2 text-left">
              <AlertTriangle size={16} className="shrink-0" />
              {locationError}
            </div>
          )}

          <div className="space-y-3">
            <button 
              onClick={requestLocation}
              disabled={gettingLocation}
              className="w-full py-3 px-4 bg-primary hover:bg-primary-hover disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              <Compass size={18} />
              {gettingLocation ? 'Detecting Location...' : 'Grant Location Access'}
            </button>
            <button 
              onClick={handleLogoutConfirm}
              className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all"
            >
              Logout / Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-['Inter'] overflow-hidden relative print:h-auto print:overflow-visible print:bg-white">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 print:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out h-full print:hidden
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar key={permissionsKey} isOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} onLogoutClick={() => setShowLogoutModal(true)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden w-full print:overflow-visible">
        <div className="print:hidden">
          <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8F9FA] p-4 md:p-6 print:overflow-visible print:bg-white print:p-0">
          {children}
        </main>

        {/* Footer */}
        <footer className="print:hidden flex-shrink-0 text-gray-600 py-2.5 px-6 flex items-center justify-center gap-2 text-[14px] font-semibold tracking-wide select-none border-t border-gray-200">
          <span>Crafted with</span>
          <span className="text-red-500 text-base animate-pulse">♥</span>
          <span>by</span>
          <a
            href="https://DigiCoders.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline underline-offset-2 text-red-500 hover:text-red-600 transition-colors duration-200"
          >
            Team DigiCoders
          </a>
        </footer>
      </div>

      {/* Logout Confirmation Modal - Full Page */}
      {showLogoutModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
            onClick={handleLogoutCancel}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-red-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle size={20} className="text-red-600" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-[16px]">Confirm Logout</h3>
                </div>
                <button 
                  onClick={handleLogoutCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-6">
                <p className="text-[14px] text-gray-600 leading-relaxed">
                  Are you sure you want to logout? You will need to login again to access the admin panel.
                </p>
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button 
                  onClick={handleLogoutCancel}
                  className="flex-1 px-4 py-2.5 text-[13px] font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogoutConfirm}
                  className="flex-1 px-4 py-2.5 text-[13px] font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm"
                >
                  Yes, Logout
                </button>
              </div>

            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in-95 {
          from { transform: scale(0.95); }
          to { transform: scale(1); }
        }
        .animate-in {
          animation: fade-in 0.2s ease-out, zoom-in-95 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Layout;
