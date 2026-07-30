import React, { useState } from 'react';
import { Search, Plus, Eye, ChevronDown, Download, X, Upload, CheckCircle, XCircle } from 'lucide-react';

const expensesData = [
  { id: 1, expNo: 'EXP/2024/001', category: 'Electricity', vendor: 'PGVCL', amount: 18500, date: '2024-02-15', mode: 'Bank Transfer', invoiceNo: 'INV-2024-001', dept: 'Admin', description: 'Monthly electricity bill', approvalStatus: 'Approved', approvedBy: 'Principal' },
  { id: 2, expNo: 'EXP/2024/002', category: 'Lab Equipment', vendor: 'Tech Supplies Ltd.', amount: 45000, date: '2024-02-14', mode: 'Cheque', invoiceNo: 'INV-2024-045', dept: 'IT Dept', description: 'New lab computers', approvalStatus: 'Pending', approvedBy: null },
  { id: 3, expNo: 'EXP/2024/003', category: 'Stationery', vendor: 'Office Mart', amount: 3200, date: '2024-02-13', mode: 'Cash', invoiceNo: 'INV-2024-012', dept: 'Admin', description: 'Office stationery items', approvalStatus: 'Approved', approvedBy: 'HOD Admin' },
  { id: 4, expNo: 'EXP/2024/004', category: 'Maintenance', vendor: 'BuildFix Co.', amount: 12000, date: '2024-02-12', mode: 'Bank Transfer', invoiceNo: 'INV-2024-078', dept: 'Civil', description: 'Building maintenance work', approvalStatus: 'Approved', approvedBy: 'Principal' },
  { id: 5, expNo: 'EXP/2024/005', category: 'Internet', vendor: 'Jio Fiber', amount: 5000, date: '2024-02-11', mode: 'UPI', invoiceNo: 'INV-2024-023', dept: 'Admin', description: 'Monthly internet bill', approvalStatus: 'Approved', approvedBy: 'Accountant' },
  { id: 6, expNo: 'EXP/2024/006', category: 'Events', vendor: 'Event Planners', amount: 35000, date: '2024-02-10', mode: 'Cheque', invoiceNo: 'INV-2024-056', dept: 'Admin', description: 'Annual day event expenses', approvalStatus: 'Under Review', approvedBy: null },
  { id: 7, expNo: 'EXP/2024/007', category: 'Transport', vendor: 'City Transport', amount: 8500, date: '2024-02-09', mode: 'Cash', invoiceNo: 'INV-2024-034', dept: 'Admin', description: 'Student trip transport', approvalStatus: 'Approved', approvedBy: 'HOD Admin' },
  { id: 8, expNo: 'EXP/2024/008', category: 'Repairs', vendor: 'ElecFix', amount: 6000, date: '2024-02-08', mode: 'Cash', invoiceNo: 'INV-2024-067', dept: 'EE Dept', description: 'Lab equipment repair', approvalStatus: 'Rejected', approvedBy: null },
];

const statusColors = {
  'Approved': 'bg-green-100 text-green-700',
  'Pending': 'bg-orange-100 text-orange-700',
  'Under Review': 'bg-blue-100 text-blue-700',
  'Rejected': 'bg-red-100 text-red-700',
};

const categories = ['Electricity', 'Maintenance', 'Stationery', 'Lab Equipment', 'Transport', 'Salary', 'Events', 'Repairs', 'Internet', 'Office Expenses'];

const Expenses = () => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const filtered = expensesData.filter(e => {
    const matchSearch = e.vendor.toLowerCase().includes(search.toLowerCase()) || e.expNo.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'All' || e.category === filterCategory;
    const matchStatus = filterStatus === 'All' || e.approvalStatus === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  const totalExpense = filtered.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Expenses</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Track and manage all college expenses</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">
            <Download size={15} /> Export
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold">
            <Plus size={15} /> Add Expense
          </button>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Expenses', value: `₹${totalExpense.toLocaleString()}`, color: 'bg-red-50 text-red-700' },
          { label: 'Approved', value: filtered.filter(e => e.approvalStatus === 'Approved').length, color: 'bg-green-50 text-green-700' },
          { label: 'Pending Approval', value: filtered.filter(e => e.approvalStatus === 'Pending').length, color: 'bg-orange-50 text-orange-700' },
          { label: 'This Month', value: `₹${expensesData.reduce((s, e) => s + e.amount, 0).toLocaleString()}`, color: 'bg-blue-50 text-blue-700' },
        ].map(card => (
          <div key={card.label} className={`${card.color} rounded-xl p-4`}>
            <p className="text-[11px] font-medium mb-1 opacity-80">{card.label}</p>
            <p className="text-[20px] font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by vendor, description..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
        <div className="relative">
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
            <option>All</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
        <div className="relative">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-9 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] cursor-pointer">
            <option>All</option>
            {Object.keys(statusColors).map(s => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <table className="w-full text-left border-collapse min-w-[1300px]">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-100">
              {['Exp No.', 'Category', 'Vendor', 'Amount', 'Date', 'Mode', 'Invoice No.', 'Department', 'Description', 'Approval', 'Actions'].map(h => (
                <th key={h} className="py-3 px-4 text-[12px] font-bold text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 text-[13px] font-semibold text-[#0A6C54]">{e.expNo}</td>
                <td className="py-3 px-4 text-[13px] text-gray-700">{e.category}</td>
                <td className="py-3 px-4 text-[13px] font-medium text-gray-800">{e.vendor}</td>
                <td className="py-3 px-4 text-[13px] font-semibold text-red-600">₹{e.amount.toLocaleString()}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{e.date}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{e.mode}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{e.invoiceNo}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600">{e.dept}</td>
                <td className="py-3 px-4 text-[13px] text-gray-600 max-w-[150px] truncate">{e.description}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[e.approvalStatus]}`}>{e.approvalStatus}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye size={14} className="text-gray-500" /></button>
                    {e.approvalStatus === 'Pending' && (
                      <>
                        <button className="p-1.5 hover:bg-green-100 rounded-lg"><CheckCircle size={14} className="text-green-600" /></button>
                        <button className="p-1.5 hover:bg-red-100 rounded-lg"><XCircle size={14} className="text-red-600" /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-[16px] font-bold text-gray-800">Add Expense</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Expense Category</label>
                <div className="relative">
                  <select className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              {[
                { label: 'Vendor Name', placeholder: 'Enter vendor name' },
                { label: 'Amount (₹)', placeholder: 'Enter amount' },
                { label: 'Invoice Number', placeholder: 'Enter invoice no.' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">{f.label}</label>
                  <input type="text" placeholder={f.placeholder} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
                </div>
              ))}
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Expense Date</label>
                <input type="date" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Payment Mode</label>
                <div className="relative">
                  <select className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {['Cash', 'Bank Transfer', 'Cheque', 'UPI', 'Card'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Department</label>
                <div className="relative">
                  <select className="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]">
                    {['Admin', 'Civil Dept', 'IT Dept', 'Mechanical Dept', 'Electrical Dept'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea rows={2} placeholder="Enter expense description..." className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Bill / Invoice Attachment</label>
                <div className="border border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center gap-3 hover:border-[#0A6C54] transition-colors cursor-pointer">
                  <Upload size={18} className="text-gray-400" />
                  <span className="text-[13px] text-gray-500">Click to upload bill (PDF, JPG, PNG)</span>
                  <input type="file" className="hidden" />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold">Save Expense</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
