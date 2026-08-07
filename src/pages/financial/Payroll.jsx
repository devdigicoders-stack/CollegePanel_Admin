import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Eye, Printer, CheckCircle, ChevronDown, X, RefreshCw, Users } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const statusColors = {
  Paid:    'bg-green-50 text-green-700 border border-green-100',
  Pending: 'bg-yellow-50 text-yellow-700 border border-yellow-100',
  Failed:  'bg-red-50 text-red-600 border border-red-100',
};

const designations = [
  'Principal', 'Professor', 'Associate Professor', 'Assistant Professor',
  'Lecturer', 'Lab Instructor', 'Admin Staff', 'Accountant', 'Librarian',
  'Peon', 'Security Guard', 'Driver', 'Other'
];

// Generate last 12 months for the month filter
const generateMonths = () => {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleString('en-US', { month: 'long', year: 'numeric' }));
  }
  return months;
};

const MONTHS = generateMonths();

const emptyForm = {
  empId: '', name: '', designation: 'Lecturer',
  basic: '', allowances: '', deductions: '',
  month: MONTHS[0], status: 'Pending', datePaid: '',
};

const Payroll = () => {
  if (!checkPermission('View Fee Reports') && !checkPermission('Manage Fee Structure')) {
    return <AccessDenied />;
  }
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterMonth, setFilterMonth]   = useState(MONTHS[0]);
  const [showModal, setShowModal]       = useState(false);
  const [editItem, setEditItem]         = useState(null);
  const [viewPayslip, setViewPayslip]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [data, setData]                 = useState([]);
  const [form, setForm]                 = useState(emptyForm);

  /* ─── fetch ─── */
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)                  params.search = search;
      if (filterStatus !== 'All') params.status  = filterStatus;
      if (filterMonth)            params.month   = filterMonth;
      const res = await axiosInstance.get('/fees/payroll', { params });
      setData(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to fetch payroll');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [search, filterStatus, filterMonth]);

  /* ─── computed net ─── */
  const computedNet = () => {
    const b = Number(form.basic) || 0;
    const a = Number(form.allowances) || 0;
    const d = Number(form.deductions) || 0;
    return Math.max(0, b + a - d);
  };

  /* ─── open modals ─── */
  const openAdd = () => {
    setEditItem(null);
    setForm({ ...emptyForm, month: filterMonth });
    setShowModal(true);
  };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      empId:       item.empId,
      name:        item.name,
      designation: item.designation,
      basic:       item.basic,
      allowances:  item.allowances || '',
      deductions:  item.deductions || '',
      month:       item.month,
      status:      item.status,
      datePaid:    item.datePaid ? new Date(item.datePaid).toISOString().split('T')[0] : '',
    });
    setShowModal(true);
  };

  /* ─── submit ─── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.empId.trim()) return toast.error('Employee ID is required');
    if (!form.name.trim())  return toast.error('Employee name is required');
    if (!form.basic || Number(form.basic) <= 0) return toast.error('Enter a valid basic salary');

    const payload = { ...form, net: computedNet() };
    setSubmitting(true);
    try {
      if (editItem) {
        await axiosInstance.put(`/fees/payroll/${editItem._id || editItem.id}`, payload);
        toast.success('Payroll record updated');
      } else {
        await axiosInstance.post('/fees/payroll', payload);
        toast.success('Payroll entry added successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save payroll entry');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── mark paid ─── */
  const handleMarkPaid = async (item) => {
    try {
      await axiosInstance.put(`/fees/payroll/${item._id || item.id}`, {
        status: 'Paid', datePaid: new Date().toISOString(),
      });
      toast.success(`${item.name}'s salary marked as Paid`);
      fetchData();
    } catch {
      toast.error('Failed to mark as paid');
    }
  };

  /* ─── stats ─── */
  const totalNet   = data.reduce((s, d) => s + (d.net || 0), 0);
  const paidCount  = data.filter(d => d.status === 'Paid').length;
  const pendCount  = data.filter(d => d.status === 'Pending').length;
  const paidAmt    = data.filter(d => d.status === 'Paid').reduce((s, d) => s + (d.net || 0), 0);

  const formatDate = (dt) => dt ? new Date(dt).toLocaleDateString('en-GB') : '—';
  const fd = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">

      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Payroll Management</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Manage employee salaries, allowances, deductions and generate payslips</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button onClick={openAdd} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Plus size={16} /> Add Payroll Entry
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Payroll',   value: `₹${totalNet.toLocaleString()}`,  color: 'bg-blue-50 text-blue-700',    sub: `${data.length} employees` },
          { label: 'Disbursed',       value: `₹${paidAmt.toLocaleString()}`,   color: 'bg-green-50 text-green-700',  sub: `${paidCount} paid` },
          { label: 'Pending Salary',  value: pendCount,                          color: 'bg-orange-50 text-orange-700',sub: 'Awaiting disbursement' },
          { label: 'Month',           value: filterMonth.split(' ')[0],          color: 'bg-purple-50 text-purple-700',sub: filterMonth.split(' ')[1] },
        ].map(c => (
          <div key={c.label} className={`${c.color} rounded-xl p-4`}>
            <p className="text-[11px] font-medium opacity-70 mb-1">{c.label}</p>
            <p className="text-[22px] font-black">{c.value}</p>
            <p className="text-[10px] opacity-60 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by employee name, ID or designation..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
        {[
          { val: filterMonth,  set: setFilterMonth,  opts: MONTHS },
          { val: filterStatus, set: setFilterStatus, opts: ['All', 'Paid', 'Pending', 'Failed'] },
        ].map((f, i) => (
          <div key={i} className="relative">
            <select value={f.val} onChange={e => f.set(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
              {f.opts.map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1 p-4">
        {loading ? (
          <SkeletonLoader type="table" rows={5} cols={9} />
        ) : (
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                {['Emp ID', 'Employee Name', 'Designation', 'Basic Pay', 'Allowances', 'Deductions', 'Net Salary', 'Status', 'Paid On', 'Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
                        <Users size={22} className="text-gray-300" />
                      </div>
                      <p className="text-gray-500 text-[14px] font-medium">No payroll records for {filterMonth}</p>
                      <p className="text-gray-400 text-[12px] mt-1">Click "Add Payroll Entry" to create one</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map(item => (
                  <tr key={item._id || item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-[13px] font-bold text-[#0A6C54] whitespace-nowrap">{item.empId}</td>
                    <td className="py-3 px-4 text-[13px] font-semibold text-gray-800 whitespace-nowrap">{item.name}</td>
                    <td className="py-3 px-4 text-[13px] text-gray-600 whitespace-nowrap">{item.designation}</td>
                    <td className="py-3 px-4 text-[13px] text-gray-800 whitespace-nowrap">₹{(item.basic || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-[13px] text-green-600 font-medium whitespace-nowrap">+₹{(item.allowances || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-[13px] text-red-500 font-medium whitespace-nowrap">-₹{(item.deductions || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-[13px] font-black text-gray-900 whitespace-nowrap">₹{(item.net || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[item.status] || 'bg-gray-50 text-gray-600'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[13px] text-gray-500 whitespace-nowrap">{item.datePaid ? formatDate(item.datePaid) : '—'}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        <button onClick={() => setViewPayslip(item)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500" title="View Payslip">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => { setEditItem(item); setShowModal(true); }} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        {item.status === 'Pending' && (
                          <button onClick={() => handleMarkPaid(item)} className="p-1.5 hover:bg-green-50 rounded-lg text-green-600" title="Mark as Paid">
                            <CheckCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-[16px] font-bold text-gray-800">{editItem ? 'Edit Payroll Entry' : 'Add Payroll Entry'}</h3>
                <p className="text-[12px] text-gray-500 mt-0.5">Net salary auto-calculated from basic + allowances − deductions</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Employee ID <span className="text-red-500">*</span></label>
                <input type="text" required placeholder="e.g. EMP-001" value={form.empId} onChange={fd('empId')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Employee Name <span className="text-red-500">*</span></label>
                <input type="text" required placeholder="Full name" value={form.name} onChange={fd('name')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Designation</label>
                <div className="relative">
                  <select value={form.designation} onChange={fd('designation')}
                    className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {designations.map(d => <option key={d}>{d}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Salary Month</label>
                <div className="relative">
                  <select value={form.month} onChange={fd('month')}
                    className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {MONTHS.map(m => <option key={m}>{m}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Basic Pay (₹) <span className="text-red-500">*</span></label>
                <input type="number" min="0" required placeholder="0" value={form.basic} onChange={fd('basic')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Allowances (₹)</label>
                <input type="number" min="0" placeholder="0" value={form.allowances} onChange={fd('allowances')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Deductions (₹)</label>
                <input type="number" min="0" placeholder="0" value={form.deductions} onChange={fd('deductions')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Status</label>
                <div className="relative">
                  <select value={form.status} onChange={fd('status')}
                    className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {['Pending', 'Paid', 'Failed'].map(s => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              {(form.basic || form.allowances || form.deductions) && (
                <div className="md:col-span-2 bg-[#0A6C54]/5 rounded-xl p-4 border border-[#0A6C54]/10 flex justify-between items-center">
                  <span className="text-[13px] font-semibold text-[#0A6C54]">Net Salary (auto-calculated)</span>
                  <span className="text-[20px] font-black text-[#0A6C54]">₹{computedNet().toLocaleString()}</span>
                </div>
              )}
              <div className="md:col-span-2 flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="bg-[#0A6C54] hover:bg-[#085a46] disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-colors">
                  {submitting ? 'Saving...' : (editItem ? 'Save Changes' : 'Add Entry')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip View + Print Modal */}
      {viewPayslip && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl max-h-[95vh] flex flex-col">
            {/* Modal Header (hidden on print) */}
            <div className="bg-white border-b border-gray-100 p-4 px-6 flex flex-shrink-0 items-center justify-between z-10 print:hidden rounded-t-2xl">
              <h3 className="font-bold text-gray-800 text-[15px]">Employee Payslip</h3>
              <div className="flex gap-3">
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2 rounded-lg text-[13px] font-semibold transition-colors">
                  <Printer size={15} /> Print
                </button>
                <button onClick={() => setViewPayslip(null)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Payslip Content */}
            <div className="p-5 sm:p-10 overflow-y-auto flex-1">
              <div className="border border-gray-200 rounded-2xl p-6 sm:p-8 print:border-none print:rounded-none">
                {/* Header */}
                <div className="text-center border-b border-dashed border-gray-200 pb-6 mb-6">
                  <h4 className="text-2xl font-black text-[#0A6C54] tracking-tight">DIGITAL COLLEGE</h4>
                  <p className="text-[12px] text-gray-500 mt-1">123 Education Lane, Tech City | accounts@college.edu</p>
                  <div className="inline-block mt-3 bg-[#0A6C54]/5 px-4 py-1.5 rounded-full border border-[#0A6C54]/10">
                    <p className="text-[12px] font-bold text-[#0A6C54] tracking-wider uppercase">
                      Payslip — {viewPayslip.month}
                    </p>
                  </div>
                </div>

                {/* Employee Info */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    ['Employee Name', viewPayslip.name],
                    ['Employee ID',   viewPayslip.empId],
                    ['Designation',   viewPayslip.designation],
                    ['Payment Date',  viewPayslip.datePaid ? formatDate(viewPayslip.datePaid) : 'Not yet paid'],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3 print:bg-transparent print:border-b print:border-gray-100">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
                      <p className="text-[13px] font-bold text-gray-800 mt-0.5">{val}</p>
                    </div>
                  ))}
                </div>

                {/* Earnings & Deductions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h5 className="text-[11px] font-black text-gray-600 uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">Earnings</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-500">Basic Pay</span>
                        <span className="font-semibold text-gray-800">₹{(viewPayslip.basic || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-500">Allowances</span>
                        <span className="font-semibold text-green-700">+₹{(viewPayslip.allowances || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[13px] pt-2 border-t border-gray-100 font-bold">
                        <span className="text-gray-700">Gross Pay</span>
                        <span className="text-gray-900">₹{((viewPayslip.basic || 0) + (viewPayslip.allowances || 0)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-gray-600 uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">Deductions</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-500">Tax & PF</span>
                        <span className="font-semibold text-red-600">-₹{(viewPayslip.deductions || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Salary */}
                <div className="bg-gradient-to-r from-[#0A6C54] to-emerald-600 rounded-2xl p-5 flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between sm:items-center items-start text-white">
                  <div>
                    <p className="text-[11px] font-semibold opacity-80 uppercase tracking-wider">Net Salary Payable</p>
                    <p className="text-[12px] opacity-60 mt-0.5">Transfer to employee account</p>
                  </div>
                  <p className="text-[28px] font-black">₹{(viewPayslip.net || 0).toLocaleString()}</p>
                </div>

                {/* Status */}
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-[11px] text-gray-400 italic">Computer generated payslip — no physical signature required</p>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${statusColors[viewPayslip.status] || ''}`}>
                    {viewPayslip.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
