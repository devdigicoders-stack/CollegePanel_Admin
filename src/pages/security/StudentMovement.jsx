import React, { useState, useEffect } from 'react';
import { Search, Download, Plus, CheckCircle, Clock, UserCheck, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import * as XLSX from 'xlsx';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';
import SkeletonLoader from '../../components/SkeletonLoader';

const StudentMovement = () => {
  if (!checkPermission('Log Student Entry/Exit')) {
    return <AccessDenied />;
  }
  const [search, setSearch] = useState('');
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newMove, setNewMove] = useState({
    enrollNo: '',
    type: 'Entry',
    remark: '',
  });

  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/security/logs?logType=Student');
      setMovements(res.data);
    } catch (error) {
      toast.error('Failed to load student movements');
    } finally {
      setLoading(false);
    }
  };

  const filtered = movements.filter(m => {
    const studentName = m.studentId?.studentName?.toLowerCase() || '';
    const enrollNo = m.studentId?.studentId?.toLowerCase() || '';
    const s = search.toLowerCase();
    return studentName.includes(s) || enrollNo.includes(s);
  });

  const handleAddMovement = async (e) => {
    e.preventDefault();
    if (!newMove.enrollNo.trim()) return toast.error('Enrollment Number is required');
    try {
      setSubmitting(true);
      await axiosInstance.post('/security/logs', {
        logType: 'Student',
        enrollNo: newMove.enrollNo,
        movementType: newMove.type,
        remarks: newMove.remark
      });
      setShowAddModal(false);
      toast.success(`Student ${newMove.type} recorded at gate successfully!`);
      setNewMove({ enrollNo: '', type: 'Entry', remark: '' });
      fetchMovements();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record student movement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    if (filtered.length === 0) return toast.error('No logs to export');
    
    const exportData = filtered.map(item => ({
      'Enrollment No': item.studentId?.studentId || 'N/A',
      'Student Name': item.studentId?.studentName || 'Unknown',
      'Movement Type': item.movementType,
      'Date': new Date(item.entryTime).toLocaleDateString('en-IN'),
      'Time': new Date(item.entryTime).toLocaleTimeString('en-IN'),
      'Remarks / Permits': item.remarks || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Movement Logs');
    XLSX.writeFile(wb, `Student_Movement_Logs_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Student Gate Check-In & Check-Out</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Log entries and exits, verify permits, and export daily movement history</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={15} /> Export Movement Logs
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Log Manual Movement
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search movement logs by student name or roll number..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="text-[12px] font-semibold text-gray-500 bg-white px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm">
          Total Logs Found: <span className="text-primary">{filtered.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={5} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Enrollment No</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Student Name</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Movement Class</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-center">Date & Time</th>
                <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Remarks / Permits</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-[13px] font-bold font-mono text-primary">{item.studentId?.studentId || 'N/A'}</td>
                  <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.studentId?.studentName || 'Unknown Student'}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${
                      item.movementType === 'Entry' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-orange-50 text-orange-700 border border-orange-100'
                    }`}>
                      {item.movementType === 'Entry' ? <CheckCircle size={13} /> : <Clock size={13} />}
                      {item.movementType}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="text-[13px] text-gray-800 font-bold">{new Date(item.entryTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                    <div className="text-[11px] text-gray-500 font-medium">{new Date(item.entryTime).toLocaleDateString('en-IN')}</div>
                  </td>
                  <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">
                    {item.remarks ? (
                      <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">{item.remarks}</span>
                    ) : (
                      <span className="text-gray-400 italic">No remarks</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <UserCheck size={40} className="mb-4 text-gray-200" />
                      <p className="text-[14px] font-medium text-gray-500">No Movement Logs Found</p>
                      <p className="text-[12px] mt-1">Try adjusting your search criteria or add a new log manually.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Movement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Log Manual Student Movement</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            
            <div className="px-6 pt-4 pb-2">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2.5">
                <AlertTriangle size={15} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
                  Enter the student's enrollment number. The system will automatically fetch their details and record the log timestamp.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddMovement} className="p-6 pt-2 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Student Enrollment No *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. CS2023001"
                  value={newMove.enrollNo}
                  onChange={(e) => setNewMove({...newMove, enrollNo: e.target.value.toUpperCase()})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Movement Type *</label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <label className={`border rounded-lg p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    newMove.type === 'Entry' ? 'border-green-500 bg-green-50 text-green-700 font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}>
                    <input type="radio" name="movementType" className="hidden" checked={newMove.type === 'Entry'} onChange={() => setNewMove({...newMove, type: 'Entry'})} />
                    <CheckCircle size={15} /> Entry to Campus
                  </label>
                  
                  <label className={`border rounded-lg p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    newMove.type === 'Exit' ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}>
                    <input type="radio" name="movementType" className="hidden" checked={newMove.type === 'Exit'} onChange={() => setNewMove({...newMove, type: 'Exit'})} />
                    <Clock size={15} /> Exit Campus
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Remarks / Permission Reference (Optional)</label>
                <textarea 
                  value={newMove.remark}
                  onChange={(e) => setNewMove({...newMove, remark: e.target.value})}
                  placeholder="e.g. Late entry - medical slip, Approved weekend outing"
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-20 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-[13px] font-semibold transition-colors shadow-sm"
                >
                  {submitting ? 'Saving...' : 'Save Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentMovement;
