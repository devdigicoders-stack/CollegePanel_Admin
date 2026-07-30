import React, { useState } from 'react';
import { Save, User, Home, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: 'Amit Sharma',
    enrollNo: 'OP/23/CS/001',
    branch: 'Computer Science & Engineering',
    semester: '4th Semester',
    mobile: '9988776655',
    email: 'amit.cs23@college.edu',
    bloodGroup: 'O+ve',
    fatherName: 'Rajesh Sharma',
    emergencyNo: '9988776611',
    address: 'Sector 15, H.No 120, Noida, UP'
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    toast.success('Profile contact details updated successfully.');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-[16px] font-bold text-gray-800">My Student Profile</h2>
        <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify primary academic registries and manage emergency contact directories</p>
      </div>

      <form onSubmit={handleUpdate} className="p-6 space-y-6 flex-1 overflow-y-auto max-w-2xl">
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
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-[#0A6C54] font-bold font-mono"
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

        <button type="submit" className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
          <Save size={15} /> Save Profile Changes
        </button>
      </form>
    </div>
  );
};

export default Profile;
