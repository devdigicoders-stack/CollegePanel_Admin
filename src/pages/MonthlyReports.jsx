import { useState, useEffect } from 'react';
import { Download, Search } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

function MonthlyReports() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [month, setMonth] = useState(currentMonth.toString());
  const [year, setYear] = useState(currentYear.toString());
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await axiosInstance.get('/employees');
      setEmployees(data.data || []);
      if (data.data?.length > 0) {
        setSelectedEmployee(data.data[0]._id);
      }
    } catch (error) {
      toast.error('Failed to load employees');
    }
  };

  const generateReport = async () => {
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/punch/reports/monthly', {
        params: { employeeId: selectedEmployee, month, year }
      });
      setReportData(data);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate report');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!reportData || !reportData.dailyLogs) return;

    const headers = ['Date', 'Punch In', 'Punch Out', 'Status'];
    const rows = reportData.dailyLogs.map(log => {
      const dateStr = new Date(log.date).toLocaleDateString('en-IN');
      const inStr = log.punchIn ? new Date(log.punchIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
      const outStr = log.punchOut ? new Date(log.punchOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
      return [dateStr, inStr, outStr, log.status];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const emp = employees.find(e => e._id === selectedEmployee);
    link.setAttribute("download", `Attendance_Report_${emp?.name || 'Employee'}_${month}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    if (status === 'Present') return 'bg-emerald-100 text-emerald-700';
    if (status === 'Half Day') return 'bg-amber-100 text-amber-700';
    if (status.includes('Absent')) return 'bg-red-100 text-red-700';
    if (status === 'Week Off') return 'bg-gray-100 text-gray-700';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Monthly Attendance Report</h1>
          <p className="text-[13px] text-gray-500">Generate, view and download detailed monthly reports for employees.</p>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="w-full sm:w-1/3">
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Select Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent"
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name} ({emp.empId})</option>
              ))}
            </select>
          </div>
          
          <div className="w-full sm:w-1/4">
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-1/4">
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent"
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-auto flex gap-2">
            <button
              onClick={generateReport}
              disabled={loading}
              className="px-6 py-2.5 text-[13px] font-bold text-white bg-[#5a4bda] rounded-lg shadow-sm hover:bg-[#4d3ecc] transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Search size={16} />
              {loading ? 'Generating...' : 'Generate'}
            </button>
            {reportData && (
              <button
                onClick={downloadCSV}
                className="px-4 py-2.5 text-[13px] font-bold text-[#5a4bda] bg-[#5a4bda]/10 rounded-lg hover:bg-[#5a4bda]/20 transition-colors flex items-center justify-center gap-2"
                title="Download CSV"
              >
                <Download size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {reportData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-[13px] text-gray-500 font-medium mb-1">Working Days</p>
              <p className="text-2xl font-bold text-gray-800">{reportData.summary.workingDays}</p>
            </div>
            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 shadow-sm">
              <p className="text-[13px] text-emerald-600 font-medium mb-1">Present</p>
              <p className="text-2xl font-bold text-emerald-700">{reportData.summary.presentDays}</p>
            </div>
            <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100 shadow-sm">
              <p className="text-[13px] text-amber-600 font-medium mb-1">Half Days</p>
              <p className="text-2xl font-bold text-amber-700">{reportData.summary.halfDays}</p>
            </div>
            <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100 shadow-sm">
              <p className="text-[13px] text-red-600 font-medium mb-1">Absent</p>
              <p className="text-2xl font-bold text-red-700">{reportData.summary.absentDays}</p>
            </div>
          </div>

          <div className="bg-white rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-[12px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-[12px] font-bold text-gray-500 uppercase tracking-wider">Punch In</th>
                    <th className="px-6 py-4 text-left text-[12px] font-bold text-gray-500 uppercase tracking-wider">Punch Out</th>
                    <th className="px-6 py-4 text-left text-[12px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reportData.dailyLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[14px] font-medium text-gray-800">
                          {new Date(log.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[13px] text-gray-600 font-medium">
                          {log.punchIn ? new Date(log.punchIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[13px] text-gray-600 font-medium">
                          {log.punchOut ? new Date(log.punchOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-[12px] font-bold rounded-md ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MonthlyReports;
