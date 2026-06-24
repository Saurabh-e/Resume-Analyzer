import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Check, X, Sun, Moon, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { register, isAuthenticated, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Password requirements state
  const [checks, setChecks] = useState({
    length: false,
    number: false,
    uppercase: false,
    lowercase: false,
  });

  const handlePasswordCheck = (val) => {
    setChecks({
      length: val.length >= 6,
      number: /\D*\d/.test(val),
      uppercase: /[A-Z]/.test(val),
      lowercase: /[a-z]/.test(val),
    });
  };

  const validate = () => {
    let nameErr = '';
    let emailErr = '';
    let passErr = '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name) {
      nameErr = 'Full name is required';
    }

    if (!formData.email) {
      emailErr = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      emailErr = 'Please enter a valid email address';
    }

    if (!formData.password) {
      passErr = 'Password is required';
    } else {
      const allChecksPass = checks.length && checks.number && checks.uppercase && checks.lowercase;
      if (!allChecksPass) {
        passErr = 'Password must meet all checklist requirements';
      }
    }

    if (!agreeTerms) {
      toast.error('You must agree to the Terms of Service and Privacy Policy');
      return false;
    }

    setErrors({ name: nameErr, email: emailErr, password: passErr });
    return !nameErr && !emailErr && !passErr;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password') {
      handlePasswordCheck(value);
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (loading) return;

    setLoading(true);
    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col md:flex-row items-center justify-center overflow-hidden bg-surface-bright dark:bg-slate-950 text-on-surface dark:text-slate-100 font-sans select-none transition-colors duration-300">
      
      {/* Floating Home Button (Top Left) */}
      <div className="absolute top-4 left-4 z-50">
        <Link
          to="/"
          id="register-home-button"
          className="flex items-center space-x-1.5 px-3 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 text-on-surface-variant dark:text-slate-400 hover:text-primary hover:bg-primary/5 transition-all shadow-sm text-xs font-bold"
          title="Return to Landing Page"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Home</span>
        </Link>
      </div>

      {/* Floating Theme Toggle (Top Right) */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          id="theme-toggle-button"
          className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all shadow-sm"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-indigo-600" />}
        </button>
      </div>

      {/* Left Visual Side (Desktop Only) */}
      <section className="hidden lg:flex w-1/2 h-screen relative bg-primary-container p-16 flex-col justify-between overflow-hidden text-left">
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDC26rUlFsxbXJqbqV1rEutJ8JL_E-JKvqczXct7Y_AU_z9Mn4PQXDu80tx-moiUJ_QYYokYhf7EsswoSL98_YowVefpAWlml0nMqssWU-bsD8vju4VZb17_PXjw6bquvSex3ImIjDnskTxD3shW3sNaMtQaFHGsP7AH_ydQg3J5B3XfqOnDt6TaWiGvyv4Qldzkkkc0qcCTmA7nJc3kyrXspktXHV00JTL2UZ2NIojOQrhnqmYNzmTguGnS2t0FLhx_1jzQLsAvZyV')" }}
          />
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" />
        </div>
        
        <header className="relative z-10">
          <Link to="/">
            <h1 className="text-2xl font-black text-on-primary-container tracking-wider">CareerAI</h1>
          </Link>
        </header>
        
        <div className="relative z-10 max-w-md space-y-4">
          <h2 className="text-4xl font-extrabold text-on-primary leading-tight font-display">
            Elevate your career with precision intelligence.
          </h2>
          <p className="text-base text-on-primary/80 leading-relaxed font-sans">
            Join 50,000+ professionals using AI to optimize their job hunt and secure top-tier roles.
          </p>
        </div>
        
        <footer className="relative z-10 flex gap-4">
          <div className="flex -space-x-3">
            <img 
              className="w-10 h-10 rounded-full border-2 border-primary-container object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe2KrTQdB6Zj0MkmhthjyTToFxCoQfFgPa7KM1_-d13yF6hRS12wUuUfuJWWIYMdxpm6iiXRYY6rZeJ_Y4i0ZbJH0gLawEJ2-5P41kzQphQWkKHqlDb57-7pfqzASc3cHWvuomuLgIKxNfOE5nrn2YXR8J8IDrTTHW7e8Vh43QjTZ3RJmVIqkKjUTangWGYCwvNbGbb_7jP3kaRgQGRoWZO_gIds7bNGiI2PbX0YCIAH_r0yuGI5Kdw7Y-MQTXBnekh2cAY8QlPkvI" 
              alt="Professional user 1" 
            />
            <img 
              className="w-10 h-10 rounded-full border-2 border-primary-container object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuACiP7psYPSug4cBuLS1xiErrLRWpF39c1yLwl_ch4z3IkDI8yTmllcJk9DH9cnC7Cmln41YpBMwQ7gprD7sz3rUum81FOwQlplJ3alp4SGELp6NvloMvebUEcBJKe2gces7kK5VePM3b0ky8EJ7uA8xo2NLTu5ojPmiRMywHjJAmA5Qd5s2MQA5xd-jpBg1cK7Y3cRj0HVdF0OTeVB0Bqr186-_QoW9i76fkILipOvi4ThI56aZXKS46q1q6VBSXEMqyMFtacAL3EQ" 
              alt="Professional user 2" 
            />
            <img 
              className="w-10 h-10 rounded-full border-2 border-primary-container object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQwW-HmXTJA4jseqquQadtknmUNRvhoc5eyx5ECDE2LcFWRAwNvY3dmgYMuq-GyWsmJHoiifLl1v6GmhO5b6oqDcd25JOeRF-2hRhWH3XptcVUB_JKcoJ2-CsUm79VPoeQph0wl8yNRi8-g9itDrwabGuknN82Cs_zNldR03IXUxfQSYhygB2T-ubIq7gRnGeDVsKVzcBej0o5X2rmwoRcuEkpsknvqsFocXIq7ERQ6Mhwk9KiUrBg9K-cm-o0NsQ9zS5YTKqtfz5e" 
              alt="Professional user 3" 
            />
          </div>
          <p className="text-xs font-semibold text-on-primary-container/70 self-center">
            Trusted by industry leaders worldwide.
          </p>
        </footer>
      </section>

      {/* Auth Section Form (Right Panel) */}
      <section className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[440px] space-y-6"
        >
          {/* Logo Mobile */}
          <div className="lg:hidden flex justify-center mb-6">
            <span className="text-2xl font-black text-primary dark:text-primary-fixed">CareerAI</span>
          </div>
          
          {/* Form Header */}
          <div className="text-center lg:text-left space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface dark:text-white font-display">Get Started</h2>
            <p className="text-sm text-on-surface-variant dark:text-slate-400">Create your account and unlock your career potential.</p>
          </div>
          
          {/* Social Logins */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              type="button" 
              className="flex items-center justify-center gap-2 px-6 py-3 border border-outline-variant/60 dark:border-slate-800 rounded-xl text-sm font-semibold text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-low dark:hover:bg-slate-900 transition duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
              </svg>
              <span>Google</span>
            </button>
            <button 
              type="button" 
              className="flex items-center justify-center gap-2 px-6 py-3 border border-outline-variant/60 dark:border-slate-800 rounded-xl text-sm font-semibold text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-low dark:hover:bg-slate-900 transition duration-200"
            >
              <svg className="w-5 h-5 text-[#0077B5]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
              </svg>
              <span>LinkedIn</span>
            </button>
          </div>
          
          {/* Divider */}
          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-outline-variant/30 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-on-surface-variant dark:text-slate-400 uppercase tracking-widest">Or with email</span>
            <div className="flex-grow border-t border-outline-variant/30 dark:border-slate-800"></div>
          </div>
          
          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            
            {/* Full Name Field */}
            <div>
              <label className="block text-xs font-bold text-on-surface dark:text-slate-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className={`flex items-center border-b-2 ${errors.name ? 'border-error' : 'border-outline-variant/30 dark:border-slate-800 focus-within:border-primary'} transition duration-300`}>
                <UserIcon className="h-5 w-5 text-slate-400 dark:text-slate-500 mr-2" />
                <input 
                  id="name-input" 
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-transparent border-none focus:ring-0 py-2 text-sm text-on-surface dark:text-white placeholder:text-on-surface-variant/40 outline-none"
                  placeholder="Alex Rivera" 
                />
              </div>
              {errors.name && (
                <p className="text-xs text-error mt-1 font-semibold">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-on-surface dark:text-slate-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className={`flex items-center border-b-2 ${errors.email ? 'border-error' : 'border-outline-variant/30 dark:border-slate-800 focus-within:border-primary'} transition duration-300`}>
                <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500 mr-2" />
                <input 
                  id="email-input" 
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent border-none focus:ring-0 py-2 text-sm text-on-surface dark:text-white placeholder:text-on-surface-variant/40 outline-none"
                  placeholder="name@company.com" 
                />
              </div>
              {errors.email && (
                <p className="text-xs text-error mt-1 font-semibold">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-on-surface dark:text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className={`flex items-center border-b-2 ${errors.password ? 'border-error' : 'border-outline-variant/30 dark:border-slate-800 focus-within:border-primary'} transition duration-300`}>
                <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500 mr-2" />
                <input 
                  id="password-input" 
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-transparent border-none focus:ring-0 py-2 text-sm text-on-surface dark:text-white placeholder:text-on-surface-variant/40 outline-none"
                  placeholder="••••••••" 
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-on-surface-variant/60 dark:text-slate-400 hover:text-primary dark:hover:text-primary-400 px-2" 
                  type="button"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>

              {/* Password Checklist Criteria */}
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Password Requirements:</p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <div className="flex items-center space-x-1.5 text-xs">
                    {checks.length ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-slate-400 dark:text-slate-500" />}
                    <span className={checks.length ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}>Min 6 characters</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs">
                    {checks.number ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-slate-400 dark:text-slate-500" />}
                    <span className={checks.number ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}>One number</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs">
                    {checks.uppercase ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-slate-400 dark:text-slate-500" />}
                    <span className={checks.uppercase ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}>One uppercase</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs">
                    {checks.lowercase ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-slate-400 dark:text-slate-500" />}
                    <span className={checks.lowercase ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}>One lowercase</span>
                  </div>
                </div>
              </div>
              {errors.password && (
                <p className="text-xs text-error mt-1 font-semibold">{errors.password}</p>
              )}
            </div>

            {/* Terms of Service Check */}
            <div className="flex items-start gap-2 pt-2">
              <input 
                id="terms"
                name="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 rounded border-outline-variant dark:border-slate-800 text-primary focus:ring-primary" 
              />
              <label htmlFor="terms" className="text-xs font-semibold text-on-surface-variant dark:text-slate-400 text-left leading-normal">
                I agree to the <a className="text-primary dark:text-primary-400 hover:underline" href="#">Terms of Service</a> and <a className="text-primary dark:text-primary-400 hover:underline" href="#">Privacy Policy</a>.
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-br from-primary-container to-primary text-on-primary font-bold text-sm py-4 rounded-xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] active:scale-95 transition-all duration-300 flex justify-center items-center mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg> 
                  <span>Creating Account...</span>
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          
          {/* Footer Switch */}
          <div className="text-center">
            <p className="text-sm text-on-surface-variant dark:text-slate-400">
              <span>Already have an account?</span>
              <Link to="/login" className="text-primary dark:text-primary-400 font-bold ml-1 hover:underline underline-offset-4">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </section>

    </main>
  );
};

export default Register;
