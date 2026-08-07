import { useState, useEffect } from 'react';
import { Download, CreditCard } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';

const Fees = () => {
  const [feeDetails, setFeeDetails] = useState(null);
  const [payments, setPayments] = useState([]);

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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
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
              <th className="py-3 px-4 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? payments.map(item => (
              <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 text-[13px] text-gray-800 font-semibold">{new Date(item.date).toLocaleDateString()}</td>
                <td className="py-3 px-4 text-[13px] text-gray-500 font-mono font-bold">{item.receiptNo}</td>
                <td className="py-3 px-4 text-[13px] text-gray-700">{item.mode}</td>
                <td className="py-3 px-4 text-[13px] text-right font-bold text-green-700">₹{item.amount.toLocaleString()}</td>
                <td className="py-3 px-4 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button onClick={() => window.print()} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Download Receipt">
                    <Download size={15} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="py-4 text-center text-[13px] text-gray-500">No payment history found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Fees;
