/**
 * VEGAM Malayalam Medical Glossary & Speech Ontology
 * Provides authentic Kerala healthcare department mappings, code-switched phrases,
 * spoken digit normalization, and clinical synonyms.
 */

export const MALAYALAM_MEDICAL_GLOSSARY = {
  Ophthalmology: {
    englishName: "Ophthalmology",
    malayalamName: "നേത്രരോഗ വിഭാഗം",
    displayTag: "നേത്രരോഗ വിഭാഗം (Ophthalmology)",
    commonTerms: ["കണ്ണ് ഡോക്ടർ", "നേത്രരോഗം", "കാഴ്ച", "കണ്ണട", "തിമിരം"],
    synonyms: [
      "കണ്ണ്", "കണ്ണു", "കണ്ണട", "കാഴ്ച", "തിമിരം", "നേത്ര", "നേത്രരോഗം", "നേത്രരോഗ വിഭാഗം",
      "eye", "vision", "cataract", "glasses", "sight", "optometry", "eye doctor", "eyes", "ophthalmology"
    ]
  },
  Pediatrics: {
    englishName: "Pediatrics",
    malayalamName: "ശിശുരോഗ വിഭാഗം",
    displayTag: "ശിശുരോഗ വിഭാഗം (Pediatrics)",
    commonTerms: ["കുട്ടികളുടെ ഡോക്ടർ", "ശിശുരോഗം", "കുഞ്ഞുങ്ങൾ", "പീഡിയാട്രിക്സ്"],
    synonyms: [
      "കുട്ടി", "കുട്ടികൾ", "കുട്ടികളുടെ", "കുഞ്ഞുങ്ങൾ", "ശിശു", "ശിശുരോഗം", "പീഡിയാട്രിക്സ്",
      "child", "baby", "kid", "infant", "pediatrician", "children", "child doctor", "kids", "pediatrics"
    ]
  },
  GeneralMedicine: {
    englishName: "General Medicine",
    malayalamName: "ജനറൽ മെഡിസിൻ",
    displayTag: "ജനറൽ മെഡിസിൻ (General Medicine)",
    commonTerms: ["പനി", "ചുമ", "ജലദോഷം", "തലവേദന", "പൊതുചികിത്സ"],
    synonyms: [
      "പനി", "ചുമ", "ജലദോഷം", "തലവേദന", "ശരീരവേദന", "ക്ഷീണം", "ജനറൽ", "മെഡിസിൻ", "ഡോക്ടർ",
      "fever", "cold", "cough", "doctor", "headache", "general", "physician", "body ache", "flu", "general medicine"
    ]
  },
  Cardiology: {
    englishName: "Cardiology",
    malayalamName: "കാർഡിയോളജി",
    displayTag: "ഹൃദ്രോഗ വിഭാഗം (Cardiology)",
    commonTerms: ["ഹൃദയം", "നെഞ്ചുവേദന", "കാർഡിയോളജി", "പ്രഷർ"],
    synonyms: [
      "ഹൃദയം", "നെഞ്ച്", "നെഞ്ചുവേദന", "ശ്വാസംമുട്ടൽ", "പ്രഷർ", "കാർഡിയോളജി", "ഹൃദ്രോഗം", "ഹാർട്ട്",
      "heart", "cardio", "chest pain", "bp", "hypertension", "cardiologist", "cardiology"
    ]
  },
  Orthopedics: {
    englishName: "Orthopedics",
    malayalamName: "അസ്ഥിരോഗ വിഭാഗം",
    displayTag: "അസ്ഥിരോഗ വിഭാഗം (Orthopedics)",
    commonTerms: ["എല്ല്", "മുട്ടുവേദന", "ഫ്രാക്ചർ", "ഓർത്തോ"],
    synonyms: [
      "എല്ല്", "അസ്ഥി", "മുട്ട്", "മുട്ടുവേദന", "നടുവേദന", "ഫ്രാക്ചർ", "ഓർത്തോ", "ഓർത്തോപീഡിക്സ്",
      "bone", "fracture", "joint", "orthopedic", "ortho", "knee pain", "back pain", "orthopedics"
    ]
  },
  ENT: {
    englishName: "ENT",
    malayalamName: "ഇ.എൻ.ടി വിഭാഗം",
    displayTag: "ഇ.എൻ.ടി (ENT)",
    commonTerms: ["ചെവി", "മൂക്ക്", "തൊണ്ട"],
    synonyms: [
      "ചെവി", "മൂക്ക്", "തൊണ്ട", "ശബ്ദം", "ഇ.എൻ.ടി", "ഇഎൻടി",
      "ear", "nose", "throat", "ent", "tonsils", "hearing"
    ]
  }
};

// Convert spoken Malayalam words or digits into numeric string
export function parseSpokenNumber(text) {
  if (!text) return "";
  const mlDigitsMap = {
    "പൂജ്യം": "0", "പൂജ്യം ": "0",
    "ഒന്ന്": "1", "ഒന്ന": "1", "വൺ": "1",
    "രണ്ട്": "2", "രണ്ട": "2", "ടു": "2",
    "മൂന്ന്": "3", "മൂന്ന": "3", "ത്രീ": "3",
    "നാല്": "4", "നാല": "4", "ഫോർ": "4",
    "അഞ്ച്": "5", "അഞ്ച": "5", "ഫൈവ്": "5",
    "ആറ്": "6", "ആറ": "6", "സിക്സ്": "6",
    "ഏഴ്": "7", "ഏഴ": "7", "സെവൻ": "7",
    "എട്ട്": "8", "എട്ട": "8", "എയ്റ്റ്": "8",
    "ഒൻപത്": "9", "ഒമ്പത്": "9", "നയൻ": "9",
    // English words
    "zero": "0", "oh": "0", "one": "1", "two": "2", "three": "3",
    "four": "4", "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9"
  };

  let normalized = text.toLowerCase();
  for (const [word, digit] of Object.entries(mlDigitsMap)) {
    const reg = new RegExp(`\\b${word}\\b`, 'g');
    normalized = normalized.replace(reg, digit);
  }
  return normalized.replace(/\D/g, '');
}

// Check if spoken phrase matches Malayalam intent
export function matchDepartmentFromMalayalam(text) {
  if (!text) return null;
  const clean = text.toLowerCase();
  for (const [key, dept] of Object.entries(MALAYALAM_MEDICAL_GLOSSARY)) {
    if (dept.synonyms.some(syn => clean.includes(syn.toLowerCase()))) {
      return dept.englishName;
    }
  }
  return null;
}

/**
 * Normalizes Malayalam-English code-switched phrases
 * e.g., "cardiology department-ൽ" -> "cardiology department"
 *       "doctor-നെ" -> "doctor"
 *       "Aarav-ന്റെ" -> "Aarav"
 */
export function cleanCodeSwitching(text) {
  if (!text) return "";
  return text
    .replace(/-(ൽ|ിൽ|നെ|ന്റെ|ക്ക്|നോട്|മായി|ഇൽ)/g, '')
    .replace(/\b(department-ൽ|departmentil)\b/gi, 'department')
    .replace(/\b(doctor-നെ|doctorne)\b/gi, 'doctor')
    .trim();
}

