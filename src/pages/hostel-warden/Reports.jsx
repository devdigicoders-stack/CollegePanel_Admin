import React, { useState, useEffect } from 'react';
import { Download, BarChart3, TrendingUp, TrendingDown, RefreshCcw, Table, FileText } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const reportOptions = [
  'Hostel Occupancy & Rooms',
  'Student Allotments',
  'Attendance Records',
  'Leaves & Outings',
  'Visitor Logs',
  'Disciplinary Incidents',
  'Maintenance Complaints',
  'Inventory & Assets'
];

const HostelReports = () => {
  if (!checkPermission('View Hostel Reports')) {
    return <AccessDenied />;
  }
  const [reportType, setReportType] = useState('Hostel Occupancy & Rooms');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [reportColumns, setReportColumns] = useState([]);

  // Stats for the top cards
  const [stats, setStats] = useState({ totalCapacity: 0, totalOccupied: 0, available: 0 });

  useEffect(() => {
    fetchTopStats();
  }, []);

  const fetchTopStats = async () => {
    try {
      const res = await axiosInstance.get('/hostel/dashboard/stats');
      if (res.data?.stats) setStats(res.data.stats);
    } catch {
      // Ignore top stat error
    }
  };

  const generateReport = async () => {
    setLoading(true);
    setReportData([]);
    setReportColumns([]);
    try {
      let data = [];
      let cols = [];

      switch (reportType) {
        case 'Hostel Occupancy & Rooms': {
          const res = await axiosInstance.get('/hostel/rooms');
          const rooms = res.data.rooms || [];
          cols = ['Block', 'Room No', 'Type', 'Capacity', 'Occupied', 'Available', 'Status'];
          data = rooms.map(r => ({
            'Block': r.blockName, 'Room No': r.roomNumber, 'Type': r.type,
            'Capacity': r.capacity, 'Occupied': r.occupancy,
            'Available': r.capacity - r.occupancy, 'Status': r.status
          }));
          break;
        }
        case 'Student Allotments': {
          const res = await axiosInstance.get('/hostel/allocations?status=All');
          cols = ['Student', 'Enrollment', 'Course', 'Room', 'Status', 'Allotted On'];
          data = res.data.map(a => ({
            'Student': a.studentId?.studentName, 'Enrollment': a.studentId?.studentId,
            'Course': a.studentId?.course,
            'Room': a.roomId ? `${a.roomId.blockName} - ${a.roomId.roomNumber}` : 'N/A',
            'Status': a.status,
            'Allotted On': new Date(a.dateOfAllotment).toLocaleDateString()
          }));
          break;
        }
        case 'Attendance Records': {
          const res = await axiosInstance.get('/hostel/attendance');
          const att = res.data.data || res.data;
          cols = ['Date', 'Student', 'Enrollment', 'Status', 'Remarks'];
          // Flatten attendance records
          att.forEach(record => {
            const dateStr = new Date(record.date).toLocaleDateString();
            record.records.forEach(r => {
              data.push({
                'Date': dateStr,
                'Student': r.studentId?.studentName,
                'Enrollment': r.studentId?.studentId,
                'Status': r.status,
                'Remarks': r.remarks || ''
              });
            });
          });
          break;
        }
        case 'Leaves & Outings': {
          const res = await axiosInstance.get('/hostel/leaves');
          cols = ['Student', 'Type', 'Reason', 'From', 'To', 'Status'];
          data = res.data.map(l => ({
            'Student': l.studentId?.studentName, 'Type': l.leaveType,
            'Reason': l.reason, 'From': new Date(l.fromDate).toLocaleDateString(),
            'To': new Date(l.toDate).toLocaleDateString(), 'Status': l.status
          }));
          break;
        }
        case 'Visitor Logs': {
          const res = await axiosInstance.get('/hostel/visitors');
          cols = ['Visitor', 'Contact', 'Student', 'Relation', 'Purpose', 'In Time', 'Out Time'];
          data = res.data.map(v => ({
            'Visitor': v.visitorName, 'Contact': v.contactNumber,
            'Student': v.studentId?.studentName, 'Relation': v.relation,
            'Purpose': v.purpose, 
            'In Time': new Date(v.inTime).toLocaleString(),
            'Out Time': v.outTime ? new Date(v.outTime).toLocaleString() : 'Inside'
          }));
          break;
        }
        case 'Disciplinary Incidents': {
          const res = await axiosInstance.get('/hostel/incidents');
          cols = ['Student', 'Incident Type', 'Date', 'Description', 'Action Taken', 'Status'];
          data = res.data.map(i => ({
            'Student': i.studentId?.studentName, 'Incident Type': i.incidentType,
            'Date': new Date(i.date).toLocaleDateString(), 'Description': i.description,
            'Action Taken': i.actionTaken, 'Status': i.status
          }));
          break;
        }
        case 'Maintenance Complaints': {
          const res = await axiosInstance.get('/complaints?category=Hostel&limit=1000');
          const comps = res.data.data || res.data;
          cols = ['Ticket No', 'Subject', 'Submitted By', 'Priority', 'Status', 'Date', 'Admin Reply'];
          data = comps.map(c => ({
            'Ticket No': c.complaintId, 'Subject': c.subject, 'Submitted By': c.submittedBy,
            'Priority': c.priority, 'Status': c.status,
            'Date': new Date(c.createdAt).toLocaleDateString(), 'Admin Reply': c.adminReply || ''
          }));
          break;
        }
        case 'Inventory & Assets': {
          const res = await axiosInstance.get('/hostel/inventory');
          cols = ['Asset Name', 'Category', 'Quantity', 'Condition', 'Room/Location', 'Remarks'];
          data = res.data.map(a => ({
            'Asset Name': a.itemName, 'Category': a.category, 'Quantity': a.quantity,
            'Condition': a.condition, 'Room/Location': a.roomId ? `${a.roomId.blockName}-${a.roomId.roomNumber}` : 'General',
            'Remarks': a.remarks || ''
          }));
          break;
        }
      }

      // Filter by Date Range if dates are selected
      if (dateRange.start && dateRange.end && data.length > 0) {
        const startDate = new Date(dateRange.start).setHours(0,0,0,0);
        const endDate = new Date(dateRange.end).setHours(23,59,59,999);
        data = data.filter(row => {
          // find any column that looks like a date
          const dateCols = Object.keys(row).filter(k => k.toLowerCase().includes('date') || k.toLowerCase().includes('time') || k.toLowerCase() === 'from' || k.toLowerCase() === 'allotted on');
          for (let col of dateCols) {
            const d = new Date(row[col]);
            if (!isNaN(d.getTime())) {
              return d.getTime() >= startDate && d.getTime() <= endDate;
            }
          }
          return true; // if no date found, keep it
        });
      }

      setReportColumns(cols);
      setReportData(data);
      toast.success(`${reportType} generated (${data.length} records)`);
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const occupancyRatio = stats.totalCapacity > 0 ? ((stats.totalOccupied / stats.totalCapacity) * 100).toFixed(1) : 0;

  const handleExportExcel = () => {
    if (reportData.length === 0) return toast.error('No data to export. Generate a report first.');
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reportData), 'Report Data');
    XLSX.writeFile(wb, `Hostel_${reportType.replace(/\s+/g,'_')}.xlsx`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Hostel Audits & Reports Engine</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Generate real-time occupancy, discipline, and audit reports</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={handleExportExcel} disabled={reportData.length === 0} className="w-full md:w-auto flex justify-center items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-lg text-[13px] font-semibold transition-colors">
            <Download size={15} /> Export Report
          </button>
        </div>
      </div>

      {/* Global Occupancy Stats */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 bg-gradient-to-br from-white to-gray-50/50">
        <div className="bg-green-50/50 border border-green-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Total Capacity</span>
            <h4 className="text-[18px] font-bold text-green-700">{stats.totalCapacity} Beds</h4>
          </div>
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600"><TrendingUp size={18} /></div>
        </div>
        <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Vacant Beds</span>
            <h4 className="text-[18px] font-bold text-red-700">{stats.available} Available</h4>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600"><TrendingDown size={18} /></div>
        </div>
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Occupancy Ratio</span>
            <h4 className="text-[18px] font-bold text-blue-700">{occupancyRatio}%</h4>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><BarChart3 size={18} /></div>
        </div>
      </div>

      {/* Report Generator Controls */}
      <div className="p-4 sm:p-5 border-b border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 bg-gray-50/30 items-end">
        <div className="md:col-span-4">
          <label className="block text-[12px] font-semibold text-gray-600 mb-1">Select Report Topic *</label>
          <select 
            value={reportType} 
            onChange={(e) => { setReportType(e.target.value); setReportData([]); }}
            className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {reportOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="block text-[12px] font-semibold text-gray-600 mb-1">From Date (Optional)</label>
          <input 
            type="date" 
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="md:col-span-3">
          <label className="block text-[12px] font-semibold text-gray-600 mb-1">To Date (Optional)</label>
          <input 
            type="date" 
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="md:col-span-2">
          <button 
            onClick={generateReport}
            disabled={loading}
            className="w-full py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-[13px] font-semibold transition-colors flex justify-center items-center gap-2"
          >
            {loading ? <RefreshCcw size={15} className="animate-spin" /> : <Table size={15} />}
            Generate
          </button>
        </div>
      </div>

      {/* Report Data Preview Table */}
      <div className="flex-1 overflow-auto bg-white p-2">
        {reportData.length > 0 ? (
          <div className="min-w-[800px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {reportColumns.map((col, idx) => (
                    <th key={idx} className="py-3 px-4 text-[12px] font-bold text-gray-700 whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    {reportColumns.map((col, i) => (
                      <td key={i} className="py-3 px-4 text-[12px] text-gray-600 max-w-[200px] truncate" title={row[col]}>
                        {row[col] || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-10">
            <FileText size={40} className="mb-4 text-gray-200" />
            <p className="text-[14px] font-medium text-gray-500 mb-1">No Report Data</p>
            <p className="text-[12px]">Select parameters and click Generate to build a report.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {reportData.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 text-[12px] text-gray-400 bg-white">
          Previewing {reportData.length} records for <strong>{reportType}</strong>
        </div>
      )}
    </div>
  );
};

export default HostelReports;
