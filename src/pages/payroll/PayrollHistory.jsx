import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, CheckCircle, CreditCard, Download, FileText, XCircle } from 'lucide-react';
import SkeletonLoader from '../../components/SkeletonLoader';

const PayrollHistory = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [actionModal, setActionModal] = useState({ show: false, type: '', id: '' });
  
  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
  const userRole = adminInfo.role || 'college_admin';
  const userPermissions = adminInfo.permissions || [];
  const canApprove = userRole === 'college_admin' || userRole === 'Super Admin' || userPermissions.includes('Approve Payroll');
  
  // Payment Form State
  const [paymentData, setPaymentData] = useState({
    paymentMode: 'Bank Transfer',
    transactionId: '',
    paymentNotes: ''
  });

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/payroll`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayrolls(res.data);
    } catch (error) {
      toast.error('Failed to fetch payroll history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const handleApprove = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(`${import.meta.env.VITE_API_URL}/payroll/${actionModal.id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Payroll approved');
      setActionModal({ show: false, type: '', id: '' });
      fetchPayrolls();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error approving payroll');
    }
  };

  const handleMarkPaid = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(`${import.meta.env.VITE_API_URL}/payroll/${actionModal.id}/mark-paid`, paymentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Payroll marked as paid');
      setActionModal({ show: false, type: '', id: '' });
      setPaymentData({ paymentMode: 'Bank Transfer', transactionId: '', paymentNotes: '' });
      fetchPayrolls();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error marking as paid');
    }
  };

  const generatePayslipPdf = async (id) => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/payroll/${id}/payslip`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedPayroll(res.data);
      // In a real scenario, you would trigger window.print() here or use jspdf.
      // For this implementation, we will show a modal with the payslip.
    } catch (error) {
      toast.error('Error generating payslip');
    }
  };

  const filtered = payrolls.filter(p => 
    p.employeeId?.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.employeeId?.empId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800">Payroll History & Processing</h2>
          <p className="text-[12px] text-gray-500 mt-0.5">Approve payrolls, process payments and generate payslips</p>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54]" />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-100">
              <th className="py-3 px-4 text-[12px] font-bold text-gray-700">Period</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-700">Employee</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-700">Net Salary</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-700">Status</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="py-8"><SkeletonLoader type="table" rows={4} cols={5} /></td></tr>
            ) : filtered.length > 0 ? (
              filtered.map(p => (
                <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-4 text-[13px] font-medium text-gray-800">
                    {new Date(0, p.month - 1).toLocaleString('default', { month: 'short' })} {p.year}
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-[13px] font-semibold text-gray-800">{p.employeeId?.name}</p>
                    <p className="text-[11px] text-gray-500">{p.employeeId?.empId}</p>
                  </td>
                  <td className="py-3 px-4 text-[13px] font-bold text-[#0A6C54]">₹{p.netSalary?.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <span className={`w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                        ${p.status === 'Generated' ? 'bg-yellow-100 text-yellow-700' : 
                          p.status === 'Approved' ? 'bg-blue-100 text-blue-700' : 
                          p.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {p.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      {p.status === 'Generated' && canApprove && (
                        <button onClick={() => setActionModal({ show: true, type: 'approve', id: p._id })} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Approve">
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {p.status === 'Approved' && canApprove && (
                        <button onClick={() => setActionModal({ show: true, type: 'pay', id: p._id })} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Mark as Paid">
                          <CreditCard size={16} />
                        </button>
                      )}
                      {(p.status === 'Approved' || p.status === 'Paid') && (
                        <button onClick={() => generatePayslipPdf(p._id)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded flex items-center gap-1 text-[11px] font-bold border border-gray-200">
                          <FileText size={14} /> Payslip
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="py-8 text-center text-gray-500 text-[13px]">No payroll records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Action Modals */}
      {actionModal.show && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-[15px] font-bold text-gray-800">
                {actionModal.type === 'approve' ? 'Approve Payroll' : 'Process Payment'}
              </h3>
              <button onClick={() => setActionModal({ show: false, type: '', id: '' })} className="text-gray-400 hover:text-gray-600"><XCircle size={18} /></button>
            </div>
            
            {actionModal.type === 'approve' ? (
              <div className="p-5">
                <p className="text-[13px] text-gray-600 mb-5">Are you sure you want to approve this payroll? Once approved, it will be ready for payment and locked for edits.</p>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setActionModal({ show: false, type: '', id: '' })} className="px-4 py-2 border rounded-lg text-[12px] font-medium text-gray-700">Cancel</button>
                  <button onClick={handleApprove} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[12px] font-semibold">Yes, Approve</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleMarkPaid} className="p-5 flex flex-col gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">Payment Mode</label>
                  <select value={paymentData.paymentMode} onChange={e => setPaymentData({...paymentData, paymentMode: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-[13px]">
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">Transaction/Reference ID</label>
                  <input type="text" required value={paymentData.transactionId} onChange={e => setPaymentData({...paymentData, transactionId: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-[13px]" placeholder="e.g. UTR Number" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">Notes (Optional)</label>
                  <input type="text" value={paymentData.paymentNotes} onChange={e => setPaymentData({...paymentData, paymentNotes: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-[13px]" />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button type="button" onClick={() => setActionModal({ show: false, type: '', id: '' })} className="px-4 py-2 border rounded-lg text-[12px] font-medium text-gray-700">Cancel</button>
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-[12px] font-semibold">Mark as Paid</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Payslip View Modal */}
      {selectedPayroll && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-[15px] font-bold text-gray-800 flex items-center gap-2"><FileText size={16}/> Payslip Preview</h3>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="px-3 py-1.5 bg-gray-900 text-white rounded text-[11px] font-bold flex items-center gap-1"><Download size={12}/> Print</button>
                <button onClick={() => setSelectedPayroll(null)} className="text-gray-500 hover:bg-gray-200 p-1 rounded"><XCircle size={20} /></button>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto print:p-0" id="payslip-content">
              {/* College Header */}
              <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
                <h1 className="text-2xl font-bold uppercase text-gray-900">{selectedPayroll.collegeId?.name || 'COLLEGE NAME'}</h1>
                <p className="text-sm text-gray-600 uppercase mt-1">Payslip for the month of {new Date(0, selectedPayroll.month - 1).toLocaleString('default', { month: 'long' })} {selectedPayroll.year}</p>
              </div>

              {/* Employee Details */}
              <div className="grid grid-cols-2 gap-x-12 gap-y-3 mb-8 text-[13px]">
                <div className="flex justify-between"><span className="text-gray-500 font-medium">Employee Name:</span> <span className="font-bold text-gray-800">{selectedPayroll.employeeId?.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 font-medium">Employee ID:</span> <span className="font-bold text-gray-800">{selectedPayroll.employeeId?.empId}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 font-medium">Department:</span> <span className="font-bold text-gray-800">{selectedPayroll.employeeId?.department}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 font-medium">Designation:</span> <span className="font-bold text-gray-800">{selectedPayroll.employeeId?.designation || selectedPayroll.employeeId?.role}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 font-medium">Working Days:</span> <span className="font-bold text-gray-800">{selectedPayroll.attendanceSummary?.workingDays}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 font-medium">Present Days:</span> <span className="font-bold text-gray-800">{selectedPayroll.attendanceSummary?.presentDays}</span></div>
              </div>

              {/* Financials Table */}
              <div className="grid grid-cols-2 gap-6 mb-8 border border-gray-300">
                {/* Earnings */}
                <div className="border-r border-gray-300">
                  <div className="bg-gray-100 p-2 font-bold text-[12px] border-b border-gray-300 flex justify-between uppercase">
                    <span>Earnings</span><span>Amount (₹)</span>
                  </div>
                  <div className="p-3 min-h-[150px]">
                    {selectedPayroll.earnings.map(e => (
                      <div key={e.code} className="flex justify-between text-[12px] mb-2">
                        <span>{e.name}</span><span>{e.amount.toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 font-bold text-[13px] border-t border-gray-300 flex justify-between bg-gray-50">
                    <span>Gross Earnings</span><span>₹{selectedPayroll.totalEarnings?.toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <div className="bg-gray-100 p-2 font-bold text-[12px] border-b border-gray-300 flex justify-between uppercase">
                    <span>Deductions</span><span>Amount (₹)</span>
                  </div>
                  <div className="p-3 min-h-[150px]">
                    {selectedPayroll.deductions.map(d => (
                      <div key={d.code} className="flex justify-between text-[12px] mb-2">
                        <span>{d.name}</span><span>{d.amount.toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                      </div>
                    ))}
                    {selectedPayroll.deductions.length === 0 && <div className="text-[12px] text-gray-400">No deductions</div>}
                  </div>
                  <div className="p-2 font-bold text-[13px] border-t border-gray-300 flex justify-between bg-gray-50">
                    <span>Total Deductions</span><span>₹{selectedPayroll.totalDeductions?.toLocaleString(undefined, {minimumFractionDigits:2})}</span>
                  </div>
                </div>
              </div>

              {/* Net Pay */}
              <div className="border border-gray-300 p-4 bg-gray-50 flex justify-between items-center mb-12">
                <span className="font-bold text-[14px] uppercase tracking-wide">Net Payable Amount</span>
                <span className="font-black text-[20px] text-[#0A6C54]">₹{selectedPayroll.netSalary?.toLocaleString(undefined, {minimumFractionDigits:2})}</span>
              </div>

              {/* Payment Info & Signatures */}
              <div className="flex justify-between items-end text-[12px]">
                <div className="text-gray-500 space-y-1">
                  <p><strong>Payment Status:</strong> {selectedPayroll.paymentStatus}</p>
                  {selectedPayroll.paymentStatus === 'Paid' && (
                    <>
                      <p><strong>Payment Mode:</strong> {selectedPayroll.paymentMode}</p>
                      <p><strong>Transaction ID:</strong> {selectedPayroll.transactionId}</p>
                      <p><strong>Payment Date:</strong> {new Date(selectedPayroll.paymentDate).toLocaleDateString()}</p>
                    </>
                  )}
                  <p className="mt-4 italic text-[10px]">This is a computer generated payslip.</p>
                </div>
                
                <div className="text-center w-48">
                  <div className="border-b border-gray-400 h-10 mb-2"></div>
                  <p className="font-bold text-gray-800">Authorized Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollHistory;
