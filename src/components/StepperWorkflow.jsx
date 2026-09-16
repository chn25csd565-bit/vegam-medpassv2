import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneCall, ShieldCheck, UserCheck, Users, Stethoscope, 
  UserRound, Calendar, CheckCircle2, QrCode, Building2, Play, Pause, RotateCcw
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const STEPS_DATA_EN = [
  {
    id: 1,
    title: "Phone Call",
    icon: PhoneCall,
    action: "Citizen dials hospital helpline",
    tool: "Vapi / Retell AI audio intake",
    privacy: "Citizen speaks phone number without entering complex UHID.",
    color: "sky"
  },
  {
    id: 2,
    title: "OTP Verification",
    icon: ShieldCheck,
    action: "Single-use 6-digit verification code",
    tool: "verify_otp(phone, otp)",
    privacy: "Auth gates records. Demo OTP: 583921.",
    color: "sky"
  },
  {
    id: 3,
    title: "Patient Identified",
    icon: UserCheck,
    action: "Hospital record matched via phone",
    tool: "check_patient(phone)",
    privacy: "Only verified profile fetched. UHID stays server-side.",
    color: "sky"
  },
  {
    id: 4,
    title: "Dependent Chosen",
    icon: Users,
    action: "Guardian chooses Self or Child",
    tool: "get_dependents(guardian_id)",
    privacy: "Guardian selects Aarav; backend silently resolves child UHID.",
    color: "indigo"
  },
  {
    id: 5,
    title: "Dept Synonyms",
    icon: Stethoscope,
    action: "Spoken 'eye doctor' mapped",
    tool: "search_department('eye doctor')",
    privacy: "AI maps natural speech to Ophthalmology automatically.",
    color: "indigo"
  },
  {
    id: 6,
    title: "Doctor Selected",
    icon: UserRound,
    action: "Matched with available specialist",
    tool: "get_doctors('Ophthalmology')",
    privacy: "Assigned to Dr. Sharma (Surgical Wing).",
    color: "indigo"
  },
  {
    id: 7,
    title: "Slot Reserved",
    icon: Calendar,
    action: "10:00 AM outpatient slot chosen",
    tool: "get_available_slots(dept, doc)",
    privacy: "Live queue slot booked to avoid overcrowding.",
    color: "emerald"
  },
  {
    id: 8,
    title: "Voice Confirmed",
    icon: CheckCircle2,
    action: "AI repeats details for verbal YES",
    tool: "book_appointment(...)",
    privacy: "Citizen explicitly confirms before hospital slot is locked.",
    color: "emerald"
  },
  {
    id: 9,
    title: "Pass Generated",
    icon: QrCode,
    action: "Digital SevaPass with QR issued",
    tool: "generate_digital_pass(apt_id)",
    privacy: "QR contains random token only — NO Aadhaar/UHID/diagnosis.",
    color: "emerald"
  },
  {
    id: 10,
    title: "Direct Check-In",
    icon: Building2,
    action: "Scanned at Hospital Room 204",
    tool: "checkin_patient(qr_token)",
    privacy: "Zero registration queue. Direct entry to Floor 2.",
    color: "emerald"
  }
];

