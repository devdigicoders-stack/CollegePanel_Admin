import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronDown, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, MoreHorizontal 
} from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

const Admissions = () => {
  const [activeTab, setActiveTab] = useState('Enquiry');
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [statusFilter, setStatusFilter] = useState('All Status');

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/admissions');
      setAdmissions(res.data);
    } catch (error) {
      toast.error('Failed to fetch admissions');
    } finally {
      setLoading(false);
    }
  };

  const getTabCount = (tabName) => admissions.filter(a => a.stage === tabName).length;

  const tabs = [
    { name: 'Enquiry', count: getTabCount('Enquiry') },
    { name: 'Application', count: getTabCount('Application') },
    { name: 'Document Verification', count: getTabCount('Document Verification') },
    { name: 'Admitted', count: getTabCount('Admitted') },
    { name: 'Cancelled', count: getTabCount('Cancelled') },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return 'text-[#0ea5e9] bg-[#e0f2fe]';
      case 'In Progress': return 'text-[#0f766e] bg-[#ccfbf1]';
      case 'Pending': return 'text-[#d97706] bg-[#fef3c7]';
      case 'Confirmed': return 'text-[#15803d] bg-[#dcfce3]';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredAdmissions = admissions.filter(a => {
    const matchesTab = a.stage === activeTab;
    const matchesCourse = courseFilter === 'All Courses' || a.course === courseFilter;
    const matchesStatus = statusFilter === 'All Status' || a.status === statusFilter;
    const matchesSearch = 
      a.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.mobile?.includes(searchQuery) ||
      a.appNo?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesCourse && matchesStatus && matchesSearch;
  });

  // Extract unique courses from admissions for the filter dropdown
  const uniqueCourses = [...new Set(admissions.map(a => a.course))];

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Tabs */}
      <div className="flex px-6 pt-2 border-b border-gray-100 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`whitespace-nowrap px-4 py-4 text-[14px] font-semibold transition-all relative ${
              activeTab === tab.name 
                ? 'text-[#0A6C54]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.name} ({tab.count})
            {activeTab === tab.name && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0A6C54] rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="p-5 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative">
            <select 
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer w-full sm:w-auto"
            >
              <option value="All Courses">All Courses</option>
              {uniqueCourses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer w-full sm:w-auto"
            >
              <option value="All Status">All Status</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
          
          <div className="hidden md:block">
             <input type="date" className="bg-[#F9FAFB] border border-gray-200 text-gray-500 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] w-[140px]" />
          </div>
        </div>

        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or mobile" 
            className="w-full sm:w-[260px] bg-[#F9FAFB] border border-gray-200 text-gray-700 py-2.5 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto relative">
        {loading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10"><div className="w-8 h-8 border-4 border-[#0A6C54] border-t-transparent rounded-full animate-spin"></div></div>}
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-[#F9FAFB] border-y border-gray-100">
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[5%]">#</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%]">Application No.</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[18%]">Name</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%]">Course</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[12%]">Mobile</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[15%]">Current Stage</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[10%]">Status</th>
              <th className="py-4 px-6 text-[13px] font-bold text-gray-800 w-[10%]">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmissions.length > 0 ? filteredAdmissions.map((row, index) => (
              <tr key={row._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-600">{index + 1}</td>
                <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54] cursor-pointer hover:underline">{row.appNo}</td>
                <td className="py-4 px-6 text-[13px] text-gray-800 font-medium">{row.name}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.course}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.mobile}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600">{row.stage}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide ${getStatusColor(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-full border border-green-100 flex items-center justify-center text-[#0A6C54] hover:bg-green-50 transition-colors">
                      <Eye size={14} strokeWidth={2} />
                    </button>
                    <button className="w-8 h-8 rounded-full border border-green-100 flex items-center justify-center text-[#0A6C54] hover:bg-green-50 transition-colors">
                      <Edit size={14} strokeWidth={2} />
                    </button>
                    <button className="w-8 h-8 rounded-full border border-green-100 flex items-center justify-center text-[#0A6C54] hover:bg-green-50 transition-colors">
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" className="py-8 text-center text-[13px] text-gray-500">
                  {loading ? 'Loading admissions...' : 'No records found in this stage.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-gray-100 gap-4">
        <div className="text-[13px] text-gray-500 font-medium">
          Showing {filteredAdmissions.length} entries
        </div>
        <div className="flex items-center gap-1.5">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300">
            <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0A6C54] text-white font-medium text-[13px]">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default Admissions;
