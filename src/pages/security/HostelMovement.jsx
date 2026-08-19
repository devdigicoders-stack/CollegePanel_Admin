import React, { useState, useEffect } from 'react';
import { Search, Download, CheckCircle, AlertTriangle, Building, ArrowRightLeft, BellRing } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';
import SkeletonLoader from '../../components/SkeletonLoader';

const HostelMovement = () => {
  if (!checkPermission('View Security Dashboard')) {
    return <AccessDenied />;
  }
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/hostel/check-in-out');
      setLogs(res.data);
    } catch (error) {
      toast.error('Failed to load hostel movements');
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter(l => {
    const s = search.toLowerCase();
    return (l.studentId?.studentName?.toLowerCase() || '').includes(s) || 
           (l.studentId?.rollNumber?.toLowerCase() || '').includes(s) ||
           (l.studentId?.studentId?.toLowerCase() || '').includes(s);
  });

  const handleReturn = async (studentId, studentName) => {
    const result = await Swal.fire({
      title: 'Check-In Student?',
      text: `Record hostel return for ${studentName}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-primary)',
      cancelButtonColor: '#e5e7eb',
      confirmButtonText: 'Yes, Check-In',
      cancelButtonText: '<span style="color: black">Cancel</span>'
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.post('/hostel/check-in-out', {
          studentId,
          type: 'Check-In',
          reason: 'Returned to hostel (verified by Security)',
          remarks: 'Checked in by Security'
        });
        toast.success(`Hostel return recorded for ${studentName}.`);
        fetchLogs();
      } catch (error) {
        toast.error('Failed to check-in student');
      }
    }
  };

  const handleNotifyWarden = async (studentName) => {
    const result = await Swal.fire({
      title: 'Notify Warden?',
      text: `Send late-return / violation alert for ${studentName} to the Chief Warden?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#e5e7eb',
      confirmButtonText: 'Yes, Send Alert',
      cancelButtonText: '<span style="color: black">Cancel</span>'
    });

    if (result.isConfirmed) {
      toast.success(`Warden successfully notified regarding ${studentName}.`);
    }
  };

  const handleExport = () => {
    if (filtered.length === 0) return toast.error('No logs to export');
    
    const exportData = filtered.map(item => ({
      'Enrollment / Roll No': item.studentId?.rollNumber || item.studentId?.studentId || 'N/A',
      'Student Name': item.studentId?.studentName || 'Unknown',
      'Movement Type': item.type,
      'Timestamp': new Date(item.dateTime).toLocaleString('en-IN'),
      'Reason / Remarks': item.reason || item.remarks || 'None'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hostel Movement Logs');
    XLSX.writeFile(wb, `Hostel_Movement_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Hostel Student Check-In & Out</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify hostel outing gate slips, record return timestamps, and manage warden alerts</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Movement Logs
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by student name or roll no..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="text-[12px] font-semibold text-gray-500 bg-white px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm">
          Total Records Found: <span className="text-primary">{filtered.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={5} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Enrollment / Roll No</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Movement Type</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Timestamp</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Reason / Remarks</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Actions / Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-bold font-mono text-primary tracking-wide">
                    {item.studentId?.rollNumber || item.studentId?.studentId || 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.studentId?.studentName || 'Unknown'}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${
                      item.type === 'Check-In' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-orange-50 text-orange-700 border border-orange-100'
                    }`}>
                      {item.type === 'Check-In' ? <Building size={13} /> : <ArrowRightLeft size={13} />}
                      {item.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="text-[13px] text-gray-800 font-bold">{new Date(item.dateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                    <div className="text-[11px] text-gray-500 font-medium">{new Date(item.dateTime).toLocaleDateString('en-IN')}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-[13px] text-gray-700 font-semibold max-w-[200px] truncate" title={item.reason || item.remarks || 'No reason provided'}>
                      {item.reason || item.remarks || '-'}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      {item.type === 'Check-Out' ? (
                        <>
                          <button 
                            onClick={() => handleReturn(item.studentId?._id, item.studentId?.studentName)} 
                            className="px-3 py-1.5 text-[12px] font-bold bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-1"
                          >
                            Check-In
                          </button>
                          <button 
                            onClick={() => handleNotifyWarden(item.studentId?.studentName)} 
                            className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg border border-transparent hover:border-red-100 transition-colors" 
                            title="Notify Warden"
                          >
                            <BellRing size={16} />
                          </button>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-400 font-semibold px-3 py-1.5">
                          <CheckCircle size={14} className="text-gray-300" /> Secure
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Building size={40} className="mb-4 text-gray-200" />
                      <p className="text-[14px] font-medium text-gray-500">No Hostel Movements Logged</p>
                      <p className="text-[12px] mt-1">Hostel check-outs and returns will appear here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HostelMovement;
