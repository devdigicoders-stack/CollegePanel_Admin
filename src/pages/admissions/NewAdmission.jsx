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

  const generateCompositeCanvas = () => {
    return new Promise((resolve) => {
      const qrCanvas = document.getElementById('qr-code-canvas');
      if (!qrCanvas) return resolve(null);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      // Premium Design Canvas Size
      const width = 800;
      const height = 1100;
      canvas.width = width;
      canvas.height = height;
      
      // Soft Gradient Background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#f8fafc'); 
      gradient.addColorStop(1, '#e2e8f0'); 
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Central White Card
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 20;
      ctx.fillStyle = '#ffffff';
      
      const rectX = 50;
      const rectY = 50;
      const rectW = 700;
      const rectH = 1000;
      const radius = 30;
      
      ctx.beginPath();
      ctx.moveTo(rectX + radius, rectY);
      ctx.lineTo(rectX + rectW - radius, rectY);
      ctx.quadraticCurveTo(rectX + rectW, rectY, rectX + rectW, rectY + radius);
      ctx.lineTo(rectX + rectW, rectY + rectH - radius);
      ctx.quadraticCurveTo(rectX + rectW, rectY + rectH, rectX + rectW - radius, rectY + rectH);
      ctx.lineTo(rectX + radius, rectY + rectH);
      ctx.quadraticCurveTo(rectX, rectY + rectH, rectX, rectY + rectH - radius);
      ctx.lineTo(rectX, rectY + radius);
      ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
      ctx.closePath();
      ctx.fill();
      
      // Reset shadow for text and images
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      
      // Header Text
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 42px "Inter", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('COLLEGE ADMISSION', width / 2, 130);
      
      ctx.fillStyle = '#10b981';
      ctx.font = '700 20px "Inter", Arial, sans-serif';
      ctx.fillText('SCAN TO FILL ADMISSION FORM', width / 2, 170);
      
      // Line separator
      ctx.beginPath();
      ctx.moveTo(150, 210);
      ctx.lineTo(650, 210);
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Details Section
      ctx.fillStyle = '#334155';
      ctx.font = '800 28px "Inter", Arial, sans-serif';
      
      let cName = adminInfo?.collegeName || 'Our College';
      if (ctx.measureText(cName).width > 600) {
         ctx.font = '800 22px "Inter", Arial, sans-serif';
      }
      ctx.fillText(cName, width / 2, 270);
      
      ctx.fillStyle = '#64748b';
      ctx.font = '600 18px "Inter", Arial, sans-serif';
      ctx.fillText('NEW STUDENT REGISTRATION PORTAL', width / 2, 310);

      // Course & Sem Badges
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(150, 340, 500, 50); 
      
      ctx.fillStyle = '#0ea5e9'; 
      ctx.font = '700 18px "Inter", Arial, sans-serif';
      ctx.fillText(`Batch ${new Date().getFullYear()}-${new Date().getFullYear() + 1}  •  All Branches`, width / 2, 372);

      // QR Border
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#10b981';
      const qrSize = 420;
      const qrX = (width - qrSize) / 2;
      const qrY = 460;
      
      ctx.beginPath();
      ctx.roundRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40, 20);
      ctx.stroke();
      
      // Draw QR Code from canvas
      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
      
      // Footer Note
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 16px "Inter", Arial, sans-serif';
      ctx.fillText('Powered by College ERP', width / 2, 980);

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
