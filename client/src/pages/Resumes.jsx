import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resumeAPI, analysisAPI } from '../services/api';
import { FileText, Trash2, Eye, Upload, Calendar, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Resumes = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [analyzingId, setAnalyzingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await resumeAPI.getAll();
      setResumes(response.data.resumes || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error(error?.message || 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await resumeAPI.delete(id);
      toast.success('Resume deleted successfully');
      fetchResumes();
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error(error?.message || 'Failed to delete resume');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAnalyze = async (id) => {
    setAnalyzingId(id);
    try {
      toast.loading('Analyzing resume with AI...', { id: 'analyze' });
      const response = await analysisAPI.analyze(id, {});
      toast.success('Analysis complete!', { id: 'analyze' });
      
      // Use React Router navigation instead of window.location
      if (response?.data?._id) {
        navigate(`/analysis/${response.data._id}`);
      } else {
        throw new Error('Invalid response from analysis API');
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast.error(error?.message || 'Failed to analyze resume', { id: 'analyze' });
    } finally {
      setAnalyzingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-800 border-t-primary-600 dark:border-t-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200/50 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white">My Resumes</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and evaluate your saved resume file versions.</p>
        </div>
        <Link
          to="/upload"
          id="resumes-upload-new-button"
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition transform active:scale-95 text-sm"
        >
          <Upload className="h-4.5 w-4.5" />
          <span>Upload New</span>
        </Link>
      </div>

      {/* Resumes Grid */}
      <AnimatePresence>
        {resumes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-12 text-center max-w-md mx-auto shadow-md"
          >
            <FileText className="h-16 w-16 text-slate-300 dark:text-slate-700 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Resumes Found</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Upload a resume in PDF or DOCX format to calculate your first ATS rating score.
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-750 text-white px-6 py-3 rounded-xl font-bold shadow-md transition"
            >
              <Upload className="h-5 w-5" />
              <span>Upload Resume</span>
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {resumes.map((resume) => (
              <motion.div
                key={resume._id}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* File icon and Type Tag */}
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 rounded-xl">
                      <FileText className="h-6 w-6" />
                    </div>
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                      {resume.fileType}
                    </span>
                  </div>

                  {/* Title & Metadata */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate" title={resume.originalName}>
                      {resume.originalName}
                    </h3>
                    <div className="flex items-center text-xs text-slate-500 font-semibold">
                      <Calendar className="h-4 w-4 mr-1 text-slate-400" />
                      <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Card CTA Actions */}
                <div className="flex space-x-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                  <button
                    onClick={() => handleAnalyze(resume._id)}
                    disabled={analyzingId === resume._id}
                    className="flex-1 flex items-center justify-center space-x-1.5 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {analyzingId === resume._id ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        <span>Analyze</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${resume.originalName}"?`)) {
                        handleDelete(resume._id);
                      }
                    }}
                    disabled={deletingId === resume._id || analyzingId === resume._id}
                    className="flex items-center justify-center px-3 py-2 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-xl hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-100 dark:hover:border-red-900/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete Resume"
                  >
                    {deletingId === resume._id ? (
                      <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Resumes;
