export const Badge = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };

  return (
    <span className={`badge ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
