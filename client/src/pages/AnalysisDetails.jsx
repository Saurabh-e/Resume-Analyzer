import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analysisAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Lightbulb,
  ArrowLeft,
  FileText,
  Brain,
  Award,
  ChevronDown,
  ChevronUp,
  Download,
  BookOpen,
  HelpCircle,
  Briefcase,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const AnalysisDetails = () => {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [scoreCount, setScoreCount] = useState(0);
  const { theme } = useAuth();

  // On-demand generated features state
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [skillGap, setSkillGap] = useState(null);
  const [skillGapLoading, setSkillGapLoading] = useState(false);

  // Accordion active index states for interview questions
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const response = await analysisAPI.getById(id);
      setAnalysis(response.data);

      if (response.data.interviewQuestions) {
        setQuestions(response.data.interviewQuestions);
      }
      if (response.data.careerRecommendations) {
        setRecommendations(response.data.careerRecommendations);
      }
      if (response.data.skillGapAnalysis) {
        setSkillGap(response.data.skillGapAnalysis);
      }
    } catch (error) {
      toast.error('Failed to load analysis');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Score Count-Up Animation
  useEffect(() => {
    if (analysis?.atsScore) {
      setScoreCount(0);
      let current = 0;
      const target = analysis.atsScore;
      const duration = 1000; // ms
      const interval = 20; // ms
      const step = (target / duration) * interval;

      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          setScoreCount(target);
          clearInterval(timer);
        } else {
          setScoreCount(Math.round(current));
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [analysis?.atsScore, activeTab]);

  const loadInterviewQuestions = async () => {
    setQuestionsLoading(true);
    try {
      const response = await analysisAPI.getInterviewQuestions(id);
      setQuestions(response.data);
      toast.success('Interview questions generated successfully!');
    } catch (error) {
      toast.error('Failed to generate interview questions');
    } finally {
      setQuestionsLoading(false);
    }
  };

  const loadCareerRecommendations = async () => {
    setRecommendationsLoading(true);
    try {
      const response = await analysisAPI.getCareerRecommendations(id);
      setRecommendations(response.data);
      toast.success('Career path recommendations generated!');
    } catch (error) {
      toast.error('Failed to generate career recommendations');
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const loadSkillGapAnalysis = async () => {
    setSkillGapLoading(true);
    try {
      const response = await analysisAPI.getSkillGap(id);
      setSkillGap(response.data);
      toast.success('Skill gap and learning path computed!');
    } catch (error) {
      toast.error('Failed to compute skill gap analysis');
    } finally {
      setSkillGapLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20';
  };

  const getScoreLabel = (score) => {
    if (score >= 75) return 'Excellent ATS Score';
    if (score >= 50) return 'Good matching potential';
    return 'Optimization highly recommended';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-800 border-t-primary-600 dark:border-t-primary-400"></div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-8 max-w-md mx-auto">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4 animate-bounce" />
        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-2">Analysis Not Found</h3>
        <p className="text-slate-500 text-sm mb-6">The requested scan record does not exist or you do not have permission to view it.</p>
        <Link to="/dashboard" className="bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-primary-750 transition">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Calculate circular stroke dashboard values
  const circumference = 402.1;
  const strokeOffset = circumference - (circumference * scoreCount) / 100;

  return (
    <div className="space-y-8 print:bg-white print:text-black">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-6 print:hidden">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="p-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-slate-600 dark:text-slate-405"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-950 dark:text-white">Analysis Results</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">{analysis.resumeId?.originalName || 'Resume'}</span> &bull; {new Date(analysis.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 px-5 py-2.5 rounded-xl font-bold shadow-sm transition text-sm text-slate-700 dark:text-slate-300"
        >
          <Download className="h-4 w-4" />
          <span>Download Report</span>
        </button>
      </div>

      {/* --- PRINT ONLY HEADER --- */}
      <div className="hidden print:block space-y-4 mb-8">
        <h1 className="text-3xl font-bold">ATS Optimizer Report</h1>
        <p className="text-sm">File: {analysis.resumeId?.originalName} | Date: {new Date(analysis.createdAt).toLocaleDateString()}</p>
        <p className="text-xl">ATS Score: {analysis.atsScore}/100</p>
      </div>

      {/* OVERVIEW SUMMARY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ATS Circular Score Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-6 sm:p-8 rounded-2xl shadow-md flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden transition-colors duration-300">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.05),transparent_60%)] pointer-events-none" />
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ATS Score Rating</h3>
          
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="72"
                className="text-slate-100 dark:text-slate-800 stroke-current"
                strokeWidth="12"
                fill="transparent"
              />
              <motion.circle
                cx="88"
                cy="88"
                r="72"
                className="text-primary-600 dark:text-primary-400 stroke-current"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray="452.4"
                initial={{ strokeDashoffset: 452.4 }}
                animate={{ strokeDashoffset: 452.4 - (452.4 * scoreCount) / 100 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-black text-slate-900 dark:text-white font-display">
                {scoreCount}
              </span>
              <span className="text-xs text-slate-500 font-bold">/ 100</span>
            </div>
          </div>

          <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${getScoreColor(analysis.atsScore)}`}>
            {getScoreLabel(analysis.atsScore)}
          </span>
        </div>

        {/* AI Resume Summary */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-6 sm:p-8 rounded-2xl shadow-md space-y-4 transition-colors duration-300">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <FileText className="h-5 w-5 text-primary-500" />
            <h2 className="text-lg font-bold font-display text-slate-950 dark:text-white">AI Analysis Summary</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {analysis.summary}
          </p>
        </div>

      </div>

      {/* DETAILED TABS TRAY (Hidden during print to display all sections sequentially) */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 print:hidden flex overflow-x-auto pb-px">
        {['overview', 'skills', 'suggestions', 'interview questions', 'career growth'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            id={`tab-btn-${tab.replace(/\s+/g, '-')}`}
            className={`py-4 px-1 mr-8 border-b-2 font-bold text-sm capitalize whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB CONTAINER CONTENT */}
      <div className="space-y-8">
        
        {/* --- OVERVIEW TAB CONTENT (OR SEQUENTIAL PRINT) --- */}
        {(activeTab === 'overview' || window.matchMedia('print').matches) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Strengths Card */}
            {analysis.strengths && analysis.strengths.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-6 rounded-2xl shadow-md space-y-4">
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <CheckCircle className="h-5 w-5" />
                  <h3 className="font-bold font-display">Identified Strengths</h3>
                </div>
                <ul className="space-y-3">
                  {analysis.strengths.map((str, i) => (
                    <li key={i} className="flex items-start space-x-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="text-green-500 font-bold mt-0.5">&bull;</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses Card */}
            {analysis.weaknesses && analysis.weaknesses.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-6 rounded-2xl shadow-md space-y-4">
                <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="font-bold font-display">Areas to Improve</h3>
                </div>
                <ul className="space-y-3">
                  {analysis.weaknesses.map((weak, i) => (
                    <li key={i} className="flex items-start space-x-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="text-yellow-500 font-bold mt-0.5">&bull;</span>
                      <span>{weak}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* --- SKILLS TAB CONTENT --- */}
        {(activeTab === 'skills' || window.matchMedia('print').matches) && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Matched Skills */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-6 rounded-2xl shadow-md space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <h3 className="font-bold font-display">Matched Skills</h3>
                  </span>
                  <span className="bg-green-50 dark:bg-green-950/20 text-green-600 text-xs px-2.5 py-1 rounded-full font-bold">
                    {analysis.matchedSkills?.length || 0} Found
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.matchedSkills && analysis.matchedSkills.length > 0 ? (
                    analysis.matchedSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1.5 bg-green-50/50 dark:bg-green-950/10 border border-green-100/50 dark:border-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">No matched technical skills found.</p>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-6 rounded-2xl shadow-md space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="flex items-center space-x-2 text-red-650 dark:text-red-400">
                    <XCircle className="h-5 w-5" />
                    <h3 className="font-bold font-display">Missing Skills</h3>
                  </span>
                  <span className="bg-red-50 dark:bg-red-950/20 text-red-600 text-xs px-2.5 py-1 rounded-full font-bold">
                    {analysis.missingSkills?.length || 0} Target
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills && analysis.missingSkills.length > 0 ? (
                    analysis.missingSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1.5 bg-red-50/50 dark:bg-red-950/10 border border-red-100/50 dark:border-red-900/30 text-red-750 dark:text-red-400 rounded-lg text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">No missing skills detected. Excellent match!</p>
                  )}
                </div>
              </div>
            </div>

            {/* AI SKILL GAP PATHWAYS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-6 sm:p-8 rounded-2xl shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-indigo-500" />
                  <h3 className="font-bold font-display text-slate-950 dark:text-white">AI Skill Gap & Learning Paths</h3>
                </div>
                {!skillGap && !skillGapLoading && (
                  <button
                    onClick={loadSkillGapAnalysis}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1"
                  >
                    <Award className="h-3.5 w-3.5" />
                    <span>Run Skill Gap Analysis</span>
                  </button>
                )}
              </div>

              {skillGapLoading && (
                <div className="space-y-4 animate-pulse">
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                </div>
              )}

              {skillGap && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Current Skill Level</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white capitalize mt-0.5">{skillGap.currentLevel || 'Junior'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Target Competency</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white capitalize mt-0.5">{skillGap.targetLevel || 'Intermediate'}</p>
                    </div>
                  </div>

                  {skillGap.learningPath && skillGap.learningPath.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                        <BookOpen className="h-4 w-4 text-primary-500" />
                        <span>Recommended Learning Pathway</span>
                      </h4>
                      <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 pl-5 space-y-4">
                        {skillGap.learningPath.map((path, idx) => (
                          <div key={idx} className="relative">
                            <span className="absolute left-[-26px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-primary-500 bg-white dark:bg-slate-950 flex items-center justify-center text-[8px] font-bold" />
                            <p className="text-sm font-semibold text-slate-950 dark:text-white">{path}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- AI SUGGESTIONS TAB CONTENT --- */}
        {(activeTab === 'suggestions' || window.matchMedia('print').matches) && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-6 sm:p-8 rounded-2xl shadow-md space-y-6">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-bold font-display text-slate-950 dark:text-white">Resume Optimization Bullet Suggestions</h2>
            </div>

            {analysis.suggestions && analysis.suggestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysis.suggestions.map((sug, idx) => (
                  <div 
                    key={idx}
                    className="p-5 border border-slate-200/60 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 hover:shadow-md transition space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize">{sug.title}</h4>
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg ${
                        sug.priority === 'high'
                          ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/20'
                          : sug.priority === 'medium'
                          ? 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-900/20'
                          : 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20'
                      }`}>
                        {sug.priority} Priority
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{sug.description}</p>
                    {sug.category && (
                      <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {sug.category}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm py-4">No suggestions available for this analysis.</p>
            )}
          </div>
        )}

        {/* --- INTERVIEW QUESTIONS TAB CONTENT --- */}
        {(activeTab === 'interview questions' || window.matchMedia('print').matches) && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-6 sm:p-8 rounded-2xl shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <HelpCircle className="h-5 w-5 text-indigo-500" />
                <h3 className="font-bold font-display text-slate-950 dark:text-white">AI-Generated Mock Interview Questions</h3>
              </div>
              {questions.length === 0 && !questionsLoading && (
                <button
                  onClick={loadInterviewQuestions}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Generate Interview Prep</span>
                </button>
              )}
            </div>

            {questionsLoading && (
              <div className="space-y-4 animate-pulse">
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-full" />
              </div>
            )}

            {questions.length > 0 && (
              <div className="space-y-3">
                {questions.map((q, idx) => {
                  const isOpen = expandedQuestion === idx;
                  return (
                    <div 
                      key={idx}
                      className="border border-slate-200/60 dark:border-slate-800/80 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedQuestion(isOpen ? null : idx)}
                        className="w-full flex justify-between items-center p-4 bg-slate-50/50 dark:bg-slate-900/50 text-left"
                      >
                        <span className="text-sm font-bold text-slate-900 dark:text-white pr-4">{q.question}</span>
                        {isOpen ? <ChevronUp className="h-4 w-4 flex-shrink-0 text-slate-400" /> : <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400" />}
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-2">
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suggested Answer Approach & Strategy:</p>
                              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                Use the STAR method to structure your answer. Highlight matches with {analysis.matchedSkills?.slice(0, 3).join(', ') || 'skills'} from your resume, demonstrating how you applied them in previous tasks.
                              </p>
                              <div className="flex space-x-2 pt-2">
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] px-2 py-0.5 rounded font-bold uppercase">{q.category}</span>
                                <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                                  q.difficulty === 'hard'
                                    ? 'bg-red-50 dark:bg-red-950/20 text-red-500'
                                    : q.difficulty === 'medium'
                                    ? 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-500'
                                    : 'bg-green-50 dark:bg-green-950/20 text-green-500'
                                }`}>{q.difficulty}</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- CAREER GROWTH TAB CONTENT --- */}
        {(activeTab === 'career growth' || window.matchMedia('print').matches) && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-6 sm:p-8 rounded-2xl shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-indigo-500" />
                <h3 className="font-bold font-display text-slate-950 dark:text-white">AI-Recommended Career Pathways</h3>
              </div>
              {recommendations.length === 0 && !recommendationsLoading && (
                <button
                  onClick={loadCareerRecommendations}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Recommend Pathways</span>
                </button>
              )}
            </div>

            {recommendationsLoading && (
              <div className="space-y-4 animate-pulse">
                <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded w-full" />
              </div>
            )}

            {recommendations.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.map((rec, idx) => (
                  <div 
                    key={idx}
                    className="p-5 border border-slate-200/60 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 hover:shadow-md transition space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{rec.title}</h4>
                      <span className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        Match: {rec.relevanceScore}%
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{rec.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};

export default AnalysisDetails;
