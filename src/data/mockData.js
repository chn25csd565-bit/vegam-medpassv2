/**
 * MEDIPASS Local / Offline Data Store
 * Matches FastAPI SQLite schema and seed records from FILE.md
 */

export const INITIAL_PATIENTS = [
  {
    id: 1,
    name: "Ananya",
    dob: "12-06-2005",
    phone: "9876543210",
    uhid: "1234567890123456",
    aadhaar_verified: true,
    dependents: [
      {
        id: 6,
        name: "Aarav",
        dob: "12-05-2020",
        relationship: "Child / Dependent",
        uhid: "3456789012345678",
        age: 6
      }
    ]
  },
  {
    id: 2,
    name: "Meera",
    dob: "05-09-1988",
    phone: "9123456780",
    uhid: "2345678901234567",
    aadhaar_verified: true,
    dependents: [
      {
        id: 3,
        name: "Aarav",
        dob: "12-05-2020",
        relationship: "Child (Son)",
        uhid: "3456789012345678",
        age: 6
      },
      {
        id: 4,
        name: "Diya",
        dob: "20-11-2022",
        relationship: "Child (Daughter)",
        uhid: "4567890123456789",
        age: 3
      }
    ]
  },
  {
    id: 5,
    name: "Ramesh Kumar",
    dob: "15-08-1960",
    phone: "9845012345",
    uhid: "5678901234567890",
    aadhaar_verified: true,
    dependents: []
  },
  {
    id: 99,
    name: "Suresh (New Citizen)",
    dob: "10-04-1992",
    phone: "9800000000",
    uhid: null,
    aadhaar_verified: false,
    dependents: []
  }
];

export const INITIAL_DEPARTMENTS = [
  {
    id: 1,
    name: "Ophthalmology",
    block: "Block B (Surgical Wing)",
    floor: 2,
    room: "Room 204",
    icon: "Eye",
    synonyms: [
      "eye", "vision", "cataract", "glasses", "sight", "optometry", "eye doctor", "eyes",
      "കണ്ണ്", "കണ്ണു", "കണ്ണട", "കാഴ്ച", "തിമിരം", "നേത്ര", "നേത്രരോഗം", "നേത്രരോഗ വിഭാഗം"
    ],
    doctors: [
      {
        id: 101,
        name: "Dr. Sharma",
        qualification: "MBBS, MS (Ophthalmology)",
        experience: "14 years",
        slots: ["09:30 AM", "10:00 AM", "11:15 AM", "02:00 PM", "03:30 PM"]
      },
      {
        id: 102,
        name: "Dr. Rajesh Varma",
        qualification: "MBBS, DO",
        experience: "9 years",
        slots: ["10:30 AM", "11:45 AM", "02:30 PM", "04:00 PM"]
      }
    ]
  },
  {
    id: 2,
    name: "Pediatrics",
    block: "Block A (Mother & Child Wing)",
    floor: 1,
    room: "Room 108",
    icon: "Baby",
    synonyms: [
      "child", "baby", "kid", "infant", "pediatrician", "children", "child doctor", "kids",
      "കുട്ടി", "കുട്ടികൾ", "കുട്ടികളുടെ", "കുഞ്ഞുങ്ങൾ", "ശിശു", "ശിശുരോഗം", "പീഡിയാട്രിക്സ്"
    ],
    doctors: [
      {
        id: 201,
        name: "Dr. Sunita Menon",
        qualification: "MBBS, MD (Pediatrics)",
        experience: "12 years",
        slots: ["09:00 AM", "10:15 AM", "11:30 AM", "02:15 PM"]
      },
      {
        id: 202,
        name: "Dr. Anand Rao",
        qualification: "MBBS, DCH",
        experience: "8 years",
        slots: ["10:00 AM", "11:00 AM", "03:00 PM"]
      }
    ]
  },
  {
    id: 3,
    name: "General Medicine",
    block: "Main OPD Block",
    floor: 1,
    room: "Room 102",
    icon: "Stethoscope",
    synonyms: [
      "fever", "cold", "cough", "doctor", "headache", "general", "physician", "body ache", "flu",
      "പനി", "ചുമ", "ജലദോഷം", "തലവേദന", "ശരീരവേദന", "ക്ഷീണം", "ജനറൽ", "മെഡിസിൻ"
    ],
    doctors: [
      {
        id: 301,
        name: "Dr. K. S. Pillai",
        qualification: "MBBS, MD (General Medicine)",
        experience: "18 years",
        slots: ["09:00 AM", "09:45 AM", "10:30 AM", "11:15 AM", "02:00 PM"]
      },
      {
        id: 302,
        name: "Dr. Farhana Begum",
        qualification: "MBBS, DNB",
        experience: "7 years",
        slots: ["10:00 AM", "11:00 AM", "02:30 PM", "03:45 PM"]
      }
    ]
  },
  {
    id: 4,
    name: "Cardiology",
    block: "Super Specialty Block",
    floor: 3,
    room: "Room 305",
    icon: "HeartPulse",
    synonyms: [
      "heart", "chest pain", "cardio", "blood pressure", "bp", "palpitations",
      "ഹൃദയം", "നെഞ്ച്", "നെഞ്ചുവേദന", "ശ്വാസംമുട്ടൽ", "പ്രഷർ", "കാർഡിയോളജി", "ഹൃദ്രോഗം"
    ],
    doctors: [
      {
        id: 401,
        name: "Dr. Venkat Raman",
        qualification: "MBBS, MD, DM (Cardiology)",
        experience: "16 years",
        slots: ["10:00 AM", "11:30 AM", "02:00 PM"]
      }
    ]
  },
  {
    id: 5,
    name: "Orthopedics",
    block: "Block B (Trauma & Ortho Wing)",
    floor: 1,
    room: "Room 114",
    icon: "Activity",
    synonyms: [
      "bone", "joint", "knee", "fracture", "spine", "back pain", "ortho",
      "എല്ല്", "അസ്ഥി", "മുട്ട്", "മുട്ടുവേദന", "നടുവേദന", "ഫ്രാക്ചർ", "ഓർത്തോ"
    ],
    doctors: [
      {
        id: 501,
        name: "Dr. Deepak Nair",
        qualification: "MBBS, MS (Ortho)",
        experience: "11 years",
        slots: ["09:30 AM", "10:45 AM", "12:00 PM", "03:15 PM"]
      }
    ]
  },
  {
    id: 6,
    name: "ENT (Ear, Nose & Throat)",
    block: "Main OPD Block",
    floor: 2,
    room: "Room 210",
    icon: "Headphones",
    synonyms: ["ear", "nose", "throat", "hearing", "sinus", "tonsils"],
    doctors: [
      {
        id: 601,
        name: "Dr. Priya Mathew",
        qualification: "MBBS, MS (ENT)",
        experience: "10 years",
        slots: ["10:00 AM", "11:15 AM", "02:00 PM"]
      }
    ]
  }
];

