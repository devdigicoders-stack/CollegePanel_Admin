import { useState, useEffect } from 'react';
import { 
  Search, ChevronDown, Eye, ChevronLeft, ChevronRight, Plus, X 
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

const Students = () => {
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const initialFormState = {
    studentName: '',
    studentId: '',
    dob: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    course: '',
    branch: '',
    year: '',
    status: 'Active',
    enrollmentDate: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/students');
      setStudents(res.data);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axiosInstance.post('/students', formData);
      toast.success('Student added successfully!');
      setIsAddPanelOpen(false);
      setFormData(initialFormState);
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save student');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'text-green-700 bg-green-50';
      case 'Inactive': return 'text-red-700 bg-red-50';
      case 'Graduated': return 'text-blue-700 bg-blue-50';
      case 'Dropped': return 'text-gray-700 bg-gray-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Filters Top Row */}
      <div className="p-5 flex flex-col md:flex-row gap-4 justify-between items-center border-b border-gray-50">
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <select className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
              <option>All Departments</option>
              <option>Computer Science</option>
              <option>Electrical Engineering</option>
              <option>Mechanical Engineering</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative flex-1 md:flex-none">
            <select className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
              <option>All Semesters</option>
              <option>1st Semester</option>
              <option>2nd Semester</option>
              <option>3rd Semester</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative flex-1 md:flex-none">
            <select className="appearance-none w-full bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
              <option>Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        <button 
          onClick={() => setIsAddPanelOpen(true)}
          className="w-full md:w-auto bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Student
        </button>
      </div>

      {/* Filters Bottom Row */}
      <div className="px-5 py-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white border-b border-gray-50">
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by name or enrollment no." 
            className="w-full bg-white border border-gray-200 text-gray-700 py-2 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] placeholder:text-gray-400 shadow-sm"
          />
        </div>
        
        <div className="relative w-full sm:w-auto">
          <select className="appearance-none w-full sm:w-auto bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm">
            <option>Export</option>
            <option>Export to CSV</option>
            <option>Export to Excel</option>
            <option>Export to PDF</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto relative">
        {loading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10"><div className="w-8 h-8 border-4 border-[#0A6C54] border-t-transparent rounded-full animate-spin"></div></div>}
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[5%]">#</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[15%]">Enrollment No.</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[18%]">Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[18%]">Department</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[10%]">Course</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[8%]">Year</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[12%]">Mobile</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[8%]">Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 w-[6%] text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? students.map((row, index) => (
              <tr key={row._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-600">{index + 1}</td>
                <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54] cursor-pointer hover:underline">{row.studentId}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-medium">{row.studentName}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.branch}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.course}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.year}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.phone}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${getStatusColor(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center">
                    <button className="text-gray-400 hover:text-[#0A6C54] transition-colors p-1">
                      <Eye size={18} strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="9" className="py-8 text-center text-[13px] text-gray-500">
                  {loading ? 'Loading...' : 'No students found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-5 border-t border-gray-100 gap-4">
        <div className="text-[13px] text-gray-500 font-medium">
          Showing {students.length} entries
        </div>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0A6C54] text-white font-semibold text-[13px] transition-colors">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Slide-over Panel for Add Student */}
      {isAddPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
            onClick={() => setIsAddPanelOpen(false)}
          ></div>
          
          {/* Panel */}
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out font-['Inter']">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-[#F9FAFB]">
              <div>
                <h2 className="text-[18px] font-bold text-gray-800 font-['Outfit']">Add New Student</h2>
                <p className="text-[13px] text-gray-500 mt-1">Fill in the student details to create a new profile.</p>
              </div>
              <button 
                onClick={() => setIsAddPanelOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <form id="add-student-form" onSubmit={handleSaveStudent} className="space-y-8">
                
                {/* Basic Details Section */}
                <div>
                  <h3 className="text-[14px] font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0A6C54]"></span>
                    Basic Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Student Full Name <span className="text-red-500">*</span></label>
                      <input type="text" name="studentName" value={formData.studentName} onChange={handleInputChange} required placeholder="e.g. Rahul Sharma" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] placeholder:text-gray-400" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Enrollment No. <span className="text-red-500">*</span></label>
                      <input type="text" name="studentId" value={formData.studentId} onChange={handleInputChange} required placeholder="e.g. OP/23/CE/001" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] placeholder:text-gray-400" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Date of Birth</label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Gender</label>
                      <div className="relative">
                        <select name="gender" value={formData.gender} onChange={handleInputChange} className="appearance-none w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700 bg-white">
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Details Section */}
                <div>
                  <h3 className="text-[14px] font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0A6C54]"></span>
                    Contact Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Email Address</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="student@example.com" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] placeholder:text-gray-400" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Phone Number</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 90000 00000" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] placeholder:text-gray-400" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Full Address</label>
                      <textarea rows="3" name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter complete address..." className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] placeholder:text-gray-400 resize-none"></textarea>
                    </div>
                  </div>
                </div>

                {/* Academic Details Section */}
                <div>
                  <h3 className="text-[14px] font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0A6C54]"></span>
                    Academic Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Course <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <select name="course" value={formData.course} onChange={handleInputChange} required className="appearance-none w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700 bg-white">
                          <option value="">Select Course</option>
                          <option value="Diploma">Diploma</option>
                          <option value="B.Tech">B.Tech</option>
                          <option value="M.Tech">M.Tech</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Branch / Department</label>
                      <div className="relative">
                        <select name="branch" value={formData.branch} onChange={handleInputChange} className="appearance-none w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700 bg-white">
                          <option value="">Select Branch</option>
                          <option value="Computer Science">Computer Science</option>
                          <option value="Electrical Engineering">Electrical Engineering</option>
                          <option value="Mechanical Engineering">Mechanical Engineering</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Academic Year / Semester</label>
                      <div className="relative">
                        <select name="year" value={formData.year} onChange={handleInputChange} className="appearance-none w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700 bg-white">
                          <option value="">Select Year/Sem</option>
                          <option value="1st Year">1st Year / 1st Sem</option>
                          <option value="2nd Year">2nd Year / 3rd Sem</option>
                          <option value="3rd Year">3rd Year / 5th Sem</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Status</label>
                      <div className="relative">
                        <select name="status" value={formData.status} onChange={handleInputChange} className="appearance-none w-full border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700 bg-white">
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Graduated">Graduated</option>
                          <option value="Dropped">Dropped</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Enrollment Date <span className="text-red-500">*</span></label>
                      <input type="date" name="enrollmentDate" value={formData.enrollmentDate} onChange={handleInputChange} required className="w-full md:w-1/2 border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] focus:border-[#0A6C54] text-gray-700" />
                    </div>
                  </div>
                </div>

              </form>
            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setIsAddPanelOpen(false)}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-[13px] font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="add-student-form"
                disabled={saving}
                className="px-6 py-2.5 rounded-lg bg-[#0A6C54] hover:bg-[#085a46] disabled:bg-[#0A6C54]/70 text-white text-[13px] font-semibold transition-colors shadow-sm flex items-center"
              >
                {saving ? 'Saving...' : 'Save Student'}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
