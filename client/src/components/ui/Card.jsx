import { motion } from 'framer-motion';

export const Card = ({ children, className = '', hover = true, ...props }) => {
  const Component = hover ? motion.div : 'div';
  const hoverProps = hover ? {
    whileHover: { y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' },
    transition: { duration: 0.2 }
  } : {};

  return (
    <Component
      className={`card-premium ${className}`}
      {...hoverProps}
      {...props}
    >
      {children}
    </Component>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 border-b border-slate-200 dark:border-slate-800 ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`p-6 border-t border-slate-200 dark:border-slate-800 ${className}`}>
    {children}
  </div>
);

export default Card;
