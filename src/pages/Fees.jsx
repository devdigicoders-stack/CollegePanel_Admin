import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { checkPermission } from '../utils/checkPermission';
import AccessDenied from '../components/AccessDenied';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';

const Fees = () => {
  if (!checkPermission('View Fees') && !checkPermission('Collect Fees')) {
    return <AccessDenied />;
  }
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [studentFees, setStudentFees] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = ['Dashboard', 'Collections', 'Pending Dues', 'Receipts', 'Refunds'];

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/fees/student-fees');
      setStudentFees(res.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch fees data');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    let totalDemand = 0;
    let totalCollection = 0;
    let pendingDues = 0;
    
    studentFees.forEach(fee => {
      totalDemand += (fee.totalFee || 0);
      totalCollection += (fee.paid || 0);
      pendingDues += (fee.pending || 0);
    });

    return {
      demand: totalDemand,
      collection: totalCollection,
      pending: pendingDues,
    };
  }, [studentFees]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full font-['Inter']">
      
      {/* Tabs */}
      <div className="flex px-6 border-b border-gray-100 pt-2 flex-shrink-0">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-[14px] font-semibold transition-colors relative ${
              activeTab === tab 
                ? 'text-[#0A6C54]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0A6C54] rounded-t-md"></div>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'Dashboard' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* Stats Cards Section */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[12px] font-semibold text-gray-500 mb-1 tracking-wide">Total Fee Demand</div>
              <div className="text-[22px] font-bold text-[#022A36]">{formatCurrency(stats.demand)}</div>
            </div>
            {/* Card 2 */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[12px] font-semibold text-gray-500 mb-1 tracking-wide">Total Collections</div>
              <div className="text-[22px] font-bold text-[#0A6C54]">{formatCurrency(stats.collection)}</div>
            </div>
            {/* Card 3 */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[12px] font-semibold text-gray-500 mb-1 tracking-wide">Pending Dues</div>
              <div className="text-[22px] font-bold text-[#022A36]">{formatCurrency(stats.pending)}</div>
            </div>
            {/* Card 4 */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[12px] font-semibold text-gray-500 mb-1 tracking-wide">Total Students</div>
              <div className="text-[22px] font-bold text-[#0A6C54]">{studentFees.length}</div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="px-6 pb-4 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <select className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm">
                  <option>All Courses</option>
                  <option>Diploma in CE</option>
                  <option>Diploma in EE</option>
                  <option>Diploma in ME</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>

              <div className="relative flex-1 md:flex-none">
                <select className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm">
                  <option>All Semesters</option>
                  <option>1st Semester</option>
                  <option>2nd Semester</option>
                  <option>3rd Semester</option>
                  <option>4th Semester</option>
                  <option>5th Semester</option>
                  <option>6th Semester</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>

              <div className="relative flex-1 md:flex-none">
                <select className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer shadow-sm">
                  <option>All Status</option>
                  <option>Paid</option>
                  <option>Partial</option>
                  <option>Due</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="relative w-full md:w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search by name or enrollment no." 
                className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 pl-10 pr-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] placeholder:text-gray-400 shadow-sm"
              />
            </div>
          </div>

          {/* Table */}
          <div className="px-6 pb-2 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#F9FAFB] border-y border-gray-100">
                  <th className="py-4 px-4 text-[12px] font-bold text-gray-800 w-[5%] rounded-tl-xl">#</th>
                  <th className="py-4 px-4 text-[12px] font-bold text-gray-800 w-[15%]">Enrollment No.</th>
                  <th className="py-4 px-4 text-[12px] font-bold text-gray-800 w-[18%]">Name</th>
                  <th className="py-4 px-4 text-[12px] font-bold text-gray-800 w-[15%]">Course</th>
                  <th className="py-4 px-4 text-[12px] font-bold text-gray-800 w-[12%]">Total Fees</th>
                  <th className="py-4 px-4 text-[12px] font-bold text-gray-800 w-[12%]">Paid</th>
                  <th className="py-4 px-4 text-[12px] font-bold text-gray-800 w-[12%]">Due</th>
                  <th className="py-4 px-4 text-[12px] font-bold text-gray-800 w-[8%]">Status</th>
                  <th className="py-4 px-4 text-[12px] font-bold text-gray-800 w-[3%] rounded-tr-xl"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><SkeletonLoader type="table" rows={5} cols={5} /></tr>
                ) : studentFees.length === 0 ? (
                  <tr><td colSpan="9" className="text-center py-6 text-gray-500 text-sm">No fee records found.</td></tr>
                ) : (
                  studentFees.map((row, index) => {
                    let statusColor = 'text-gray-600 bg-gray-50 border border-gray-100';
                    if (row.status === 'Paid') statusColor = 'text-green-700 bg-green-50 border border-green-100';
                    if (row.status === 'Partial') statusColor = 'text-orange-600 bg-orange-50 border border-orange-100';
                    if (row.status === 'Due' || row.status === 'Pending') statusColor = 'text-red-600 bg-red-50 border border-red-100';

                    return (
                      <tr key={row._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-4 text-[13px] text-gray-600 font-medium">{index + 1}</td>
                        <td className="py-4 px-4 text-[13px] font-semibold text-[#0A6C54] cursor-pointer hover:underline">{row.enrollNo || 'N/A'}</td>
                        <td className="py-4 px-4 text-[13px] font-medium text-gray-800">{row.studentName}</td>
                        <td className="py-4 px-4 text-[13px] text-gray-600 font-medium">{row.course}</td>
                        <td className="py-4 px-4 text-[13px] text-gray-800 font-semibold">{formatCurrency(row.totalFee)}</td>
                        <td className="py-4 px-4 text-[13px] text-gray-600 font-medium">{formatCurrency(row.paid)}</td>
                        <td className="py-4 px-4 text-[13px] text-gray-600 font-medium">{formatCurrency(row.pending)}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide ${statusColor}`}>
                            {row.status || (row.pending > 0 ? 'Due' : 'Paid')}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <MoreHorizontal size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center p-6 pt-4 mt-auto">
            <div className="text-[13px] text-gray-500 font-medium">
              Showing {studentFees.length} entries
            </div>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0A6C54] text-white font-semibold text-[13px] transition-colors">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent text-gray-600 hover:bg-gray-50 font-medium text-[13px] transition-colors">
                2
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent text-gray-600 hover:bg-gray-50 font-medium text-[13px] transition-colors">
                3
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent text-gray-600 hover:bg-gray-50 font-medium text-[13px] transition-colors">
                4
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent text-gray-600 hover:bg-gray-50 font-medium text-[13px] transition-colors">
                5
              </button>
              <div className="w-8 h-8 flex items-center justify-center text-gray-400 font-medium">
                ...
              </div>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent text-gray-600 hover:bg-gray-50 font-medium text-[13px] transition-colors">
                849
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab !== 'Dashboard' && (
        <div className="flex-1 flex items-center justify-center text-gray-500 font-medium">
          {activeTab} module is under development.
        </div>
      )}

    </div>
  );
};

export default Fees;
