import React, { useState } from 'react';
import { Plus, Search, ChevronDown, ChevronLeft, ChevronRight, Edit, Trash2, Copy } from 'lucide-react';

const Hods = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [hods, setHods] = useState([
    { id: 1, name: 'Dr. Sunil Tiwari', department: 'Civil Engineering', email: 'sunil.t@greenpoly.edu', mobile: '9876543210', doj: '2020-01-15', status: 'Active' },
    { id: 2, name: 'Mr. Prakash Mehra', department: 'Mechanical Engineering', email: 'prakash.m@greenpoly.edu', mobile: '9876543211', doj: '2018-07-22', status: 'Active' },
    { id: 3, name: 'Mr. Amit Gupta', department: 'Electrical Engineering', email: 'amit.g@greenpoly.edu', mobile: '9876543212', doj: '2019-11-05', status: 'Active' },
    { id: 4, name: 'Ms. Neha Verma', department: 'Computer Engineering', email: 'neha.v@greenpoly.edu', mobile: '9876543213', doj: '2021-03-10', status: 'Active' },
    { id: 5, name: 'Mr. Rajat Verma', department: 'Electronics Engg.', email: 'rajat.v@greenpoly.edu', mobile: '9876543214', doj: '2022-08-01', status: 'Active' },
  ]);

  // Form State
  const [formData, setFormData] = useState({
    name: '', department: 'Computer Engineering', email: '', mobile: '', doj: '', status: 'Active'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateHod = (e) => {
    e.preventDefault();
    const newHod = {
      id: hods.length > 0 ? Math.max(...hods.map(h => h.id)) + 1 : 1,
      name: formData.name,
      department: formData.department,
      email: formData.email,
      mobile: formData.mobile,
      doj: formData.doj,
      status: formData.status
    };
    
    setHods([...hods, newHod]);
    setIsCreating(false);
    setFormData({ name: '', department: 'Computer Engineering', email: '', mobile: '', doj: '', status: 'Active' });
  };

  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to remove this HOD?')) {
      setHods(hods.filter(h => h.id !== id));
    }
  };

  if (isCreating) {
    return (
      <div className="flex flex-col h-full font-['Inter']">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-gray-800 font-['Outfit']">Add New HOD</h2>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Left Column: HOD Information */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 sm:p-8 h-fit">
              <h3 className="text-[15px] font-bold text-[#0A6C54] mb-6">Personal Information</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Full Name<span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Department<span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] appearance-none bg-white"
                  >
                    <option>Computer Engineering</option>
                    <option>Electrical Engineering</option>
                    <option>Mechanical Engineering</option>
                    <option>Civil Engineering</option>
                    <option>Electronics Engg.</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      Date of Joining<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="date" 
                        name="doj"
                        value={formData.doj}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                      Status<span className="text-red-500">*</span>
                    </label>
                    <select 
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] appearance-none bg-white"
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                      <option>On Leave</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Email Address<span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@college.edu"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                    Mobile Number<span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54]"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Login Credentials */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 sm:p-8 h-fit">
                <h3 className="text-[15px] font-bold text-[#0A6C54] mb-6">Login Credentials <span className="font-medium text-gray-500">(Auto Generated)</span></h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <label className="w-20 text-[13px] font-semibold text-gray-700">Username</label>
                    <div className="flex-1 relative">
                      <input 
                        type="text" 
                        readOnly
                        value={formData.name ? formData.name.toLowerCase().replace(/[^a-z0-9]/g, '.') : 'auto.generated'}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-[13px] text-gray-500 bg-gray-50 outline-none pr-10"
                      />
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#0A6C54] hover:bg-green-50 rounded-md transition-colors">
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="w-20 text-[13px] font-semibold text-gray-700">Password</label>
                    <div className="flex-1 relative">
                      <input 
                        type="password" 
                        readOnly
                        value="**********"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-[13px] text-gray-500 bg-gray-50 outline-none pr-10"
                      />
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#0A6C54] hover:bg-green-50 rounded-md transition-colors">
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center cursor-pointer group">
                      <div className="relative flex items-center">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0A6C54] focus:ring-[#0A6C54] accent-[#0A6C54] cursor-pointer" />
                      </div>
                      <span className="ml-2 text-[13px] text-gray-600 font-medium group-hover:text-gray-800 transition-colors">Send credentials to email</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="mt-4 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button 
            type="button"
            onClick={() => setIsCreating(false)}
            className="px-5 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button type="button" className="px-5 py-2.5 text-[13px] font-semibold text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-sm">
            Save as Draft
          </button>
          <button onClick={handleCreateHod} className="px-6 py-2.5 text-[13px] font-semibold text-white bg-[#0A6C54] hover:bg-[#085a46] rounded-lg transition-colors shadow-sm">
            Save HOD
          </button>
        </div>
      </div>
    );
  }

  // --- Table View ---
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Filters Top Row */}
      <div className="p-5 flex flex-col md:flex-row gap-4 justify-between items-center border-b border-gray-50">
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search HOD by name or department..." 
            className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] placeholder:text-gray-400 shadow-sm"
          />
        </div>

        <button 
          onClick={() => setIsCreating(true)}
          className="w-full md:w-auto bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add HOD
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[5%]">#</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[18%]">HOD Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[18%]">Department</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[15%]">Email</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[12%]">Mobile</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[12%]">Date of Joining</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[10%]">Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[10%] text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {hods.map((row, index) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-600">{index + 1}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-medium">{row.name}</td>
                <td className="py-4 px-6 text-[13px] text-[#0A6C54] font-medium">{row.department}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.email}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.mobile}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.doj}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${
                    row.status === 'Active' ? 'text-green-700 bg-green-50' : 
                    row.status === 'Inactive' ? 'text-red-700 bg-red-50' : 
                    'text-orange-700 bg-orange-50'
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-3">
                    <button className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                      <Edit size={14} strokeWidth={2} />
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="w-7 h-7 rounded border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors bg-red-50/50">
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {hods.length === 0 && (
              <tr>
                <td colSpan="8" className="py-8 text-center text-gray-500 text-[14px]">
                  No HODs found. Click "Add HOD" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Hods;
