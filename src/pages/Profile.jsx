import React, { useState } from 'react';
import { Eye, EyeOff, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';

const Profile = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setIsUpdating(true);
      await axiosInstance.put('/college-admin/profile', {
        currentPassword,
        newPassword
      });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsUpdating(false);
    }
  };

  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
  const roleName = adminInfo.role === 'college_admin' ? 'College Admin' : (adminInfo.role || 'Staff Member');
  
  const [userName, setUserName] = useState(adminInfo.name || 'Admin User');
  const [userEmail, setUserEmail] = useState(adminInfo.email || adminInfo.adminEmail || 'admin@pccollege.edu.in');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handleProfileUpdate = async () => {
    if (!userName || !userEmail) {
      toast.error('Name and Email are required');
      return;
    }
    try {
      setIsUpdatingProfile(true);
      const res = await axiosInstance.put('/college-admin/profile', {
        name: userName,
        email: userEmail
      });
      
      // Update localStorage
      const updatedInfo = { ...adminInfo };
      if (updatedInfo.role === 'college_admin') {
        updatedInfo.name = res.data.user.name;
        updatedInfo.adminEmail = res.data.user.email;
      } else {
        updatedInfo.name = res.data.user.name;
        updatedInfo.email = res.data.user.email;
      }
      localStorage.setItem('admin_info', JSON.stringify(updatedInfo));
      
      toast.success('Profile details updated successfully!');
      // Dispatch event to notify other components (like Header/Sidebar) if they are listening
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 font-['Inter']">
      
      {/* Left Sidebar / Profile Card */}
      <div className="w-full md:w-[320px] flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-8 flex flex-col items-center text-center relative h-full">
          
          <div className="relative mb-6">
            <div className="w-28 h-28 rounded-full border-4 border-gray-50 overflow-hidden bg-gray-100">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=022A36&color=fff&size=200`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#0A6C54] rounded-full border-2 border-white flex items-center justify-center text-white hover:bg-[#085a46] transition-colors shadow-sm">
              <Camera size={14} />
            </button>
          </div>

          <h2 className="text-[20px] font-bold text-[#022A36] font-['Outfit'] mb-1">{userName}</h2>
          <p className="text-[13px] text-gray-500 font-medium mb-8">{roleName}</p>

          <div className="w-full space-y-5 text-left border-t border-gray-100 pt-6">
            <div>
              <p className="text-[12px] text-gray-400 font-semibold mb-1">Email</p>
              <p className="text-[14px] text-gray-800 font-medium truncate">{userEmail}</p>
            </div>
            {adminInfo.department && (
              <div>
                <p className="text-[12px] text-gray-400 font-semibold mb-1">Department</p>
                <p className="text-[14px] text-gray-800 font-medium truncate">{adminInfo.department}</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Basic Profile Details */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-8">
          <h3 className="text-[16px] font-bold text-[#022A36] mb-6">My Profile</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-y-6 gap-x-6 max-w-2xl">
            <label className="text-[13px] font-semibold text-gray-600">Full Name</label>
            <input 
              type="text" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
            />

            <label className="text-[13px] font-semibold text-gray-600">Email</label>
            <input 
              type="email" 
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
            />

            <label className="text-[13px] font-semibold text-gray-600">Role & Access</label>
            <input 
              type="text" 
              value={roleName}
              readOnly
              className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none cursor-not-allowed"
            />
            
            <div className="sm:col-start-2 mt-2">
              <button 
                type="button"
                onClick={handleProfileUpdate}
                disabled={isUpdatingProfile}
                className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-colors shadow-sm disabled:opacity-50"
              >
                {isUpdatingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-8">
          <h3 className="text-[16px] font-bold text-[#022A36] mb-6">Change Password</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-y-6 gap-x-6 max-w-2xl">
            
            <label className="text-[13px] font-semibold text-gray-600">Current Password</label>
            <div className="relative w-full">
              <input 
                type={showCurrentPassword ? "text" : "password"} 
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] shadow-sm pr-10"
              />
              <button 
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <label className="text-[13px] font-semibold text-gray-600">New Password</label>
            <div className="relative w-full">
              <input 
                type={showNewPassword ? "text" : "password"} 
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] shadow-sm pr-10"
              />
              <button 
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <label className="text-[13px] font-semibold text-gray-600">Confirm Password</label>
            <div className="relative w-full">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] shadow-sm pr-10"
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            
            <div className="sm:col-start-2 mt-2">
              <button 
                type="button"
                onClick={handlePasswordUpdate}
                disabled={isUpdating}
                className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-colors shadow-sm disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Update Password'}
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default Profile;
