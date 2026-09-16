import React, { useState } from 'react';
import { 
  ShieldCheck, QrCode, Search, CheckCircle2, User, 
  MapPin, Clock, Stethoscope, AlertCircle, ArrowRight, Printer, Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { sfx } from '../services/speech';
import { useLanguage } from '../context/LanguageContext';

export default function CheckInDesk({ recentAppointments = [], onCheckinSuccess }) {
  const { language, t } = useLanguage();
  const [searchInput, setSearchInput] = useState('');
  const [scannedApt, setScannedApt] = useState(null);
  const [checkedInResult, setCheckedInResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Search or Scan Handler
  const handleVerify = async (query = null) => {
    const q = (query || searchInput).trim();
    if (!q) return;
    setErrorMsg('');
    setCheckedInResult(null);

    // Play scan beep
    sfx.playScanBeep();

    const all = await api.getAdminStats();
    const list = all.recent_appointments || [];
    const found = list.find(a => 
      a.id.toLowerCase() === q.toLowerCase() || 
      (a.qr_token && a.qr_token.toLowerCase() === q.toLowerCase()) ||
      a.patient_name.toLowerCase().includes(q.toLowerCase())
    );

    if (!found) {
      setErrorMsg(
        language === 'ml'
          ? `"${q}" എന്നതിന് അനുയോജ്യമായ അപ്പോയിന്റ്മെന്റ് കണ്ടെത്താനായില്ല.`
          : `No appointment found matching "${q}". Try picking a demo appointment below.`
      );
      setScannedApt(null);
    } else {
      setScannedApt(found);
      if (found.status === "Checked In") {
        setCheckedInResult({
          appointment: found,
          token_number: found.token_number || "OPD-204-#01",
          checked_in_at: found.checked_in_at || (language === 'ml' ? "ഇന്ന് മുൻപ്" : "Earlier Today")
        });
      }
    }
  };

  // Simulate Camera Scanner
  const handleSimulateCameraScan = (apt) => {
    setIsScanning(true);
    setSearchInput(apt.qr_token || apt.id);
    setTimeout(() => {
      setIsScanning(false);
      handleVerify(apt.qr_token || apt.id);
    }, 800);
  };

  // Confirm Check-In
  const handleConfirmCheckin = async () => {
    if (!scannedApt) return;
    
    const res = await api.checkIn({
      appointmentId: scannedApt.id,
      qrToken: scannedApt.qr_token
    });

    if (res.success) {
      setCheckedInResult(res);
      sfx.playSuccessChime();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      if (onCheckinSuccess) {
        onCheckinSuccess(res.appointment);
      }
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      
      {/* Staff Counter Banner */}
      <div className="bg-linear-to-r from-emerald-800 to-emerald-950 text-white p-5 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-emerald-700">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-700 text-emerald-200">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-300">
              {t('checkin.headerTag')}
            </span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black mt-1">
            {t('checkin.headerTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-xl leading-relaxed">
            {t('checkin.headerSubtitle')}
          </p>
        </div>

        <div className="bg-emerald-900/80 border border-emerald-700 p-3 sm:p-3.5 rounded-2xl text-left sm:text-right shrink-0 w-full sm:w-auto">
          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-300 uppercase block">
            {language === 'ml' ? 'കിയോസ്‌ക് സ്ഥലം' : 'Kiosk Location'}
          </span>
          <p className="text-xs sm:text-sm font-extrabold text-white">
            {language === 'ml' ? 'പ്രധാന കവാടം • Gate 1' : 'Main Entrance • Gate 1'}
          </p>
          <span className="text-[10px] text-emerald-400 font-mono">Terminal #G1-04</span>
        </div>
      </div>

      {/* Verification & Scanner Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Left: Scanner / Input Console */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 sm:space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-sky-700 shrink-0" />
              <span>{t('checkin.scannerTitle')}</span>
            </h3>

            {/* Input & Search Form */}
            <div className="flex flex-col min-[380px]:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={language === 'ml' ? "ഉദാ: APT-2026-8801 അല്ലെങ്കിൽ ടോക്കൺ..." : "e.g. APT-2026-8801 or medipass_token..."}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                />
              </div>
              <button
                onClick={() => handleVerify()}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer min-h-[44px] shrink-0"
              >
                {t('common.confirm')}
              </button>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Simulated Optical Viewfinder */}
            <div className="relative bg-slate-950 rounded-2xl p-5 sm:p-6 text-center text-white overflow-hidden border border-slate-800">
              {/* Scan laser line animation */}
              <div className={`absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] transition-all duration-700 ${
                isScanning ? 'top-3/4 animate-bounce' : 'top-1/2'
              }`} />
              
              <QrCode className="w-14 h-14 sm:w-16 sm:h-16 text-slate-700 mx-auto mb-2 opacity-60" />
              <p className="text-xs font-mono text-slate-300">
                {isScanning 
                  ? (language === 'ml' ? 'QR കോഡ് സ്കാൻ ചെയ്യുന്നു...' : 'Scanning QR barcode...') 
                  : (language === 'ml' ? 'സ്കാനറിനു മുന്നിൽ ഡിജിറ്റൽ പാസ്സ് QR കാണിക്കുക' : 'Position Digital Pass QR in front of scanner')}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Optical laser ready • 0.2s instant decode</p>
            </div>

            {/* Quick Demo Preload Buttons */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {t('checkin.recentArrivals')}:
              </span>
              <div className="flex flex-col gap-2">
                {recentAppointments.slice(0, 3).map((apt) => (
                  <button
                    key={apt.id}
                    onClick={() => handleSimulateCameraScan(apt)}
                    className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all group cursor-pointer gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-900 block truncate">
                        {apt.patient_name} ({apt.department})
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block truncate">
                        {apt.id} • {apt.time}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      apt.status === "Checked In" 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {apt.status === "Checked In" ? t('pass.statusCheckedIn') : apt.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right: Verification Status & Big Green Check-in Button */}
        <div className="lg:col-span-6 space-y-6">
          {scannedApt ? (
            <div className="bg-white p-4 sm:p-8 rounded-3xl border-2 border-emerald-500/80 shadow-xl space-y-5 sm:space-y-6">
              
              {/* Verification Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </span>
                  <div>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      {language === 'ml' ? 'പാസ്സ് സ്ഥിരീകരിച്ചു ✓' : 'Pass Verified ✓'}
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-slate-900">
                      {scannedApt.patient_name}
                    </h4>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
                  {scannedApt.id}
                </span>
              </div>

              {/* Patient & Clinic Details */}
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 font-bold text-[10px] uppercase">{t('pass.departmentLabel')}</span>
                  <p className="font-extrabold text-slate-900 mt-0.5">{scannedApt.department}</p>
                  <p className="text-slate-500">{scannedApt.doctor}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 font-bold text-[10px] uppercase">{t('common.time')}</span>
                  <p className="font-extrabold text-slate-900 mt-0.5">{scannedApt.time}</p>
                  <p className="text-slate-500">{scannedApt.date}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 font-bold text-[10px] uppercase">{t('common.floor')}</span>
                  <p className="font-extrabold text-slate-900 mt-0.5">{t('common.floor')} {scannedApt.floor}</p>
                  <p className="text-slate-500">{scannedApt.block}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-400 font-bold text-[10px] uppercase">{t('pass.roomLocationLabel')}</span>
                  <p className="font-black text-emerald-700 mt-0.5 text-sm">{scannedApt.room}</p>
                  <p className="text-slate-500">Consultation OPD</p>
                </div>
              </div>

              {/* Success Token Slip or Big Check-In Button */}
              {checkedInResult ? (
                <div className="bg-linear-to-br from-emerald-50 to-teal-50 border-2 border-emerald-400 p-4 sm:p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-900 uppercase">
                      {t('checkin.checkedInSuccess')}
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      ACTIVE TOKEN
                    </span>
                  </div>
                  
                  <div className="text-center py-2">
                    <span className="text-xs text-emerald-700 font-semibold block">
                      {language === 'ml' ? 'ഒ.പി. ക്യൂ ടോക്കൺ നമ്പർ' : 'OPD QUEUE TOKEN NUMBER'}
                    </span>
                    <p className="text-3xl sm:text-4xl font-black text-emerald-900 tracking-tight mt-1">
                      {checkedInResult.token_number}
                    </p>
                    <p className="text-xs text-emerald-800 font-medium mt-1">
                      {language === 'ml' ? `രേഖപ്പെടുത്തിയ സമയം: ${checkedInResult.checked_in_at}` : `Checked in at ${checkedInResult.checked_in_at}`}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-emerald-200 text-center text-xs text-emerald-900">
                    {language === 'ml' 
                      ? <>രോഗിയെ നേരിട്ട് <strong>{scannedApt.room} ({scannedApt.block})</strong>-ലേക്ക് വിടുക.</>
                      : <>Direct patient to <strong>{scannedApt.room} ({scannedApt.block})</strong>.</>}
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleConfirmCheckin}
                  className="w-full py-3.5 sm:py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl shadow-emerald-700/30 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer min-h-[50px]"
                >
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>{t('checkin.btnVerifyCheckin')}</span>
                </button>
              )}

            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-8 sm:p-12 text-center text-slate-400 space-y-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-xs mx-auto flex items-center justify-center text-slate-400">
                <User className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-700">
                {language === 'ml' ? 'പാസ്സ് സ്കാൻ ചെയ്യാൻ കാത്തിരിക്കുന്നു' : 'Awaiting Citizen Pass'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {language === 'ml'
                  ? 'ഇടതുവശത്ത് QR സ്കാൻ ചെയ്യുകയോ പാസ്സ് ഐഡി നൽകുകയോ ചെയ്യുക. രോഗിയുടെ ഡോക്ടറും മുറിയും ഇവിടെ പ്രദർശിപ്പിക്കും.'
                  : 'Scan or enter pass details on the left. The patient\'s verified doctor, room, and floor assignment will appear here for 1-click check-in.'}
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

