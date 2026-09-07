import React, { useRef } from 'react';
import { Printer, X, CheckCircle, ShieldCheck, Download } from 'lucide-react';

const FineReceiptModal = ({ receipt, onClose, collegeInfo }) => {
  const printRef = useRef();

  if (!receipt) return null;

  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
  const collegeName = collegeInfo?.name || adminInfo?.collegeName || adminInfo?.name || 'College Library';

  const handlePrint = () => {
    window.print();
  };

  const isPaid = receipt.fineStatus === 'Paid' || (receipt.balance === 0 && receipt.paidAmount > 0);
  const isWaived = receipt.fineStatus === 'Waived';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto font-['Inter']">
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-fine-receipt, #printable-fine-receipt * {
            visibility: visible;
          }
          #printable-fine-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none;
            border: none;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Action Bar (No Print) */}
        <div className="no-print bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer size={18} className="text-emerald-400" />
            <span className="text-sm font-black tracking-wide">Library Fine Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Printer size={14} /> Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-fine-receipt" ref={printRef} className="p-6 sm:p-8 space-y-5 bg-white text-gray-800">
          
          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-dashed border-gray-200">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{collegeName}</h2>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Central Library • Fine Payment Receipt</p>
            <div className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black bg-gray-100 text-gray-700 tracking-wider">
              RECEIPT NO: <span className="font-mono text-primary font-bold">{receipt.receiptNumber || 'LIB-RCP-PENDING'}</span>
            </div>
          </div>

          {/* Date & Borrower Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Student / Member</p>
              <p className="font-bold text-gray-900 text-sm">{receipt.memberName || 'N/A'}</p>
              {receipt.memberId && receipt.memberId !== 'N/A' && (
                <p className="text-[11px] font-mono text-gray-500">ID: {receipt.memberId}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Receipt Date</p>
              <p className="font-bold text-gray-900 text-sm">
                {receipt.paidAt ? new Date(receipt.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN')}
              </p>
              <p className="text-[11px] text-gray-500 font-mono">
                {receipt.paidAt ? new Date(receipt.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Book Details */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Book Title:</span>
              <span className="font-bold text-gray-900 text-right max-w-[240px] truncate">{receipt.bookTitle}</span>
            </div>
            {receipt.accessionNo && (
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Accession / Barcode:</span>
                <span className="font-mono font-bold text-gray-800">{receipt.accessionNo}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Due Date:</span>
              <span className="font-medium text-gray-700">
                {receipt.dueDate ? new Date(receipt.dueDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Return Date:</span>
              <span className="font-medium text-gray-700">
                {receipt.returnDate ? new Date(receipt.returnDate).toLocaleDateString() : new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Calculation & Payment Summary */}
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Total Fine Levied:</span>
              <span className="font-bold text-gray-900">₹{receipt.fineAmount}</span>
            </div>
            <div className="flex justify-between text-emerald-800 font-bold text-sm pt-1 border-t border-emerald-200/50">
              <span>Amount Paid:</span>
              <span className="text-emerald-700">₹{receipt.paidAmount || 0}</span>
            </div>
            <div className="flex justify-between text-gray-600 font-medium">
              <span>Balance Due:</span>
              <span className={`font-bold ${receipt.balance > 0 ? 'text-amber-600' : 'text-gray-700'}`}>
                ₹{receipt.balance !== undefined ? receipt.balance : Math.max(0, receipt.fineAmount - (receipt.paidAmount || 0))}
              </span>
            </div>
            <div className="flex justify-between text-gray-600 font-medium pt-1">
              <span>Payment Mode:</span>
              <span className="font-bold px-2 py-0.5 rounded bg-white text-gray-800 border border-emerald-200 uppercase text-[10px]">
                {receipt.paymentMode || 'Cash'}
              </span>
            </div>
          </div>

          {/* Status Badge & Stamp */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {isWaived ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800">
                  WAIVED / DISCOUNTED
                </span>
              ) : isPaid ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                  <CheckCircle size={14} /> PAID & CLEARED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800">
                  PARTIAL PAYMENT
                </span>
              )}
            </div>

            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Authorized Signature</p>
              <p className="text-xs font-bold text-gray-800 mt-1">{receipt.collectedBy || 'Librarian'}</p>
            </div>
          </div>

          {/* Receipt Footer note */}
          <p className="text-[9px] text-center text-gray-400 pt-3 border-t border-dashed border-gray-200">
            This is a computer-generated library fine slip. Keep it for your records and semester no-dues clearance.
          </p>
        </div>

        {/* Bottom Close Button (No Print) */}
        <div className="no-print p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="w-full bg-gray-900 hover:bg-black text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors shadow-sm"
          >
            Close Receipt
          </button>
        </div>

      </div>
    </div>
  );
};

export default FineReceiptModal;
