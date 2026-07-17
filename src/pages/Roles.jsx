import React, { useState } from 'react';
import { Eye, UploadCloud } from 'lucide-react';

const Roles = () => {
  const [isCreating, setIsCreating] = useState(true);

  if (isCreating) {
    return (
      <div className="flex flex-col h-full font-['Inter']">
        <div className="flex flex-col mb-6">
          <h2 className="text-[20px] font-bold text-[#022A36] font-['Outfit']">Create New User</h2>
          <p className="text-[13px] text-gray-500 mt-1">Users &gt; Create User</p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 sm:p-8">
              <h3 className="text-[15px] font-bold text-[#022A36] mb-6">Personal Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Full Name<span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter full name"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Mobile Number<span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter mobile number"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Date of Birth
                  </label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Gender
                  </label>
                  <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] appearance-none bg-white">
                    <option>Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 sm:p-8">
              <h3 className="text-[15px] font-bold text-[#022A36] mb-6">Professional Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Role<span className="text-red-500">*</span>
                  </label>
                  <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] appearance-none bg-white">
                    <option>Select role</option>
                    <option>Admin</option>
                    <option>Teacher</option>
                    <option>Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Department<span className="text-red-500">*</span>
                  </label>
                  <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] appearance-none bg-white">
                    <option>Select department</option>
                    <option>Computer Engineering</option>
                    <option>Civil Engineering</option>
                    <option>Mechanical Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Qualification
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter qualification"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Joining Date
                  </label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                  />
                </div>
              </div>
            </div>

            {/* Login Information */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 sm:p-8">
              <h3 className="text-[15px] font-bold text-[#022A36] mb-6">Login Information</h3>
              
              <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Inputs Area */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      Username<span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="Enter username"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      Password<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="password" 
                        placeholder="Enter password"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] pr-10"
                      />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      Confirm Password<span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="password" 
                      placeholder="Confirm password"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                    />
                  </div>
                </div>

                {/* Profile Photo Area */}
                <div className="lg:w-48 flex flex-col">
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Profile Photo
                  </label>
                  <div className="flex-1 border border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center p-4 min-h-[100px]">
                    <button className="bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-lg text-[12px] font-medium hover:bg-gray-50 transition-colors mb-2 shadow-sm">
                      Upload Photo
                    </button>
                    <span className="text-[10px] text-gray-400 font-medium text-center">
                      PNG, JPG (Max. 2MB)
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="mt-8 flex items-center justify-center gap-3">
                <button 
                  onClick={() => setIsCreating(false)}
                  className="px-8 py-2.5 text-[13px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button className="px-8 py-2.5 text-[13px] font-semibold text-white bg-[#022A36] hover:bg-[#022a36]/90 rounded-lg transition-colors shadow-sm">
                  Save
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    );
  }

  // --- Table View Default ---
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-xl text-gray-500 mb-4">Users List</h2>
      <button 
        onClick={() => setIsCreating(true)}
        className="bg-[#0A6C54] text-white px-6 py-2 rounded-lg"
      >
        Create New User
      </button>
    </div>
  );
};

export default Roles;
