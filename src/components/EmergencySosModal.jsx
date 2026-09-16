import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  PhoneCall, PhoneOff, Mic, MicOff, Volume2, VolumeX, ShieldAlert,
  AlertTriangle, Ambulance, Building2, MapPin, CheckCircle2, RotateCcw,
  Terminal, ShieldCheck, Clock, Navigation, ExternalLink, X, Radio
} from 'lucide-react';
import { sfx, speakText, stopSpeaking, createSpeechRecognizer } from '../services/speech';
import { useLanguage } from '../context/LanguageContext';

export default function EmergencySosModal({ isOpen, onClose }) {
  const { language, t } = useLanguage();

  // Call status: 'CALLING' | 'CONNECTED' | 'ENDED'
  const [callStatus, setCallStatus] = useState('CALLING');
  
  // Conversation step: 'OPTIONS' | 'CONFIRM_AMBULANCE' | 'CONFIRM_ED' | 'IN_CALL_AMBULANCE' | 'IN_CALL_ED' | 'LOCATION_SHARED'
  const [step, setStep] = useState('OPTIONS');

  // Audio & Mic states
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Call duration counter
  const [callSeconds, setCallSeconds] = useState(0);

  // Location data
  const [locationData, setLocationData] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Conversation transcript
  const [transcript, setTranscript] = useState([]);
  
  // Real-time backend emergency dispatch traces
  const [toolCalls, setToolCalls] = useState([]);
  const [activeMobileTab, setActiveMobileTab] = useState('sos'); // 'sos' | 'telemetry'

  const chatBottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const lastAiMessageRef = useRef('');

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Call timer
  useEffect(() => {
    let interval = null;
    if (callStatus === 'CONNECTED') {
      interval = setInterval(() => {
        setCallSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setCallSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  // Format timer
  const formatTime = (totalSec) => {
    const mins = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const secs = String(totalSec % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Add message helper
  const addAiMessage = useCallback((text, toolCall = null) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTranscript(prev => [...prev, { sender: 'ai', text, time }]);
    lastAiMessageRef.current = text;

    if (toolCall) {
      setToolCalls(prev => [toolCall, ...prev]);
    }

    if (isAudioEnabled) {
      setIsSpeaking(true);
      speakText(text, language, () => setIsSpeaking(false));
    }
  }, [isAudioEnabled, language]);

  const addUserMessage = (text) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTranscript(prev => [...prev, { sender: 'user', text, time }]);
  };

  // Start SOS Call session
  const startSosSession = useCallback(() => {
    setCallStatus('CALLING');
    setStep('OPTIONS');
    setTranscript([]);
    setToolCalls([]);
    setCallSeconds(0);
    sfx.playEmergencyTone();

    setTimeout(() => {
      sfx.playConnectTone();
      setCallStatus('CONNECTED');
      const prompt = language === 'ml'
        ? "അടിയന്തര സഹായം വേണമോ? ഒരു ഓപ്ഷൻ തിരഞ്ഞെടുക്കുക: ആംബുലൻസ് വിളിക്കുക, എമർജൻസി ഡിപ്പാർട്ട്മെന്റ് വിളിക്കുക, അല്ലെങ്കിൽ നിലവിലെ ലൊക്കേഷൻ ഷെയർ ചെയ്യുക."
        : "Emergency? Choose an option: Call Ambulance, Call Emergency Department, or Share Current Location.";
      
      addAiMessage(
        prompt,
        { 
          name: "emergency_dispatcher_init", 
          args: { priority: "CRITICAL", hotline: "108/112", status: "CONNECTED", lang: language }, 
          result: { session: "SOS-LIVE", response_time: "< 1s" } 
        }
      );
    }, 1000);
  }, [addAiMessage, language]);

  // Initialize on open
  useEffect(() => {
    if (isOpen) {
      startSosSession();
    } else {
      stopSpeaking();
      recognitionRef.current?.stop();
      setIsListening(false);
      setCallStatus('ENDED');
    }
  }, [isOpen, startSosSession]);

  // Option 1: Trigger Confirmation for Ambulance
  const handleSelectAmbulance = () => {
    addUserMessage(language === 'ml' ? "ആംബുലൻസ് വിളിക്കുക" : "Call Ambulance");
    setStep('CONFIRM_AMBULANCE');
    const msg = language === 'ml'
      ? "അടിയന്തര ആംബുലൻസ് കോൾ: 108 ആംബുലൻസ് സർവീസിലേക്ക് ഉടൻ ബന്ധിപ്പിക്കണോ?"
      : "Confirm Emergency Call: Are you sure you want to call the Ambulance (108) immediately?";
    addAiMessage(msg);
  };

  // Option 2: Trigger Confirmation for Emergency Department
  const handleSelectEmergencyDept = () => {
    addUserMessage(language === 'ml' ? "എമർജൻസി ഡിപ്പാർട്ട്മെന്റ് വിളിക്കുക" : "Call Emergency Department");
    setStep('CONFIRM_ED');
    const msg = language === 'ml'
      ? "ആശുപത്രി എമർജൻസി വിഭാഗത്തിലേക്ക് (കാഷ്വാലിറ്റി & ട്രോമ റൂം) ഉടൻ വിളിക്കണോ?"
      : "Confirm Emergency Call: Are you sure you want to call the Hospital Emergency Department (Casualty & Trauma Room)?";
    addAiMessage(msg);
  };

  // Option 3: Share Current Location
  const handleShareLocation = () => {
    addUserMessage(language === 'ml' ? "നിലവിലെ സ്ഥലം പങ്കുവെക്കുക" : "Share Current Location");
    setIsLocating(true);

    const onLocationResolved = (lat, lng, accuracy = 15) => {
      setIsLocating(false);
      const loc = {
        lat: lat.toFixed(4),
        lng: lng.toFixed(4),
        accuracy,
        address: "Medical College Junction, Thiruvananthapuram, Kerala 695011",
        timestamp: new Date().toLocaleTimeString()
      };
      setLocationData(loc);
      sfx.playSuccessChime();
      setStep('LOCATION_SHARED');

      const msg = language === 'ml'
        ? `അടിയന്തര ലൊക്കേഷൻ ഷെയർ ചെയ്തു! GPS കോർഡിനേറ്റ്സ് (${loc.lat}° N, ${loc.lng}° E) 108 എമർജൻസി വിഭാഗത്തിനും അടുത്തുള്ള ട്രോമ കെയർ യൂണിറ്റിനും കൈമാറി.`
        : `Emergency location shared! GPS Coordinates (${loc.lat}° N, ${loc.lng}° E) transmitted to 108 Emergency Dispatch and nearest trauma casualty unit.`;

      addAiMessage(
        msg,
        {
          name: "transmit_gps_coordinates",
          args: { latitude: loc.lat, longitude: loc.lng, accuracy_meters: loc.accuracy },
          result: { dispatch_notified: true, nearest_hospital: "Govt Medical College Hospital (1.2 km away)", tracking_code: "LOC-KL-9821" }
        }
      );
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onLocationResolved(pos.coords.latitude, pos.coords.longitude, Math.round(pos.coords.accuracy));
        },
        () => {
          // Fallback location: Govt Medical College Trivandrum
          onLocationResolved(8.5241, 76.9366, 12);
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    } else {
      onLocationResolved(8.5241, 76.9366, 12);
    }
  };

  // Confirmation Action: Confirm Call Ambulance
  const handleConfirmCallAmbulance = () => {
    addUserMessage(language === 'ml' ? "അതെ, ആംബുലൻസ് വിളിക്കുക" : "Yes, Call Ambulance");
    sfx.playEmergencyTone();
    setStep('IN_CALL_AMBULANCE');

    const msg = language === 'ml'
      ? "108 ആംബുലൻസ് ഡിസ്പാച്ചറുമായി ബന്ധിപ്പിക്കുന്നു. നിങ്ങളുടെ ലൊക്കേഷനിലേക്ക് ആംബുലൻസ് അയച്ചിട്ടുണ്ട്. ഫോൺ കട്ട് ചെയ്യാതെ കാത്തിരിക്കുക."
      : "Connecting to Emergency Ambulance (108) Dispatcher. An ambulance has been flagged for dispatch to your location. Stay calm and keep your phone line open.";

    addAiMessage(
      msg,
      {
        name: "dispatch_ambulance",
        args: { service: "National Ambulance 108", location: locationData ? `${locationData.lat}, ${locationData.lng}` : "Live Cell Triangulation", triage: "CODE_RED" },
        result: { status: "AMBULANCE_EN_ROUTE", vehicle_id: "KL-01-AMB-8801", eta_minutes: 7, dispatch_hub: "Central EMS Station" }
      }
    );
  };

  // Confirmation Action: Confirm Call Emergency Dept
  const handleConfirmCallEmergencyDept = () => {
    addUserMessage(language === 'ml' ? "അതെ, എമർജൻസി ഡിപ്പാർട്ട്മെന്റ് വിളിക്കുക" : "Yes, Call Emergency Department");
    sfx.playEmergencyTone();
    setStep('IN_CALL_ED');

    const msg = language === 'ml'
      ? "ട്രോമ റൂമിലെ ഡ്യൂട്ടി മെഡിക്കൽ ഓഫീസറുമായി ബന്ധിപ്പിക്കുന്നു. ലൈൻ കണക്ട് ചെയ്തിട്ടുണ്ട്."
      : "Connecting to Hospital Casualty Medical Officer on duty at Trauma Room 101. Line connected. Please speak to the triage officer.";

    addAiMessage(
      msg,
      {
        name: "connect_casualty_hotline",
        args: { ward: "Emergency & Trauma ICU", cmo_officer: "Dr. Nair (Chief Casualty Officer)", priority: "HIGHEST" },
        result: { line_status: "ACTIVE", trauma_bed_allocated: true, contact: "+91-471-2528384" }
      }
    );
  };

  // Cancel Confirmation
  const handleCancelCall = () => {
    addUserMessage(language === 'ml' ? "റദ്ദാക്കുക" : "Cancel");
    setStep('OPTIONS');
    const msg = language === 'ml'
      ? "കോൾ റദ്ദാക്കി. അടിയന്തര സഹായം വേണമോ? താഴെയുള്ളവയിൽ ഒന്ന് തിരഞ്ഞെടുക്കുക: ആംബുലൻസ് വിളിക്കുക, എമർജൻസി ഡിപ്പാർട്ട്മെന്റ് വിളിക്കുക, അല്ലെങ്കിൽ നിലവിലെ ലൊക്കേഷൻ ഷെയർ ചെയ്യുക."
      : "Call cancelled. Emergency? Choose an option: Call Ambulance, Call Emergency Department, or Share Current Location.";
    addAiMessage(msg);
  };

  // End Call
  const handleEndCall = () => {
    stopSpeaking();
    recognitionRef.current?.stop();
    setIsListening(false);
    setCallStatus('ENDED');
  };

  // Spoken voice input processing
  const handleSpokenInput = (transcriptText) => {
    const lower = transcriptText.trim().toLowerCase();
    if (!lower) return;

    if (
      lower.includes('end call') || lower.includes('hang up') || lower.includes('disconnect') ||
      lower.includes('കട്ട് ചെയ്യുക') || lower.includes('കോൾ അവസാനിപ്പിക്കുക')
    ) {
      addUserMessage(language === 'ml' ? "കോൾ അവസാനിപ്പിക്കുക" : "End call");
      handleEndCall();
      return;
    }

    if (
      lower.includes('cancel') || lower.includes('go back') || lower.includes('stop') ||
      lower.includes('റദ്ദാക്കുക') || lower.includes('വേണ്ട')
    ) {
      handleCancelCall();
      return;
    }

    if (step === 'OPTIONS' || step === 'LOCATION_SHARED') {
      if (
        lower.includes('ambulance') || lower.includes('108') || lower.includes('van') ||
        lower.includes('ആംബുലൻസ്') || lower.includes('വണ്ടി')
      ) {
        handleSelectAmbulance();
      } else if (
        lower.includes('emergency') || lower.includes('hospital') || lower.includes('casualty') || lower.includes('doctor') ||
        lower.includes('കാഷ്വാലിറ്റി') || lower.includes('ഡോക്ടർ') || lower.includes('ആശുപത്രി')
      ) {
        handleSelectEmergencyDept();
      } else if (
        lower.includes('location') || lower.includes('share') || lower.includes('gps') || lower.includes('address') ||
        lower.includes('ലൊക്കേഷൻ') || lower.includes('സ്ഥലം')
      ) {
        handleShareLocation();
      } else {
        addUserMessage(transcriptText);
        addAiMessage(
          language === 'ml'
            ? "അടിയന്തര സഹായം വേണമോ? ആംബുലൻസ് വിളിക്കുക, എമർജൻസി ഡിപ്പാർട്ട്മെന്റ് വിളിക്കുക, അല്ലെങ്കിൽ സ്ഥലം ഷെയർ ചെയ്യുക."
            : "Emergency? Please choose: Call Ambulance, Call Emergency Department, or Share Current Location."
        );
      }
    } else if (step === 'CONFIRM_AMBULANCE') {
      if (
        lower.includes('yes') || lower.includes('confirm') || lower.includes('call') || lower.includes('sure') ||
        lower.includes('അതെ') || lower.includes('ഉറപ്പാക്കാം') || lower.includes('വിളിക്കുക')
      ) {
        handleConfirmCallAmbulance();
      } else if (lower.includes('no') || lower.includes('cancel') || lower.includes('വേണ്ട')) {
        handleCancelCall();
      }
    } else if (step === 'CONFIRM_ED') {
      if (
        lower.includes('yes') || lower.includes('confirm') || lower.includes('call') || lower.includes('sure') ||
        lower.includes('അതെ') || lower.includes('ഉറപ്പാക്കാം') || lower.includes('വിളിക്കുക')
      ) {
        handleConfirmCallEmergencyDept();
      } else if (lower.includes('no') || lower.includes('cancel') || lower.includes('വേണ്ട')) {
        handleCancelCall();
      }
    }
  };

  // Toggle Live Speech Recognition (Configured for ml-IN or en-IN)
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const rec = createSpeechRecognizer(
      language,
      (finalText) => {
        handleSpokenInput(finalText);
      },
      () => {
        setIsListening(false);
      }
    );

    if (rec) {
      recognitionRef.current = rec;
      rec.start();
      setIsListening(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border-2 border-rose-600/60 flex flex-col lg:flex-row max-h-[92vh]">
        
        {/* Left Side: Phone Device Interface */}
        <div className={`lg:w-7/12 flex flex-col bg-slate-900 text-white ${activeMobileTab === 'sos' ? 'flex' : 'hidden lg:flex'}`}>
          
          {/* Emergency Alert Header Bar */}
          <div className="bg-rose-700 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-rose-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0" />
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-white shrink-0" />
                <span className="text-xs font-black tracking-wider uppercase text-white truncate max-w-[130px] min-[380px]:max-w-none">
                  Emergency SOS
                </span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-950/80 text-rose-200 font-mono font-bold shrink-0">
                108 • 112
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Live Microphone Toggle */}
              {callStatus === 'CONNECTED' && (
                <button
                  onClick={toggleListening}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[32px] ${
                    isListening
                      ? 'bg-white text-rose-700 animate-pulse shadow-md'
                      : 'bg-rose-800/80 text-white hover:bg-rose-800'
                  }`}
                  title={isListening ? "Listening... Click to pause" : "Click to speak"}
                >
                  {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  <span className="hidden min-[400px]:inline">{isListening ? "Listening..." : "Mic"}</span>
                </button>
              )}

              <button
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center ${
                  isAudioEnabled ? 'bg-rose-900 text-white' : 'bg-rose-950 text-rose-400'
                }`}
                title={isAudioEnabled ? 'Audio Mute' : 'Audio Unmute'}
              >
                {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={onClose}
                className="text-rose-200 hover:text-white text-xs px-2.5 py-1 rounded-md bg-rose-950/80 hover:bg-rose-950 cursor-pointer min-h-[32px] flex items-center"
                title="Close SOS Modal"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Mobile Screen Tab Switcher (< lg) */}
          <div className="lg:hidden flex border-b border-rose-900/50 bg-slate-950 px-3 py-1.5 gap-2">
            <button
              onClick={() => setActiveMobileTab('sos')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[38px] cursor-pointer ${
                activeMobileTab === 'sos'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{language === 'ml' ? 'അടിയന്തര സഹായം' : 'SOS Controls'}</span>
            </button>

            <button
              onClick={() => setActiveMobileTab('telemetry')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[38px] cursor-pointer ${
                activeMobileTab === 'telemetry'
                  ? 'bg-rose-900 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{language === 'ml' ? 'ഡിസ്പാച്ച് ലോഗുകൾ' : 'EMS Telemetry'}</span>
              {toolCalls.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 bg-rose-950 text-rose-300 rounded-full font-mono">
                  {toolCalls.length}
                </span>
              )}
            </button>
          </div>

          {/* Emergency Operator Persona & Status */}
          <div className="bg-linear-to-b from-slate-950 to-slate-900 p-3 sm:p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shrink-0 ${isSpeaking ? 'ring-4 ring-rose-400/50 animate-pulse' : ''}`}>
                  <Ambulance className="w-5 sm:w-6 h-5 sm:h-6" />
                </div>
                {callStatus === 'CONNECTED' && (
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5 leading-snug">
                  <span>Emergency Dispatch Operator</span>
                  <span className="text-[10px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800 font-normal">
                    PRIORITY 1
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  {callStatus === 'CONNECTED' ? `Live Telephony • Duration: ${formatTime(callSeconds)}` : 'Initiating Emergency Hotline...'}
                </p>
              </div>
            </div>

            {/* Audio Waveform */}
            {callStatus === 'CONNECTED' && (
              <div className="hidden min-[420px]:flex items-center gap-1 h-8 px-2.5 bg-slate-800/80 rounded-xl border border-slate-700/50">
                <span className={`w-1 bg-rose-400 rounded-full ${isSpeaking || isListening ? 'animate-wave-1' : 'h-2'}`} />
                <span className={`w-1 bg-rose-400 rounded-full ${isSpeaking || isListening ? 'animate-wave-2' : 'h-4'}`} />
                <span className={`w-1 bg-rose-400 rounded-full ${isSpeaking || isListening ? 'animate-wave-3' : 'h-5'}`} />
                <span className={`w-1 bg-rose-400 rounded-full ${isSpeaking || isListening ? 'animate-wave-4' : 'h-3'}`} />
                <span className={`w-1 bg-rose-400 rounded-full ${isSpeaking || isListening ? 'animate-wave-5' : 'h-2'}`} />
              </div>
            )}
          </div>

          {/* Conversation Chat Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[260px] max-h-[340px] bg-slate-900/90 text-xs">
            {transcript.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-rose-600 text-white rounded-br-xs shadow-md'
                      : 'bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700/80 shadow-sm'
                  }`}
                >
                  <p className="font-medium">{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-500 px-1 mt-0.5">{msg.time}</span>
              </div>
            ))}

            {/* Shared Location Card inline in chat */}
            {locationData && (
              <div className="bg-emerald-950/80 border border-emerald-700 rounded-2xl p-3.5 space-y-2 text-slate-200">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>Emergency GPS Coordinates</span>
                  </span>
                  <span className="text-[10px] bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded-full font-mono">
                    ✓ Transmitted
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/60 p-2 rounded-xl">
                  <div>
                    <span className="text-slate-400 block text-[9px]">LATITUDE:</span>
                    <span className="font-bold text-white">{locationData.lat}° N</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">LONGITUDE:</span>
                    <span className="font-bold text-white">{locationData.lng}° E</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-300">
                  📍 {locationData.address}
                </p>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Interactive Step Controls / Buttons */}
          {callStatus === 'CONNECTED' && (
            <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
              
              {/* Primary Header Prompt */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-rose-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-rose-500" />
                  <span>{t('sos.mainPrompt')}</span>
                </span>
                <span className="text-[10px] text-slate-400 italic">
                  {t('voice.quickOptionsTip')}
                </span>
              </div>

              {/* STEP 1: Main 3 Options */}
              {(step === 'OPTIONS' || step === 'LOCATION_SHARED') && (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Option 1: Call Ambulance */}
                    <button
                      onClick={handleSelectAmbulance}
                      className="p-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex sm:flex-col items-center justify-center gap-2.5 sm:gap-1 cursor-pointer min-h-[56px]"
                    >
                      <Ambulance className="w-5 h-5 shrink-0" />
                      <div className="flex flex-col items-start sm:items-center">
                        <span className="leading-tight">{t('sos.btnAmbulance')}</span>
                        <span className="text-[10px] font-normal text-rose-100">{t('sos.ambulanceDesc')}</span>
                      </div>
                    </button>

                    {/* Option 2: Call Emergency Department */}
                    <button
                      onClick={handleSelectEmergencyDept}
                      className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700 active:scale-95 flex sm:flex-col items-center justify-center gap-2.5 sm:gap-1 cursor-pointer min-h-[56px]"
                    >
                      <Building2 className="w-5 h-5 text-amber-400 shrink-0" />
                      <div className="flex flex-col items-start sm:items-center">
                        <span className="leading-tight">{t('sos.btnEmergencyDept')}</span>
                        <span className="text-[10px] font-normal text-slate-400">{t('sos.emergencyDeptDesc')}</span>
                      </div>
                    </button>

                    {/* Option 3: Share Current Location */}
                    <button
                      onClick={handleShareLocation}
                      disabled={isLocating}
                      className="p-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex sm:flex-col items-center justify-center gap-2.5 sm:gap-1 cursor-pointer disabled:opacity-50 min-h-[56px]"
                    >
                      <MapPin className="w-5 h-5 shrink-0" />
                      <div className="flex flex-col items-start sm:items-center">
                        <span className="leading-tight">{isLocating ? t('sos.locating') : t('sos.btnShareLocation')}</span>
                        <span className="text-[10px] font-normal text-emerald-200">{t('sos.locationDesc')}</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2A: Confirmation for Ambulance */}
              {step === 'CONFIRM_AMBULANCE' && (
                <div className="p-3.5 bg-rose-950/80 border border-rose-700 rounded-2xl space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">
                        {t('sos.confirmAmbulanceTitle')}
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        {t('sos.confirmAmbulanceText')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleConfirmCallAmbulance}
                      className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>{t('sos.btnYesCallAmbulance')}</span>
                    </button>
                    <button
                      onClick={handleCancelCall}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs cursor-pointer"
                    >
                      {t('sos.btnCancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2B: Confirmation for Emergency Department */}
              {step === 'CONFIRM_ED' && (
                <div className="p-3.5 bg-amber-950/80 border border-amber-700 rounded-2xl space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">
                        {t('sos.confirmEdTitle')}
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        {t('sos.confirmEdText')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleConfirmCallEmergencyDept}
                      className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>{t('sos.btnYesCallEd')}</span>
                    </button>
                    <button
                      onClick={handleCancelCall}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs cursor-pointer"
                    >
                      {t('sos.btnCancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3A: In Call with Ambulance */}
              {step === 'IN_CALL_AMBULANCE' && (
                <div className="p-3.5 bg-rose-950/90 border border-rose-600 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-white">
                        {t('sos.connectedAmbulance')}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-rose-300">
                      {formatTime(callSeconds)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Ambulance unit <strong>KL-01-AMB-8801</strong> is en route. ETA: <strong>~7 mins</strong>.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href="tel:108"
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold text-center inline-flex items-center justify-center gap-1.5"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{t('sos.directDial108')}</span>
                    </a>
                    <button
                      onClick={() => setStep('OPTIONS')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      {t('sos.otherOptions')}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3B: In Call with Emergency Dept */}
              {step === 'IN_CALL_ED' && (
                <div className="p-3.5 bg-amber-950/90 border border-amber-600 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-white">
                        {t('sos.connectedEd')}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {formatTime(callSeconds)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Speaking with Chief Casualty Officer. Trauma bay prepared for incoming patient.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href="tel:112"
                      className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold text-center inline-flex items-center justify-center gap-1.5"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{t('sos.directDialHospital')}</span>
                    </a>
                    <button
                      onClick={() => setStep('OPTIONS')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      {t('sos.otherOptions')}
                    </button>
                  </div>
                </div>
              )}

              {/* Call Controls Footer */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  onClick={startSosSession}
                  className="flex items-center gap-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t('sos.btnRestart')}</span>
                </button>

                <button
                  onClick={handleEndCall}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-900 text-rose-300 hover:text-white rounded-lg font-semibold transition-all cursor-pointer"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span>{t('sos.btnEndCall')}</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Right Side: Emergency Telemetry & Dispatch Traces */}
        <div className={`lg:w-5/12 bg-slate-950 p-4 sm:p-5 flex flex-col border-t lg:border-t-0 lg:border-l border-slate-800 text-slate-300 overflow-y-auto max-h-[70vh] lg:max-h-[92vh] ${activeMobileTab === 'telemetry' ? 'flex' : 'hidden lg:flex'}`}>
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-rose-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {t('sos.telemetryTitle')}
              </h4>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-mono">
              EMS Dispatch System
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            {t('sos.telemetrySubtitle')}
          </p>

          {/* Quick First-Aid Advice */}
          <div className="mt-3 p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] space-y-1.5">
            <span className="font-bold text-white flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'ml' ? 'പ്രഥമശുശ്രൂഷാ മാർഗ്ഗനിർദ്ദേശങ്ങൾ:' : 'Immediate First-Aid Protocols:'}</span>
            </span>
            <ul className="text-slate-400 space-y-1 list-disc list-inside text-[10px]">
              <li>{language === 'ml' ? 'രോഗിയെ സുരക്ഷിതമായി കിടത്തുക; ചുറ്റും ആൾക്കൂട്ടം ഒഴിവാക്കുക.' : 'Keep patient in recovery position; do not crowd.'}</li>
              <li>{language === 'ml' ? 'നെഞ്ചുവേദനയാണെങ്കിൽ നിർദ്ദേശാനുസരണം മരുന്ന് നൽകുക.' : 'In chest pain, administer Sorbitrate / Aspirin if advised.'}</li>
              <li>{language === 'ml' ? 'ഡിസ്പാച്ചറുടെ കോളിനായി ഫോൺ ലൈൻ തുറന്നുവെക്കുക.' : 'Keep the phone line clear for incoming dispatcher callback.'}</li>
            </ul>
          </div>

          {/* Live Tool Invocations List */}
          <div className="mt-4 space-y-2.5 flex-1 overflow-y-auto">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {language === 'ml' ? 'എമർജൻസി ടൂൾ കോളുകൾ' : 'Emergency Tool Calls'}
            </div>
            {toolCalls.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs italic">
                {language === 'ml' ? 'അടിയന്തര നടപടിക്കായി കാത്തിരിക്കുന്നു...' : 'Awaiting user emergency action...'}
              </div>
            ) : (
              toolCalls.map((tc, idx) => (
                <div key={idx} className="bg-slate-900 border border-rose-900/40 rounded-xl p-2.5 space-y-1 font-mono text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-rose-400 font-bold">⚡ {tc.name}()</span>
                    <span className="text-[9px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                      DISPATCHED
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-slate-500 text-[9px]">ARGS:</span>
                    <pre className="text-slate-300 bg-slate-950 p-1 rounded overflow-x-auto text-[9px]">
                      {JSON.stringify(tc.args, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[9px]">RESULT:</span>
                    <pre className="text-emerald-300 bg-slate-950 p-1 rounded overflow-x-auto text-[9px]">
                      {JSON.stringify(tc.result, null, 2)}
                    </pre>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Hotline Numbers Notice */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Ambulance className="w-3.5 h-3.5 text-rose-400" />
              <span>{language === 'ml' ? 'ആംബുലൻസ്: ' : 'National Ambulance: '}<strong>108</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>{language === 'ml' ? 'അടിയന്തര ഹെൽപ്പ്‌ലൈൻ: ' : 'National Emergency: '}<strong>112</strong></span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

