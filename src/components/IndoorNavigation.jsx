import React, { useState } from 'react';
import { 
  MapPin, Navigation, ArrowRight, CornerDownRight, 
  Building2, Compass, Accessibility, Volume2, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { speakText } from '../services/speech';
import { useLanguage } from '../context/LanguageContext';

export default function IndoorNavigation({ activePass = null }) {
  const { language, t } = useLanguage();
  const [accessibleRoute, setAccessibleRoute] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState(activePass?.floor || 2);

  const room = activePass?.room || "Room 204";
  const floor = activePass?.floor || 2;
  const block = activePass?.block || "Block B (Surgical Wing)";
  const dept = activePass?.department || "Ophthalmology";
  const doctor = activePass?.doctor || "Dr. Sharma";

  const navigationSteps = [
    {
      step: 1,
      title: language === 'ml' ? "ആശുപത്രി പ്രധാന കവാടം (Gate 1)" : "Hospital Main Entrance (Gate 1)",
      desc: language === 'ml' 
        ? "Gate 1 കാൽനട പാതയിലൂടെ പ്രവേശിക്കുക. സുരക്ഷാ പരിശോധന പൂർത്തിയാക്കുക."
        : "Enter through Gate 1 pedestrian walkway. Pass temperature & security screening.",
      dist: "0 meters",
      time: language === 'ml' ? "തുടക്കം" : "Start"
    },
    {
      step: 2,
      title: language === 'ml' ? "റിസപ്ഷൻ & ചെക്ക്-ഇൻ കിയോസ്‌ക്" : "Reception & Check-In Kiosk A",
      desc: language === 'ml'
        ? "ടോക്കൺ ലഭിക്കുന്നതിന് സേവാപാസ്സ് QR കോഡ് ടെർമിനൽ G1-04-ൽ കാണിക്കുക."
        : "Show your SevaPass QR at Terminal G1-04 to collect your OPD physical token.",
      dist: "25 meters",
      time: "1 min"
    },
    {
      step: 3,
      title: accessibleRoute 
        ? (language === 'ml' ? "സെൻട്രൽ എലിവേറ്റർ ലോബി B" : "Central Elevator Lobby B")
        : (language === 'ml' ? "പടവുകൾ അല്ലെങ്കിൽ എലിവേറ്റർ" : "Stairwell B or Elevator"),
      desc: accessibleRoute 
        ? (language === 'ml' ? `ലിഫ്റ്റ് #2 അല്ലെങ്കിൽ #3 വഴി നേരിട്ട് Floor ${floor}-ലേക്ക് പോകുക (വീൽചെയർ സൗകര്യം ലഭ്യമാണ്).` : `Take Elevator #2 or #3 directly to Floor ${floor} (Wheelchair ramp available).`)
        : (language === 'ml' ? `പടവുകൾ വഴിയോ ലിഫ്റ്റ് വഴിയോ Floor ${floor}-ലേക്ക് പോകുക.` : `Take Stairwell B or Elevator to Floor ${floor}.`),
      dist: "65 meters",
      time: "2 mins"
    },
    {
      step: 4,
      title: language === 'ml' ? `Floor ${floor} സർജിക്കൽ വിംഗ് കോറിഡോർ` : `Floor ${floor} Surgical Wing Corridor`,
      desc: language === 'ml'
        ? `ലിഫ്റ്റിൽ നിന്ന് ഇറങ്ങി വലത്തോട്ട് തിരിയുക. ${dept} വിഭാഗത്തിലേക്ക് നടക്കുക.`
        : `Exit elevator, turn right towards ${dept} OPD Suites. Look for overhead signage.`,
      dist: "90 meters",
      time: "2.5 mins"
    },
    {
      step: 5,
      title: language === 'ml' ? `${room} (${doctor}) എത്തിച്ചേർന്നു` : `Arrival at ${room} (${doctor})`,
      desc: language === 'ml'
        ? `വെയ്റ്റിംഗ് ലോഞ്ചിൽ ഇരിക്കുക. നിങ്ങളുടെ ടോക്കൺ നമ്പർ ഡിജിറ്റൽ ഡിസ്പ്ലേയിൽ വിളിക്കും.`
        : "Take a seat in the waiting lounge. Your token will be called on the OPD display screen.",
      dist: "115 meters",
      time: language === 'ml' ? "3 മിനിറ്റ് നടത്തം" : "3 mins walk"
    }
  ];

  const handleReadDirections = () => {
    let speech = "";
    if (language === 'ml') {
      speech = `${room}, ${block}-ലേക്ക് പോകുന്നതിനുള്ള വഴി. ഘട്ടം 1: ആശുപത്രി പ്രധാന കവാടം Gate 1 വഴി പ്രവേശിക്കുക. ഘട്ടം 2: റിസപ്ഷൻ കൗണ്ടർ വഴി കടന്നുപോകുക. ഘട്ടം 3: ലിഫ്റ്റ് വഴി Floor ${floor}-ലേക്ക് പോവുക. ഘട്ടം 4: വലത്തോട്ട് തിരിഞ്ഞ് നേരെ നടക്കുക. നിങ്ങളുടെ ലക്ഷ്യസ്ഥാനം ${doctor}-ന്റെ ${room} ആണ്.`;
    } else {
      speech = `Directions to ${room}, ${block}. Step 1: Enter through Hospital Main Entrance Gate 1. Step 2: Pass Reception Kiosk. Step 3: Take Elevator Lobby B to Floor ${floor}. Step 4: Turn right along surgical wing corridor. Destination is ${room} for ${doctor}.`;
    }
    speakText(speech, language);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      
      {/* Wayfinding Header */}
      <div className="bg-linear-to-r from-sky-900 to-indigo-950 text-white p-5 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-sky-800 text-sky-200">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-sky-300">
              {t('navigation.headerTag')}
            </span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black mt-1">
            {t('navigation.headerTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-sky-200/90 mt-1 leading-relaxed">
            {t('navigation.assignedRoom')}: <span className="font-bold text-white">{room}</span> • {t('common.floor')} {floor} • {block}
          </p>
        </div>

        <div className="flex flex-col min-[420px]:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={handleReadDirections}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-sky-800 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer min-h-[44px]"
          >
            <Volume2 className="w-4 h-4 shrink-0" />
            <span>{language === 'ml' ? 'ശബ്ദ നിർദ്ദേശം' : 'Voice Guide'}</span>
          </button>

          <button
            onClick={() => setAccessibleRoute(!accessibleRoute)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer min-h-[44px] ${
              accessibleRoute 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'bg-sky-900/60 text-sky-300 border border-sky-700'
            }`}
          >
            <Accessibility className="w-4 h-4 shrink-0" />
            <span>{accessibleRoute 
              ? (language === 'ml' ? 'വീൽചെയർ / ലിഫ്റ്റ്' : 'Wheelchair / Lift Mode') 
              : (language === 'ml' ? 'പടവുകൾ' : 'Standard Stairs')}</span>
          </button>
        </div>
      </div>

      {/* Visual Waypoint Stepper Diagram */}
      <div className="bg-white p-4 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-sky-700 shrink-0" />
            <span>{language === 'ml' ? 'വഴി മാപ്പ്: കവാടം → റിസപ്ഷൻ → ലിഫ്റ്റ് → മുറി' : 'Visual Route Path: Entry → Reception → Lift → Floor → Room'}</span>
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            {language === 'ml' ? 'നടത്ത സമയം: ~3 മിനിറ്റ്' : 'Est. Walking Time: ~3 mins'}
          </span>
        </div>

        {/* Step Cards Trail */}
        <div className="space-y-4">
          {navigationSteps.map((s, idx) => (
            <div key={s.step} className="flex items-start gap-3 sm:gap-4 group">
              
              {/* Step indicator circle */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                  idx === navigationSteps.length - 1
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : 'bg-sky-700 text-white'
                }`}>
                  {idx === navigationSteps.length - 1 ? <MapPin className="w-4 h-4" /> : s.step}
                </div>
                {idx < navigationSteps.length - 1 && (
                  <div className="w-0.5 h-12 bg-slate-200 my-1 group-hover:bg-sky-300 transition-colors" />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 bg-slate-50 hover:bg-sky-50/50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 transition-colors">
                <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between gap-1.5">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">{s.title}</h4>
                  <div className="flex items-center gap-1.5 self-start min-[420px]:self-auto">
                    <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {s.dist}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md">
                      {s.time}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{s.desc}</p>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Interactive Floor Plan Map Diagram */}
      <div className="bg-white p-4 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-sky-700 shrink-0" />
              <span>{language === 'ml' ? `ആശുപത്രി ഫ്ലോർ പ്ലാൻ (Floor ${selectedFloor})` : `Hospital Floor Plan Diagram (Floor ${selectedFloor})`}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ml' ? 'കൺസൾട്ടേഷൻ മുറികളും ലിഫ്റ്റും കാണിക്കുന്ന ആശുപത്രി ലേഔട്ട്' : 'Interactive layout showing surgical suites, consultation rooms, and elevator lobby.'}
            </p>
          </div>

          {/* Floor selector tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            {[1, 2, 3].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFloor(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
                  selectedFloor === f 
                    ? 'bg-sky-700 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('common.floor')} {f}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="flex sm:hidden items-center justify-between text-[11px] text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl">
          <span>👈 Swipe horizontally to view full floor plan 👉</span>
          <span className="text-emerald-400 font-bold">Floor {selectedFloor}</span>
        </div>

        {/* Visual Architectural Map Representation with horizontal scroll wrapper */}
        <div className="relative bg-slate-950 text-white rounded-2xl p-4 sm:p-8 border border-slate-800 overflow-x-auto no-scrollbar">
          
          <div className="min-w-[500px]">
            {/* Floor grid overlay */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 h-full">
              
              {/* Rooms Left */}
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 font-mono block">ROOM 201</span>
                  <span className="text-xs font-bold text-slate-300">Minor OT</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 font-mono block">ROOM 202</span>
                  <span className="text-xs font-bold text-slate-300">Refraction Lab</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 font-mono block">ROOM 203</span>
                  <span className="text-xs font-bold text-slate-300">Vision Check</span>
                </div>
              </div>

              {/* Central Corridor & Elevator */}
              <div className="col-span-1 sm:col-span-2 flex flex-col justify-between py-2 items-center bg-slate-900/40 border-x border-dashed border-slate-700/60 rounded-xl p-3">
                <div className="w-full text-center bg-sky-950/70 border border-sky-800 p-2 rounded-lg">
                  <span className="text-[11px] font-bold text-sky-300 block">ELEVATOR LOBBY B</span>
                  <span className="text-[9px] text-sky-400">Lifts #1, #2, #3</span>
                </div>

                {/* Animated Walkway Indicator */}
                <div className="my-4 flex flex-col items-center gap-1 text-sky-400">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Central Corridor</span>
                  <div className="w-0.5 h-16 bg-linear-to-b from-sky-500 to-emerald-400 animate-pulse" />
                  <CornerDownRight className="w-5 h-5 text-emerald-400" />
                </div>

                <div className="w-full text-center bg-slate-900 border border-slate-800 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400">{language === 'ml' ? 'വെയ്റ്റിംഗ് ലോഞ്ച്' : 'Central Waiting Lounge'}</span>
                </div>
              </div>

              {/* Destination Room Right */}
              <div className="space-y-3">
                {/* Highlighted Destination Room 204 */}
                <div className="p-4 rounded-xl bg-linear-to-br from-emerald-950 to-teal-900 border-2 border-emerald-400 text-center relative shadow-lg shadow-emerald-950/50">
                  <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold animate-ping">
                    •
                  </div>
                  <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                    ✓
                  </div>
                  <span className="text-[10px] text-emerald-300 font-mono font-bold block">
                    {room} ({language === 'ml' ? 'ലക്ഷ്യസ്ഥാനം' : 'DESTINATION'})
                  </span>
                  <span className="text-sm font-black text-white block mt-0.5">{dept}</span>
                  <span className="text-xs font-semibold text-emerald-200 block">{doctor}</span>
                  <span className="text-[9px] text-emerald-300/80 mt-1 block">{doctor} Consultation</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 font-mono block">ROOM 205</span>
                  <span className="text-xs font-bold text-slate-300">Glaucoma OPD</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 font-mono block">ROOM 206</span>
                  <span className="text-xs font-bold text-slate-300">Staff Station</span>
                </div>
              </div>

            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span>{language === 'ml' ? `നിങ്ങളുടെ ലക്ഷ്യസ്ഥാനം: ${room}` : `Your destination: ${room}`}</span>
              </span>
              <span className="font-mono text-[11px] text-slate-500">Scale: 1cm = 5m</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

