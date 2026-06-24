import { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { resumeAPI, analysisAPI } from '../services/api';
import { FileText, ArrowRight, Trash2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resumeId, setResumeId] = useState(null);
  
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentUploads();
  }, []);

  const fetchRecentUploads = async () => {
    try {
      setRecentLoading(true);
      const response = await analysisAPI.getAll({ limit: 5 });
      setRecentAnalyses(response.data.analyses || []);
    } catch (err) {
      console.error('Failed to load recent uploads:', err);
    } finally {
      setRecentLoading(false);
    }
  };

  // Handle file drops via React Dropzone
  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
      toast.success(`${selectedFile.name} loaded successfully`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: uploading || analyzing
  });

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setResumeId(null);
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      // Simulate progress updates for a smoother visual feel
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 10;
        });
      }, 200);

      const response = await resumeAPI.upload(formData);
      clearInterval(progressInterval);
      setProgress(95);
      setResumeId(response.data._id);
      
      toast.success('Resume uploaded successfully!');
      
      // Auto-analyze after upload completes
      handleAnalyze(response.data._id);
    } catch (error) {
      toast.error(error.message || 'Failed to upload resume');
      setUploading(false);
      setProgress(0);
    }
  };

  const handleAnalyze = async (id = resumeId) => {
    if (!id) {
      toast.error('Please upload a resume first');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await analysisAPI.analyze(id, { jobDescription });
      setProgress(100);
      toast.success('Analysis complete!');
      setTimeout(() => {
        navigate(`/analysis/${response.data._id}`);
      }, 400);
    } catch (error) {
      toast.error(error.message || 'Failed to analyze resume');
      setUploading(false);
      setAnalyzing(false);
    }
  };

  // Circular Progress calculation
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      
      {/* Visual background elements */}
      <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[100px] -mr-64 -mt-32 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 -z-10 w-[300px] h-[300px] bg-secondary-500/5 rounded-full blur-[80px] -ml-32 -mb-16 pointer-events-none"></div>

      {/* Header Section */}
      <header className="space-y-2">
        <h2 className="font-black font-display text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">Optimise Your Path</h2>
        <p className="font-medium text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl">
          Upload your current resume to let our precision AI analyze your skills, experience, and keyword alignment for your target roles.
        </p>
      </header>

      {/* Drag & Drop Zone Container */}
      <section className="relative">
        <div
          {...getRootProps()}
          className={`upload-dashed glass-card rounded-2xl p-8 flex flex-col items-center justify-center min-h-[340px] cursor-pointer transition-all duration-300 group ${
            isDragActive 
              ? 'bg-primary-500/[0.04] scale-[1.01] border-primary-500' 
              : 'hover:bg-primary-500/[0.02] border-slate-200/60 dark:border-slate-800/80'
          }`}
          id="drop-zone"
        >
          <input {...getInputProps()} />

          <AnimatePresence mode="wait">
            {uploading || analyzing ? (
              // Active/Uploading View
              <motion.div 
                key="uploading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md flex flex-col items-center"
              >
                <div className="relative w-24 h-24 mb-6">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle 
                      className="text-slate-100 dark:text-slate-800 stroke-current" 
                      cx="50" 
                      cy="50" 
                      fill="transparent" 
                      r="40" 
                      strokeWidth="8"
                    />
                    <circle 
                      className="text-teal-500 stroke-current" 
                      cx="50" 
                      cy="50" 
                      fill="transparent" 
                      r="40" 
                      strokeLinecap="round" 
                      strokeWidth="8" 
                      style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: strokeOffset,
                        transform: 'rotate(-90deg)',
                        transformOrigin: '50% 50%',
                        transition: 'stroke-dashoffset 0.2s ease-out',
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-bold text-lg text-slate-800 dark:text-white">{progress}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                    {analyzing ? 'AI Scans Processing...' : 'Uploading Resume...'}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 animate-pulse">
                    Please wait while CareerAI intelligence analyzes content
                  </p>
                </div>
              </motion.div>
            ) : file ? (
              // Loaded state
              <motion.div
                key="loaded"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center text-center p-4 relative"
              >
                <div className="w-20 h-20 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 flex items-center justify-center rounded-full mb-6 group-hover:scale-105 transition-transform shadow-inner">
                  <span className="material-symbols-outlined text-4xl block">check_circle</span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1 truncate max-w-xs">{file.name}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                
                <button 
                  onClick={clearFile}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/25 dark:hover:bg-red-900/30 dark:text-red-400 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove File</span>
                </button>
              </motion.div>
            ) : (
              // Empty State View
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center rounded-full mb-6 group-hover:scale-105 transition-transform duration-300">
                  <span className="material-symbols-outlined text-primary dark:text-primary-400 text-4xl block">upload_file</span>
                </div>
                <h3 className="font-bold text-base sm:text-lg text-slate-905 dark:text-white mb-1.5">
                  Drag and drop your resume here, or <span className="text-primary-600 dark:text-primary-400 font-bold">click to browse</span>.
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Supported formats: PDF, DOCX (up to 5MB)</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Target Job Description Textarea (Collapsible Card style) */}
      <AnimatePresence>
        {!uploading && !analyzing && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm space-y-4"
          >
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="material-symbols-outlined text-indigo-500 text-xl block">psychology</span>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Target Job Description (Optional but Recommended)</h3>
            </div>
            
            <textarea
              id="jobDescription"
              rows="5"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:outline-none transition text-slate-900 dark:text-white text-xs sm:text-sm font-medium"
              placeholder="Paste target job descriptions here to get targeted keyword checks and tailored score indicators..."
              disabled={uploading || analyzing}
            />
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Adding a target description triggers advanced skill comparison and produces custom feedback.
              </p>
              
              <button
                onClick={handleUpload}
                disabled={!file}
                className="w-full sm:w-auto flex justify-center items-center space-x-2 py-3 px-6 rounded-xl border border-transparent text-xs sm:text-sm font-bold text-white bg-primary-600 hover:bg-primary-750 transition transform active:scale-[0.98] select-none shadow-lg shadow-primary-500/10 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 dark:disabled:border-slate-700 disabled:shadow-none disabled:cursor-not-allowed"
              >
                <span>Upload &amp; Analyze Resume</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent History / Queue Table */}
      <section className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-lg text-slate-900 dark:text-white">Recent Uploads</h4>
          <Link to="/resumes" className="text-primary-600 dark:text-primary-400 font-bold hover:underline text-xs sm:text-sm">
            View All
          </Link>
        </div>
        
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/80 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/80">
                <th className="px-6 py-4 font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Document Name</th>
                <th className="px-6 py-4 font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date Uploaded</th>
                <th className="px-6 py-4 font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Score</th>
                <th className="px-6 py-4 font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLoading ? (
                // Skeleton Rows
                <>
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <td className="px-6 py-5">
                        <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-8 w-12 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-full" />
                      </td>
                    </tr>
                  ))}
                </>
              ) : recentAnalyses.length > 0 ? (
                recentAnalyses.map((analysis) => (
                  <tr 
                    key={analysis._id} 
                    className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white text-sm truncate max-w-[200px]">
                      <Link to={`/analysis/${analysis._id}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                        {analysis.resumeId?.originalName || 'Resume File'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        analysis.atsScore >= 75
                          ? 'bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400'
                          : analysis.atsScore >= 50
                          ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
                      }`}>
                        {analysis.atsScore}/100
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 rounded text-[10px] font-extrabold uppercase tracking-wider">
                        Processed
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-slate-405 dark:text-slate-500 text-sm">
                    No uploads found. Drag and drop a file above to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};

export default ResumeUpload;
