import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Eye, Download, FileText, CheckCircle, Clock, AlertCircle, DollarSign, X } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const Payroll = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterMonth, setFilterMonth] = useState('January 2024');
  const [showModal, setShowModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterStatus !== 'All') params.status = filterStatus;
      if (filterMonth) params.month = filterMonth;
      const res = await axiosInstance.get('/fees/payroll', { params });
      setData(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Failed to fetch payroll');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, filterStatus, filterMonth]);

  const filtered = data.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(search.toLowerCase()) || 
                          item.empId?.toLowerCase().includes(search.toLowerCase()) || 
                          item.designation?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    const matchesMonth = item.month === filterMonth;
    return matchesSearch && matchesStatus && matchesMonth;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Payroll Management</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Manage employee basic salaries, allowances, deductions, and generate payslips</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => toast.success('Exporting...')} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export
          </button>
          <button onClick={() => toast.success('Payroll processing started')} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <DollarSign size={16} /> Process Payroll
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by employee name, ID or designaton..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
          />
        </div>

        <div className="flex gap-3">
          <select 
            value={filterMonth} 
            onChange={(e) => setFilterMonth(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option value="January 2024">January 2024</option>
            <option value="December 2023">December 2023</option>
            <option value="November 2023">November 2023</option>
          </select>

          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Processing">Processing</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={9} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Employee ID</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Employee Name</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Designation</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Basic Pay</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Allowances</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Deductions</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Net Salary</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Status</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id || item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-semibold text-[#0A6C54]">{item.empId}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-medium">{item.name}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.designation}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800">₹{(item.basic || 0).toLocaleString()}</td>
                  <td className="py-4 px-6 text-[13px] text-green-600 font-medium">+₹{(item.allowances || 0).toLocaleString()}</td>
                  <td className="py-4 px-6 text-[13px] text-red-500 font-medium">-₹{(item.deductions || 0).toLocaleString()}</td>
                  <td className="py-4 px-6 text-[13px] font-bold text-gray-900">₹{(item.net || 0).toLocaleString()}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      item.status === 'Paid' ? 'bg-green-50 text-green-700 border border-green-100' :
                      item.status === 'Processing' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      'bg-yellow-50 text-yellow-700 border border-yellow-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 flex gap-2">
                    <button onClick={() => { setSelectedPayslip(item); setShowModal(true); }} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="View Payslip"><Eye size={15} /></button>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg text-[#0A6C54] transition-colors" title="Download Payslip"><FileText size={15} /></button>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={9} className="py-8 text-center text-gray-500 text-[13px]">No payroll records found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Payslip View Modal */}
      {showModal && selectedPayslip && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Employee Payslip</h3>
              <button onClick={() => { setShowModal(false); setSelectedPayslip(null); }} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* College Info */}
              <div className="text-center border-b border-dashed border-gray-200 pb-4">
                <h4 className="font-bold text-gray-800 text-[16px] uppercase">Polytechnic College ERP</h4>
                <p className="text-[11px] text-gray-500">Campus Address Road, City, State - Pin Code</p>
                <p className="text-[12px] font-semibold text-[#0A6C54] mt-2">PAYSLIP FOR THE MONTH OF {(selectedPayslip.month || '').toUpperCase()}</p>
              </div>

              {/* Employee Details */}
              <div className="grid grid-cols-2 gap-y-3 text-[13px] border-b border-dashed border-gray-200 pb-4">
                <div><span className="text-gray-500 font-medium">Employee Name:</span> <span className="text-gray-800 font-semibold">{selectedPayslip.name}</span></div>
                <div><span className="text-gray-500 font-medium">Employee ID:</span> <span className="text-gray-800 font-semibold">{selectedPayslip.empId}</span></div>
                <div><span className="text-gray-500 font-medium">Designation:</span> <span className="text-gray-800 font-semibold">{selectedPayslip.designation}</span></div>
                <div><span className="text-gray-500 font-medium">Payment Date:</span> <span className="text-gray-800 font-semibold">{selectedPayslip.datePaid}</span></div>
              </div>

              {/* Earnings & Deductions Tables */}
              <div className="grid grid-cols-2 gap-6 text-[13px]">
                <div className="space-y-2.5">
                  <h5 className="font-bold text-gray-800 uppercase tracking-wide text-[11px]">Earnings</h5>
                  <div className="flex justify-between border-b border-gray-100 py-1">
                    <span className="text-gray-600">Basic Pay</span>
                    <span className="font-semibold text-gray-800">₹{(selectedPayslip.basic || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 py-1">
                    <span className="text-gray-600">Allowances</span>
                    <span className="font-semibold text-gray-800">₹{(selectedPayslip.allowances || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h5 className="font-bold text-gray-800 uppercase tracking-wide text-[11px]">Deductions</h5>
                  <div className="flex justify-between border-b border-gray-100 py-1">
                    <span className="text-gray-600">Tax & Provident Fund</span>
                    <span className="font-semibold text-gray-800">₹{(selectedPayslip.deductions || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net Salary Summary */}
              <div className="bg-[#0A6C54]/5 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <div className="text-[11px] uppercase tracking-wide font-bold text-[#0A6C54]">Net Salary Payable</div>
                  <div className="text-[12px] text-gray-500 font-medium mt-0.5">Transfer amount to employee account</div>
                </div>
                <div className="text-[20px] font-bold text-[#0A6C54]">
                  ₹{(selectedPayslip.net || 0).toLocaleString()}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => { setShowModal(false); setSelectedPayslip(null); }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold"
                >
                  Print Payslip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;

