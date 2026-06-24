import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, analysisAPI } from '../services/api';
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Calendar, 
  Shield, 
  FileText, 
  KeyRound, 
  Eye, 
  EyeOff, 
  MapPin, 
  Briefcase,
  Trash2,
  Bell,
  Sparkles,
  CreditCard,
  CheckCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, updateUser, theme, toggleTheme } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // overview, history, settings
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const [profileDetails, setProfileDetails] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Client-only editable fields for rich SaaS display
  const [jobTitle, setJobTitle] = useState(localStorage.getItem('user_job_title') || 'Senior Product Designer');
  const [location, setLocation] = useState(localStorage.getItem('user_location') || 'San Francisco, CA');
  const [editJobTitle, setEditJobTitle] = useState(jobTitle);
  const [editLocation, setEditLocation] = useState(location);

  // Preference Toggles
  const [emailDigest, setEmailDigest] = useState(() => {
    const saved = localStorage.getItem('pref_email_digest');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [aiAlerts, setAiAlerts] = useState(() => {
    const saved = localStorage.getItem('pref_ai_alerts');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name || '', email: user.email || '' });
    }
    fetchFullProfile();
  }, [user]);

  const fetchFullProfile = async () => {
    try {
      setHistoryLoading(true);
      const response = await authAPI.getProfile();
      setProfileDetails(response.data);
    } catch (err) {
      toast.error('Failed to load profile details');
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileData.name || !profileData.email) {
      toast.error('Name and Email are required');
      return;
    }

    setProfileLoading(true);
    try {
      const response = await authAPI.updateProfile(profileData);
      updateUser(response.data);
      
      // Save client-only SaaS fields
      setJobTitle(editJobTitle);
      setLocation(editLocation);
      localStorage.setItem('user_job_title', editJobTitle);
      localStorage.setItem('user_location', editLocation);

      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAllData = async () => {
    const analysesToDelete = profileDetails?.analyses || [];
    if (analysesToDelete.length === 0) {
      toast.error("No analysis records to delete");
      return;
    }

    if (window.confirm("⚠️ Are you sure you want to delete all your analysis records? This action is permanent and cannot be undone.")) {
      const deletePromise = Promise.all(
        analysesToDelete.map(analysis => analysisAPI.delete(analysis._id))
      );

      toast.promise(deletePromise, {
        loading: 'Deleting all analysis data...',
        success: 'All analysis data deleted successfully!',
        error: 'Failed to delete some analysis records.',
      });

      try {
        await deletePromise;
        fetchFullProfile();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEditProfileClick = () => {
    setActiveTab('overview');
    setTimeout(() => {
      const el = document.getElementById('name');
      if (el) el.focus();
    }, 100);
  };

  const handleAiAlertsToggle = () => {
    const nextValue = !aiAlerts;
    setAiAlerts(nextValue);
    localStorage.setItem('pref_ai_alerts', JSON.stringify(nextValue));
    
    if (nextValue) {
      toast.success('Smart AI alerts enabled!', {
        icon: '🔔',
        duration: 4000,
      });

      // Show a smart AI suggestions pop-up alert
      setTimeout(() => {
        const mockSuggestions = [
          "💡 Smart Alert: Action verbs like 'Spearheaded' and 'Optimized' will increase your ATS impact score by 12% over passive verbs.",
          "💡 Smart Alert: Your target job title requires 'TypeScript' in 74% of postings. Consider listing it under your primary skills.",
          "💡 Smart Alert: Try adding 'Docker' or 'CI/CD pipelines' to your resume skills section to match 18% more jobs in your target title!",
          "💡 Smart Alert: Shortening your resume header and combining contact details into a single line leaves 15% more vertical space for experience highlights."
        ];
        const randomSuggestion = mockSuggestions[Math.floor(Math.random() * mockSuggestions.length)];
        
        toast(randomSuggestion, {
          duration: 6000,
          style: {
            border: '1px solid #3525cd',
            padding: '16px',
            color: '#3525cd',
            background: '#e2dfff',
            fontWeight: 'bold',
            borderRadius: '12px',
          },
        });
      }, 1000);
    } else {
      toast.success('Smart AI alerts disabled.');
    }
  };

  const handleEmailDigestToggle = () => {
    const nextValue = !emailDigest;
    setEmailDigest(nextValue);
    localStorage.setItem('pref_email_digest', JSON.stringify(nextValue));
    if (nextValue) {
      toast.success('Email Digest enabled! Weekly career insights will be sent.', {
        icon: '✉️',
        duration: 4000,
      });
    } else {
      toast.success('Email Digest disabled.');
    }
  };

  const totalAnalyses = profileDetails?.analyses?.length || 0;
  const averageScore = profileDetails?.analyses && profileDetails.analyses.length > 0
    ? Math.round(profileDetails.analyses.reduce((acc, curr) => acc + (curr.atsScore || 0), 0) / profileDetails.analyses.length)
    : 0;
  const highestScore = profileDetails?.analyses && profileDetails.analyses.length > 0
    ? Math.max(...profileDetails.analyses.map(a => a.atsScore || 0))
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* PROFILE HEADER CARD */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-md relative overflow-hidden transition-all duration-300">
        {/* Cover Banner (colorful mesh gradient) */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-primary-500 via-indigo-600 to-teal-500 relative">
          <div className="absolute inset-0 bg-black/10 dark:bg-black/25"></div>
          {/* Subtle glowing dots pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-40"></div>
        </div>
        
        {/* Profile Info Area */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row md:items-end md:justify-between gap-6 -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            {/* Avatar block */}
            <div className="relative group shrink-0">
              {user?.avatar ? (
                <img 
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover shadow-xl border-4 border-white dark:border-slate-900 relative z-10" 
                  src={user.avatar} 
                  alt={user.name} 
                />
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black font-display text-4xl sm:text-5xl shadow-xl border-4 border-white dark:border-slate-900 relative z-10">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <button className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all z-20 hover:scale-105 active:scale-95">
                <span className="material-symbols-outlined text-primary dark:text-primary-400 text-lg block">photo_camera</span>
              </button>
            </div>
            
            {/* Name, Title, Badges */}
            <div className="space-y-2 pb-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="font-extrabold font-display text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">{user?.name}</h1>
                <span className="px-2.5 py-0.5 bg-teal-50 dark:bg-teal-950/40 text-teal-650 dark:text-teal-400 rounded-full text-[10px] font-bold flex items-center gap-1 border border-teal-100 dark:border-teal-900">
                  <span className="material-symbols-outlined text-[12px] font-fill-1">verified</span>
                  Verified Talent
                </span>
              </div>
              <p className="font-medium text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-355">{jobTitle}</span>
                <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
                <span className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-0.5 text-slate-400" /> {location}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions / Plan badge */}
          <div className="flex flex-row sm:flex-row md:flex-col gap-3 justify-center w-full md:w-auto self-center md:self-end md:pb-2">
            <button 
              onClick={handleEditProfileClick}
              className="px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-750 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit Profile
            </button>
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between gap-4 shrink-0 min-w-[150px]">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Plan Status</p>
                <p className="text-sm font-black text-primary-650 dark:text-primary-400">Pro Member</p>
              </div>
              <Sparkles className="h-4.5 w-4.5 text-yellow-505 fill-yellow-500 shrink-0" />
            </div>
          </div>
        </div>

        {/* Stats Grid inside header */}
        <div className="grid grid-cols-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 divide-x divide-slate-100 dark:divide-slate-800 text-center">
          <div className="p-4">
            <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-0.5">Analyses Run</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{totalAnalyses}</p>
          </div>
          <div className="p-4">
            <p className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-widest mb-0.5">Average Score</p>
            <div className="flex items-center justify-center gap-1.5">
              <p className={`text-xl sm:text-2xl font-black ${
                averageScore >= 75 ? 'text-teal-605 dark:text-teal-400' :
                averageScore >= 50 ? 'text-amber-600 dark:text-amber-400' :
                'text-rose-600 dark:text-rose-455'
              }`}>{averageScore}%</p>
            </div>
          </div>
          <div className="p-4">
            <p className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-widest mb-0.5">Highest Score</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{highestScore}%</p>
          </div>
        </div>
      </section>

      {/* TABS SELECTOR SYSTEM */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-6">
        {[
          { id: 'overview', label: 'Overview & Profile', icon: 'person' },
          { id: 'history', label: 'Resume History', icon: 'history' },
          { id: 'settings', label: 'Security & Preferences', icon: 'settings' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 text-sm font-bold flex items-center gap-2 relative transition-all duration-200 ${
                isActive 
                  ? 'text-primary-600 dark:text-primary-400' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-primary-400 rounded-full"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ACTIVE TAB CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
          className="space-y-8"
        >
          {/* TAB 1: OVERVIEW & PROFILE */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Profile Details Form */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-6">
                <div>
                  <h2 className="font-extrabold font-display text-lg text-slate-900 dark:text-white">Profile Details</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Keep your professional information and location details up-to-date.</p>
                </div>
                
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          className="pl-11 w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:outline-none transition text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 text-xs font-semibold"
                          placeholder="e.g. John Doe"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          className="pl-11 w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:outline-none transition text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 text-xs font-semibold"
                          placeholder="e.g. john.doe@example.com"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="jobTitle" className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        Professional Title
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          id="jobTitle"
                          type="text"
                          value={editJobTitle}
                          onChange={(e) => setEditJobTitle(e.target.value)}
                          className="pl-11 w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:outline-none transition text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 text-xs font-semibold"
                          placeholder="e.g. Senior Product Designer"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          id="location"
                          type="text"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="pl-11 w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:outline-none transition text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 text-xs font-semibold"
                          placeholder="e.g. San Francisco, CA"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-md text-xs font-bold text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/30 disabled:opacity-50 transition active:scale-95"
                    >
                      {profileLoading ? 'Updating Profile...' : 'Save Profile Details'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Membership Card (Right column) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="relative overflow-hidden p-6 rounded-3xl bg-slate-900 border border-slate-850 text-white shadow-xl">
                  {/* Decorative glowing orb */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <div className="absolute top-0 right-0 p-6 pointer-events-none">
                    <span className="material-symbols-outlined text-4xl opacity-15 block">workspace_premium</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-extrabold font-display text-lg sm:text-xl tracking-tight flex items-center">
                      CareerAI Pro
                    </h4>
                    <Sparkles className="h-4.5 w-4.5 text-yellow-400 fill-yellow-400" />
                  </div>
                  <p className="text-slate-400 text-xs font-semibold mb-6">
                    Billed monthly. Next billing date: November 24, 2026.
                  </p>

                  {/* Usage trackers */}
                  <div className="space-y-4 mb-8">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5 font-bold">
                        <span className="text-slate-300">Resume Analyses</span>
                        <span className="text-white">12 / Unlimited</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-primary to-teal-400 h-full w-[40%] rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1.5 font-bold">
                        <span className="text-slate-300">AI Mock Interviews</span>
                        <span className="text-white">3 / 5 used</span>
                      </div>
                      <div className="w-full bg-slate-805 h-2 rounded-full overflow-hidden">
                        <div className="bg-teal-400 h-full w-[60%] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 relative z-10">
                    <button className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-sm text-sm">
                      Upgrade to Enterprise
                    </button>
                    <button className="w-full py-3 bg-white/10 border border-white/10 text-white rounded-xl font-bold hover:bg-white/15 transition-colors text-sm flex items-center justify-center space-x-2">
                      <CreditCard className="h-4 w-4 text-slate-350" />
                      <span>View Billing Invoices</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESUME HISTORY */}
          {activeTab === 'history' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-6">
              <div>
                <h2 className="font-extrabold font-display text-lg text-slate-900 dark:text-white">Analysis Log History</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">View scores and detail summaries for all your processed resume files.</p>
              </div>

              {historyLoading ? (
                <div className="space-y-4 animate-pulse">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="h-24 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
                  ))}
                </div>
              ) : profileDetails?.analyses && profileDetails.analyses.length > 0 ? (
                <div className="space-y-4">
                  {profileDetails.analyses.map((analysis) => (
                    <Link 
                      key={analysis._id} 
                      to={`/analysis/${analysis._id}`}
                      className="group p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 hover:border-primary/30 dark:hover:border-primary/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 text-left block"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon Indicator */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          analysis.atsScore >= 75 
                            ? 'bg-teal-50 dark:bg-teal-950/20 text-teal-650 dark:text-teal-400 border border-teal-100 dark:border-teal-900/40' 
                            : analysis.atsScore >= 50 
                            ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40'
                            : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455 border border-rose-100 dark:border-rose-900/40'
                        }`}>
                          <span className="material-symbols-outlined text-2xl font-bold">description</span>
                        </div>
                        
                        <div className="space-y-1.5 min-w-0">
                          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate max-w-md group-hover:text-primary dark:group-hover:text-primary-400 transition-colors">
                            {analysis.resumeId?.originalName || 'Resume File'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                            <span className="text-slate-400 dark:text-slate-500 font-semibold">
                              {new Date(analysis.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold text-[9px] text-slate-550 dark:text-slate-400 uppercase tracking-wider">
                              {analysis.analysisType === 'job-matched' ? 'Job Matched' : 'Baseline Profile'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Score Metrics */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-105 dark:border-slate-800">
                        <div className="text-right sm:text-right shrink-0">
                          <p className="text-[9px] font-bold text-slate-450 uppercase tracking-widest">ATS Score</p>
                          <p className={`text-xl font-black ${
                            analysis.atsScore >= 75 ? 'text-teal-650 dark:text-teal-400' :
                            analysis.atsScore >= 50 ? 'text-amber-655 dark:text-amber-400' :
                            'text-rose-655 dark:text-rose-400'
                          }`}>{analysis.atsScore} / 100</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-350 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <FileText className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-505 dark:text-slate-400 text-sm font-semibold">No resume analysis data found.</p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Upload and analyze your first resume to populate logs.</p>
                  <Link to="/upload" className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold mt-4 inline-block hover:opacity-95 shadow-md">
                    Start AI Analysis
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SECURITY & PREFERENCES */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Security Form Column */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/65 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-6">
                <div>
                  <h2 className="font-extrabold font-display text-lg text-slate-900 dark:text-white">Security &amp; Credentials</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Manage your password credentials and account security.</p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label htmlFor="currentPassword" className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                          id="currentPassword"
                          name="currentPassword"
                          type={showPass.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="pl-11 pr-10 w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:outline-none transition text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 text-xs font-semibold"
                          placeholder="••••••••"
                          required
                        />
                      <button
                        type="button"
                        onClick={() => setShowPass({ ...showPass, current: !showPass.current })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPass.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label htmlFor="newPassword" className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                          id="newPassword"
                          name="newPassword"
                          type={showPass.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="pl-11 pr-10 w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:outline-none transition text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 text-xs font-semibold"
                          placeholder="••••••••"
                          required
                        />
                      <button
                        type="button"
                        onClick={() => setShowPass({ ...showPass, new: !showPass.new })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPass.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPass.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="pl-11 pr-10 w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:outline-none transition text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 text-xs font-semibold"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPass.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-md text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-50 transition active:scale-95"
                    >
                      {passwordLoading ? 'Updating Password...' : 'Save New Password'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Preferences & Danger Zone Column */}
              <div className="lg:col-span-5 space-y-6">
                {/* App Settings card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-6">
                  <div>
                    <h3 className="font-extrabold font-display text-sm text-slate-900 dark:text-white uppercase tracking-wider">App Settings</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-0.5">Control notification emails and application themes.</p>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Notifications switch */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400">
                          <Bell className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white">Email Digest</p>
                          <p className="text-[10px] text-slate-450 dark:text-slate-500">Weekly career insights</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={emailDigest} 
                          onChange={handleEmailDigestToggle} 
                          className="sr-only peer" 
                        />
                        <div className="relative w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {/* Dark mode switch */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400">
                          <span className="material-symbols-outlined text-[18px]">dark_mode</span>
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white">Dark Theme</p>
                          <p className="text-[10px] text-slate-450 dark:text-slate-500">Toggle dark mode visual</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={theme === 'dark'} 
                          onChange={toggleTheme} 
                          className="sr-only peer" 
                        />
                        <div className="relative w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {/* AI notifications switch */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400">
                          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white">AI Suggestions</p>
                          <p className="text-[10px] text-slate-450 dark:text-slate-500">Smart resume alerts</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={aiAlerts} 
                          onChange={handleAiAlertsToggle} 
                          className="sr-only peer" 
                        />
                        <div className="relative w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Danger zone */}
                <div className="bg-red-50/20 dark:bg-red-950/10 border border-red-200/50 dark:border-red-900/30 p-6 rounded-3xl space-y-4">
                  <div>
                    <h3 className="font-extrabold font-display text-sm text-red-650 dark:text-red-400 flex items-center gap-1.5">
                      <Trash2 className="h-4 w-4 shrink-0" />
                      <span>Danger Zone</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Deleting your analysis data is irreversible and removes all parsing logs, keyword match history, and score charts.
                    </p>
                  </div>
                  
                  <button 
                    onClick={handleDeleteAllData}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all text-xs shadow-md shadow-red-500/10 active:scale-95"
                  >
                    Delete All Analysis Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Profile;