const STEPS_DATA_ML = [
  {
    id: 1,
    title: "ഫോൺ കോൾ",
    icon: PhoneCall,
    action: "പൗരൻ ആശുപത്രി ഹെൽപ്പ് ലൈനിലേക്ക് വിളിക്കുന്നു",
    tool: "Vapi / Retell AI audio intake",
    privacy: "സങ്കീർണ്ണമായ UHID ടൈപ്പ് ചെയ്യാതെ മൊബൈൽ നമ്പർ മാത്രം സംസാരിക്കുന്നു.",
    color: "sky"
  },
  {
    id: 2,
    title: "OTP പരിശോധന",
    icon: ShieldCheck,
    action: "6 അക്ക സ്ഥിരീകരണ കോഡ്",
    tool: "verify_otp(phone, otp)",
    privacy: "രേഖകൾ സുരക്ഷിതമാക്കുന്നു. Demo OTP: 583921.",
    color: "sky"
  },
  {
    id: 3,
    title: "രോഗിയെ തിരിച്ചറിയൽ",
    icon: UserCheck,
    action: "മൊബൈൽ നമ്പർ വഴി ആശുപത്രി രേഖകൾ കണ്ടെത്തുന്നു",
    tool: "check_patient(phone)",
    privacy: "സ്ഥിരീകരിച്ച പ്രൊഫൈൽ മാത്രം നൽകുന്നു. UHID സെർവർ വഴി സംരക്ഷിക്കപ്പെടുന്നു.",
    color: "sky"
  },
  {
    id: 4,
    title: "കുടുംബാംഗം",
    icon: Users,
    action: "സ്വന്തമായോ കുട്ടികൾക്കോ വേണ്ടി തിരഞ്ഞെടുക്കുന്നു",
    tool: "get_dependents(guardian_id)",
    privacy: "രക്ഷിതാവ് Aarav എന്ന് പറയുന്നു; backend നിശബ്ദമായി കുട്ടിയുടെ UHID കണ്ടെത്തുന്നു.",
    color: "indigo"
  },
  {
    id: 5,
    title: "വിഭാഗം കണ്ടെത്തൽ",
    icon: Stethoscope,
    action: "\"കണ്ണിന്റെ ഡോക്ടർ\" എന്ന് സംസാരിച്ചാൽ തിരിച്ചറിയുന്നു",
    tool: "search_department('കണ്ണിന്റെ ഡോക്ടർ')",
    privacy: "സംഭാഷണത്തിലെ സാധാരണ വാക്കുകളെ തനിയെ Ophthalmology വിഭാഗവുമായി ബന്ധിപ്പിക്കുന്നു.",
    color: "indigo"
  },
  {
    id: 6,
    title: "ഡോക്ടറെ നിശ്ചയിക്കൽ",
    icon: UserRound,
    action: "ലഭ്യമായ സ്പെഷ്യലിസ്റ്റ് ഡോക്ടറെ തിരഞ്ഞെടുക്കുന്നു",
    tool: "get_doctors('Ophthalmology')",
    privacy: "Dr. Sharma-യെ (Surgical Wing) നിയോഗിക്കുന്നു.",
    color: "indigo"
  },
  {
    id: 7,
    title: "സമയം റിസർവ് ചെയ്യൽ",
    icon: Calendar,
    action: "10:00 AM outpatient slot ബുക്ക് ചെയ്യുന്നു",
    tool: "get_available_slots(dept, doc)",
    privacy: "ആശുപത്രിയിലെ തിരക്ക് ഒഴിവാക്കാൻ live queue slot നൽകുന്നു.",
    color: "emerald"
  },
  {
    id: 8,
    title: "ശബ്ദത്തിലൂടെ ഉറപ്പാക്കൽ",
    icon: CheckCircle2,
    action: "AI വിവരങ്ങൾ വീണ്ടും ഓർമ്മിപ്പിച്ച് സ്ഥിരീകരണം തേടുന്നു",
    tool: "book_appointment(...)",
    privacy: "പൗരൻ വ്യക്തമായി സ്ഥിരീകരിച്ച ശേഷം മാത്രമേ ആശുപത്രി slot ലോക്ക് ചെയ്യൂ.",
    color: "emerald"
  },
  {
    id: 9,
    title: "പാസ്സ് നൽകൽ",
    icon: QrCode,
    action: "QR കോഡുള്ള digital SevaPass ലഭ്യമാക്കുന്നു",
    tool: "generate_digital_pass(apt_id)",
    privacy: "QR-ൽ random token മാത്രം — Aadhaar/UHID/diagnosis കാണിക്കില്ല.",
    color: "emerald"
  },
  {
    id: 10,
    title: "നേരിട്ടുള്ള ചെക്ക്-ഇൻ",
    icon: Building2,
    action: "Hospital Room 204-ൽ സ്കാൻ ചെയ്യുന്നു",
    tool: "checkin_patient(qr_token)",
    privacy: "രജിസ്ട്രേഷൻ ക്യൂവുകൾ ഒഴിവാക്കി നേരിട്ട് Floor 2-ലേക്ക് പ്രവേശിക്കാം.",
    color: "emerald"
  }
];

