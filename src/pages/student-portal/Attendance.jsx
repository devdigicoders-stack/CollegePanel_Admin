import React, { useState, useEffect } from 'react';
import { AlertCircle, Download, Search, CheckCircle, Calendar } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const Attendance = () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const [allRecords, setAllRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [month, setMonth] = useState(currentMonth.toString());
  const [year, setYear] = useState(currentYear.toString());
  
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalClasses: 0,
    present: 0,
    absent: 0,
    percentage: 0
  });

  const [subjectData, setSubjectData] = useState([]);

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    filterData();
  }, [month, year, allRecords]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/student-portal/attendance');
      setAllRecords(res.data || []);
    } catch (error) {
      toast.error('Failed to fetch attendance');
      console.error(error);
    } finally { 
      setLoading(false); 
    }
  };

  const filterData = () => {
    if (!allRecords.length) return;

    let filtered = allRecords;

    // Filter by Month and Year if "All Time" is not selected
    if (month !== 'all') {
      filtered = allRecords.filter(record => {
        if (!record.sessionId || !record.sessionId.date) return false;
        const d = new Date(record.sessionId.date);
        return (d.getMonth() + 1).toString() === month && d.getFullYear().toString() === year;
      });
    } else {
      // If All Time, just filter by Year
      filtered = allRecords.filter(record => {
        if (!record.sessionId || !record.sessionId.date) return false;
        const d = new Date(record.sessionId.date);
        return d.getFullYear().toString() === year;
      });
    }

    setFilteredRecords(filtered);

    // Calculate Summary Stats
    let totalAttended = 0;
    let totalAbsent = 0;
    const subjectMap = {};

    filtered.forEach(record => {
      if (!record.sessionId || !record.sessionId.subject) return;
      
      const subId = record.sessionId.subject; 
      if (!subjectMap[subId]) {
        subjectMap[subId] = {
          subject: record.sessionId.subject,
          code: record.sessionId.className || 'General',
          attended: 0,
          conducted: 0
        };
      }
      
      subjectMap[subId].conducted += 1;
      if (record.status === 'Present') {
        subjectMap[subId].attended += 1;
        totalAttended += 1;
      } else {
        totalAbsent += 1;
      }
    });

    const totalClasses = totalAttended + totalAbsent;
    const percentage = totalClasses > 0 ? ((totalAttended / totalClasses) * 100).toFixed(1) : 0;

    setStats({
      totalClasses,
      present: totalAttended,
      absent: totalAbsent,
      percentage
    });

    const processedData = Object.values(subjectMap).map(item => {
      const perc = item.conducted > 0 ? Math.round((item.attended / item.conducted) * 100) : 0;
      return {
        ...item,
        percentage: perc,
        isShort: perc < 75
      };
    });

    setSubjectData(processedData);
  };

  const downloadCSV = () => {
    if (!filteredRecords.length) {
      toast.error('No records to download');
      return;
    }

    const headers = ['Date', 'Subject', 'Class', 'Teacher', 'Status'];
    const rows = filteredRecords.map(log => {
      const dateStr = log.sessionId?.date ? new Date(log.sessionId.date).toLocaleDateString('en-IN') : 'N/A';
      return [
        dateStr, 
        log.sessionId?.subject || 'N/A', 
        log.sessionId?.className || 'N/A', 
        log.sessionId?.teacherName || 'N/A', 
        log.status
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const label = month === 'all' ? `Year_${year}` : `${month}_${year}`;
    link.setAttribute("download", `My_Attendance_Report_${label}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    if (status === 'Present') return 'bg-emerald-100 text-emerald-700';
    if (status === 'Late') return 'bg-amber-100 text-amber-700';
    if (status.includes('Absent')) return 'bg-red-100 text-red-700';
    return 'bg-blue-100 text-blue-700';
  };

  if (loading) {
    return (
      <div className="p-6 h-full flex flex-col gap-6">
        <SkeletonLoader type="card" count={4} />
        <SkeletonLoader type="table" rows={6} cols={5} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-10 font-['Inter']">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 font-['Outfit'] mb-1">Attendance Report</h1>
          <p className="text-[13px] text-gray-500">Track your attendance dynamically by month, year, and subject.</p>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row items-end gap-4">
          
          <div className="w-full sm:w-1/3">
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent"
            >
              <option value="all">All Time (Whole Year)</option>
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-1/3">
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
              onClick={downloadCSV}
              disabled={!filteredRecords.length}
              className="px-5 py-2.5 text-[13px] font-bold text-[#5a4bda] bg-[#5a4bda]/10 rounded-lg hover:bg-[#5a4bda]/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download size={16} /> Download CSV
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <p className="text-[12px] uppercase tracking-wider text-gray-500 font-bold mb-1">Total Classes</p>
          <p className="text-2xl font-black text-gray-800">{stats.totalClasses}</p>
          <Calendar size={24} className="absolute right-4 bottom-4 text-gray-100" />
        </div>
        <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden">
          <p className="text-[12px] uppercase tracking-wider text-emerald-600 font-bold mb-1">Attended</p>
          <p className="text-2xl font-black text-emerald-700">{stats.present}</p>
          <CheckCircle size={24} className="absolute right-4 bottom-4 text-emerald-200" />
        </div>
        <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden">
          <p className="text-[12px] uppercase tracking-wider text-red-600 font-bold mb-1">Absent</p>
          <p className="text-2xl font-black text-red-700">{stats.absent}</p>
          <AlertCircle size={24} className="absolute right-4 bottom-4 text-red-200" />
        </div>
        <div className={`p-5 rounded-2xl shadow-sm relative overflow-hidden border ${stats.percentage >= 75 ? 'bg-emerald-500 border-emerald-600' : stats.percentage >= 60 ? 'bg-amber-500 border-amber-600' : 'bg-red-500 border-red-600'}`}>
          <p className="text-[12px] uppercase tracking-wider text-white/80 font-bold mb-1">Overall %</p>
          <p className="text-2xl font-black text-white">{stats.percentage}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Subject Wise Analysis */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-[15px] font-bold text-gray-800 font-['Outfit']">Subject-wise Progress</h3>
          {subjectData.length > 0 ? subjectData.map((item, idx) => (
            <div key={idx} className="p-4 border border-gray-100 rounded-xl space-y-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-white hover:border-[#5a4bda]/30 transition-colors">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-800 text-[13px] truncate">{item.subject}</h4>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">{item.code}</p>
                </div>
                <span className={`text-[14px] font-bold flex-shrink-0 ${item.isShort ? 'text-red-500' : 'text-emerald-600'}`}>
                  {item.percentage}%
                </span>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${item.isShort ? 'bg-red-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${item.percentage}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] font-medium text-gray-500">
                <span>{item.attended} / {item.conducted} Attended</span>
                {item.isShort && (
                  <span className="text-red-500 flex items-center gap-1 font-bold">
                    <AlertCircle size={12} /> Short
                  </span>
                )}
              </div>
            </div>
          )) : (
            <div className="text-gray-500 text-[13px] p-6 text-center bg-white rounded-xl border border-gray-100 shadow-sm">
              No subjects found for this period.
            </div>
          )}
        </div>

        {/* Detailed Logs Table */}
        <div className="lg:col-span-2">
           <h3 className="text-[15px] font-bold text-gray-800 font-['Outfit'] mb-4">Detailed Attendance Log</h3>
           <div className="bg-white rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden h-fit">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10 shadow-sm">
                  <tr className="border-b border-gray-100">
                    <th className="px-5 py-3.5 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3.5 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-5 py-3.5 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Teacher</th>
                    <th className="px-5 py-3.5 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredRecords.length > 0 ? filteredRecords.map((log, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className="text-[13px] font-medium text-gray-800">
                          {log.sessionId?.date ? new Date(log.sessionId.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' }) : 'N/A'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[13px] text-gray-700 font-semibold line-clamp-1">
                          {log.sessionId?.subject || 'N/A'}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono block">
                          {log.sessionId?.className || ''}
                        </span>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className="text-[13px] text-gray-600 font-medium flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-bold">
                             {(log.sessionId?.teacherName || 'T').charAt(0)}
                           </div>
                           {log.sessionId?.teacherName || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-right">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-5 py-8 text-center text-[13px] text-gray-500">
                        No records found for the selected period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Attendance;
