import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import StepperWorkflow from './components/StepperWorkflow';
import VoiceCallModal from './components/VoiceCallModal';
import EmergencySosModal from './components/EmergencySosModal';
import DigitalPassCard from './components/DigitalPassCard';
import CheckInDesk from './components/CheckInDesk';
import IndoorNavigation from './components/IndoorNavigation';
import AdminDashboard from './components/AdminDashboard';
import PatientDashboard from './components/PatientDashboard';
import { api } from './services/api';
import { INITIAL_PATIENTS, getStoredAppointments } from './data/mockData';
import { useLanguage } from './context/LanguageContext';
import { 
  PhoneCall, QrCode, ShieldCheck, MapPin, BarChart3, 
  Sparkles, CheckCircle2, Stethoscope, ChevronRight, ArrowRight, ExternalLink,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  const { language, setLanguage, t } = useLanguage();

  // Navigation
  const [activeTab, setActiveTab] = useState('home');

  // Appointments & Current Pass
  const [appointments, setAppointments] = useState([]);
  const [activePass, setActivePass] = useState(null);

  // Voice Call Modal
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isDemoPreload, setIsDemoPreload] = useState(false);
  const [isMlDemoPreload, setIsMlDemoPreload] = useState(false);

  // Emergency SOS Modal
  const [isEmergencySosOpen, setIsEmergencySosOpen] = useState(false);

  // Active Patient (Default Meera with kids Aarav and Diya; index 3 Suresh with no UHID)
  const [patientIndex, setPatientIndex] = useState(1);
  const currentPatient = INITIAL_PATIENTS[patientIndex] || INITIAL_PATIENTS[1];
  const dependents = currentPatient.dependents || [];

  // Load appointments
  const refreshAppointments = async () => {
    const data = await api.getAdminStats();
    const list = data?.recent_appointments || getStoredAppointments();
    const normalized = (list || []).map(a => ({
      ...a,
      id: a.id || a.appointment_id,
      appointment_id: a.id || a.appointment_id
    }));
    setAppointments(normalized);
    if (!activePass && normalized.length > 0) {
      setActivePass(normalized[0]);
    }
  };

  useEffect(() => {
    refreshAppointments();
  }, []);

  // Trigger Voice Call (regular)
  const handleStartVoice = () => {
    setIsDemoPreload(false);
    setIsMlDemoPreload(false);
    setIsVoiceModalOpen(true);
  };

  // Trigger English 1-Click Demo
  const handleRunDemo = () => {
    setIsDemoPreload(true);
    setIsMlDemoPreload(false);
    setIsVoiceModalOpen(true);
  };

  // Trigger Malayalam 1-Click Demo
  const handleRunMlDemo = () => {
    setLanguage('ml');
    setIsDemoPreload(false);
    setIsMlDemoPreload(true);
    setIsVoiceModalOpen(true);
  };

  // When a pass is created from Voice Call
  const handlePassCreated = async (newPass) => {
    if (!newPass) return;

    const aptId = newPass.id || newPass.appointment_id;
    const normalizedPass = {
      ...newPass,
      id: aptId,
      appointment_id: aptId
    };

    // 1. Immediately update appointments state synchronously so Dashboard and Pass Card have the new booking with zero race condition
    setAppointments(prev => {
      const filtered = prev.filter(a => (a.id && a.id !== aptId) && (a.appointment_id && a.appointment_id !== aptId));
      return [normalizedPass, ...filtered];
    });

    // 2. Set active pass to the exact newly booked pass
    setActivePass(normalizedPass);

    // 3. Automatically sync the active patient in the dashboard to match the patient for whom the booking was made
    const bookedPatientName = normalizedPass.patient_name || '';
    const bookedPatientId = normalizedPass.patient_id;
    const foundIdx = INITIAL_PATIENTS.findIndex(p => 
      (bookedPatientId && p.id === Number(bookedPatientId)) ||
      (bookedPatientName && (
        p.name.toLowerCase() === bookedPatientName.toLowerCase() ||
        p.dependents?.some(d => d.id === Number(bookedPatientId) || d.name.toLowerCase() === bookedPatientName.toLowerCase())
      ))
    );
    if (foundIdx !== -1) {
      setPatientIndex(foundIdx);
    }

    // 4. Switch to passes tab
    setActiveTab('passes');

    // 5. Background sync with backend / storage
    try {
      const data = await api.getAdminStats();
      const list = data?.recent_appointments || getStoredAppointments();
      if (list && list.length > 0) {
        const syncedList = list.map(a => ({
          ...a,
          id: a.id || a.appointment_id,
          appointment_id: a.id || a.appointment_id
        }));
        const withoutNew = syncedList.filter(a => (a.id !== aptId) && (a.appointment_id !== aptId));
        setAppointments([normalizedPass, ...withoutNew]);
      }
    } catch (e) {
      console.warn("Background refresh error", e);
    }
  };

  // Check-In navigation helper
  const handleNavigateToCheckin = (pass = null) => {
    if (pass) setActivePass(pass);
    setActiveTab('checkin');
  };

  // Room Navigation helper
  const handleNavigateToRoom = (pass = null) => {
    if (pass) setActivePass(pass);
    setActiveTab('navigation');
  };

  // Emergency SOS Trigger
  const handleStartSos = () => {
    setIsEmergencySosOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white">
      
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunDemo={handleRunDemo}
        onRunMlDemo={handleRunMlDemo}
        onOpenSos={handleStartSos}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-24 sm:pb-12">
        
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-10">
            {/* Hero Section */}
            <HeroBanner
              onStartVoice={handleStartVoice}
              onRunDemo={handleRunDemo}
              onRunMlDemo={handleRunMlDemo}
              onGoCheckin={() => setActiveTab('checkin')}
              onOpenSos={handleStartSos}
            />

            {/* 10-Step Interactive Workflow */}
            <StepperWorkflow
              onSelectStep={(stepId) => {
                if (stepId === 1 || stepId === 8) handleStartVoice();
                else if (stepId === 9) setActiveTab('passes');
                else if (stepId === 10) setActiveTab('checkin');
              }}
            />

            {/* Featured Pass & Quick Access Section */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 sm:mb-8">
                <div>
                  <span className="text-xs font-bold text-sky-700 uppercase tracking-wider bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                    {t('pass.showcaseTag')}
                  </span>
                  <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-1">
                    {t('pass.showcaseTitle')}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    {t('pass.showcaseSubtitle')}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('passes')}
                    className="w-full sm:w-auto px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    {t('pass.btnViewAll')}
                  </button>
                </div>
              </div>

              {/* Pass Card preview */}
              {activePass ? (
                <DigitalPassCard
                  appointment={activePass}
                  onNavigate={handleNavigateToRoom}
                  onCheckin={handleNavigateToCheckin}
                />
              ) : (
                <div className="text-center py-10 sm:py-12 bg-white rounded-3xl border border-slate-200 px-4">
                  <p className="text-sm font-semibold text-slate-600">{t('pass.noPasses')}</p>
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                    <button
                      onClick={handleRunDemo}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      {t('pass.btnPreloadDemo')}
                    </button>
                    <button
                      onClick={handleRunMlDemo}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      ⚡ {t('nav.mlDemo')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hospital Architecture / Key Guarantees */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900">{t('features.zeroTyping')}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t('features.zeroTypingDesc')}
                  </p>
                </div>

                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900">{t('features.privacyToken')}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t('features.privacyTokenDesc')}
                  </p>
                </div>

                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-2.5 sm:col-span-2 md:col-span-1">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900">{t('features.roomNav')}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t('features.roomNavDesc')}
                  </p>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VOICE BOOKING (Standalone Portal View) */}
        {activeTab === 'voice' && (
          <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                {t('voice.portalTag')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {t('voice.portalTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                {t('voice.portalSubtitle')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2.5 sm:gap-3 pt-2">
              <button
                onClick={handleStartVoice}
                className="w-full sm:w-auto px-6 py-3.5 bg-sky-700 hover:bg-sky-800 text-white font-bold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer min-h-[48px]"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{t('voice.btnDialer')}</span>
              </button>

              <button
                onClick={handleRunDemo}
                className="w-full sm:w-auto px-5 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer min-h-[48px]"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('voice.btnAaravDemo')}</span>
              </button>

              <button
                onClick={handleRunMlDemo}
                className="w-full sm:w-auto px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer min-h-[48px]"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('voice.btnMlDemo')}</span>
              </button>
            </div>

            {/* Kerala Government Booking Option */}
            <div className="mt-8 max-w-xl mx-auto p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <p className="text-sm font-bold text-emerald-950">{t('voice.noUhidBannerTitle')}</p>
                <p className="text-xs text-slate-600">{t('voice.noUhidBannerText')}</p>
              </div>
              <button
                onClick={() => window.open('https://ehealth.kerala.gov.in', '_blank', 'noopener,noreferrer')}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center justify-center gap-1.5 shrink-0 transition-all active:scale-95 cursor-pointer min-h-[44px]"
              >
                <span>{t('voice.btnGovtSystem')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: DIGITAL PASSES & PATIENT DASHBOARD */}
        {activeTab === 'passes' && (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
            <PatientDashboard
              patient={currentPatient}
              dependents={dependents}
              appointments={appointments}
              onViewPass={(pass) => setActivePass(pass)}
              onBookNew={handleStartVoice}
              onNavigate={handleNavigateToRoom}
              onSwitchPatient={(idx) => setPatientIndex(idx)}
            />

            {activePass && (
              <div className="pt-6 border-t border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 text-center mb-6">
                  {t('pass.showcaseTitle')}
                </h3>
                <DigitalPassCard
                  appointment={activePass}
                  onNavigate={handleNavigateToRoom}
                  onCheckin={handleNavigateToCheckin}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 4: HOSPITAL CHECK-IN DESK */}
        {activeTab === 'checkin' && (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
            <CheckInDesk
              recentAppointments={appointments}
              onCheckinSuccess={(updated) => {
                refreshAppointments();
                setActivePass(updated);
              }}
            />
          </div>
        )}

        {/* TAB 5: ROOM NAVIGATION */}
        {activeTab === 'navigation' && (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
            <IndoorNavigation activePass={activePass} />
          </div>
        )}

        {/* TAB 6: OPD ADMIN MONITOR */}
        {activeTab === 'admin' && (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
            <AdminDashboard
              onSelectPass={(pass) => {
                setActivePass(pass);
                setActiveTab('passes');
              }}
            />
          </div>
        )}

      </main>

      {/* MOBILE-ONLY FLOATING ACTION DOCK (Zero collision, safe-area aware) */}
      {!isVoiceModalOpen && !isEmergencySosOpen && (
        <div className="sm:hidden fixed bottom-3 inset-x-0 z-40 px-3 flex items-center justify-center gap-2 pointer-events-none">
          <div className="flex items-center gap-2 p-1.5 rounded-full bg-slate-900/90 backdrop-blur-md shadow-2xl border border-slate-700/60 pointer-events-auto max-w-full">
            {/* SOS Pill Button */}
            <button
              onClick={handleStartSos}
              className="bg-linear-to-r from-rose-600 to-rose-700 hover:from-rose-500 text-white font-black px-3.5 py-2 rounded-full text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer ring-1 ring-rose-400 shrink-0"
              title="Emergency SOS: Call Ambulance or Emergency Dept"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-white animate-bounce shrink-0" />
              <span>{t('nav.sos')}</span>
            </button>

            {/* Voice Booking Pill Button */}
            <button
              onClick={handleStartVoice}
              className="bg-linear-to-r from-sky-700 to-sky-900 hover:from-sky-800 text-white font-extrabold px-3.5 py-2 rounded-full text-[11px] flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer ring-1 ring-sky-400 shrink-0"
              title="Start AI Voice Helpline Call"
            >
              <div className="relative shrink-0">
                <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              </div>
              <span className="truncate max-w-[140px]">
                {language === 'ml' ? 'വോയ്സ് ബുക്കിംഗ്' : 'Voice Booking'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* TABLET & DESKTOP FLOATING BUTTONS (Preserved existing layout) */}
      {!isVoiceModalOpen && !isEmergencySosOpen && (
        <>
          {/* Voice Call Floating Trigger (Desktop / Tablet) */}
          <button
            onClick={handleStartVoice}
            className="hidden sm:flex fixed bottom-6 right-6 z-40 bg-linear-to-r from-sky-700 to-sky-900 hover:from-sky-800 hover:to-sky-950 text-white font-bold p-4 rounded-full shadow-2xl hover:scale-105 transition-all items-center gap-3 border-2 border-white ring-4 ring-sky-700/20 cursor-pointer"
            title="Start AI Voice Helpline Call"
          >
            <div className="relative">
              <PhoneCall className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
            </div>
            <span className="text-xs font-extrabold tracking-wide pr-1">
              {language === 'ml' ? 'വോയ്സ് കോൾ വഴി ബുക്ക് ചെയ്യുക' : 'Book by Voice Call'}
            </span>
          </button>

          {/* Persistent Floating Emergency SOS Button (Desktop / Tablet) */}
          <button
            onClick={handleStartSos}
            className="hidden sm:flex fixed bottom-6 left-6 z-40 bg-linear-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold px-4 py-3.5 rounded-full shadow-2xl hover:scale-105 transition-all items-center gap-2.5 border-2 border-white ring-4 ring-rose-600/30 cursor-pointer"
            title="Emergency SOS: Call Ambulance, Emergency Dept, or Share Location"
          >
            <div className="relative flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white animate-bounce" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-300 rounded-full animate-ping" />
            </div>
            <span className="text-xs font-black tracking-wider uppercase pr-1">
              {t('nav.sosHotline')}
            </span>
          </button>
        </>
      )}

      {/* Interactive Voice Call Modal */}
      <VoiceCallModal
        isOpen={isVoiceModalOpen}
        onClose={() => {
          setIsVoiceModalOpen(false);
          setIsDemoPreload(false);
          setIsMlDemoPreload(false);
        }}
        onPassCreated={handlePassCreated}
        initialPreload={isDemoPreload}
        isMlDemo={isMlDemoPreload}
      />

      {/* Emergency SOS Conversational Call Modal */}
      <EmergencySosModal
        isOpen={isEmergencySosOpen}
        onClose={() => setIsEmergencySosOpen(false)}
      />

      {/* Public Service Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-slate-800">{t('footer.brandText')}</span>
          </div>

          <p className="italic text-slate-400">
            {t('footer.tagline')}
          </p>
        </div>
      </footer>

    </div>
  );
}