export const INITIAL_APPOINTMENTS = [
  {
    id: "APT-2026-8801",
    appointment_id: "APT-2026-8801",
    patient_id: 5,
    patient_name: "Ramesh Kumar",
    uhid: "5678901234567890",
    department: "Cardiology",
    doctor: "Dr. Venkat Raman",
    date: "2026-09-15",
    time: "10:00 AM",
    block: "Super Specialty Block",
    floor: 3,
    room: "Room 305",
    status: "Checked In",
    token_number: "OPD-305-#01",
    checked_in_at: "2026-09-15 09:42 AM",
    qr_token: "medipass_token_8801_c9f2"
  },
  {
    id: "APT-2026-8802",
    appointment_id: "APT-2026-8802",
    patient_id: 1,
    patient_name: "Ananya",
    uhid: "1234567890123456",
    department: "Ophthalmology",
    doctor: "Dr. Sharma",
    date: "2026-09-15",
    time: "10:00 AM",
    block: "Block B (Surgical Wing)",
    floor: 2,
    room: "Room 204",
    status: "Booked",
    token_number: null,
    checked_in_at: null,
    qr_token: "medipass_token_8802_a7d4"
  }
];

// Helper functions for local storage persistence
const STORAGE_KEY_APPOINTMENTS = "medipass_appointments";

export function getStoredAppointments() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn("Could not read stored appointments", e);
  }
  return INITIAL_APPOINTMENTS;
}

export function saveStoredAppointments(appointments) {
  try {
    localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(appointments));
  } catch (e) {
    console.warn("Could not save appointments to localStorage", e);
  }
}

