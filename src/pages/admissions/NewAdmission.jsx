import { Copy, Check, MessageCircle, ExternalLink, Share2, Link as LinkIcon, QrCode, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';
import toast from 'react-hot-toast';

const NewAdmission = () => {
  if (!checkPermission('Add Admission')) {
    return <AccessDenied />;
  }

  // Get college info from localStorage
  const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');
  const collegeId = adminInfo?.collegeId || adminInfo?._id;
  
  // Construct the public URL using the live frontend link
  const baseUrl = 'https://college-panel-admin.vercel.app';
  const publicUrl = `${baseUrl}/public/admission/${collegeId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success('Link copied to clipboard!');
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Hello! Please use this link to complete your student registration form for our college:\n\n${publicUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const generateCompositeCanvas = async () => {
    return new Promise((resolve) => {
      const qrCanvas = document.getElementById('qr-code-canvas');
      if (!qrCanvas) return resolve(null);
      
      const collegeName = adminInfo?.collegeName || 'College Admission';
      
      // Create a new canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set dimensions
      const width = 400;
      const height = 500;
      canvas.width = width;
      canvas.height = height;
      
      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      
      // Header: College Name
      ctx.fillStyle = 'var(--color-primary)';
      ctx.font = 'bold 24px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      
      // Simple word wrap for long college names
      const maxTextWidth = width - 40;
      let textToPrint = collegeName;
      if (ctx.measureText(collegeName).width > maxTextWidth) {
         ctx.font = 'bold 20px Inter, Arial, sans-serif';
      }
      ctx.fillText(textToPrint, width / 2, 50);
      
      // Subtitle
      ctx.fillStyle = '#4B5563';
      ctx.font = '16px Inter, Arial, sans-serif';
      ctx.fillText('Student Registration Portal', width / 2, 80);
      
      // Draw QR Code
      const qrSize = 250;
      const qrX = (width - qrSize) / 2;
      const qrY = 110;
      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
      
      // Footer messages
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 20px Inter, Arial, sans-serif';
      ctx.fillText('Scan QR Code', width / 2, 410);
      
      ctx.fillStyle = '#6B7280';
      ctx.font = '15px Inter, Arial, sans-serif';
      ctx.fillText('to open & submit your registration form', width / 2, 440);
      
      // Outer Border
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, width - 2, height - 2);

      resolve(canvas);
    });
  };

  const downloadQR = async () => {
    const canvas = await generateCompositeCanvas();
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    let downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'Admission_Form_QR.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    toast.success('QR Code downloaded!');
  };

  const shareQR = async () => {
    const canvas = await generateCompositeCanvas();
    if (!canvas) return;
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'QR.png', { type: 'image/png' })] })) {
          const file = new File([blob], 'Admission_Form_QR.png', { type: 'image/png' });
          await navigator.share({
            title: 'College Admission Form QR',
            text: 'Scan this QR code to open our student registration form.',
            files: [file]
          });
        } else {
          toast.error('Direct sharing not supported on this browser. Please download the QR code instead.');
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing', error);
          toast.error('Failed to share QR code.');
        }
      }
    }, 'image/png');
  };

  return (
    <div className="space-y-6 font-['Inter']">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Student Registration Link</h1>
          <p className="text-[13px] text-gray-500 font-medium mt-1">
            Share the registration link with admitted students.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-3xl mx-auto text-center mt-10">
        
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Share2 className="text-primary" size={36} strokeWidth={1.5} />
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-2">Automated Student Registration</h2>
        <p className="text-[13px] text-gray-500 mb-8 max-w-lg mx-auto leading-relaxed">
          Manual data entry is no longer required. Generate your unique student registration link and share it directly with admitted students via WhatsApp or Email. Students will fill the form themselves, and it will appear in your <b>Pending Applications</b> for verification.
        </p>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between gap-4 mb-8 text-left">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm flex-shrink-0">
              <LinkIcon size={18} className="text-gray-400" />
            </div>
            <p className="text-[13px] font-medium text-gray-700 truncate font-mono">
              {publicUrl}
            </p>
          </div>
          <button 
            onClick={copyToClipboard}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 flex-shrink-0"
          >
            <Copy size={14} /> Copy
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <button 
            onClick={shareOnWhatsApp}
            className="px-6 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl text-[13px] font-bold shadow-md shadow-[#25D366]/20 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <MessageCircle size={18} /> Share via WhatsApp
          </button>
          
          <a 
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-[13px] font-bold transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            Preview Form <ExternalLink size={16} />
          </a>
        </div>
        
        {/* QR Code Section */}
        <div className="border-t border-gray-100 pt-8 mt-4 flex flex-col items-center">
          <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
            <QrCode size={18} className="text-primary" /> Scan QR Code to Apply
          </h3>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 inline-block mb-6">
            <QRCodeCanvas 
              id="qr-code-canvas" 
              value={publicUrl} 
              size={180} 
              bgColor={"#ffffff"}
              fgColor={"#022a36"}
              level={"H"}
              includeMargin={false}
            />
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={downloadQR}
              className="px-5 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[12px] font-bold transition-colors flex items-center gap-2"
            >
              <Download size={14} /> Download QR
            </button>
            <button 
              onClick={shareQR}
              className="px-5 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[12px] font-bold transition-colors flex items-center gap-2"
            >
              <Share2 size={14} /> Share QR
            </button>
          </div>
        </div>
        
      </div>

    </div>
  );
};

export default NewAdmission;
