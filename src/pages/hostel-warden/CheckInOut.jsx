import { useState, useEffect } from 'react';
import { Search, LogIn, LogOut, Download, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import * as XLSX from 'xlsx';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';
import SkeletonLoader from '../../components/SkeletonLoader';

const CheckInOut = () => {
  if (!checkPermission('View Hostels') && !checkPermission('Manage Allocations')) {
    return <AccessDenied />;
  }
  const [activeTab, setActiveTab] = useState('CheckIn');

  // Search panel state
  const [studentSearch, setStudentSearch] = useState('');
  const [targetStudent, setTargetStudent] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Check-In form
  const [keyIssued, setKeyIssued] = useState(false);
  const [mattressIssued, setMattressIssued] = useState(false);
  const [chairIssued, setChairIssued] = useState(false);
  const [checkInRemarks, setCheckInRemarks] = useState('');

  // Check-Out form
  const [damageCharges, setDamageCharges] = useState(0);
  const [checkOutRemarks, setCheckOutRemarks] = useState('');
  const [keyReturned, setKeyReturned] = useState(false);
  const [mattressReturned, setMattressReturned] = useState(false);

  // Logs panel
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logFilter, setLogFilter] = useState('All');

  useEffect(() => {
    fetchAllocations();
    fetchLogs();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [logFilter]);

  const fetchAllocations = async () => {
    try {
      const [allocRes, studentsRes] = await Promise.all([
        axiosInstance.get('/hostel/allocations'),
        axiosInstance.get('/students')
      ]);
      setAllocations(allocRes.data || []);
      setAllStudents(studentsRes.data.data || studentsRes.data || []);
    } catch {
      toast.error('Failed to load allotment data');
    }
  };

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await axiosInstance.get(`/hostel/check-in-out?type=${logFilter}`);
      setLogs(res.data || []);
    } catch {
      toast.error('Failed to load logs');
    } finally {
      setLogsLoading(false);
    }
  };

  // ── Search student by name or enrollment no ───────────────────────
  const handleStudentSearch = (e) => {
    e.preventDefault();
    if (!studentSearch.trim()) return;
    const q = studentSearch.trim().toLowerCase();

    // 1. Search in active allotments first
    const found = allocations.find(a =>
      a.studentId?.studentId?.toLowerCase() === q ||
      a.studentId?.studentName?.toLowerCase().includes(q)
    );

    if (found) {
      setTargetStudent(found);
      setStudentSearch('');
      setKeyIssued(false); setMattressIssued(false); setChairIssued(false);
      setKeyReturned(false); setMattressReturned(false);
      setCheckInRemarks(''); setCheckOutRemarks(''); setDamageCharges(0);
      return;
    }

    // 2. Check if student exists in system but is NOT allotted
    const existsInSystem = allStudents.find(s =>
      s.studentId?.toLowerCase() === q ||
      s.studentName?.toLowerCase().includes(q)
    );

    if (existsInSystem) {
      toast.error(
        `"${existsInSystem.studentName}" is registered but has no active hostel allotment. Please allot a room first from the Allotment page.`,
        { duration: 5000 }
      );
    } else {
      toast.error('No student found with this name or enrollment number.');
    }
  };

  // ── Complete Check-In ─────────────────────────────────────────────
  const handleCompleteCheckIn = async () => {
    if (!targetStudent) return;
    const itemsIssued = [
      keyIssued && 'Room Key',
      mattressIssued && 'Mattress & Pillow',
      chairIssued && 'Study Chair'
    ].filter(Boolean);

    try {
      await axiosInstance.post('/hostel/check-in-out', {
        studentId: targetStudent.studentId._id,
        type: 'Check-In',
        remarks: `Items issued: ${itemsIssued.join(', ')}${checkInRemarks ? '. Note: ' + checkInRemarks : ''}`
      });
      toast.success(`✅ Check-In completed for ${targetStudent.studentId.studentName}`);
      setTargetStudent(null);
      setKeyIssued(false); setMattressIssued(false); setChairIssued(false);
      setCheckInRemarks('');
      fetchLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-In failed');
    }
  };

  // ── Complete Check-Out ────────────────────────────────────────────
  const handleCompleteCheckOut = async () => {
    if (!targetStudent) return;
    try {
      await axiosInstance.post('/hostel/check-in-out', {
        studentId: targetStudent.studentId._id,
        type: 'Check-Out',
        remarks: checkOutRemarks,
        damageCharges: parseFloat(damageCharges) || 0
      });
      toast.success(`✅ Check-Out clearance recorded for ${targetStudent.studentId.studentName}`);
      setTargetStudent(null);
      setCheckOutRemarks(''); setDamageCharges(0);
      setKeyReturned(false); setMattressReturned(false);
      fetchLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-Out failed');
    }
  };

  // ── Export logs ───────────────────────────────────────────────────
  const handleExport = () => {
    if (logs.length === 0) return toast.error('No logs to export');
    const data = logs.map(l => ({
      'Student Name': l.studentId?.studentName || 'N/A',
      'Enrollment No': l.studentId?.studentId || 'N/A',
      'Type': l.type,
      'Date & Time': l.dateTime ? new Date(l.dateTime).toLocaleString('en-IN') : '',
      'Remarks': l.remarks || '',
      'Reason': l.reason || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CheckInOut');
    XLSX.writeFile(wb, 'Hostel_CheckInOut_Log.xlsx');
  };

  const checkInReady = targetStudent && keyIssued && mattressIssued && chairIssued;
  const checkOutReady = targetStudent && keyReturned;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Tab Header */}
      <div className="flex border-b border-gray-100 px-6 pt-2">
        {[
          { key: 'CheckIn', label: 'Student Check-In', icon: LogIn },
          { key: 'CheckOut', label: 'Student Check-Out & Clearance', icon: LogOut },
          { key: 'Logs', label: 'Recent Logs', icon: Clock }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setTargetStudent(null); }}
            className={`flex items-center gap-2 px-5 py-4 text-[13px] font-semibold relative transition-colors ${activeTab === key ? 'text-[#0A6C54]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Icon size={14} />
            {label}
            {activeTab === key && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0A6C54] rounded-t-md" />}
          </button>
        ))}
      </div>

      {/* Check-In / Check-Out tabs */}
      {(activeTab === 'CheckIn' || activeTab === 'CheckOut') && (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto bg-gray-50/30">
          {/* Left: Student Search */}
          <div className="space-y-4">
            <div className="border border-gray-100 p-5 rounded-xl bg-white shadow-sm space-y-4">
              <h3 className="font-bold text-gray-800 text-[14px]">1. Search Allotted Student</h3>
              <form onSubmit={handleStudentSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Student Name / Enrollment No..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="flex-1 p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] bg-white"
                />
                <button type="submit" className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-4 py-2.5 rounded-lg text-[13px] font-bold transition-colors">
                  <Search size={15} />
                </button>
              </form>

              {targetStudent ? (
                <div className="bg-[#0A6C54]/5 border border-[#0A6C54]/20 p-4 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-[#0A6C54] uppercase tracking-wider">Student Found</span>
                    <button onClick={() => setTargetStudent(null)} className="text-gray-400 hover:text-red-500 text-lg">&times;</button>
                  </div>
                  <div className="space-y-1.5 text-[13px]">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name</span>
                      <span className="font-bold text-gray-800">{targetStudent.studentId?.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Enrollment No</span>
                      <span className="font-semibold text-gray-700">{targetStudent.studentId?.studentId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Course</span>
                      <span className="font-semibold text-gray-700">{targetStudent.studentId?.course || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Allotted Room</span>
                      <span className="font-bold text-[#0A6C54]">{targetStudent.roomId?.blockName} — Room {targetStudent.roomId?.roomNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${targetStudent.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {targetStudent.status}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-[13px] border border-dashed border-gray-200 rounded-xl">
                  Search for a student to begin
                </div>
              )}
            </div>
          </div>

          {/* Right: Check-In or Check-Out form */}
          {activeTab === 'CheckIn' ? (
            <div className="border border-gray-100 p-6 rounded-xl space-y-4 flex flex-col bg-white shadow-sm">
              <h3 className="font-bold text-gray-800 text-[14px] pb-2 border-b border-gray-100">
                2. Check-In Inventory Checklist
              </h3>
              <div className="space-y-3 flex-1">
                {[
                  { state: keyIssued, setter: setKeyIssued, label: 'Room Key Issued', desc: 'Physical key handed over and duplicate verified' },
                  { state: mattressIssued, setter: setMattressIssued, label: 'Mattress & Pillow', desc: 'Standard single mattress with pillow cover issued' },
                  { state: chairIssued, setter: setChairIssued, label: 'Study Chair Issued', desc: 'Plastic study chair tagged under student bed ID' }
                ].map(({ state, setter, label, desc }) => (
                  <label key={label} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors text-[13px] ${state ? 'border-[#0A6C54]/30 bg-[#0A6C54]/5' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <input
                      type="checkbox"
                      checked={state}
                      onChange={(e) => setter(e.target.checked)}
                      className="w-4 h-4 accent-[#0A6C54] cursor-pointer"
                    />
                    <div>
                      <p className={`font-bold ${state ? 'text-[#0A6C54]' : 'text-gray-800'}`}>{label}</p>
                      <p className="text-[11px] text-gray-500">{desc}</p>
                    </div>
                    {state && <CheckCircle2 size={16} className="ml-auto text-[#0A6C54]" />}
                  </label>
                ))}

                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Additional Remarks (optional)</label>
                  <textarea
                    value={checkInRemarks}
                    onChange={(e) => setCheckInRemarks(e.target.value)}
                    placeholder="Any special notes about the room condition..."
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-16 resize-none focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              </div>

              {/* Progress indicator */}
              <div className="text-[12px] text-gray-400 text-center">
                {[keyIssued, mattressIssued, chairIssued].filter(Boolean).length} / 3 items verified
              </div>

              <button
                onClick={handleCompleteCheckIn}
                disabled={!checkInReady}
                className={`w-full py-3 rounded-xl text-[13px] font-bold text-white transition-colors ${checkInReady ? 'bg-[#0A6C54] hover:bg-[#085a46]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                {!targetStudent ? 'Search a student first' : !checkInReady ? `Complete all ${3 - [keyIssued, mattressIssued, chairIssued].filter(Boolean).length} remaining items` : '✓ Complete Check-In'}
              </button>
            </div>
          ) : (
            <div className="border border-gray-100 p-6 rounded-xl space-y-4 flex flex-col bg-white shadow-sm">
              <h3 className="font-bold text-gray-800 text-[14px] pb-2 border-b border-gray-100">
                2. Check-Out Clearance
              </h3>
              <div className="space-y-4 flex-1">
                <div className="p-3 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl text-[12px]">
                  ⚠️ Ensure student has returned all room inventory. Inspect walls and furniture for damages before approving.
                </div>

                {/* Return checklist */}
                {[
                  { state: keyReturned, setter: setKeyReturned, label: 'Room Key Returned' },
                  { state: mattressReturned, setter: setMattressReturned, label: 'Mattress & Items Returned' }
                ].map(({ state, setter, label }) => (
                  <label key={label} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors text-[13px] ${state ? 'border-[#0A6C54]/30 bg-[#0A6C54]/5' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <input type="checkbox" checked={state} onChange={(e) => setter(e.target.checked)} className="w-4 h-4 accent-[#0A6C54]" />
                    <p className={`font-bold ${state ? 'text-[#0A6C54]' : 'text-gray-800'}`}>{label}</p>
                    {state && <CheckCircle2 size={16} className="ml-auto text-[#0A6C54]" />}
                  </label>
                ))}

                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Room Damage Charges (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={damageCharges}
                    onChange={(e) => setDamageCharges(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Inspection Remarks</label>
                  <textarea
                    value={checkOutRemarks}
                    onChange={(e) => setCheckOutRemarks(e.target.value)}
                    placeholder="e.g. All items returned, minor paint damage noted..."
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-16 resize-none focus:outline-none focus:ring-1 focus:ring-[#0A6C54]"
                  />
                </div>
              </div>

              <button
                onClick={handleCompleteCheckOut}
                disabled={!checkOutReady}
                className={`w-full py-3 rounded-xl text-[13px] font-bold text-white transition-colors ${checkOutReady ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                {!targetStudent ? 'Search a student first' : !keyReturned ? 'Confirm key returned first' : 'Approve Check-Out & Clearance'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'Logs' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/30 flex-wrap">
            <div className="flex gap-2">
              {['All', 'Check-In', 'Check-Out'].map(f => (
                <button
                  key={f}
                  onClick={() => setLogFilter(f)}
                  className={`px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors ${logFilter === f ? 'bg-[#0A6C54] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={fetchLogs} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <RefreshCw size={13} /> Refresh
              </button>
              <button onClick={handleExport} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <Download size={13} /> Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            {logsLoading ? (
              <SkeletonLoader type="table" rows={5} cols={5} />
            ) : (
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="py-3 px-6 text-[12px] font-bold text-gray-800">Student</th>
                    <th className="py-3 px-6 text-[12px] font-bold text-gray-800">Enrollment No</th>
                    <th className="py-3 px-6 text-[12px] font-bold text-gray-800 text-center">Type</th>
                    <th className="py-3 px-6 text-[12px] font-bold text-gray-800">Date & Time</th>
                    <th className="py-3 px-6 text-[12px] font-bold text-gray-800">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-6 text-[13px] font-bold text-gray-800">{log.studentId?.studentName || 'N/A'}</td>
                      <td className="py-3 px-6 text-[13px] font-semibold text-[#0A6C54]">{log.studentId?.studentId || 'N/A'}</td>
                      <td className="py-3 px-6 text-center">
                        <span className={`flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold w-fit mx-auto ${log.type === 'Check-In' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                          {log.type === 'Check-In' ? <LogIn size={11} /> : <LogOut size={11} />}
                          {log.type}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-[12px] text-gray-500">
                        {log.dateTime ? new Date(log.dateTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="py-3 px-6 text-[12px] text-gray-500 max-w-[200px] truncate">{log.remarks || log.reason || '—'}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr><td colSpan="5" className="py-10 text-center text-gray-400 text-[13px]">No check-in/out records found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          {logs.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-100 text-[12px] text-gray-400">
              Showing {logs.length} records
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckInOut;
