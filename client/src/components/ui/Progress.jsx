import { motion } from 'framer-motion';

export const ProgressBar = ({ value = 0, max = 100, className = '', showLabel = false, color = 'primary' }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const colors = {
    primary: 'bg-gradient-to-r from-indigo-600 to-indigo-500',
    success: 'bg-gradient-to-r from-emerald-600 to-emerald-500',
    warning: 'bg-gradient-to-r from-amber-600 to-amber-500',
    error: 'bg-gradient-to-r from-rose-600 to-rose-500',
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${colors[color]} relative overflow-hidden`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 shimmer" />
        </motion.div>
      </div>
      {showLabel && (
        <div className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
};

export const CircularProgress = ({ value = 0, max = 100, size = 120, strokeWidth = 8, className = '', children }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 80) return '#10b981'; // emerald-500
    if (percentage >= 60) return '#6366f1'; // indigo-500
    if (percentage >= 40) return '#f59e0b'; // amber-500
    return '#ef4444'; // rose-500
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-slate-200 dark:text-slate-800"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children || (
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {Math.round(percentage)}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Score
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
