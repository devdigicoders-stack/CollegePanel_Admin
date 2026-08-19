import React, { useState, useEffect } from 'react';
import { Save, User, Home, ShieldAlert } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: '',
    enrollNo: '',
    branch: '',
    semester: '',
    mobile: '',
    email: '',
    bloodGroup: '',
    fatherName: '',
    emergencyNo: '',
    address: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get('/student-portal/profile');
      const data = res.data;
      setProfile({
        name: data.studentName || '',
        enrollNo: data.studentId || '',
        branch: data.branch || '',
        semester: data.course || '',
        mobile: data.phone || '',
        email: data.email || '',
        bloodGroup: data.bloodGroup || '',
        fatherName: data.fatherName || '',
        emergencyNo: data.emergencyContact || '',
        address: data.address || ''
      });
    } catch (error) {
      toast.error('Failed to fetch profile details');
    } finally { setLoading(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put('/student-portal/profile', profile);
      toast.success('Profile contact details updated successfully.');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally { setLoading(false); }
  };

  
  if (loading) {
    return (
      <div className="p-6">
        <SkeletonLoader type="profile" rows={6} cols={5} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-[16px] font-bold text-gray-800">My Student Profile</h2>
        <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify primary academic registries and manage emergency contact directories</p>
      </div>

      <form onSubmit={handleUpdate} className="p-6 space-y-6 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Static Fields */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">Full Name (Read-Only)</label>
            <input 
              type="text" 
              readOnly 
              value={profile.name}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">Enrollment No (Read-Only)</label>
            <input 
              type="text" 
              readOnly 
              value={profile.enrollNo}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-primary font-bold font-mono"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">Branch/Department</label>
            <input 
              type="text" 
              readOnly 
              value={profile.branch}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">Current Academic Sem</label>
            <input 
              type="text" 
              readOnly 
              value={profile.semester}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-500 font-semibold"
            />
          </div>

          {/* Editable Fields */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1">Mobile Number</label>
            <input 
              type="text" 
              value={profile.mobile}
              onChange={(e) => setProfile({...profile, mobile: e.target.value})}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1">Blood Group</label>
            <input 
              type="text" 
              value={profile.bloodGroup}
              onChange={(e) => setProfile({...profile, bloodGroup: e.target.value})}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1">Father's Name</label>
            <input 
              type="text" 
              value={profile.fatherName}
              onChange={(e) => setProfile({...profile, fatherName: e.target.value})}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1">Emergency Contact No</label>
            <input 
              type="text" 
              value={profile.emergencyNo}
              onChange={(e) => setProfile({...profile, emergencyNo: e.target.value})}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-gray-600 mb-1">Communication Address</label>
          <textarea 
            value={profile.address}
            onChange={(e) => setProfile({...profile, address: e.target.value})}
            className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-20 resize-none"
          />
        </div>

        <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
          <Save size={15} /> Save Profile Changes
        </button>
      </form>
    </div>
  );
};

export default Profile;
