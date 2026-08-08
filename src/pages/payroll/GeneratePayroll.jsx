import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calculator, CheckCircle, FileText } from 'lucide-react';
import SkeletonLoader from '../../components/SkeletonLoader';

const GeneratePayroll = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    employeeId: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const empData = res.data.data || res.data.employees || res.data;
      setEmployees(Array.isArray(empData) ? empData : []);
    } catch (error) {
      toast.error('Failed to load employees');
    }
  };

  const handlePreview = async () => {
    if (!filters.employeeId) return toast.error('Please select an employee');
    
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/payroll/preview`, filters, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPreviewData(res.data);
    } catch (error) {
      setPreviewData(null);
      toast.error(error.response?.data?.message || 'Error generating preview');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      await axios.post(`${import.meta.env.VITE_API_URL}/payroll/generate`, filters, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Payroll generated successfully');
      setPreviewData(null); // Clear preview after generation
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error generating payroll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter'] overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Generate Payroll</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Calculate and generate monthly salary for employees</p>
        </div>
      </div>

      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1">Select Month</label>
            <select value={filters.month} onChange={e => setFilters({...filters, month: Number(e.target.value)})} className="w-40 px-3 py-2 border rounded-lg text-[13px]">
              {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1">Select Year</label>
            <select value={filters.year} onChange={e => setFilters({...filters, year: Number(e.target.value)})} className="w-32 px-3 py-2 border rounded-lg text-[13px]">
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[12px] font-semibold text-gray-700 mb-1">Select Employee</label>
            <select value={filters.employeeId} onChange={e => setFilters({...filters, employeeId: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-[13px]">
              <option value="">Select an employee...</option>
              {employees.map(e => <option key={e._id} value={e._id}>{e.name} ({e.empId}) - {e.department}</option>)}
            </select>
          </div>
          <button onClick={handlePreview} disabled={loading} className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-2 h-[38px]">
            <Calculator size={16} /> {loading && !previewData ? 'Calculating...' : 'Preview Payroll'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        {loading && !previewData ? (
          <SkeletonLoader type="card" count={1} />
        ) : previewData ? (
          <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-[#0A6C54]/5 flex justify-between items-center">
              <div>
                <h3 className="text-[16px] font-bold text-[#0A6C54]">Payroll Preview</h3>
                <p className="text-[12px] text-gray-600 mt-1">{previewData.employee?.name} ({previewData.employee?.empId}) • {new Date(0, previewData.month - 1).toLocaleString('default', { month: 'long' })} {previewData.year}</p>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[11px] font-bold tracking-wide">DRAFT</span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Attendance & Earnings */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-[13px] font-bold text-gray-800 mb-3 uppercase tracking-wider border-b pb-2">Attendance Summary</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-[11px] text-gray-500 font-medium">Calendar Days</p>
                      <p className="text-[16px] font-bold text-gray-800">{previewData.attendanceSummary.calendarDays}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                      <p className="text-[11px] text-green-700 font-medium">Present</p>
                      <p className="text-[16px] font-bold text-green-800">{previewData.attendanceSummary.presentDays}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                      <p className="text-[11px] text-red-700 font-medium">Absent (LOP)</p>
                      <p className="text-[16px] font-bold text-red-800">{previewData.attendanceSummary.unpaidLeaveDays}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[13px] font-bold text-gray-800 mb-3 uppercase tracking-wider border-b pb-2">Earnings</h4>
                  <div className="space-y-2">
                    {previewData.earnings.map(e => (
                      <div key={e.code} className="flex justify-between items-center text-[13px]">
                        <span className="text-gray-600">{e.name}</span>
                        <span className="font-medium text-gray-800">₹{e.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center text-[13px] font-bold pt-2 border-t border-gray-100 mt-2 text-green-700">
                      <span>Total Earnings</span>
                      <span>₹{previewData.totalEarnings.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Deductions & Net */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-[13px] font-bold text-gray-800 mb-3 uppercase tracking-wider border-b pb-2">Deductions</h4>
                  <div className="space-y-2">
                    {previewData.deductions.map(d => (
                      <div key={d.code} className="flex justify-between items-center text-[13px]">
                        <span className="text-gray-600">{d.name} {d.code === 'LOP' ? `(${previewData.attendanceSummary.unpaidLeaveDays} days)` : ''}</span>
                        <span className="font-medium text-red-600">-₹{d.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    {previewData.deductions.length === 0 && <p className="text-[12px] text-gray-400">No deductions</p>}
                    
                    <div className="flex justify-between items-center text-[13px] font-bold pt-2 border-t border-gray-100 mt-2 text-red-700">
                      <span>Total Deductions</span>
                      <span>₹{previewData.totalDeductions.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0A6C54] text-white p-5 rounded-xl shadow-md">
                  <p className="text-[12px] text-[#0A6C54] text-green-100 font-medium uppercase tracking-wider mb-1">Net Payable Salary</p>
                  <p className="text-[28px] font-bold">₹{previewData.netSalary.toLocaleString()}</p>
                  <p className="text-[11px] text-green-100 mt-2 opacity-80">This amount will be transferred to the employee.</p>
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setPreviewData(null)} className="px-5 py-2 border rounded-lg text-[13px] font-medium text-gray-700 hover:bg-white transition-colors">Discard Preview</button>
              <button onClick={handleGenerate} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-6 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-2 shadow-sm transition-colors">
                <CheckCircle size={16} /> Confirm & Generate Payroll
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText size={24} className="text-gray-400" />
            </div>
            <h3 className="text-[16px] font-bold text-gray-800 mb-2">No Preview Generated</h3>
            <p className="text-[13px] text-gray-500">Select an employee and period above, then click 'Preview Payroll' to calculate and review their salary before finalizing.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratePayroll;
