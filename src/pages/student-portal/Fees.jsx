import { useState, useEffect } from 'react';
import { Download, CreditCard, Printer, X } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const Fees = () => {
  const [feeDetails, setFeeDetails] = useState(null);
  const [payments, setPayments] = useState([]);
  const [printData, setPrintData] = useState(null);
  const [collegeDetails, setCollegeDetails] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);

  const [paying, setPaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const res = await axiosInstance.get('/student-portal/fees');
      setFeeDetails(res.data.feeDetails);
      setPayments(res.data.payments);
      setCollegeDetails(res.data.college);
      setStudentDetails(res.data.student);
    } catch (error) {
      toast.error('Failed to fetch fee details');
    } finally { setLoading(false); }
  };

  const handlePay = async (amount) => {
    try {
      setPaying(true);
      await axiosInstance.post('/student-portal/fees/pay', { amount });
      toast.success(`Payment of ₹${amount} successful!`);
      fetchFees();
    } catch (error) {
      toast.error('Failed to process payment');
    } finally {
      setLoading(false);
      setPaying(false);
    }
  };

  
  if (loading) {
    return (
      <div className="p-6">
        <SkeletonLoader type="table" rows={6} cols={5} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col font-['Inter'] print:h-auto print:block">
      <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col flex-1 ${printData ? 'print:hidden' : ''}`}>
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-[16px] font-bold text-gray-800">My Fee Ledger & Receipts</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify paid tuition fee installments, track dues, and download receipts</p>
        </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
          <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Total Fee (Annual)</p>
          <h4 className="text-[18px] font-bold text-gray-800 mt-1">₹{feeDetails ? feeDetails.totalFee?.toLocaleString() : 0}</h4>
        </div>
        <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
          <p className="text-[11px] text-green-600 font-semibold uppercase tracking-wider">Total Paid</p>
          <h4 className="text-[18px] font-bold text-green-700 mt-1">₹{feeDetails ? feeDetails.paid?.toLocaleString() : 0}</h4>
        </div>
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex justify-between items-center">
          <div>
            <p className="text-[11px] text-red-600 font-semibold uppercase tracking-wider">Pending Dues</p>
            <h4 className="text-[18px] font-bold text-red-700 mt-1">₹{feeDetails ? feeDetails.pending?.toLocaleString() : 0}</h4>
          </div>
          {feeDetails && feeDetails.pending > 0 && (
            <button 
              onClick={() => handlePay(feeDetails.pending)} 
              disabled={paying}
              className="px-3 py-1.5 text-[12px] font-bold bg-[#0A6C54] text-white rounded-lg hover:bg-[#085a46] flex items-center gap-1.5 disabled:opacity-70 transition-colors"
            >
              {paying ? <span className="animate-spin text-lg leading-none">↻</span> : <CreditCard size={14} />}
              {paying ? 'Processing...' : 'Pay Now'}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1 px-6 pb-6">
        <h3 className="font-bold text-gray-800 text-[14px] mb-3">Payment History</h3>
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Date</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Receipt No</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Payment Mode</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-right">Amount Paid</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Payment Status</th>
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? payments.map(item => (
              <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 text-[13px] text-gray-800 font-semibold">{new Date(item.date).toLocaleDateString('en-GB')}</td>
                <td className="py-3 px-4 text-[13px] text-[#0A6C54] font-semibold">{item.receiptNo}</td>
                <td className="py-3 px-4 text-[13px] text-gray-700">{item.mode}</td>
                <td className="py-3 px-4 text-[13px] text-right font-bold text-green-700">₹{item.amount.toLocaleString()}</td>
                <td className="py-3 px-4 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Completed' || item.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button onClick={() => setPrintData(item)} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors inline-flex items-center" title="Print Receipt">
                    <Printer size={15} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="py-8 text-center text-[13px] text-gray-500">No payment history found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      </div>

      {/* Awesome Printable Receipt Modal */}
      {printData && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 sm:p-6 print:static print:bg-transparent print:p-0 print:block">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden print:shadow-none print:max-h-none print:w-full print:overflow-visible">
            
            {/* Action Bar (Hidden on Print) */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 px-6 flex items-center justify-between print:hidden z-10">
              <h3 className="font-bold text-gray-800 text-[15px]">Fee Receipt</h3>
              <div className="flex items-center gap-3">
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2 rounded-lg text-[13px] font-semibold transition-colors">
                  <Printer size={16}/> Print
                </button>
                <button onClick={() => setPrintData(null)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="p-8 sm:p-12 print:p-0 bg-white" id="printable-receipt">
              <div className="border border-gray-200 rounded-2xl p-8 sm:p-10 print:border-none print:p-0">
                
                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#0A6C54] tracking-tight">{collegeDetails?.collegeName || 'COLLEGE NAME'}</h1>
                    <p className="text-[13px] text-gray-500 mt-2 font-medium">{collegeDetails?.address || 'College Address'}</p>
                    <p className="text-[13px] text-gray-500 mt-0.5 font-medium">Phone: {collegeDetails?.contactNumber || 'N/A'} | Email: {collegeDetails?.officialEmail || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-wider uppercase">FEE RECEIPT</h2>
                    <p className="text-[13px] font-semibold text-gray-600 mt-3">Receipt No: <span className="text-gray-900 font-bold">{printData.receiptNo}</span></p>
                    <p className="text-[13px] font-semibold text-gray-500 mt-0.5">Date: <span className="text-gray-800">{new Date(printData.date).toLocaleDateString('en-GB')}</span></p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 print:bg-transparent print:border-none print:p-0">
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-2">Student Details</p>
                    <p className="font-bold text-gray-900 text-[16px]">{studentDetails?.name || 'Student Name'}</p>
                    <p className="text-[13px] text-gray-600 mt-1">Roll No: <span className="font-semibold text-gray-800">{studentDetails?.rollNo || 'N/A'}</span></p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 print:bg-transparent print:border-none print:p-0 text-right">
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-2">Payment Details</p>
                    <p className="text-[13px] text-gray-600">Payment Mode: <span className="font-semibold text-gray-800">{printData.mode}</span></p>
                    <p className="text-[13px] text-gray-600 mt-1">Status: <span className={`font-bold ${printData.status === 'Cancelled' ? 'text-red-600' : 'text-green-600'}`}>{printData.status}</span></p>
                  </div>
                </div>

                {/* Amount Table */}
                <table className="w-full mb-10">
                  <thead>
                    <tr className="bg-gray-50 border-y border-gray-200">
                      <th className="py-3 px-4 text-left text-[13px] font-bold text-gray-800">Description</th>
                      <th className="py-3 px-4 text-right text-[13px] font-bold text-gray-800">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-4 text-[14px] font-medium text-gray-700">Tuition Fee Payment</td>
                      <td className="py-4 px-4 text-[14px] font-bold text-gray-900 text-right">₹{(printData.amount || 0).toLocaleString()}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td className="py-4 px-4 text-right font-bold text-gray-800 text-[14px]">Total Amount Received</td>
                      <td className="py-4 px-4 text-right font-black text-xl text-[#0A6C54]">₹{(printData.amount || 0).toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>

                {/* Footer Signatures */}
                <div className="flex justify-between items-end mt-16 pt-8 border-t border-gray-200">
                  <div className="max-w-[60%]">
                    <p className="text-[11px] text-gray-500 italic">This is a computer generated receipt and does not require a physical signature.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-40 border-b-2 border-gray-400 mb-2"></div>
                    <p className="text-[13px] font-bold text-gray-700">Authorized Signatory</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;