export const TRANSLATIONS = {
  en: {
    brandTitle: "MEDIPASS",
    brandBadge: "SevaPass",
    brandSubtitle: "Govt Hospital Outpatient Access",
    voiceBooking: "Voice Booking",
    digitalPasses: "Digital Passes",
    hospitalCheckin: "Hospital Check-In",
    roomNavigation: "Room Navigation",
    opdMonitor: "OPD Monitor",
    heroTitlePrefix: "Skip the Queue.",
    heroTitleHighlight: "Start with a Call.",
    heroSubtitle: "Book outpatient appointments at government hospitals by speaking naturally in your own language. No long registration lines, no typing UHID numbers. Get an instant digital QR pass on your phone and walk directly to your doctor's consultation room.",
    bookByVoice: "Book by AI Voice Call",
    oneClickDemo: "1-Click Full Demo Flow",
    staffCheckin: "Hospital Staff Check-In",
    closingLine: "Less Queue. Less Confusion. More Accessible Healthcare.",
    cancelAppointment: "Cancel Appointment",
    directions: "Directions",
    viewPass: "View Pass & QR",
    namaste: "Namaste",
    activePasses: "Active Outpatient Passes",
    familyDependents: "Linked Family Dependents",
    newBooking: "New Voice Booking"
  },
  hi: {
    brandTitle: "मेडीपास",
    brandBadge: "सेवापास",
    brandSubtitle: "सरकारी अस्पताल बाह्यरोगी (ओपीडी) सेवा",
    voiceBooking: "आवाज़ से बुकिंग",
    digitalPasses: "डिजिटल पास",
    hospitalCheckin: "अस्पताल चेक-इन",
    roomNavigation: "कमरा नेविगेशन",
    opdMonitor: "ओपीडी मॉनिटर",
    heroTitlePrefix: "कतार से बचें।",
    heroTitleHighlight: "एक कॉल से शुरू करें।",
    heroSubtitle: "अपनी भाषा में बोलकर सरकारी अस्पतालों में ओपीडी अपॉइंटमेंट बुक करें। न कोई लंबी लाइन, न कोई नंबर टाइप करना। अपने फोन पर डिजिटल क्यूआर पास पाएं और सीधे डॉक्टर के कमरे में जाएं।",
    bookByVoice: "एआई वॉयस कॉल से बुक करें",
    oneClickDemo: "1-क्लिक पूर्ण डेमो",
    staffCheckin: "अस्पताल स्टाफ चेक-इन",
    closingLine: "कम कतार। कम भ्रम। अधिक सुलभ स्वास्थ्य सेवा।",
    cancelAppointment: "अपॉइंटमेंट रद्द करें",
    directions: "दिशा-निर्देश",
    viewPass: "पास और क्यूआर देखें",
    namaste: "नमस्ते",
    activePasses: "सक्रिय ओपीडी पास",
    familyDependents: "परिवार के आश्रित सदस्य",
    newBooking: "नई वॉयस बुकिंग"
  },
  ml: {
    brandTitle: "മെഡിപാസ്",
    brandBadge: "സേവാപാസ്",
    brandSubtitle: "സർക്കാർ ആശുപത്രി ഒപി ഡിജിറ്റൽ പാസ്",
    voiceBooking: "വോയ്‌സ് ബുക്കിംഗ്",
    digitalPasses: "ഡിജിറ്റൽ പാസുകൾ",
    hospitalCheckin: "ആശുപത്രി ചെക്ക്-ഇൻ",
    roomNavigation: "റൂം വഴികാട്ടി",
    opdMonitor: "ഒപി മോണിറ്റർ",
    heroTitlePrefix: "വരി നിൽക്കേണ്ടതില്ല.",
    heroTitleHighlight: "ഒരു കോളിൽ തുടങ്ങാം.",
    heroSubtitle: "നിങ്ങളുടെ സ്വന്തം ഭാഷയിൽ സംസാരിച്ച് സർക്കാർ ആശുപത്രികളിൽ ഒപി അപ്പോയിന്റ്മെന്റുകൾ ബുക്ക് ചെയ്യുക. ഫോണിൽ തത്സമയം ക്യുആർ പാസ് നേടുക, നേരിട്ട് ഡോക്ടറുടെ അടുത്തേക്ക് നടക്കുക.",
    bookByVoice: "എഐ വോയ്‌സ് കോൾ ബുക്കിംഗ്",
    oneClickDemo: "1-ക്ലിക്ക് ഡെമോ",
    staffCheckin: "സ്റ്റാഫ് ചെക്ക്-ഇൻ കൗണ്ടർ",
    closingLine: "കുറഞ്ഞ ക്യൂ. കുറഞ്ഞ ആശങ്ക. മികച്ച ആരോഗ്യപരിരക്ഷ.",
    cancelAppointment: "അപ്പോയിന്റ്മെന്റ് റദ്ദാക്കുക",
    directions: "വഴികാട്ടി",
    viewPass: "പാസ് & ക്യുആർ കാണുക",
    namaste: "നമസ്കാരം",
    activePasses: "സജീവ ഒപി പാസുകൾ",
    familyDependents: "കുടുംബാംഗങ്ങൾ (ആശ്രിതർ)",
    newBooking: "പുതിയ വോയ്‌സ് ബുക്കിംഗ്"
  }
};

