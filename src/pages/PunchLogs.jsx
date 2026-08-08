import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Calendar, Clock, Search, MapPin } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import { checkPermission } from '../utils/checkPermission';
import AccessDenied from '../components/AccessDenied';

const PunchLogs = () => {
  if (!checkPermission('View Attendance')) {
    return <AccessDenied />;
  }

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [selectedDate]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/punch/all-logs?date=${selectedDate}`);
      setLogs(res.data);
    } catch (err) {
      console.error('Error fetching logs', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filtered = logs.filter(l => 
    l.employeeId?.name?.toLowerCase().includes(search.toLowerCase()) || 
    l.employeeId?.empId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col font-['Inter']">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-['Outfit']">Employee Punch Logs</h1>
          <p className="text-sm text-gray-500 mt-1">Live tracking of geofenced employee attendance.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/30">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search employee name or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-gray-600">Date:</span>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
            />
          </div>
        </div>

        <div className="overflow-x-auto flex-1 p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-y border-gray-100">
                <th className="py-3 px-4 text-[12px] font-bold text-gray-700">Employee</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-700">Role</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-700">Punch In</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-700">Punch Out</th>
                <th className="py-3 px-4 text-[12px] font-bold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8"><SkeletonLoader type="table" rows={5} cols={5} /></td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map(log => (
                  <tr key={log._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="text-[13px] font-bold text-gray-800">{log.employeeId?.name || 'Unknown'}</div>
                      <div className="text-[11px] text-gray-500">{log.employeeId?.empId} • {log.employeeId?.department}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[11px] font-medium">{log.employeeId?.role}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-700">
                        <Clock size={13} className="text-green-500" />
                        {formatTime(log.punchInTime)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-700">
                        <Clock size={13} className="text-red-500" />
                        {formatTime(log.punchOutTime)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide
                        ${log.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500 text-[13px]">
                    No punch logs found for this date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PunchLogs;
