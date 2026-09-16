import React, { useState } from 'react';
import { 
  Users, Calendar, Clock, MapPin, QrCode, 
  ArrowRight, ShieldCheck, PlusCircle, Baby, XCircle, ExternalLink
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function PatientDashboard({ 
  patient, 
  dependents = [], 
  appointments = [], 
  onViewPass, 
  onBookNew, 
  onNavigate,
  onCancelAppointment,
  onSwitchPatient
}) {
  const { language, t } = useLanguage();
  const [cancellingId, setCancellingId] = useState(null);

  const patientAppointments = appointments.filter(a => 
    (a.patient_id && patient?.id && Number(a.patient_id) === Number(patient.id)) ||
    (a.patient_name && patient?.name && a.patient_name.toLowerCase() === patient.name.toLowerCase()) ||
    dependents.some(d => 
      (a.patient_id && Number(a.patient_id) === Number(d.id)) ||
      (a.patient_name && a.patient_name.toLowerCase().includes(d.name.toLowerCase()))
    )
  );

  const handleConfirmCancel = async (aptId) => {
    if (onCancelAppointment) {
      await onCancelAppointment(aptId);
    }
    setCancellingId(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      
      {/* Patient Greeting & Status Header */}
      <div className="bg-linear-to-r from-sky-800 to-sky-950 text-white p-5 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 sm:gap-6 border border-sky-700">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white text-sky-900 flex items-center justify-center font-extrabold text-xl sm:text-2xl shadow-md shrink-0">
            {patient?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-sky-300">
                {patient?.uhid ? t('dashboard.patientAccount') : t('dashboard.unregisteredAccount')}
              </span>
              <span className={`text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                patient?.uhid 
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30" 
                  : "bg-amber-500/20 text-amber-300 border-amber-400/30"
              }`}>
                {patient?.uhid ? t('dashboard.aadhaarLinked') : t('dashboard.uhidPending')}
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black mt-0.5">
              {t('dashboard.greeting')}, {patient?.name || 'Citizen'}
            </h2>
            {patient?.uhid ? (
              <p className="text-[11px] sm:text-xs text-sky-200/90 font-mono mt-0.5 sm:mt-1">
                Mobile: {patient?.phone || '9876543210'} • UHID: {`${patient.uhid.substring(0, 4)}...${patient.uhid.slice(-4)}`}
              </p>
            ) : (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs text-amber-300 font-semibold">{t('voice.noUhidBannerTitle')}</span>
                <button
                  onClick={() => window.open('https://ehealth.kerala.gov.in', '_blank', 'noopener,noreferrer')}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 min-h-[36px]"
                >
                  <span>{t('voice.btnGovtSystem')}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {onSwitchPatient && (
            <div className="flex flex-wrap bg-sky-900/60 p-1 rounded-xl border border-sky-700/60 text-xs gap-1">
              <button
                onClick={() => onSwitchPatient(0)}
                className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer min-h-[36px] flex items-center justify-center ${
                  patient?.id === 1 ? 'bg-white text-sky-900 shadow-xs' : 'text-sky-200 hover:text-white'
                }`}
              >
                Ananya ({language === 'ml' ? 'സ്വന്തം' : 'Self'})
              </button>
              <button
                onClick={() => onSwitchPatient(1)}
                className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer min-h-[36px] flex items-center justify-center ${
                  patient?.id === 2 ? 'bg-white text-sky-900 shadow-xs' : 'text-sky-200 hover:text-white'
                }`}
              >
                Meera ({t('common.guardian')})
              </button>
              <button
                onClick={() => onSwitchPatient(3)}
                className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer min-h-[36px] flex items-center justify-center ${
                  !patient?.uhid ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-amber-200 hover:text-white'
                }`}
              >
                Suresh ({language === 'ml' ? 'UHID ഇല്ല' : 'No UHID'})
              </button>
            </div>
          )}

          <button
            onClick={onBookNew}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer min-h-[44px]"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>{t('dashboard.btnNewBooking')}</span>
          </button>
        </div>
      </div>

      {/* Banner if patient does not have UHID */}
      {!patient?.uhid && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-800">
          <div className="text-center sm:text-left">
            <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider block">
              {t('dashboard.noUhidBannerTitle')}
            </span>
            <p className="text-xs text-slate-700 mt-0.5">
              {t('dashboard.noUhidBannerDesc')}
            </p>
          </div>
          <button
            onClick={() => window.open('https://ehealth.kerala.gov.in', '_blank', 'noopener,noreferrer')}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 shrink-0 active:scale-95 transition-all cursor-pointer"
          >
            <span>{t('dashboard.btnGovtPortal')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Grid: Upcoming Passes & Linked Dependents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Active Outpatient Passes */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-sky-700" />
              <span>{t('dashboard.activePassesTitle')}</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {patientAppointments.length} {t('dashboard.passesIssued')}
            </span>
          </div>

          {patientAppointments.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400 space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">{t('dashboard.noActivePasses')}</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {t('dashboard.noActivePassesDesc')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  onClick={onBookNew}
                  className="px-4 py-2 bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-sky-800 cursor-pointer"
                >
                  {t('dashboard.btnBookVoice')}
                </button>
                <button
                  onClick={() => window.open('https://ehealth.kerala.gov.in', '_blank', 'noopener,noreferrer')}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{t('dashboard.btnGovtPortal')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {patientAppointments.map((apt) => {
                const isCancelled = apt.status === "Cancelled";
                return (
                  <div 
                    key={apt.id}
                    className={`bg-white p-5 rounded-2xl border transition-all space-y-3 ${
                      isCancelled 
                        ? 'border-slate-200 opacity-60 bg-slate-50/50' 
                        : 'border-slate-200 shadow-2xs hover:border-sky-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">PASS #{apt.id || apt.appointment_id}</span>
                        <h4 className="text-base font-bold text-slate-900 mt-0.5">{apt.patient_name}</h4>
                        <p className="text-xs font-semibold text-sky-700">{apt.department} • {apt.doctor}</p>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        apt.status === "Checked In" 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : isCancelled
                          ? 'bg-slate-200 text-slate-600'
                          : 'bg-sky-100 text-sky-800'
                      }`}>
                        {apt.status === "Checked In" ? t('pass.statusCheckedIn') : apt.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{apt.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{apt.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium text-sky-900">
                        <MapPin className="w-3.5 h-3.5 text-sky-700" />
                        <span>{apt.room} ({t('common.floor')} {apt.floor})</span>
                      </div>
                    </div>

                    {/* Cancellation confirmation modal inline */}
                    {cancellingId === apt.id ? (
                      <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex flex-col min-[380px]:flex-row items-stretch min-[380px]:items-center justify-between gap-2 text-xs">
                        <span className="text-rose-800 font-semibold">{t('dashboard.confirmCancel')}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleConfirmCancel(apt.id)}
                            className="flex-1 min-[380px]:flex-none px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs cursor-pointer min-h-[36px]"
                          >
                            {t('dashboard.btnYesCancel')}
                          </button>
                          <button
                            onClick={() => setCancellingId(null)}
                            className="flex-1 min-[380px]:flex-none px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer min-h-[36px]"
                          >
                            {t('dashboard.btnKeep')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      !isCancelled && (
                        <div className="flex flex-col min-[420px]:flex-row items-stretch min-[420px]:items-center justify-between pt-1 gap-2">
                          <button
                            onClick={() => setCancellingId(apt.id)}
                            className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center justify-center min-[420px]:justify-start gap-1 transition-colors cursor-pointer min-h-[36px]"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{t('dashboard.btnCancel')}</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onNavigate && onNavigate(apt)}
                              className="flex-1 min-[420px]:flex-none px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer min-h-[38px]"
                            >
                              <MapPin className="w-3 h-3" />
                              <span>{t('dashboard.btnDirections')}</span>
                            </button>
                            <button
                              onClick={() => onViewPass && onViewPass(apt)}
                              className="flex-1 min-[420px]:flex-none px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 shadow-2xs cursor-pointer min-h-[38px]"
                            >
                              <span>{t('dashboard.btnViewPass')}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Linked Family Dependents (Child Booking) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-700 shrink-0" />
              <span>{t('dashboard.dependentsTitle')}</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">{t('dashboard.autoResolved')}</span>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('dashboard.dependentsDesc')}
            </p>

            <div className="space-y-3">
              {dependents.map((dep) => (
                <div 
                  key={dep.id} 
                  className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col min-[400px]:flex-row items-start min-[400px]:items-center justify-between hover:bg-indigo-50/50 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                      <Baby className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{dep.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        {dep.relationship} • {dep.age} {language === 'ml' ? 'വയസ്സ്' : 'years old'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        UHID: {dep.uhid ? `${dep.uhid.substring(0, 4)}...${dep.uhid.slice(-4)}` : (language === 'ml' ? 'സൈലന്റ് ലിങ്ക്ഡ്' : 'Silent')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onBookNew}
                    className="w-full min-[400px]:w-auto px-3.5 py-2 bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer min-h-[38px] flex items-center justify-center shrink-0"
                  >
                    {t('dashboard.btnBookFor')}
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {t('dashboard.childTag')}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

