import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, LayoutDashboard, FileText, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">
                AI Resume Analyzer
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/resumes"
              className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition"
            >
              <FileText className="h-5 w-5" />
              <span>Resumes</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition"
              >
                <Shield className="h-5 w-5" />
                <span>Admin</span>
              </Link>
            )}

            <Link
              to="/profile"
              className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition"
            >
              <User className="h-5 w-5" />
              <span>{user?.name}</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