export default function StepperWorkflow({ currentStep = 1, onSelectStep }) {
  const { language, t } = useLanguage();
  const isMl = language === 'ml';
  const steps = isMl ? STEPS_DATA_ML : STEPS_DATA_EN;

  const [activeStep, setActiveStep] = useState(currentStep);
  const [isPlaying, setIsPlaying] = useState(false);

  // Sync with prop change if controlled externally
  const prevStepRef = useRef(currentStep);
  useEffect(() => {
    if (prevStepRef.current !== currentStep) {
      prevStepRef.current = currentStep;
      setActiveStep(currentStep);
    }
  }, [currentStep]);

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStep(prev => {
          if (prev >= 10) {
            setIsPlaying(false);
            return 10;
          }
          return prev + 1;
        });
      }, 2200);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const currentData = steps[activeStep - 1] || steps[0];

  return (
    <section className="bg-white border-b border-slate-200 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                {t('workflow.architectureTag', '10-Step Journey Architecture')}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {t('workflow.loopAnimation', 'Core Loop Animation')}
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 mt-1 break-words">
              {t('workflow.headline', 'CALL → VERIFY → SPEAK → BOOK → PASS → CHECK-IN')}
            </h2>
          </div>

          {/* Player controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer min-h-[36px]"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? t('workflow.pauseAuto', 'Pause Auto Demo') : t('workflow.autoPlay', 'Auto Play Steps')}</span>
            </button>
            <button
              onClick={() => { setIsPlaying(false); setActiveStep(1); }}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs active:scale-95 transition-all cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              title={t('workflow.reset', 'Reset Stepper')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 10 Step Buttons Ribbon (Smooth swipeable on mobile, 10-col grid on desktop) */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 -translate-y-1/2 -z-0" />
          
          <div className="flex sm:grid sm:grid-cols-10 overflow-x-auto gap-2 relative z-10 pb-2 sm:pb-0 no-scrollbar">
            {steps.map((step) => {
              const Icon = step.icon;
              const isCurrent = step.id === activeStep;
              const isPast = step.id < activeStep;

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveStep(step.id);
                    if (onSelectStep) onSelectStep(step.id);
                  }}
                  className={`flex flex-col items-center text-center p-2 rounded-xl transition-all border min-w-[76px] sm:min-w-0 flex-1 shrink-0 sm:shrink cursor-pointer ${
                    isCurrent
                      ? 'bg-sky-700 text-white border-sky-800 ring-4 ring-sky-100 scale-102 shadow-md'
                      : isPast
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 text-xs font-bold shrink-0 ${
                    isCurrent
                      ? 'bg-white text-sky-800 shadow-xs'
                      : isPast
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isPast ? '✓' : <Icon className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-bold line-clamp-1 w-full text-center">
                    {step.id}. {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Step Deep Dive Card */}
        <div className="mt-5 sm:mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-center">
            
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-sky-700 text-white flex items-center justify-center font-extrabold text-base sm:text-lg shadow-sm shrink-0">
                #{currentData.id}
              </div>
              <div>
                <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                  {t('workflow.stepOf', 'Step')} {currentData.id} {t('workflow.stepOfTotal', 'of 10')}
                </span>
                <h4 className="text-base font-bold text-slate-900">{currentData.title}</h4>
                <p className="text-xs text-slate-600">{currentData.action}</p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                {t('workflow.backendTool', 'Backend / Voice Tool Call')}
              </span>
              <code className="text-xs font-mono font-semibold text-sky-700 block mt-0.5 break-all">
                {currentData.tool}
              </code>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                {t('workflow.securityRule', 'Security & Privacy Rule')}
              </span>
              <p className="text-xs text-slate-700 mt-0.5">
                {currentData.privacy}
              </p>
            </div>

          </div>
        </div>

        {/* Closing Line for Demo */}
        <div className="mt-6 text-center">
          <p className="text-xs sm:text-sm font-extrabold text-slate-700 tracking-wide inline-flex items-center gap-2 bg-slate-100/90 px-4 py-1.5 rounded-full border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>{t('workflow.tagline', '"Less Queue. Less Confusion. More Accessible Healthcare."')}</span>
          </p>
        </div>

      </div>
    </section>
  );
}
