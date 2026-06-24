import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { FileText, TrendingUp, Activity, Upload, ArrowRight, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative w-16 h-16">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-800 border-t-primary-600 dark:border-t-primary-400"></div>
        </div>
      </div>
    );
  }

  // Theme-aware Chart Styling
  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  const chartData = {
    labels: stats?.scoreTrends?.map((trend) => trend._id) || [],
    datasets: [
      {
        label: 'ATS Score',
        data: stats?.scoreTrends?.map((trend) => trend.avgScore) || [],
        borderColor: isDark ? '#a78bfa' : '#6366f1',
        backgroundColor: isDark ? 'rgba(167, 139, 250, 0.15)' : 'rgba(99, 102, 241, 0.15)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: isDark ? '#a78bfa' : '#6366f1',
        pointBorderColor: isDark ? '#020617' : '#ffffff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#94a3b8' : '#475569',
        borderColor: isDark ? '#1e293b' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `ATS Score: ${context.parsed.y}`,
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
          font: { family: 'Inter', size: 11 },
        },
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
          font: { family: 'Inter', size: 11 },
          stepSize: 20,
        },
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      
      {/* Banner/Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 rounded-2xl border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">Welcome Back!</h1>
          <p className="text-sm text-slate-400">Upload a new resume or analyze existing scans to track your score gains.</p>
        </div>
        <Link
          to="/upload"
          id="dashboard-upload-button"
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-primary-500/20 transition transform active:scale-95 flex-shrink-0 relative z-10"
        >
          <Upload className="h-5 w-5" />
          <span>Upload Resume</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Analyses */}
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-md flex items-center justify-between transition group hover:shadow-lg dark:hover:border-slate-700"
        >
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Scans</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white font-display">
              {stats?.summary?.totalAnalyses || 0}
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <Activity className="h-6 w-6" />
          </div>
        </motion.div>

        {/* Total Resumes */}
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-md flex items-center justify-between transition group hover:shadow-lg dark:hover:border-slate-700"
        >
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Saved Resumes</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white font-display">
              {stats?.summary?.totalResumes || 0}
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <FileText className="h-6 w-6" />
          </div>
        </motion.div>

        {/* Average ATS Score */}
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-md flex items-center justify-between transition group hover:shadow-lg dark:hover:border-slate-700 sm:col-span-2 lg:col-span-1"
        >
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg ATS Rating</p>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-display">
                {stats?.summary?.averageScore || 0}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400 font-semibold">/100</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <TrendingUp className="h-6 w-6" />
          </div>
        </motion.div>
      </div>

      {/* Chart Section */}
      {stats?.scoreTrends && stats.scoreTrends.length > 0 && (
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-md"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display mb-4">ATS Rating Over Time</h2>
          <div className="h-72 w-full relative">
            <Line data={chartData} options={chartOptions} />
          </div>
        </motion.div>
      )}

      {/* Grid of Recent Analyses and Top Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Analyses List */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-md space-y-4"
        >
          <div className="flex justify-between items-center pb-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">Recent Analyses</h2>
            <Link to="/resumes" className="text-xs font-bold text-primary-600 hover:text-primary-750 dark:text-primary-400 flex items-center space-x-1 hover:underline">
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {stats?.recentAnalyses && stats.recentAnalyses.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {stats.recentAnalyses.map((analysis) => (
                <Link
                  key={analysis._id}
                  to={`/analysis/${analysis._id}`}
                  className="flex justify-between items-center py-4 first:pt-0 last:pb-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-xl transition group"
                >
                  <div className="min-w-0 pr-4 space-y-1">
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      {analysis.resumeId?.originalName || 'Unknown Resume'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-lg">
                      {analysis.summary || 'Click to view analysis description...'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      analysis.atsScore >= 75
                        ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400'
                        : analysis.atsScore >= 50
                        ? 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400'
                        : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
                    }`}>
                      Score: {analysis.atsScore}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary-500 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3 animate-pulse" />
              <p className="text-slate-500 text-sm">No scans completed yet.</p>
              <Link to="/upload" className="text-xs text-primary-600 font-bold hover:underline mt-1.5 inline-block">Upload & analyze now</Link>
            </div>
          )}
        </motion.div>

        {/* Top Skills Tag Cloud */}
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-md flex flex-col justify-between"
        >
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display flex items-center space-x-2">
              <Award className="h-5 w-5 text-indigo-500" />
              <span>Top Recurrent Skills</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Frequently matched skills extracted from your resume analyses.</p>

            {stats?.topSkills && stats.topSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {stats.topSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/30 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 border border-slate-100 dark:border-slate-800 hover:border-primary-100 dark:hover:border-primary-900/50 rounded-lg text-xs font-semibold transition"
                  >
                    {skill.name} <span className="opacity-60 text-[10px] ml-1">({skill.count})</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">No matching skills identified.</p>
              </div>
            )}
          </div>
        </motion.div>

      </div>

    </motion.div>
  );
};

export default Dashboard;
