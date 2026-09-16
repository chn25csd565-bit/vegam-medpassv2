import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  PhoneCall, PhoneOff, Mic, MicOff, Volume2, VolumeX, ShieldCheck, 
  Sparkles, AlertCircle, CheckCircle2, Terminal, Check, RefreshCw, RotateCcw,
  ExternalLink, Volume1
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { sfx, speakText, stopSpeaking, createSpeechRecognizer } from '../services/speech';
import { useLanguage } from '../context/LanguageContext';
import { parseSpokenNumber, cleanCodeSwitching, MALAYALAM_MEDICAL_GLOSSARY } from '../locales/glossary';
import { executeGeminiTurn } from '../services/geminiLiveService';

export default function VoiceCallModal({ 
  isOpen, 
  onClose, 
  onPassCreated, 
  initialPreload = false,
  isMlDemo = false 
}) {
  const { language, setLanguage, t } = useLanguage();

  // Call state machine: 'IDLE' | 'CALLING' | 'CONNECTED' | 'ENDED'
  const [callStatus, setCallStatus] = useState('IDLE');
  
  // Conversational step: 'PHONE' | 'OTP' | 'DEPENDENT' | 'DEPARTMENT' | 'SLOT' | 'CONFIRM' | 'COMPLETED'
  const [step, setStep] = useState('PHONE');

  // Audio & Speech states
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Form / Call Memory
  const [phone, setPhone] = useState('9876543210'); // Default Ananya
  const [otp, setOtp] = useState('583921');
  const [currentPatient, setCurrentPatient] = useState(null);
  const [dependents, setDependents] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [selectedDept, setSelectedDept] = useState('Ophthalmology');
  const [selectedDoctor, setSelectedDoctor] = useState('Dr. Sharma');
  const [selectedDate, setSelectedDate] = useState('2026-09-15');
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');

  // Live messages transcript
  const [transcript, setTranscript] = useState([]);
  
  // Real-time tool execution logs
  const [toolCalls, setToolCalls] = useState([]);

  // Created appointment result
  const [bookedPass, setBookedPass] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showGovBooking, setShowGovBooking] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('call'); // 'call' | 'tools'

  const chatBottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const lastAiMessageRef = useRef('');

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Clean up audio & speech recognizer on unmount or close
  useEffect(() => {
    return () => {
      stopSpeaking();
      recognitionRef.current?.stop();
    };
  }, []);

  // Helper to add message & speak using current language
  const addAiMessage = useCallback((text, toolLog = null) => {
    lastAiMessageRef.current = text;
    setTranscript(prev => [
      ...prev, 
      { sender: 'ai', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    if (toolLog) {
      setToolCalls(prev => [toolLog, ...prev]);
    }
    if (isAudioEnabled) {
      setIsSpeaking(true);
      speakText(text, language, () => setIsSpeaking(false));
    }
  }, [isAudioEnabled, language]);

  const addUserMessage = useCallback((text) => {
    setTranscript(prev => [
      ...prev, 
      { sender: 'user', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
  }, []);

  // Dedicated "Repeat Audio" handler for elderly and accessibility
  const handleRepeatAudio = useCallback(() => {
    if (lastAiMessageRef.current) {
      if (language === 'ml') {
        addUserMessage("വീണ്ടും പറയൂ");
      } else {
        addUserMessage("Can you repeat that?");
      }
      setIsSpeaking(true);
      speakText(lastAiMessageRef.current, language, () => setIsSpeaking(false));
    }
  }, [language, addUserMessage]);

  // 1-Click English Demo (Ananya booking Aarav to Ophthalmology Dr. Sharma)
  const handle1ClickDemo = useCallback((chosenPhone = '9876543210') => {
    setCallStatus('CONNECTED');
    setPhone(chosenPhone);
    setOtp('583921');
    setCurrentPatient({ id: 1, name: "Ananya", phone: chosenPhone, uhid: "1234567890123456" });
    setDependents([
      { id: 6, name: "Aarav", relationship: "Child / Dependent", uhid: "3456789012345678", age: 6 }
    ]);
    setSelectedPatientId(6);
    setSelectedPatientName("Aarav (Child)");
    setSelectedDept("Ophthalmology");
    setSelectedDoctor("Dr. Sharma");
    setSelectedDate("2026-09-15");
    setSelectedSlot("10:00 AM");

    setTranscript([
      { sender: 'ai', text: "Namaste! Welcome to Government Hospital Outpatient Helpline. Please confirm your mobile number.", time: "10:00 AM" },
      { sender: 'user', text: chosenPhone, time: "10:00 AM" },
      { sender: 'ai', text: "Thank you Ananya. Demo verification code 583921 verified.", time: "10:01 AM" },
      { sender: 'user', text: "Book for child Aarav", time: "10:01 AM" },
      { sender: 'ai', text: "Understood, booking for Aarav. Which department or specialist do you need?", time: "10:01 AM" },
      { sender: 'user', text: "Eye doctor (Ophthalmology)", time: "10:02 AM" },
      { sender: 'ai', text: "Mapped to Ophthalmology. Assigned Dr. Sharma at Room 204, Floor 2. Slot: 10:00 AM.", time: "10:02 AM" }
    ]);

    setToolCalls([
      { name: "search_department", args: { query: "Eye doctor" }, result: { matched: "Ophthalmology", room: "Room 204", floor: 2 } },
      { name: "get_dependents", args: { guardian_id: 1 }, result: [{ name: "Aarav", silent_uhid_resolved: true }] },
      { name: "verify_otp", args: { phone: chosenPhone, otp: "583921" }, result: { verified: true } },
      { name: "check_patient", args: { phone: chosenPhone }, result: { patient_id: 1, name: "Ananya" } }
    ]);

    setStep('CONFIRM');
    addAiMessage(
      "Confirming appointment for Aarav with Dr. Sharma, Ophthalmology at Room 204, Floor 2, tomorrow at 10:00 AM. Say 'Confirm' or click below to generate your digital pass."
    );
  }, [addAiMessage]);

  // 1-Click Malayalam Demo Flow:
  // "എനിക്ക് നാളെ കണ്ണിന്റെ doctor-നെ കാണണം" -> Gemini Live AI understands Ophthalmology -> Dr. Sharma -> Room 204 -> Confirms in Malayalam
  const handle1ClickMlDemo = useCallback(() => {
    setLanguage('ml');
    setCallStatus('CONNECTED');
    setPhone('9876543210');
    setOtp('583921');
    setCurrentPatient({ id: 1, name: "Ananya", phone: "9876543210", uhid: "1234567890123456" });
    setDependents([
      { id: 6, name: "Aarav", relationship: "മകൻ (കുട്ടി)", uhid: "3456789012345678", age: 6 }
    ]);
    setSelectedPatientId(6);
    setSelectedPatientName("Aarav (മകൻ)");
    setSelectedDept("Ophthalmology");
    setSelectedDoctor("Dr. Sharma");
    setSelectedDate("2026-09-15");
    setSelectedSlot("10:00 AM");

    setTranscript([
      { 
        sender: 'ai', 
        text: "നമസ്കാരം! സർക്കാർ ആശുപത്രി ഒ.പി. വോയ്സ് ഹെൽപ്പ്‌ലൈനിലേക്ക് സ്വാഗതം. നിങ്ങളുടെ മൊബൈൽ നമ്പർ ഉറപ്പാക്കുക.", 
        time: "10:00 AM" 
      },
      { sender: 'user', text: "9876543210", time: "10:00 AM" },
      { 
        sender: 'ai', 
        text: "നന്ദി Ananya. ഒ.ടി.പി. 583921 വിജയകരമായി സ്ഥിരീകരിച്ചു.", 
        time: "10:01 AM" 
      },
      { 
        sender: 'user', 
        text: "എനിക്ക് നാളെ കണ്ണിന്റെ doctor-നെ കാണണം. മകൻ Aarav-ന് വേണ്ടിയാണ്.", 
        time: "10:01 AM" 
      },
      { 
        sender: 'ai', 
        text: "മനസ്സിലായി. നേത്രരോഗ വിഭാഗത്തിലേക്ക് (Ophthalmology) മാറ്റി. ലഭ്യമായ സ്പെഷ്യലിസ്റ്റ്: Dr. Sharma. കൺസൾട്ടേഷൻ മുറി: Room 204, Floor 2. നാളെ രാവിലെ 10:00 AM.", 
        time: "10:02 AM" 
      }
    ]);

    setToolCalls([
      { 
        name: "search_department", 
        args: { query: "കണ്ണിന്റെ doctor", code_switched: true }, 
        result: { matched: "Ophthalmology", malayalam: "നേത്രരോഗ വിഭാഗം", room: "Room 204", floor: 2 } 
      },
      { 
        name: "get_doctors", 
        args: { department: "Ophthalmology" }, 
        result: [{ name: "Dr. Sharma", room: "Room 204", floor: 2 }] 
      },
      { 
        name: "get_dependents", 
        args: { guardian_id: 1 }, 
        result: [{ name: "Aarav", silent_uhid_resolved: true }] 
      },
      { 
        name: "verify_otp", 
        args: { phone: "9876543210", otp: "583921" }, 
        result: { verified: true } 
      },
      { 
        name: "check_patient", 
        args: { phone: "9876543210" }, 
        result: { patient_id: 1, name: "Ananya", uhid: "MASKED" } 
      }
    ]);

    setStep('CONFIRM');
    addAiMessage(
      "നമസ്കാരം! നിങ്ങളുടെ മകൻ Aarav-ന് Dr. Sharma-യുമായി Ophthalmology വിഭാഗത്തിൽ നാളെ രാവിലെ 10:00 AM-ന് അപ്പോയിന്റ്മെന്റ് സ്ഥിരീകരിക്കട്ടെ? 'ഉറപ്പാക്കാം' എന്ന് പറയുകയോ താഴെ ക്ലിക്ക് ചെയ്യുകയോ ചെയ്യുക."
    );
  }, [setLanguage, addAiMessage]);

  // Preload scenario if requested
  useEffect(() => {
    if (isOpen) {
      if (isMlDemo) {
        handle1ClickMlDemo();
      } else if (initialPreload) {
        handle1ClickDemo();
      }
    }
  }, [initialPreload, isMlDemo, isOpen, handle1ClickDemo, handle1ClickMlDemo]);

  // Start Call
  const handleStartCall = () => {
    setCallStatus('CALLING');
    sfx.playRingTone();
    setTranscript([]);
    setToolCalls([]);
    setErrorMessage('');
    setShowGovBooking(false);

    setTimeout(() => {
      sfx.playConnectTone();
      setCallStatus('CONNECTED');
      setStep('PHONE');

      const welcomeMsg = language === 'ml'
        ? "നമസ്കാരം! സർക്കാർ ആശുപത്രി ഒ.പി. വോയ്സ് ഹെൽപ്പ്‌ലൈനിലേക്ക് സ്വാഗതം. നിങ്ങളുടെ 10 അക്ക മൊബൈൽ നമ്പർ പറയുക അല്ലെങ്കിൽ താഴെ തിരഞ്ഞെടുക്കുക."
        : "Namaste! Welcome to Government Hospital Outpatient Helpline. Please speak or confirm your 10-digit mobile number.";

      addAiMessage(
        welcomeMsg,
        { name: "initialize_session", args: { channel: "telephony_voice", language: language === 'ml' ? 'ml-IN' : 'en-IN' }, result: "READY" }
      );
    }, 1200);
  };

  // Triggered when citizen does not have a UHID
  const handleNoUhid = () => {
    const userMsg = language === 'ml' ? "എനിക്ക് UHID ഇല്ല" : "I don't have a UHID";
    addUserMessage(userMsg);
    setShowGovBooking(true);

    const bannerErr = language === 'ml'
      ? "UHID ഇല്ലേ? കേരള സർക്കാർ e-Health പോർട്ടൽ വഴി നേരിട്ട് ബുക്ക് ചെയ്യാം."
      : "Don't have a UHID? You can book directly through Kerala Government System.";
    setErrorMessage(bannerErr);

    const aiMsg = language === 'ml'
      ? "നിങ്ങൾക്ക് രജിസ്റ്റർ ചെയ്ത UHID ഇല്ലെങ്കിൽ, ഔദ്യോഗിക കേരള സർക്കാർ e-Health പോർട്ടൽ വഴി നേരിട്ട് രജിസ്റ്റർ ചെയ്യാനും ഒ.പി. ബുക്ക് ചെയ്യാനും സാധിക്കും."
      : "If you don't have a registered UHID, you can register and book directly through the official Kerala Government e-Health portal.";

    addAiMessage(
      aiMsg,
      { name: "check_patient", args: { uhid_status: "none" }, result: { portal: "https://ehealth.kerala.gov.in" } }
    );
  };

  // 1. Submit Phone
  const handlePhoneSubmit = async (customPhone = null) => {
    const targetPhone = (customPhone || phone).trim();
    addUserMessage(targetPhone);
    setErrorMessage('');

    const res = await api.checkUhid(targetPhone);
    if (!res.success) {
      setShowGovBooking(true);
      const errMsg = language === 'ml'
        ? "ഈ നമ്പറിൽ രജിസ്റ്റർ ചെയ്ത UHID കണ്ടെത്തിയില്ല. കേരള സർക്കാർ സംവിധാനം വഴി ബുക്ക് ചെയ്യാം."
        : (res.message || "No registered UHID found for this number.");
      setErrorMessage(errMsg);

      const aiMsg = language === 'ml'
        ? `${targetPhone} എന്ന നമ്പറിൽ രജിസ്റ്റർ ചെയ്ത UHID കണ്ടെത്താനായില്ല. നിങ്ങൾക്ക് UHID ഇല്ലെങ്കിൽ കേരള സർക്കാർ e-Health വഴി ബുക്ക് ചെയ്യാം.`
        : `I could not find a registered UHID for ${targetPhone}. If you don't have a UHID, you can book through the Kerala Government System.`;

      addAiMessage(
        aiMsg,
        { name: "check_patient", args: { phone: targetPhone }, result: { uhid_found: false, kerala_portal: "https://ehealth.kerala.gov.in" } }
      );
      return;
    }

    setPhone(targetPhone);

    const aiMsg = language === 'ml'
      ? `നന്ദി, ${res.name}. നിങ്ങളുടെ ഫോണിലേക്ക് 6 അക്ക വെരിഫിക്കേഷൻ കോഡ് അയച്ചിട്ടുണ്ട്. ദയവായി കോഡ് പറയുക. (ഡെമോ കോഡ്: 583921)`
      : `Thank you, ${res.name}. I have sent a 6-digit verification code to your phone. Please speak or enter the code to proceed. (Demo code: 583921)`;

    addAiMessage(
      aiMsg,
      { name: "check_patient", args: { phone: targetPhone }, result: { patient_id: res.patient_id, name: res.name, uhid: "MASKED" } }
    );
    setStep('OTP');
  };

  // 2. Submit OTP
  const handleOtpSubmit = async (customOtp = null) => {
    const targetOtp = (customOtp || otp).trim();
    addUserMessage(language === 'ml' ? `കോഡ്: ${targetOtp}` : `Code: ${targetOtp}`);
    setErrorMessage('');

    const res = await api.verifyOtp(phone, targetOtp);
    if (!res.verified) {
      setErrorMessage(res.message);
      const errPrompt = language === 'ml'
        ? "നൽകിയ കോഡ് തെറ്റാണ്. ഈ ഡെമോയ്ക്കായി ദയവായി 583921 ഉപയോഗിക്കുക."
        : "Incorrect verification code. For this demo, please use code 583921.";
      addAiMessage(errPrompt);
      return;
    }

    setCurrentPatient(res.patient);
    const deps = await api.getDependents(res.patient.id);
    setDependents(deps);

    let depText = "";
    if (deps && deps.length > 0) {
      depText = language === 'ml'
        ? `വെരിഫിക്കേഷൻ പൂർത്തിയായി, ${res.patient.name}. നിങ്ങൾക്കാണോ അതോ ആശ്രിതനായ ${deps.map(d => `${d.name} (${d.relationship})`).join(', ')}-നാണോ ബുക്ക് ചെയ്യേണ്ടത്?`
        : `Authentication confirmed, ${res.patient.name}. Are you booking for yourself, or for your linked dependent: ${deps.map(d => `${d.name} (${d.relationship})`).join(', ')}?`;
    } else {
      depText = language === 'ml'
        ? `വെരിഫിക്കേഷൻ പൂർത്തിയായി, ${res.patient.name}. നിങ്ങൾക്കാണോ ബുക്ക് ചെയ്യേണ്ടത്?`
        : `Authentication confirmed, ${res.patient.name}. Are you booking for yourself?`;
    }

    addAiMessage(
      depText,
      { name: "verify_otp", args: { phone, otp: targetOtp }, result: { verified: true, session_id: res.session_id } }
    );
    setStep('DEPENDENT');
  };

  // 3. Select Dependent (Children silently resolved without asking for child UHID)
  const handleSelectDependent = (patientId, patientName) => {
    setSelectedPatientId(patientId);
    setSelectedPatientName(patientName);
    addUserMessage(language === 'ml' ? `രോഗി: ${patientName}` : `Booking for: ${patientName}`);

    const aiMsg = language === 'ml'
      ? `${patientName}-ന് വേണ്ടി ബുക്കിംഗ് ആരംഭിക്കുന്നു. ഏത് വിഭാഗത്തിലെ ഡോക്ടറെയാണ് കാണേണ്ടത്? ഉദാഹരണത്തിന്: കണ്ണ് ഡോക്ടർ (Ophthalmology), കുട്ടികളുടെ ഡോക്ടർ (Pediatrics), അല്ലെങ്കിൽ ജനറൽ മെഡിസിൻ?`
      : `Understood, booking for ${patientName}. Which department or specialist do you need? For example: Eye doctor (Ophthalmology), Child specialist (Pediatrics), or General Medicine?`;

    addAiMessage(
      aiMsg,
      { name: "get_dependents", args: { guardian_id: currentPatient?.id }, result: { selected_patient_id: patientId, silent_uhid_resolved: true } }
    );
    setStep('DEPARTMENT');
  };

  // 4. Select Department (Handles Malayalam and Manglish synonyms)
  const handleSelectDept = async (spokenDept) => {
    addUserMessage(spokenDept);
    const cleaned = cleanCodeSwitching(spokenDept);
    const depts = await api.searchDept(cleaned || spokenDept);
    const matched = depts[0] || { name: "Ophthalmology", block: "Block B (Surgical Wing)", floor: 2, room: "Room 204" };
    setSelectedDept(matched.name);

    const doctors = await api.getDoctors(matched.name);
    const doc = doctors[0] || { name: "Dr. Sharma" };
    setSelectedDoctor(doc.name);

    const aiMsg = language === 'ml'
      ? `${matched.name} വിഭാഗത്തിലേക്ക് മാറ്റി. ലഭ്യമായ സ്പെഷ്യലിസ്റ്റ്: ${doc.name}. കൺസൾട്ടേഷൻ മുറി: ${matched.room || 'Room 204'}, Floor ${matched.floor || 2}. നാളത്തേക്ക് അനുയോജ്യമായ സമയം തിരഞ്ഞെടുക്കുക.`
      : `Got it, ${matched.name}. Available specialist is ${doc.name} at ${matched.room || 'Room 204'}, Floor ${matched.floor || 2}. Please choose an appointment slot for tomorrow.`;

    addAiMessage(
      aiMsg,
      { name: "search_department", args: { query: spokenDept, mapped: matched.name }, result: { matched_dept: matched.name, floor: matched.floor, room: matched.room } }
    );
    setStep('SLOT');
  };

  // 5. Select Slot
  const handleSelectSlot = (slotTime) => {
    setSelectedSlot(slotTime);
    addUserMessage(`${slotTime} (${selectedDate})`);

    const aiMsg = language === 'ml'
      ? `ദയവായി സ്ഥിരീകരിക്കുക: ${selectedPatientName}-ന് Dr. Sharma (${selectedDept})-യുമായി നാളെ (${selectedDate}) ${slotTime}-ന് അപ്പോയിന്റ്മെന്റ് സ്ഥിരീകരിക്കട്ടെ? 'ഉറപ്പാക്കാം' എന്ന് പറയുക.`
      : `Please confirm: Booking for ${selectedPatientName} with ${selectedDoctor}, Department of ${selectedDept}, on ${selectedDate} at ${slotTime}. Say 'Confirm' or click below.`;

    addAiMessage(
      aiMsg,
      { name: "get_available_slots", args: { department: selectedDept, doctor: selectedDoctor, date: selectedDate }, result: { selected_slot: slotTime } }
    );
    setStep('CONFIRM');
  };

  // 6. Confirm Booking
  const handleConfirmBooking = async () => {
    const confirmPrompt = language === 'ml' ? "അതെ, അപ്പോയിന്റ്മെന്റ് സ്ഥിരീകരിക്കുക." : "Yes, please confirm the appointment.";
    addUserMessage(confirmPrompt);

    const isDemoBooking = isMlDemo || initialPreload || (selectedDept === 'Ophthalmology' && selectedDoctor === 'Dr. Sharma');
    const chosenAptId = isDemoBooking ? 'APT-2026-8802' : undefined;

    const res = await api.bookAppointment({
      patientId: selectedPatientId || currentPatient?.id || 1,
      department: selectedDept,
      doctor: selectedDoctor,
      date: selectedDate,
      time: selectedSlot,
      appointmentId: chosenAptId
    });

    const aptId = res.id || res.appointment_id || chosenAptId || 'APT-2026-8802';
    const normalizedRes = {
      ...res,
      id: aptId,
      appointment_id: aptId,
      patient_id: selectedPatientId || currentPatient?.id || 1,
      patient_name: selectedPatientName?.replace(/\s*\(.*?\)/, '').trim() || res.patient_name
    };

    setBookedPass(normalizedRes);
    sfx.playSuccessChime();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    const aiMsg = language === 'ml'
      ? `അപ്പോയിന്റ്മെന്റ് വിജയകരമായി സ്ഥിരീകരിച്ചു! അപ്പോയിന്റ്മെന്റ് ഐഡി: ${aptId}. നിങ്ങളുടെ ഡിജിറ്റൽ പാസ്സ് തയ്യാറായിക്കഴിഞ്ഞു. ആശുപത്രിയിൽ എത്തുമ്പോൾ ${res.room}, Floor ${res.floor}-ൽ ഈ QR പാസ്സ് കാണിക്കുക.`
      : `Appointment confirmed! Your appointment ID is ${aptId}. Your digital pass with QR code has been generated. Show it at ${res.room}, Floor ${res.floor}. Have a safe hospital visit!`;

    addAiMessage(
      aiMsg,
      { name: "book_appointment", args: { patient_id: selectedPatientId, dept: selectedDept, slot: selectedSlot }, result: normalizedRes }
    );

    setStep('COMPLETED');
    if (onPassCreated) {
      onPassCreated(normalizedRes);
    }
  };

  // End Call
  const handleEndCall = () => {
    stopSpeaking();
    recognitionRef.current?.stop();
    setIsListening(false);
    setCallStatus('ENDED');
  };

  // Conversational Intent Parser for Live Microphone Input (English + Malayalam + Manglish)
  const handleSpokenInput = (transcriptText) => {
    const cleanText = transcriptText.trim();
    if (!cleanText) return;
    const lower = cleanText.toLowerCase();

    // 1. Universal voice navigation commands (English + Malayalam)
    if (
      lower.includes('repeat') || lower.includes('say again') || lower.includes('pardon') ||
      lower.includes('വീണ്ടും') || lower.includes('കേട്ടില്ല') || lower.includes('ഒന്നുകൂടി')
    ) {
      handleRepeatAudio();
      return;
    }

    if (
      lower.includes('go back') || lower.includes('previous') ||
      lower.includes('തിരികെ') || lower.includes('മുമ്പത്തെ')
    ) {
      addUserMessage(language === 'ml' ? "തിരികെ പോകുക" : "Go back");
      if (step === 'CONFIRM') setStep('SLOT');
      else if (step === 'SLOT') setStep('DEPARTMENT');
      else if (step === 'DEPARTMENT') setStep('DEPENDENT');
      else if (step === 'DEPENDENT') setStep('OTP');
      else if (step === 'OTP') setStep('PHONE');
      addAiMessage(language === 'ml' ? "മുമ്പത്തെ ഘട്ടത്തിലേക്ക് പോകുന്നു." : "Returning to previous step.");
      return;
    }

    if (
      lower.includes('cancel call') || lower.includes('end call') || lower.includes('hang up') ||
      lower.includes('കോൾ അവസാനിപ്പിക്കുക') || lower.includes('കട്ട് ചെയ്യുക')
    ) {
      addUserMessage(language === 'ml' ? "കോൾ അവസാനിപ്പിക്കുക" : "End call");
      handleEndCall();
      return;
    }

    // 2. Step-specific handlers
    if (step === 'PHONE') {
      if (
        lower.includes('no uhid') || lower.includes("don't have") || lower.includes('government') || lower.includes('kerala') ||
        lower.includes('ഇല്ല') || lower.includes('രജിസ്റ്റർ ചെയ്തിട്ടില്ല')
      ) {
        handleNoUhid();
        return;
      }
      const digits = parseSpokenNumber(cleanText);
      if (digits.length >= 10) {
        handlePhoneSubmit(digits.slice(-10));
      } else if (lower.includes('ananya') || lower.includes('അനന്യ')) {
        handlePhoneSubmit('9876543210');
      } else if (lower.includes('meera') || lower.includes('മീര')) {
        handlePhoneSubmit('9123456780');
      } else {
        addUserMessage(cleanText);
        addAiMessage(
          language === 'ml'
            ? "ദയവായി നിങ്ങളുടെ 10 അക്ക മൊബൈൽ നമ്പർ വ്യക്തമായി പറയുക, അല്ലെങ്കിൽ 'UHID ഇല്ല' എന്ന് പറയുക."
            : "Please speak your 10-digit mobile number, or say 'I don't have a UHID'."
        );
      }
    } else if (step === 'OTP') {
      const digits = parseSpokenNumber(cleanText);
      if (digits.length === 6) {
        handleOtpSubmit(digits);
      } else if (
        lower.includes('five eight') || lower.includes('demo') || lower.includes('code') ||
        lower.includes('അഞ്ച് എട്ട്') || lower.includes('ഡെമോ')
      ) {
        handleOtpSubmit('583921');
      } else {
        addUserMessage(cleanText);
        addAiMessage(
          language === 'ml'
            ? "ദയവായി 6 അക്ക വെരിഫിക്കേഷൻ കോഡ് പറയുക. ഡെമോയ്ക്കായി '5-8-3-9-2-1' എന്ന് പറയുക."
            : "Please enter or speak the 6-digit verification code. For demo, say '5-8-3-9-2-1'."
        );
      }
    } else if (step === 'DEPENDENT') {
      if (
        lower.includes('aarav') || lower.includes('ആരവ്') || lower.includes('child') || 
        lower.includes('son') || lower.includes('മകൻ') || lower.includes('കുട്ടി')
      ) {
        const aarav = dependents.find(d => d.name.toLowerCase().includes('aarav')) || { id: 6, name: "Aarav (Child)" };
        handleSelectDependent(aarav.id, aarav.name);
      } else if (
        lower.includes('diya') || lower.includes('ദിയ') || lower.includes('daughter') || lower.includes('മകൾ')
      ) {
        const diya = dependents.find(d => d.name.toLowerCase().includes('diya')) || { id: 4, name: "Diya (Child)" };
        handleSelectDependent(diya.id, diya.name);
      } else if (
        lower.includes('myself') || lower.includes('me') || lower.includes('self') || 
        lower.includes('എനിക്ക്') || lower.includes('സ്വന്തം')
      ) {
        handleSelectDependent(currentPatient.id, currentPatient.name);
      } else {
        addUserMessage(cleanText);
        addAiMessage(
          language === 'ml'
            ? "നിങ്ങൾക്കാണോ അതോ മകൻ Aarav-നാണോ ബുക്ക് ചെയ്യേണ്ടത്?"
            : "Would you like to book for yourself or your child Aarav?"
        );
      }
    } else if (step === 'DEPARTMENT') {
      handleSelectDept(cleanText);
    } else if (step === 'SLOT') {
      if (lower.includes('9') || lower.includes('nine') || lower.includes('ഒൻപത്') || lower.includes('രാവിലെ 9')) {
        handleSelectSlot("09:30 AM");
      } else if (lower.includes('10') || lower.includes('ten') || lower.includes('പത്ത്') || lower.includes('രാവിലെ 10')) {
        handleSelectSlot("10:00 AM");
      } else if (lower.includes('11') || lower.includes('eleven') || lower.includes('പതിനൊന്ന്')) {
        handleSelectSlot("11:15 AM");
      } else if (lower.includes('2') || lower.includes('two') || lower.includes('രണ്ട്') || lower.includes('ഉച്ചയ്ക്ക്')) {
        handleSelectSlot("02:00 PM");
      } else {
        handleSelectSlot("10:00 AM");
      }
    } else if (step === 'CONFIRM') {
      if (
        lower.includes('yes') || lower.includes('confirm') || lower.includes('book') || 
        lower.includes('ok') || lower.includes('sure') || lower.includes('അതെ') || 
        lower.includes('ഉറപ്പാക്കാം') || lower.includes('ശരി') || lower.includes('ബുക്ക് ചെയ്യുക')
      ) {
        handleConfirmBooking();
      } else if (
        lower.includes('no') || lower.includes('change') || lower.includes('വേണ്ട') || 
        lower.includes('മാറ്റുക') || lower.includes('വേറെ')
      ) {
        setStep('DEPARTMENT');
        addAiMessage(
          language === 'ml'
            ? "മനസ്സിലായി. ഏത് വിഭാഗത്തിലെ ഡോക്ടറെയാണ് മാറ്റേണ്ടത്?"
            : "Understood. Which department or doctor would you prefer?"
        );
      } else {
        addUserMessage(cleanText);
        addAiMessage(
          language === 'ml'
            ? "ഡിജിറ്റൽ പാസ്സ് തയ്യാറാക്കാൻ 'ഉറപ്പാക്കാം' എന്ന് പറയുക, അല്ലെങ്കിൽ മാറ്റാൻ 'മാറ്റുക' എന്ന് പറയുക."
            : "Please say 'Yes, confirm' to generate your digital pass, or 'change' to pick a different department."
        );
      }
    }
  };

  // Toggle Live Microphone Listening (Configured for ml-IN or en-IN)
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognizer = createSpeechRecognizer(
      language,
      (spokenText) => {
        setIsListening(false);
        handleSpokenInput(spokenText);
      },
      (error) => {
        console.warn("Speech recognition notice:", error);
        setIsListening(false);
      }
    );

    if (recognizer) {
      try {
        recognizer.start();
        recognitionRef.current = recognizer;
        setIsListening(true);
      } catch (e) {
        console.warn("Speech recognizer start error:", e);
      }
    } else {
      setErrorMessage(
        language === 'ml'
          ? "ബ്രൗസറിൽ മൈക്രോഫോൺ ലഭ്യമല്ല. ദയവായി താഴെയുള്ള ഓപ്ഷനുകൾ ക്ലിക്ക് ചെയ്യുക."
          : "Speech recognition not supported in this browser. Please click the quick speech options."
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col lg:flex-row max-h-[92vh]">
        
        {/* Left Side: Phone Device Interface */}
        <div className={`lg:w-7/12 flex flex-col bg-slate-900 text-white ${activeMobileTab === 'call' ? 'flex' : 'hidden lg:flex'}`}>
          
          {/* Top Status Bar */}
          <div className="bg-slate-950 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[130px] min-[380px]:max-w-none">
                {t('voice.modalHeaderTitle')}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-900/60 text-sky-300 font-mono shrink-0">
                {t('voice.modalHotline')}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Language pill indicator */}
              <button
                onClick={() => setLanguage(language === 'ml' ? 'en' : 'ml')}
                className="px-2 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-sky-300 text-[11px] font-bold border border-slate-700 cursor-pointer min-h-[32px] flex items-center"
                title="Toggle English / മലയാളം"
              >
                {language === 'ml' ? 'മലയാളം' : 'English'}
              </button>

              {/* Live Microphone Toggle */}
              {callStatus === 'CONNECTED' && (
                <button
                  onClick={toggleListening}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[32px] ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-900/50'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title={isListening ? "Listening to your voice... Click to pause" : "Click to speak via microphone"}
                >
                  {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5 text-slate-400" />}
                  <span className="hidden min-[400px]:inline">{isListening ? t('voice.micListening') : t('voice.micMuted')}</span>
                </button>
              )}

              {/* Audio Volume Mute Toggle */}
              <button
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center ${
                  isAudioEnabled ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
                title={isAudioEnabled ? 'Audio Mute' : 'Audio Unmute'}
              >
                {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 cursor-pointer min-h-[32px] flex items-center"
              >
                ✕ <span className="hidden min-[380px]:inline ml-1">{t('common.close')}</span>
              </button>
            </div>
          </div>

          {/* Mobile Screen Tab Switcher (< lg) */}
          <div className="lg:hidden flex border-b border-slate-800 bg-slate-950 px-3 py-1.5 gap-2">
            <button
              onClick={() => setActiveMobileTab('call')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[38px] cursor-pointer ${
                activeMobileTab === 'call'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{language === 'ml' ? 'കോൾ & വോയ്സ്' : 'Call Interface'}</span>
            </button>

            <button
              onClick={() => setActiveMobileTab('tools')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[38px] cursor-pointer ${
                activeMobileTab === 'tools'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{language === 'ml' ? 'ടൂൾ ലോഗുകൾ' : 'Gemini Tools'}</span>
              {toolCalls.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 rounded-full font-mono">
                  {toolCalls.length}
                </span>
              )}
            </button>
          </div>

          {/* AI Voice Equalizer & Persona Banner */}
          <div className="bg-linear-to-b from-slate-950 to-slate-900 p-3 sm:p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-2xl bg-sky-700 flex items-center justify-center text-white shadow-lg shrink-0 ${isSpeaking ? 'ring-4 ring-sky-400/40 animate-pulse' : ''}`}>
                  <PhoneCall className="w-5 sm:w-6 h-5 sm:h-6" />
                </div>
                {callStatus === 'CONNECTED' && (
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-snug">{t('voice.agentName')}</h3>
                <p className="text-[11px] text-slate-400">
                  {callStatus === 'CONNECTED' ? t('voice.agentStatusLive') : t('voice.agentStatusStandby')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* ACCESSIBILITY: High visibility "Repeat Audio" button for elderly users */}
              {callStatus === 'CONNECTED' && (
                <button
                  onClick={handleRepeatAudio}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer min-h-[36px]"
                  title="Repeat the last spoken AI message"
                >
                  <Volume1 className="w-3.5 h-3.5" />
                  <span>{t('voice.repeatButton')}</span>
                </button>
              )}

              {/* Audio Waveform visualization */}
              {callStatus === 'CONNECTED' && (
                <div className="hidden min-[420px]:flex items-center gap-1 h-8 px-2.5 bg-slate-800/80 rounded-xl border border-slate-700/50">
                  <span className={`w-1 bg-sky-400 rounded-full ${isSpeaking || isListening ? 'animate-wave-1' : 'h-2'}`} />
                  <span className={`w-1 bg-sky-400 rounded-full ${isSpeaking || isListening ? 'animate-wave-2' : 'h-3'}`} />
                  <span className={`w-1 bg-sky-400 rounded-full ${isSpeaking || isListening ? 'animate-wave-3' : 'h-4'}`} />
                  <span className={`w-1 bg-sky-400 rounded-full ${isSpeaking || isListening ? 'animate-wave-4' : 'h-2'}`} />
                  <span className={`w-1 bg-sky-400 rounded-full ${isSpeaking || isListening ? 'animate-wave-5' : 'h-3'}`} />
                </div>
              )}
            </div>
          </div>

          {/* Conversation Chat Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[260px] max-h-[340px] bg-slate-900/90 text-xs">
            {callStatus === 'IDLE' && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-sky-400 shadow-inner">
                  <PhoneCall className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-semibold text-slate-200 text-sm">
                    {language === 'ml' ? 'വോയ്സ് വഴി ബുക്ക് ചെയ്യാൻ തയ്യാറാണോ?' : 'Ready to Book by Voice?'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    {language === 'ml' 
                      ? 'കോൾ ആരംഭിക്കുകയോ ഡെമോ ബട്ടൺ ക്ലിക്ക് ചെയ്യുകയോ ചെയ്യുക.' 
                      : 'Start call or click 1-Click Demo to simulate Indian Govt hospital booking in seconds.'}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <button
                    onClick={handleStartCall}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>{language === 'ml' ? 'കോൾ തുടങ്ങുക' : 'Start Call'}</span>
                  </button>
                  <button
                    onClick={handle1ClickMlDemo}
                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{t('voice.btnMlDemo')}</span>
                  </button>
                  <button
                    onClick={() => handle1ClickDemo('9876543210')}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{t('voice.btnAaravDemo')}</span>
                  </button>
                </div>
              </div>
            )}

            {transcript.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-br-xs'
                      : 'bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700/60 shadow-sm'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-500 px-1 mt-0.5">{msg.time}</span>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Interactive Step Controls / Quick Speech Bubbles */}
          {callStatus === 'CONNECTED' && (
            <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
              
              {errorMessage && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/50 p-2 rounded-lg border border-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Voice Helper Tag */}
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Mic className="w-3 h-3 text-sky-400" />
                  <span>{t('voice.quickOptionsTip')}</span>
                </span>
                <span className="text-[10px] text-slate-500 italic">{t('voice.sayRepeatTip')}</span>
              </div>

              {/* Step: PHONE */}
              {step === 'PHONE' && (
                <div className="space-y-2.5">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handlePhoneSubmit('9876543210')}
                      className="px-3.5 py-2 bg-sky-700 hover:bg-sky-600 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer min-h-[42px] inline-flex items-center"
                    >
                      "9876543210" ({language === 'ml' ? 'അനന്യ - കുട്ടിക്ക്' : 'Ananya - Self / Child'})
                    </button>
                    <button
                      onClick={() => handlePhoneSubmit('9123456780')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-300 border border-slate-700 cursor-pointer min-h-[42px] inline-flex items-center"
                    >
                      "9123456780" ({language === 'ml' ? 'മീര - രക്ഷിതാവ്' : 'Meera - Guardian'})
                    </button>
                    <button
                      onClick={handleNoUhid}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-amber-300 border border-slate-700 cursor-pointer min-h-[42px] inline-flex items-center"
                    >
                      {t('voice.noUhidOption')}
                    </button>
                  </div>

                  {/* Kerala Government Booking Option */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-slate-300 font-medium">{t('voice.noUhidBannerTitle')}</span>
                    <button
                      onClick={() => window.open('https://ehealth.kerala.gov.in', '_blank', 'noopener,noreferrer')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer min-h-[38px]"
                    >
                      <span>{t('voice.btnGovtSystem')}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {showGovBooking && step !== 'PHONE' && (
                <div className="p-3 bg-emerald-950/70 border border-emerald-700/80 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300">{t('voice.noUhidBannerTitle')}</span>
                    <span className="text-[10px] bg-emerald-900/90 text-emerald-200 px-2 py-0.5 rounded-full font-semibold border border-emerald-700">
                      e-Health
                    </span>
                  </div>
                  <button
                    onClick={() => window.open('https://ehealth.kerala.gov.in', '_blank', 'noopener,noreferrer')}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer min-h-[44px]"
                  >
                    <span>{t('voice.btnGovtSystem')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Step: OTP */}
              {step === 'OTP' && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleOtpSubmit('583921')}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer min-h-[42px] inline-flex items-center"
                    >
                      "5-8-3-9-2-1" ({language === 'ml' ? 'ഡെമോ ഒ.ടി.പി.' : 'Valid Demo OTP'})
                    </button>
                    <button
                      onClick={() => handleOtpSubmit('999999')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-rose-300 border border-slate-700 cursor-pointer min-h-[42px] inline-flex items-center"
                    >
                      {language === 'ml' ? 'തെറ്റായ കോഡ് പരിശോധിക്കുക' : 'Test Wrong Code'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step: DEPENDENT */}
              {step === 'DEPENDENT' && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleSelectDependent(currentPatient.id, currentPatient.name)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-200 border border-slate-700 cursor-pointer min-h-[42px] inline-flex items-center"
                    >
                      {language === 'ml' ? `സ്വന്തം (${currentPatient?.name})` : `Myself (${currentPatient?.name})`}
                    </button>
                    {dependents.map(d => (
                      <button
                        key={d.id}
                        onClick={() => handleSelectDependent(d.id, `${d.name} (${d.relationship})`)}
                        className="px-3.5 py-2 bg-sky-700 hover:bg-sky-600 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer min-h-[42px] inline-flex items-center"
                      >
                        {language === 'ml' ? `കുട്ടി: ${d.name} (${d.age} വയസ്സ്)` : `Child: ${d.name} (${d.age}y)`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step: DEPARTMENT */}
              {step === 'DEPARTMENT' && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleSelectDept("Eye doctor")}
                      className="px-3.5 py-2 bg-sky-700 hover:bg-sky-600 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer min-h-[42px] inline-flex items-center"
                    >
                      {language === 'ml' ? '"കണ്ണ് ഡോക്ടർ" (Ophthalmology)' : '"Eye doctor" (Ophthalmology)'}
                    </button>
                    <button
                      onClick={() => handleSelectDept("Child specialist")}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-200 border border-slate-700 cursor-pointer min-h-[42px] inline-flex items-center"
                    >
                      {language === 'ml' ? '"കുട്ടികളുടെ ഡോക്ടർ" (Pediatrics)' : '"Child specialist" (Pediatrics)'}
                    </button>
                    <button
                      onClick={() => handleSelectDept("Fever and cold")}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-200 border border-slate-700 cursor-pointer min-h-[42px] inline-flex items-center"
                    >
                      {language === 'ml' ? '"പനി, ചുമ" (General Med)' : '"Fever & cold" (General Med)'}
                    </button>
                    <button
                      onClick={() => handleSelectDept("Heart doctor")}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-200 border border-slate-700 cursor-pointer min-h-[42px] inline-flex items-center"
                    >
                      {language === 'ml' ? '"ഹൃദ്രോഗം" (Cardiology)' : '"Heart" (Cardiology)'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step: SLOT */}
              {step === 'SLOT' && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {["09:30 AM", "10:00 AM", "11:15 AM", "02:00 PM"].map(s => (
                      <button
                        key={s}
                        onClick={() => handleSelectSlot(s)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[42px] inline-flex items-center justify-center ${
                          s === '10:00 AM'
                            ? 'bg-sky-700 hover:bg-sky-600 text-white ring-2 ring-sky-400'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step: CONFIRM */}
              {step === 'CONFIRM' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleConfirmBooking}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95 min-h-[46px]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('voice.btnConfirmBooking')}</span>
                  </button>
                  <button
                    onClick={() => setStep('DEPARTMENT')}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer min-h-[46px] inline-flex items-center"
                  >
                    {t('voice.btnChange')}
                  </button>
                </div>
              )}

              {/* Step: COMPLETED */}
              {step === 'COMPLETED' && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-700/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> {t('voice.passIssued')}: {bookedPass?.appointment_id}
                    </span>
                    <span className="text-[10px] bg-emerald-800 text-white px-2 py-0.5 rounded-full font-bold">
                      {bookedPass?.room} • Floor {bookedPass?.floor}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={onClose}
                      className="flex-1 py-2 bg-white text-slate-900 font-bold rounded-lg text-xs hover:bg-slate-100 cursor-pointer"
                    >
                      {t('voice.btnViewPass')}
                    </button>
                    <button
                      onClick={handleStartCall}
                      className="px-3 py-2 bg-slate-800 text-slate-300 font-semibold rounded-lg text-xs hover:bg-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{t('voice.btnNewCall')}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Call Disconnect & Step Back Button */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    if (step === 'CONFIRM') setStep('SLOT');
                    else if (step === 'SLOT') setStep('DEPARTMENT');
                    else if (step === 'DEPARTMENT') setStep('DEPENDENT');
                    else if (step === 'DEPENDENT') setStep('OTP');
                    else if (step === 'OTP') setStep('PHONE');
                  }}
                  className="flex items-center gap-1 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t('voice.btnGoBack')}</span>
                </button>

                <button
                  onClick={handleEndCall}
                  className="flex items-center gap-1 text-rose-400 hover:text-rose-300 text-xs font-semibold cursor-pointer"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span>{t('voice.btnEndCall')}</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Right Side: Real-time Backend Tool Calling Drawer */}
        <div className={`lg:w-5/12 bg-slate-950 p-4 sm:p-5 flex flex-col border-t lg:border-t-0 lg:border-l border-slate-800 text-slate-300 overflow-y-auto max-h-[70vh] lg:max-h-[92vh] ${activeMobileTab === 'tools' ? 'flex' : 'hidden lg:flex'}`}>
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {t('voice.drawerTitle')}
              </h4>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
              Gemini Tool Calls
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            {t('voice.drawerSubtitle')}
          </p>

          {/* Tool Invocations List */}
          <div className="mt-4 space-y-3 flex-1 overflow-y-auto">
            {toolCalls.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-xs italic">
                {t('voice.drawerWaiting')}
              </div>
            ) : (
              toolCalls.map((tc, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-sky-400 font-bold">⚡ {tc.name}()</span>
                    <span className="text-[9px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                      SUCCESS
                    </span>
                  </div>
                  
                  {/* Arguments */}
                  <div>
                    <span className="text-[10px] text-slate-500 block">PARAMS:</span>
                    <pre className="text-[10px] text-slate-300 bg-slate-950 p-1.5 rounded overflow-x-auto">
                      {JSON.stringify(tc.args, null, 2)}
                    </pre>
                  </div>

                  {/* Result */}
                  <div>
                    <span className="text-[10px] text-slate-500 block">RESULT:</span>
                    <pre className="text-[10px] text-emerald-300 bg-slate-950 p-1.5 rounded overflow-x-auto">
                      {JSON.stringify(tc.result, null, 2)}
                    </pre>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Privacy & Security Tag */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <strong>Security Model:</strong> {t('voice.securityTag')}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
