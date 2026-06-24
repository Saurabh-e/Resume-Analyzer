import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Sparkles, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  PlayCircle,
  Sun,
  Moon,
  Check
} from 'lucide-react';

const Landing = () => {
  const { isAuthenticated, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const features = [
    {
      icon: 'description',
      iconColor: 'text-primary bg-primary/10 dark:bg-primary/20 dark:text-primary-fixed',
      title: 'ATS Optimization',
      description: 'Beat the gatekeepers. We use proprietary algorithms to ensure your resume ranks in the top 1% for any job description.',
      linkText: 'Learn more',
      linkPath: '/register'
    },
    {
      icon: 'psychology',
      iconColor: 'text-secondary bg-secondary/10 dark:bg-secondary/20 dark:text-secondary-fixed',
      title: 'Skill Gap Analysis',
      description: "Don't guess what's missing. Identify exactly which hard and soft skills are preventing you from being the perfect candidate.",
      linkText: 'Explore analyzer',
      linkPath: '/register'
    },
    {
      icon: 'forum',
      iconColor: 'text-tertiary-container bg-tertiary-container/10 dark:bg-tertiary-container/20 dark:text-tertiary-fixed-dim',
      title: 'AI Interview Prep',
      description: 'Practice in a safe, intelligent environment. Get real-time feedback on your responses, tone, and confidence levels.',
      linkText: 'Start mock interview',
      linkPath: '/register'
    }
  ];

  const testimonials = [
    {
      quote: "CareerAI helped me landing a Senior PM role at a Tier 1 tech company. The skill gap analysis was a game-changer for my interview prep.",
      author: "Sarah Jenkins",
      role: "Senior Product Manager",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
    },
    {
      quote: "The ATS optimization tool is incredible. I went from zero responses to five interview calls in just two weeks of using the platform.",
      author: "David Chen",
      role: "Software Engineer @ Meta",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
    },
    {
      quote: "I was skeptical about AI coaching, but the interview prep module gave me insights that human coaches missed. Worth every penny.",
      author: "Elena Rodriguez",
      role: "Marketing Director",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150"
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      description: 'Perfect for getting a quick health-check of your current resume.',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        '1 Resume analysis per month',
        'Core ATS score compliance check',
        'Basic keyword gap checklist',
        'Standard PDF formatting tips',
        'Community forum support'
      ],
      ctaText: 'Get Started for Free',
      ctaAction: handleCTA,
      popular: false,
      buttonStyle: 'border border-outline-variant dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-on-surface dark:text-slate-100'
    },
    {
      name: 'Pro',
      description: 'Designed for active job seekers looking to land interviews fast.',
      monthlyPrice: 19,
      annualPrice: 12,
      features: [
        'Unlimited resume analyses',
        'Advanced ATS optimization report',
        'Comprehensive keyword gap checker',
        '5 AI Mock Interviews per month',
        'AI Cover Letter & Outreach writer',
        'Priority AI response times',
        '24/7 AI Career Coach access'
      ],
      ctaText: 'Upgrade to Pro',
      ctaAction: handleCTA,
      popular: true,
      buttonStyle: 'bg-primary text-on-primary hover:opacity-90 shadow-lg shadow-primary/20'
    },
    {
      name: 'Elite',
      description: 'For candidates seeking high-touch expert guidance and unlimited power.',
      monthlyPrice: 49,
      annualPrice: 35,
      features: [
        'Everything in Pro plan',
        '1-on-1 human expert resume review (1/mo)',
        'Unlimited AI Mock Interviews',
        'Tailored LinkedIn profile optimization',
        'Direct email & chat support',
        'Custom layout & formatting templates'
      ],
      ctaText: 'Go Elite',
      ctaAction: handleCTA,
      popular: false,
      buttonStyle: 'bg-slate-900 dark:bg-slate-800 text-white hover:opacity-90 shadow-md dark:shadow-slate-950/50'
    }
  ];

  return (
    <div className="min-h-screen bg-surface dark:bg-slate-950 text-on-surface dark:text-slate-100 transition-colors duration-300 font-sans relative overflow-hidden">
      
      {/* Background Decorative Blur Orbs */}
      <div className="absolute -top-10 -right-10 w-96 h-96 bg-primary/10 blur-3xl rounded-full -z-10" />
      <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-secondary/10 blur-3xl rounded-full -z-10" />

      {/* --- TopNavBar --- */}
      <nav className="sticky top-0 z-50 flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto bg-surface/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-outline-variant/30 dark:border-slate-800/50 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary dark:text-primary-fixed font-display">CareerAI</span>
          </Link>
          <div className="hidden md:flex gap-6">
            <Link className="text-sm font-semibold text-primary dark:text-primary-fixed border-b-2 border-primary dark:border-primary-fixed pb-1" to="/">Product</Link>
            <a className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 hover:text-primary dark:hover:text-primary-fixed hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 px-2 py-0.5 rounded" href="#features">Features</a>
            {isAuthenticated && (
              <>
                <Link className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 hover:text-primary dark:hover:text-primary-fixed hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 px-2 py-0.5 rounded" to="/dashboard">Dashboard</Link>
                <Link className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 hover:text-primary dark:hover:text-primary-fixed hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 px-2 py-0.5 rounded" to="/resumes">Resumes</Link>
              </>
            )}
            <a className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 hover:text-primary dark:hover:text-primary-fixed hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 px-2 py-0.5 rounded" href="#pricing">Pricing</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            id="theme-toggle-button"
            className="p-2.5 rounded-lg border border-outline-variant/30 dark:border-slate-800 text-on-surface-variant dark:text-slate-300 hover:text-primary dark:hover:text-primary-fixed hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-indigo-600" />}
          </button>
          {isAuthenticated ? (
            <Link to="/dashboard" className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 active:scale-95 transition-all duration-200 shadow-md flex items-center space-x-1">
              <span>Go to Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden md:block font-semibold text-on-surface-variant dark:text-slate-300 hover:text-primary dark:hover:text-primary-fixed transition-colors text-sm">Login</Link>
              <button 
                onClick={handleCTA}
                className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 active:scale-95 transition-all duration-200 shadow-md text-sm"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden pt-16 pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
          
          <div className="flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full w-fit">
              <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
              <span className="text-xs text-primary font-bold tracking-widest uppercase">Trusted by 50k+ Job Seekers</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display text-on-surface leading-tight">
              Land Your Dream Job with <span className="text-primary">AI-Powered Precision.</span>
            </h1>
            
            <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed">
              Optimize your resume for ATS, uncover missing skills, and outshine the competition with the world&apos;s most advanced career intelligence platform.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={handleCTA}
                className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 flex items-center justify-center"
              >
                Get Started
              </button>
              <a 
                href="#features"
                className="border border-outline-variant bg-surface-bright text-on-surface px-8 py-4 rounded-xl font-bold hover:bg-surface-container-low transition-all active:scale-95 flex items-center gap-2"
              >
                <PlayCircle className="h-5 w-5 text-slate-500" />
                <span>Watch Demo</span>
              </a>
            </div>
          </div>

          {/* Right Visual Dashboard Mockup */}
          <div className="relative w-full flex justify-center">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="glass-card border border-outline-variant/30 rounded-2xl p-6 shadow-xl relative overflow-hidden w-full max-w-[440px]"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-error"></div>
                  <div className="w-3 h-3 rounded-full bg-secondary-container"></div>
                  <div className="w-3 h-3 rounded-full bg-primary-container"></div>
                </div>
                <div className="px-4 py-1 bg-surface-container-high rounded-full text-xs font-bold text-on-surface-variant">
                  ATS Score: 94/100
                </div>
              </div>

              <div className="space-y-6">
                <div className="h-4 bg-surface-container-highest rounded-full w-3/4"></div>
                <div className="flex gap-4 items-center">
                  <div className="flex-1 space-y-3">
                    <div className="h-3 bg-surface-container-highest/60 rounded-full"></div>
                    <div className="h-3 bg-surface-container-highest/60 rounded-full w-5/6"></div>
                    <div className="h-3 bg-surface-container-highest/60 rounded-full w-4/6"></div>
                  </div>
                  <div className="w-24 h-24 rounded-full border-8 border-secondary flex items-center justify-center glow-teal">
                    <span className="text-xl font-black text-secondary">94%</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-20 bg-primary/5 rounded-lg border border-primary/10 flex flex-col justify-center items-center p-2 text-center">
                    <span className="text-xs font-bold text-primary">Metadata</span>
                    <span className="text-[10px] text-slate-400 mt-1">100% Pass</span>
                  </div>
                  <div className="h-20 bg-primary/5 rounded-lg border border-primary/10 flex flex-col justify-center items-center p-2 text-center">
                    <span className="text-xs font-bold text-primary">Keywords</span>
                    <span className="text-[10px] text-slate-400 mt-1">24 Matched</span>
                  </div>
                  <div className="h-20 bg-primary/5 rounded-lg border border-primary/10 flex flex-col justify-center items-center p-2 text-center">
                    <span className="text-xs font-bold text-primary">Format</span>
                    <span className="text-[10px] text-slate-400 mt-1">Correct</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* --- FEATURES BENTO SECTION --- */}
      <section id="features" className="py-24 bg-surface-container-low dark:bg-slate-900/30 px-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold font-display text-on-surface dark:text-slate-100">
              Precision Engineering for Your Career
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Our AI engine analyzes millions of job descriptions to give you the exact edge needed to land interviews at top-tier companies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -6 }}
                className="bg-surface-bright dark:bg-slate-900/60 p-8 rounded-2xl border border-outline-variant/30 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${item.iconColor}`}>
                    <span className="material-symbols-outlined font-black text-2xl">{item.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-4">
                    {item.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant dark:text-slate-400 leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>
                <button
                  onClick={handleCTA}
                  className="w-fit flex items-center text-primary dark:text-primary-fixed font-bold text-sm gap-2 hover:gap-4 transition-all"
                >
                  <span>{item.linkText}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS SECTION --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
          <div className="max-w-xl space-y-2 text-left">
            <span className="text-primary dark:text-primary-fixed text-xs font-bold uppercase tracking-widest block">Success Stories</span>
            <h2 className="text-3xl font-extrabold font-display text-on-surface dark:text-slate-100">
              Trusted by the next generation of industry leaders.
            </h2>
          </div>
          <div className="flex gap-4 mt-6 md:mt-0">
            <button className="w-12 h-12 rounded-full border border-outline-variant dark:border-slate-800 flex items-center justify-center hover:bg-surface-container-low dark:hover:bg-slate-900 transition-colors">
              <ChevronLeft className="h-5 w-5 text-slate-650 dark:text-slate-450" />
            </button>
            <button className="w-12 h-12 rounded-full border border-outline-variant dark:border-slate-800 flex items-center justify-center hover:bg-surface-container-low dark:hover:bg-slate-900 transition-colors">
              <ChevronRight className="h-5 w-5 text-slate-650 dark:text-slate-450" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((test, index) => (
            <div key={index} className="glass-card p-8 rounded-2xl border border-outline-variant dark:border-slate-800/80 shadow-sm flex flex-col justify-between text-left">
              <div>
                <div className="flex gap-1 text-secondary mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current text-secondary animate-pulse" />
                  ))}
                </div>
                <p className="text-sm sm:text-base italic text-on-surface dark:text-slate-200 mb-8 leading-relaxed">
                  &ldquo;{test.quote}&rdquo;
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <img 
                  className="w-12 h-12 rounded-full object-cover border border-slate-100 dark:border-slate-800" 
                  src={test.avatar} 
                  alt={test.author} 
                />
                <div>
                  <h4 className="font-bold text-sm text-on-surface dark:text-white">{test.author}</h4>
                  <p className="text-xs text-on-surface-variant dark:text-slate-400">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-24 bg-surface-container-low dark:bg-slate-900/30 px-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <span className="text-primary dark:text-primary-fixed text-xs font-bold uppercase tracking-widest block">Flexible Plans</span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-display text-on-surface dark:text-slate-100">
              Simple, Transparent Pricing
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Choose the plan that fits your career goals. Switch or cancel anytime. Save up to 35% with annual billing.
            </p>

            {/* Toggle Switch */}
            <div className="flex items-center justify-center gap-4 pt-6">
              <span className={`text-sm font-semibold transition-colors duration-200 ${!isAnnual ? 'text-primary dark:text-primary-fixed font-bold' : 'text-on-surface-variant dark:text-slate-450'}`}>
                Monthly billing
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="w-14 h-8 bg-primary/20 dark:bg-slate-800/80 rounded-full p-1 transition-colors duration-205 focus:outline-none relative flex items-center"
                aria-label="Toggle annual billing"
              >
                <motion.div
                  layout
                  className="w-6 h-6 bg-primary dark:bg-primary-fixed rounded-full"
                  animate={{ x: isAnnual ? 24 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold transition-colors duration-200 ${isAnnual ? 'text-primary dark:text-primary-fixed font-bold' : 'text-on-surface-variant dark:text-slate-450'}`}>
                  Annual billing
                </span>
                <span className="bg-secondary/15 text-secondary dark:bg-secondary/35 dark:text-secondary-fixed text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  Save ~35%
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {pricingPlans.map((plan, index) => {
              const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
              return (
                <motion.div
                  key={index}
                  whileHover={{ y: -8 }}
                  className={`bg-surface-bright dark:bg-slate-900/60 p-8 rounded-3xl border transition-all flex flex-col justify-between relative ${
                    plan.popular
                      ? 'border-primary dark:border-primary-fixed shadow-xl ring-2 ring-primary/10 dark:ring-primary-fixed/15'
                      : 'border-outline-variant/30 dark:border-slate-800/80 shadow-sm hover:shadow-md'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-on-primary dark:bg-primary-fixed dark:text-on-primary-fixed-variant text-[11px] font-black tracking-widest uppercase px-4 py-1 rounded-full shadow-md">
                      Most Popular
                    </span>
                  )}

                  <div className="space-y-6">
                    {/* Header Details */}
                    <div className="text-left">
                      <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-on-surface-variant dark:text-slate-400 min-h-[32px] leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline text-left border-b border-outline-variant/20 dark:border-slate-800/50 pb-6">
                      <span className="text-4xl font-extrabold font-display text-slate-900 dark:text-white">
                        ${price}
                      </span>
                      <span className="text-sm text-on-surface-variant dark:text-slate-400 ml-2">
                        / month
                      </span>
                      {isAnnual && price > 0 && (
                        <span className="text-[10px] text-secondary dark:text-secondary-fixed font-bold ml-auto block">
                          Billed annually
                        </span>
                      )}
                    </div>

                    {/* Features List */}
                    <ul className="space-y-4 text-left pt-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-secondary dark:text-secondary-fixed shrink-0 mt-0.5" />
                          <span className="text-sm text-on-surface-variant dark:text-slate-350">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-8">
                    <button
                      onClick={plan.ctaAction}
                      className={`w-full py-3.5 px-6 rounded-xl font-bold transition-all active:scale-95 text-sm ${plan.buttonStyle}`}
                    >
                      {plan.ctaText}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="bg-primary rounded-[2rem] p-8 md:p-16 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-container/20 to-transparent opacity-50 pointer-events-none" />
          
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold font-display text-on-primary leading-tight">
              Ready to upgrade your career?
            </h2>
            <p className="text-sm sm:text-base text-on-primary/80 max-w-lg mx-auto">
              Join thousands of professionals who are using CareerAI to secure their future. Get started for free today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
              <button 
                onClick={handleCTA}
                className="bg-on-primary text-primary px-8 py-4 rounded-xl font-bold hover:bg-surface-bright transition-all shadow-xl hover:-translate-y-1"
              >
                Claim Your Free Analysis
              </button>
              <a 
                href="#pricing"
                className="text-on-primary border border-on-primary/30 px-8 py-4 rounded-xl font-bold hover:bg-on-primary/10 transition-all text-center w-full sm:w-auto"
              >
                View Pricing Plans
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="w-full py-12 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 bg-surface-bright dark:bg-slate-900 border-t border-outline-variant/50 dark:border-slate-800/80 mt-16 text-left">
        <div className="space-y-4">
          <span className="text-xl font-bold text-primary dark:text-primary-fixed font-display block">CareerAI</span>
          <p className="text-sm text-on-surface-variant dark:text-slate-400 leading-relaxed">
            Precision Career Intelligence for the modern professional.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-on-surface dark:text-slate-200 mb-6">Product</h4>
          <ul className="space-y-4 text-sm text-on-surface-variant dark:text-slate-400 font-medium">
            <li><a className="hover:text-primary dark:hover:text-primary-fixed transition-all duration-200" href="#">ATS Optimizer</a></li>
            <li><a className="hover:text-primary dark:hover:text-primary-fixed transition-all duration-200" href="#">Skill Gap Analyzer</a></li>
            <li><a className="hover:text-primary dark:hover:text-primary-fixed transition-all duration-200" href="#">AI Mock Interviews</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-on-surface dark:text-slate-200 mb-6">Company</h4>
          <ul className="space-y-4 text-sm text-on-surface-variant dark:text-slate-400 font-medium">
            <li><a className="hover:text-primary dark:hover:text-primary-fixed transition-all duration-200" href="#">About Us</a></li>
            <li><a className="hover:text-primary dark:hover:text-primary-fixed transition-all duration-200" href="#">Careers</a></li>
            <li><a className="hover:text-primary dark:hover:text-primary-fixed transition-all duration-200" href="#">Privacy Policy</a></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold text-on-surface dark:text-slate-200 mb-6">Newsletter</h4>
          <p className="text-xs text-on-surface-variant dark:text-slate-400 leading-relaxed">
            Get weekly career insights delivered to your inbox.
          </p>
          <div className="flex gap-2">
            <input 
              className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-lg px-3 py-2 text-xs w-full focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white" 
              placeholder="Email address" 
              type="email" 
            />
            <button className="bg-primary text-on-primary p-2.5 rounded-lg hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-xs flex">arrow_forward</span>
            </button>
          </div>
        </div>

        <div className="col-span-1 md:col-span-4 border-t border-outline-variant/30 dark:border-slate-800/80 pt-6 mt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <p>&copy; 2026 CareerAI. Precision Career Intelligence.</p>
          <div className="flex gap-6">
            <a className="hover:text-primary dark:hover:text-primary-fixed" href="#">Terms</a>
            <a className="hover:text-primary dark:hover:text-primary-fixed" href="#">Privacy</a>
            <a className="hover:text-primary dark:hover:text-primary-fixed" href="#">Cookies</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
