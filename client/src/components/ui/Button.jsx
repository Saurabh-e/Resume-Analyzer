import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const buttonVariants = {
  primary: 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-700 hover:to-indigo-600 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40',
  secondary: 'bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-700 hover:to-teal-600 shadow-lg shadow-teal-500/30',
  outline: 'border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900',
  ghost: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
  danger: 'bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:from-rose-700 hover:to-rose-600 shadow-lg shadow-rose-500/30',
  success: 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-500/30',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      disabled={disabled || loading}
      className={`
        font-semibold rounded-xl transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95 inline-flex items-center justify-center gap-2
        ${buttonVariants[variant]}
        ${buttonSizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
