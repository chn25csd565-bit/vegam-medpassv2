import React from 'react';
import { 
  PhoneCall, QrCode, ShieldCheck, MapPin, BarChart3, Sparkles, 
  Languages, Stethoscope, AlertTriangle, Globe 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onRunDemo, 
  onRunMlDemo,
  onOpenSos 
}) {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      {/* Indian Public Service Tricolor Accent Bar */}
      <div className="h-1.5 w-full bg-linear-to-r from-amber-500 via-white to-emerald-600 border-b border-slate-200/50" />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-18 gap-2">
          
          {/* Brand Logo & Govt Healthcare Badging */}
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" onClick={() => setActiveTab('home')}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-sky-700 to-sky-900 flex items-center justify-center text-white shadow-md shadow-sky-900/20 ring-2 ring-sky-100 shrink-0">
              <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="text-base sm:text-xl font-black tracking-tight text-slate-900">
                  MEDI<span className="text-sky-700">PASS</span>
                </span>
                <span className="hidden min-[400px]:inline-block text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                  {t('nav.brandBadge')}
                </span>
              </div>
              <p className="text-[9px] sm:text-[11px] font-medium text-slate-500 tracking-wide uppercase truncate max-w-[130px] min-[400px]:max-w-[180px] sm:max-w-none">
                {t('nav.brandSubtitle')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('voice')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'voice'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{t('nav.voiceBooking')}</span>
            </button>

            <button
              onClick={() => setActiveTab('passes')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'passes'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{t('nav.digitalPasses')}</span>
            </button>

            <button
              onClick={() => setActiveTab('checkin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'checkin'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('nav.hospitalCheckin')}</span>
            </button>

            <button
              onClick={() => setActiveTab('navigation')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'navigation'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{t('nav.roomNavigation')}</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{t('nav.opdMonitor')}</span>
            </button>
          </nav>

          {/* Action CTAs, Language Switcher & SOS */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* Dedicated English / മലയാളം Toggle Pill */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px] sm:text-xs font-bold shadow-2xs">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer min-h-[32px] flex items-center ${
                  language === 'en' 
                    ? 'bg-white text-sky-900 shadow-xs border border-slate-200 font-extrabold' 
                    : 'text-slate-600 hover:text-slate-950'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ml')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer min-h-[32px] flex items-center ${
                  language === 'ml' 
                    ? 'bg-emerald-600 text-white shadow-xs font-extrabold' 
                    : 'text-slate-600 hover:text-slate-950'
                }`}
                title="മലയാളത്തിലേക്ക് മാറ്റുക"
              >
                <span className="sm:hidden">ML</span>
                <span className="hidden sm:inline">മലയാളം</span>
              </button>
            </div>

            {/* Emergency SOS Button */}
            <button
              onClick={onOpenSos}
              className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] sm:text-xs font-black px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-sm hover:shadow-md hover:shadow-rose-600/30 transition-all active:scale-95 cursor-pointer ring-1 ring-rose-400 min-h-[32px]"
              title="Emergency SOS (108 Ambulance / Casualty)"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-white animate-pulse shrink-0" />
              <span className="font-extrabold">{t('nav.sos')}</span>
            </button>

            {/* 1-Click Malayalam Demo Shortcut (Desktop only) */}
            {onRunMlDemo && (
              <button
                onClick={onRunMlDemo}
                className="hidden lg:flex items-center gap-1.5 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer border border-emerald-400/40"
                title="കണ്ണിന്റെ ഡോക്ടർ മലയാളം വോയ്സ് ഡെമോ"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span>മലയാളം ഡെമോ</span>
              </button>
            )}

            {/* 1-Click English Demo Shortcut */}
            <button
              onClick={onRunDemo}
              className="flex items-center gap-1 sm:gap-1.5 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-[11px] sm:text-xs font-bold px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer min-h-[32px]"
              title="Preload Aarav booking Ophthalmology Dr. Sharma"
            >
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-200 shrink-0" />
              <span className="hidden sm:inline">{t('nav.oneClickDemo')}</span>
              <span className="sm:hidden font-bold">Demo</span>
            </button>
          </div>

        </div>

        {/* Mobile Tab Strip with Touch-Friendly Targets (min 44px height) */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1.5 border-t border-slate-100 no-scrollbar items-center">
          <button
            onClick={() => setActiveTab('home')}
            className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 min-h-[40px] transition-all cursor-pointer ${
              activeTab === 'home' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
            }`}
          >
            🏠 <span>Home</span>
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 min-h-[40px] transition-all cursor-pointer ${
              activeTab === 'voice' ? 'bg-sky-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{t('nav.voiceBooking')}</span>
          </button>
          <button
            onClick={() => setActiveTab('passes')}
            className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 min-h-[40px] transition-all cursor-pointer ${
              activeTab === 'passes' ? 'bg-sky-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{t('nav.digitalPasses')}</span>
          </button>
          <button
            onClick={() => setActiveTab('checkin')}
            className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 min-h-[40px] transition-all cursor-pointer ${
              activeTab === 'checkin' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('nav.hospitalCheckin')}</span>
          </button>
          <button
            onClick={() => setActiveTab('navigation')}
            className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 min-h-[40px] transition-all cursor-pointer ${
              activeTab === 'navigation' ? 'bg-sky-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{t('nav.roomNavigation')}</span>
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`whitespace-nowrap px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 min-h-[40px] transition-all cursor-pointer ${
              activeTab === 'admin' ? 'bg-sky-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{t('nav.opdMonitor')}</span>
          </button>
          {onRunMlDemo && (
            <button
              onClick={onRunMlDemo}
              className="whitespace-nowrap px-3 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white flex items-center gap-1 shrink-0 min-h-[40px] shadow-2xs active:scale-95 cursor-pointer"
            >
              ⚡ മലയാളം
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
