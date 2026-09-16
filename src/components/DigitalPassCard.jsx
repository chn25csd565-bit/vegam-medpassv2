import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Printer, MapPin, CheckCircle2, QrCode, ShieldCheck, 
  Calendar, Clock, Building, User, Download, Share2, Stethoscope, ArrowRight 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function DigitalPassCard({ appointment, onNavigate, onCheckin }) {
  const { language, t } = useLanguage();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && appointment?.qr_token) {
      QRCode.toCanvas(
        canvasRef.current,
        appointment.qr_token,
        {
          width: 140,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        },
        (error) => {
          if (error) console.error("QR Code generation error:", error);
        }
      );
    }
  }, [appointment]);

  if (!appointment) return null;

  const isCheckedIn = appointment.status === "Checked In";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden max-w-xl mx-auto transition-all hover:shadow-2xl">
      
      {/* Printable Container */}
      <div id="printable-pass" className="p-4 sm:p-8 space-y-5 sm:space-y-6">
        
        {/* Pass Header: Govt Emblem & Serial */}
        <div className="border-b-2 border-slate-100 pb-4 sm:pb-5 flex flex-col min-[480px]:flex-row items-start min-[480px]:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sky-800 text-white flex items-center justify-center shadow-md shrink-0">
              <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[11px] sm:text-xs font-bold text-sky-800 uppercase tracking-wider">
                  {language === 'ml' ? 'സർക്കാർ ജനറൽ ആശുപത്രി' : 'Govt General Hospital'}
                </span>
                <span className="text-[9px] sm:text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full">
                  {t('pass.cardBadge')}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {t('pass.showcaseTitle')}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                {t('pass.cardOfficialHeader')}
              </p>
            </div>
          </div>

          {/* Verification Status Badge */}
          <div className="flex min-[480px]:flex-col items-center min-[480px]:items-end justify-between w-full min-[480px]:w-auto gap-1">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
              isCheckedIn 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                : 'bg-sky-100 text-sky-800 border border-sky-300'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isCheckedIn ? t('pass.statusCheckedIn') : t('pass.statusValid')}
            </span>
            <p className="text-[10px] text-slate-400 font-mono">
              ID: {appointment.id || appointment.appointment_id}
            </p>
          </div>
        </div>

        {/* Patient & Booking Details */}
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3 sm:gap-4 bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('pass.patientLabel')}
            </span>
            <p className="text-base font-extrabold text-slate-900 mt-0.5">
              {appointment.patient_name}
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              UHID: {appointment.uhid ? `${appointment.uhid.substring(0, 4)}...${appointment.uhid.slice(-4)}` : '1234...1256'}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('pass.departmentLabel')} & {t('pass.doctorLabel')}
            </span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {appointment.department}
            </p>
            <p className="text-xs font-semibold text-sky-700">
              {appointment.doctor}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('pass.dateTimeLabel')}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs font-bold text-slate-800">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{appointment.date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{appointment.time}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('pass.roomLocationLabel')}
            </span>
            <p className="text-sm font-extrabold text-sky-900 mt-0.5">
              {appointment.room} ({t('common.floor')} {appointment.floor})
            </p>
            <p className="text-[11px] text-slate-500">
              {appointment.block || "Block B (Surgical Wing)"}
            </p>
          </div>
        </div>

        {/* Assigned Token Slip if Checked In */}
        {isCheckedIn && appointment.token_number && (
          <div className="bg-linear-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-3.5 sm:p-4 flex flex-col min-[440px]:flex-row items-start min-[440px]:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                {language === 'ml' ? 'ആശുപത്രി ഒ.പി. ക്യൂ ടോക്കൺ' : 'Hospital OPD Queue Token'}
              </span>
              <p className="text-2xl font-black text-emerald-900 mt-0.5">
                {appointment.token_number}
              </p>
              <p className="text-[11px] text-emerald-700">
                {language === 'ml' 
                  ? `${appointment.room}-ലേക്ക് നേരിട്ട് ചെല്ലുക. വാതിലിനു പുറത്ത് കാത്തിരിക്കുക.`
                  : `Proceed directly to ${appointment.room}. Wait outside consultation door.`}
              </p>
            </div>
            <div className="text-left min-[440px]:text-right text-xs text-emerald-800 font-medium">
              <span>{language === 'ml' ? 'രേഖപ്പെടുത്തിയ സമയം:' : 'Time stamped:'}</span><br />
              <span className="font-bold">{appointment.checked_in_at || (language === 'ml' ? 'ഇപ്പോൾ' : 'Just now')}</span>
            </div>
          </div>
        )}

        {/* QR Code & Scan Instructions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 bg-linear-to-b from-white to-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:p-4">
          <div className="bg-white p-2 rounded-xl shadow-xs border border-slate-200 shrink-0">
            <canvas ref={canvasRef} className="rounded-lg max-w-[130px] sm:max-w-[140px]" />
          </div>

          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>{t('features.privacyToken')}</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              "{t('pass.tokenInstruction')}"
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'ml'
                ? `ഈ QR കോഡ് ആശുപത്രി പ്രവേശന കവാടത്തിലോ ${appointment.room}-നു പുറത്തോ കാണിക്കുക. ഇതിൽ രഹസ്യ ആധാർ വിവരങ്ങളോ രോഗവിവരങ്ങളോ അടങ്ങിയിട്ടില്ല.`
                : `Scan this QR at the hospital reception kiosk or directly outside Room ${appointment.room}. This token contains no sensitive Aadhaar or medical history.`}
            </p>
            <p className="text-[10px] font-mono text-slate-400 break-all">
              TOKEN: {appointment.qr_token || 'medipass_token_sample'}
            </p>
          </div>
        </div>

      </div>

      {/* Action Footer Bar (Hidden in Print) */}
      <div className="bg-slate-50 border-t border-slate-200 p-3.5 sm:p-4 sm:px-8 flex flex-col min-[480px]:flex-row items-stretch min-[480px]:items-center justify-between gap-2.5">
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer min-h-[44px]"
        >
          <Printer className="w-3.5 h-3.5 shrink-0" />
          <span>{language === 'ml' ? 'പാസ്സ് പ്രിന്റ് ചെയ്യുക' : 'Print Pass / PDF'}</span>
        </button>

        <div className="flex flex-col min-[380px]:flex-row items-stretch min-[380px]:items-center gap-2">
          <button
            onClick={() => onNavigate && onNavigate(appointment)}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer min-h-[44px]"
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{t('pass.btnDirections')}</span>
          </button>

          {!isCheckedIn && (
            <button
              onClick={() => onCheckin && onCheckin(appointment)}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer min-h-[44px]"
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>{t('pass.btnCheckin')}</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

