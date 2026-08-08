import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [permissionsKey, setPermissionsKey] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
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
