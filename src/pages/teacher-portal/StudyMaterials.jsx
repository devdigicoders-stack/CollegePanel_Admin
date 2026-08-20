import React, { useState, useEffect } from 'react';
import { BookText, Plus, X, Download } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import SkeletonLoader from '../../components/SkeletonLoader';
import ClassSelector from './components/ClassSelector';

const StudyMaterials = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [materialForm, setMaterialForm] = useState({ title: '', type: 'PDF Document', fileUrl: '', size: '' });
  
  const [uploadMode, setUploadMode] = useState('link');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (selectedClass) {
      fetchMaterials(selectedClass);
    }
  }, [selectedClass]);

  const fetchMaterials = async (classId) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/teacher-portal/class/${classId}/study-materials`);
      setMaterials(res.data || []);
    } catch (error) {
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setMaterialForm(prev => ({ ...prev, size: `${sizeMB} MB` }));
    }
  };

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let finalFileUrl = materialForm.fileUrl;
      
      if (uploadMode === 'file') {
        if (!selectedFile) {
          toast.error('Please select a file to upload');
          setUploading(false);
          return;
        }
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        
        const uploadRes = await axiosInstance.post('/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        finalFileUrl = axiosInstance.defaults.baseURL.replace('/api', '') + uploadRes.data.url;
      }
      
      const payload = { ...materialForm, fileUrl: finalFileUrl };
      await axiosInstance.post(`/teacher-portal/class/${selectedClass}/study-materials`, payload);
      
      toast.success('Material uploaded successfully');
      setShowModal(false);
      setMaterialForm({ title: '', type: 'PDF Document', fileUrl: '', size: '' });
      setSelectedFile(null);
      setUploadMode('link');
      fetchMaterials(selectedClass);
    } catch (error) {
      toast.error('Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="font-['Inter'] space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight font-['Outfit'] flex items-center gap-2">
            <BookText size={24} className="text-primary" />
            Study Materials
          </h1>
          <p className="text-[13px] text-gray-500 font-medium mt-1">Upload and manage resources for your class.</p>
        </div>
        <ClassSelector selectedClass={selectedClass} setSelectedClass={setSelectedClass} />
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 p-6 min-h-[400px]">
        <div className="flex justify-end mb-6">
          <button 
            onClick={() => setShowModal(true)}
            disabled={!selectedClass}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Plus size={16} /> Upload Material
          </button>
        </div>

        {loading ? (
          <SkeletonLoader type="card" count={3} />
        ) : !selectedClass ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
            <BookText size={48} className="mb-4 opacity-20" />
            <p>Please select a class to view materials.</p>
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No study materials uploaded yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map(m => (
              <div key={m._id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">{m.type}</span>
                    <span className="text-xs font-medium text-gray-400">{m.size}</span>
                  </div>
                  <h4 className="font-bold text-gray-800 text-base mb-1 line-clamp-2">{m.title}</h4>
                  <p className="text-xs font-medium text-gray-500 mb-5">Uploaded on: {new Date(m.createdAt).toLocaleDateString()}</p>
                </div>
                <a 
                  href={m.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  <Download size={16} className="text-primary" /> View / Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-lg">Upload Study Material</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleUploadMaterial} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Material Title</label>
                <input type="text" required value={materialForm.title} onChange={e => setMaterialForm({...materialForm, title: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary" placeholder="E.g., Chapter 1 Notes" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Type</label>
                  <select value={materialForm.type} onChange={e => setMaterialForm({...materialForm, type: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary">
                    <option value="PDF">PDF Document</option>
                    <option value="PPT">Presentation (PPT)</option>
                    <option value="Video">Video Link</option>
                    <option value="Link">External Link</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Approx. Size</label>
                  <input type="text" value={materialForm.size} onChange={e => setMaterialForm({...materialForm, size: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary" placeholder="E.g., 2.5 MB" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Upload Method</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="uploadMode" checked={uploadMode === 'file'} onChange={() => setUploadMode('file')} className="text-primary focus:ring-primary" />
                    Upload File
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="uploadMode" checked={uploadMode === 'link'} onChange={() => setUploadMode('link')} className="text-primary focus:ring-primary" />
                    Provide URL Link
                  </label>
                </div>
              </div>

              {uploadMode === 'link' ? (
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">External URL / Drive Link</label>
                  <input type="url" required value={materialForm.fileUrl} onChange={e => setMaterialForm({...materialForm, fileUrl: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary" placeholder="https://..." />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Select File to Upload</label>
                  <input type="file" required onChange={handleFileChange} className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                  {selectedFile && <p className="text-[11px] text-gray-500 mt-1 ml-1">Selected: {selectedFile.name}</p>}
                </div>
              )}
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm font-semibold text-gray-600">Cancel</button>
                <button type="submit" disabled={uploading} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyMaterials;
