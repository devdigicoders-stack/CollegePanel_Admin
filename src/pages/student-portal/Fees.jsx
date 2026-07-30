import React from 'react';
import { Download, CreditCard, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Fees = () => {
  const ledger = [
    { id: 1, feeType: 'Tuition Fee - Sem 4', amount: 25000, paid: 25000, due: 0, deadline: 'Paid', status: 'Settled', rcptNo: 'RCPT-OB8812' },
    { id: 2, feeType: 'Hostel Fee - Annual', amount: 15000, paid: 2500, due: 12500, deadline: '2024-03-01', status: 'Due', rcptNo: 'RCPT-HB9012' },
  ];

  const handlePay = (feeType, amount) => {
    toast.success(`Online payment request for ${feeType} of ₹${amount} initiated!`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-[16px] font-bold text-gray-800">My Fee Ledger & Receipts</h2>
        <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Verify paid tuition fee installments, track hostel dues, and download receipts</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Fee Category</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Total Fee</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Paid Amount</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800 text-right">Dues Pending</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Receipt / Due Date</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Payment Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] text-gray-800 font-bold">{item.feeType}</td>
                <td className="py-4 px-6 text-[13px] text-right font-bold text-gray-900">₹{item.amount.toLocaleString()}</td>
                <td className="py-4 px-6 text-[13px] text-right font-bold text-green-700">₹{item.paid.toLocaleString()}</td>
                <td className="py-4 px-6 text-[13px] text-right font-bold text-red-500">₹{item.due.toLocaleString()}</td>
                <td className="py-4 px-6 text-[13px] text-gray-500 font-mono font-semibold">{item.due === 0 ? item.rcptNo : item.deadline}</td>
                <td className="py-4 px-6 text-[13px]">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    item.status === 'Settled' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6 flex gap-2">
                  {item.due > 0 ? (
                    <button onClick={() => handlePay(item.feeType, item.due)} className="px-2.5 py-1 text-[11px] font-bold bg-[#0A6C54] text-white rounded hover:bg-[#085a46] flex items-center gap-1">
                      <CreditCard size={12} /> Pay Now
                    </button>
                  ) : (
                    <button onClick={() => toast.success('Receipt download initiated!')} className="p-1 hover:bg-gray-100 rounded text-gray-600" title="Download Receipt"><Download size={15} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Fees;
