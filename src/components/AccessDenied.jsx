import { ShieldAlert } from 'lucide-react';

const AccessDenied = ({ message = 'Aapke paas is page ko view karne ki permission nahi hai.' }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-2xl border border-gray-100 p-8 shadow-sm h-full">
    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-400 mb-4">
      <ShieldAlert size={32} />
    </div>
    <h2 className="text-[18px] font-bold text-gray-800 font-['Outfit']">Access Denied</h2>
    <p className="text-gray-500 mt-2 text-center max-w-md text-[14px] leading-relaxed">{message}</p>
    <p className="text-[12px] text-gray-400 mt-3">Agar galti lag rahi hai toh Admin se permission request karein.</p>
  </div>
);

export default AccessDenied;
