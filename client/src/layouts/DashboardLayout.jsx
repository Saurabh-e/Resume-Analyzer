import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon,
  ChevronLeft,
  ChevronRight,
  Shield,
  Home
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout, theme, toggleTheme, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Resumes', path: '/resumes', icon: FileText },
    { name: 'Upload Resume', path: '/upload', icon: Upload },
    { name: 'Profile & Settings', path: '/profile', icon: User },
  ];

  const sidebarVariants = {
    expanded: { width: 260 },
    collapsed: { width: 80 }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors duration-300">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <motion.aside
        initial="expanded"
        animate={sidebarOpen ? "expanded" : "collapsed"}
        variants={sidebarVariants}
        className="hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 overflow-y-auto z-20 transition-colors duration-300"
      >
        {/* Brand Logo */}
        <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <Link to="/dashboard" className="flex items-center space-x-3 overflow-hidden">
            <div className="flex-shrink-0 p-2 bg-primary-600 rounded-lg text-white">
              <FileText className="h-6 w-6" />
            </div>
            {sidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-lg font-display text-slate-900 dark:text-white truncate"
              >
                ATS Analyzer
              </motion.span>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                id={`sidebar-nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400'}`} />
                {sidebarOpen && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {item.name}
                  </motion.span>
                )}
                {/* Tooltip for collapsed state */}
                {!sidebarOpen && (
                  <div className="absolute left-20 scale-0 rounded bg-slate-900 p-2 text-xs text-white group-hover:scale-100 transition-all z-30 whitespace-nowrap shadow-md">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all group relative ${
                location.pathname === '/admin'
                  ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shield className="h-5 w-5 flex-shrink-0 text-slate-500 dark:text-slate-400 group-hover:scale-110" />
              {sidebarOpen && <span>Admin Dashboard</span>}
            </Link>
          )}
        </nav>

        {/* Sidebar Footer & Toggle */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {/* User Widget */}
          {sidebarOpen && (
            <div className="flex items-center space-x-3 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg overflow-hidden">
              <div className="h-9 w-9 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold font-display text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
          )}

          {/* Toggle Sidebar Width */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </motion.aside>

      {/* --- MOBILE DRAWER OVERLAY --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-30 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-[260px] bg-white dark:bg-slate-900 shadow-2xl z-40 p-5 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-lg font-display text-slate-900 dark:text-white">ATS Analyzer</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium ${
                        location.pathname === item.path
                          ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 h-16 flex items-center justify-between px-4 sm:px-6 transition-colors duration-300">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold font-display text-slate-950 dark:text-white capitalize">
              {location.pathname.substring(1).replace('-', ' ') || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            {/* Return to Landing Page */}
            <Link
              to="/"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-bold"
              title="Return to Landing Page"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Landing Page</span>
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              id="theme-toggle-button"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-indigo-600" />}
            </button>

            {/* User Dropdown / Widget (Mobile Header shortcut) */}
            <div className="flex items-center space-x-2 border-l border-slate-200 dark:border-slate-800 pl-3">
              <Link 
                to="/profile" 
                className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold hover:ring-2 hover:ring-primary-500 transition"
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Link>
              <button
                onClick={handleLogout}
                className="hidden sm:flex p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Pages Root Wrapper */}
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
