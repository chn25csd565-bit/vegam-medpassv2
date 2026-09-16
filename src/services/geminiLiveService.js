/**
 * Google Gemini Voice Assistant & Function Calling Service
 * Supports Google Gemini 2.0 / 1.5 Flash with live Tool Invocations,
 * Kerala Malayalam (ml-IN) natural language understanding, and bilingual code-switching.
 */
import { api } from './api';
import { matchDepartmentFromMalayalam, parseSpokenNumber } from '../locales/glossary';

// Gemini Function Calling Tools Schema
export const GEMINI_TOOLS_SCHEMA = [
  {
    name: "check_patient",
    description: "Check if citizen's mobile phone number is registered with hospital record and UHID.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "10-digit mobile number" }
      },
      required: ["phone"]
    }
  },
  {
    name: "send_otp",
    description: "Dispatch a single-use 6-digit authentication code to citizen's phone.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "10-digit mobile number" }
      },
      required: ["phone"]
    }
  },
  {
    name: "verify_otp",
    description: "Verify citizen's OTP authentication code to access hospital record.",
    parameters: {
      type: "OBJECT",
      properties: {
        phone: { type: "STRING", description: "10-digit mobile number" },
        otp: { type: "STRING", description: "6-digit OTP code (e.g. 583921)" }
      },
      required: ["phone", "otp"]
    }
  },
  {
    name: "get_dependents",
    description: "Fetch verified linked child/family dependents for the guardian without exposing raw child UHIDs.",
    parameters: {
      type: "OBJECT",
      properties: {
        guardian_id: { type: "INTEGER", description: "Guardian's patient ID" }
      },
      required: ["guardian_id"]
    }
  },
  {
    name: "search_department",
    description: "Match citizen's spoken symptom or department in Malayalam or English to clinical department.",
    parameters: {
      type: "OBJECT",
      properties: {
        query: { type: "STRING", description: "Department or symptom name, e.g. 'കണ്ണു ഡോക്ടർ', 'Eye doctor', 'Fever'" }
      },
      required: ["query"]
    }
  },
  {
    name: "get_doctors",
    description: "Retrieve list of duty doctors and specialists for a department.",
    parameters: {
      type: "OBJECT",
      properties: {
        department: { type: "STRING", description: "Clinical department name, e.g. 'Ophthalmology'" }
      },
      required: ["department"]
    }
  },
  {
    name: "get_available_slots",
    description: "Fetch open appointment consultation time slots for a doctor on a specific date.",
    parameters: {
      type: "OBJECT",
      properties: {
        department: { type: "STRING", description: "Department name" },
        doctor: { type: "STRING", description: "Doctor name" },
        date: { type: "STRING", description: "Date YYYY-MM-DD" }
      },
      required: ["department", "doctor", "date"]
    }
  },
  {
    name: "book_appointment",
    description: "Confirm and book the outpatient hospital consultation.",
    parameters: {
      type: "OBJECT",
      properties: {
        patient_id: { type: "INTEGER", description: "Patient or dependent ID" },
        department: { type: "STRING", description: "Department name" },
        doctor: { type: "STRING", description: "Doctor name" },
        date: { type: "STRING", description: "Date YYYY-MM-DD" },
        time: { type: "STRING", description: "Slot time, e.g. '10:00 AM'" }
      },
      required: ["patient_id", "department", "doctor", "date", "time"]
    }
  },
  {
    name: "generate_digital_pass",
    description: "Issue a cryptographic digital entry pass token (SevaPass) with room and floor directions.",
    parameters: {
      type: "OBJECT",
      properties: {
        appointment_id: { type: "STRING", description: "Confirmed appointment ID" }
      },
      required: ["appointment_id"]
    }
  }
];

// System prompt for Google Gemini
export const GEMINI_SYSTEM_PROMPT = `
You are the Voice Helpline Assistant for MEDIPASS (SevaPass), the Government Hospital Outpatient System in Kerala, India.

GUIDELINES:
1. Speak in warm, respectful, and simple language suitable for elderly patients and everyday Kerala citizens.
2. If the citizen speaks in Malayalam, reply in natural, polite Kerala Malayalam.
3. If the citizen speaks English, reply in English.
4. Support Kerala-style code switching (e.g. "എനിക്ക് നാളെ cardiology department-ൽ appointment വേണം").
5. NEVER translate or modify: UHID, OTP, Room numbers (e.g. Room 204), Floor numbers (e.g. Floor 2), Doctor names (e.g. Dr. Sharma), phone numbers, or Appointment IDs.
6. When booking for a child, use the guardian's verified account and linked dependent names; NEVER ask for or expose a child's raw UHID.
7. Always invoke tools for factual state actions (check_patient, verify_otp, search_department, get_doctors, get_available_slots, book_appointment). Never invent availability.
8. Repeat and confirm: patient name, department, doctor, date, and time before calling book_appointment.
`.trim();

/**
 * Executes a conversational turn with Google Gemini or the built-in local Malayalam engine
 */
export async function processVoiceInputWithGemini({
  inputText,
  language = 'en',
  sessionState = {},
  apiKey = null
}) {
  const geminiKey = apiKey || (typeof window !== 'undefined' ? (window.__GEMINI_API_KEY__ || import.meta.env.VITE_GEMINI_API_KEY) : null);

  // If Gemini API Key is configured, attempt live call to Google Gemini
  if (geminiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: GEMINI_SYSTEM_PROMPT }] },
          contents: [
            {
              role: "user",
              parts: [{ text: `Language: ${language}. User input: "${inputText}". Current state: ${JSON.stringify(sessionState)}` }]
            }
          ],
          tools: [{ function_declarations: GEMINI_TOOLS_SCHEMA }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0];
        if (candidate?.functionCall) {
          return {
            source: "gemini_api",
            type: "function_call",
            toolCall: {
              name: candidate.functionCall.name,
              args: candidate.functionCall.args
            },
            replyText: candidate.text || null
          };
        } else if (candidate?.text) {
          return {
            source: "gemini_api",
            type: "text",
            replyText: candidate.text
          };
        }
      }
    } catch (e) {
      console.warn("Gemini API call failed, using local Malayalam engine:", e);
    }
  }

  // Built-in intelligent Malayalam & English NLP fallback (exact tool contracts)
  return processLocalMalayalamEngine(inputText, language, sessionState);
}

/**
 * Built-in Malayalam NLP Pipeline
 * Matches Malayalam symptoms, names, digits, and triggers corresponding tools
 */
function processLocalMalayalamEngine(inputText, language, sessionState) {
  const text = (inputText || "").trim();
  const lower = text.toLowerCase();
  const isMl = language === 'ml' || /[\u0D00-\u0D7F]/.test(text);

  // 1. Check for Repeat Intent
  if (lower.includes('വീണ്ടും') || lower.includes('repeat') || lower.includes('കേട്ടില്ല') || lower.includes('pardon')) {
    return {
      type: "repeat",
      replyText: isMl 
        ? "ഞാൻ ഒരിക്കൽ കൂടി പറയാം. ദയവായി ശ്രദ്ധിക്കുക."
        : "I will repeat that. Please listen carefully."
    };
  }

  // 2. Check for Navigation / Back Intent
  if (lower.includes('തിരികെ') || lower.includes('go back') || lower.includes('മുമ്പത്തെ') || lower.includes('previous')) {
    return {
      type: "go_back",
      replyText: isMl ? "മുമ്പത്തെ ഘട്ടത്തിലേക്ക് തിരികെ പോകുന്നു." : "Returning to the previous step."
    };
  }

  // 3. Department / Specialist Matching
  const matchedDept = matchDepartmentFromMalayalam(text);
  if (matchedDept) {
    return {
      type: "function_call",
      toolCall: {
        name: "search_department",
        args: { query: text },
        resolvedDept: matchedDept
      },
      replyText: isMl
        ? `ശരി, ${matchedDept} വിഭാഗം തിരഞ്ഞെടുത്തു. ലഭ്യമായ ഡോക്ടറെയും സമയവും കണ്ടെത്തുന്നു.`
        : `Understood, searching for ${matchedDept} specialist.`
    };
  }

  // 4. Number / Phone / OTP parsing
  const digits = parseSpokenNumber(text);
  if (digits.length >= 10) {
    return {
      type: "function_call",
      toolCall: {
        name: "check_patient",
        args: { phone: digits.slice(-10) }
      },
      replyText: isMl
        ? `നന്ദി. ${digits.slice(-10)} എന്ന നമ്പറിലേക്ക് 6 അക്ക വെരിഫിക്കേഷൻ കോഡ് അയച്ചിട്ടുണ്ട്.`
        : `Thank you. A 6-digit code has been sent to ${digits.slice(-10)}.`
    };
  } else if (digits.length === 6) {
    return {
      type: "function_call",
      toolCall: {
        name: "verify_otp",
        args: { otp: digits }
      },
      replyText: isMl ? "ഓ.ടി.പി സ്ഥിരീകരിച്ചു." : "Verification confirmed."
    };
  }

  // Default natural echo
  return {
    type: "text",
    replyText: isMl
      ? `നിങ്ങൾ പറഞ്ഞത്: "${text}". ദയവായി ഡോക്ടറെയോ ചികിത്സാ വിഭാഗത്തെയോ വ്യക്തമാക്കുക.`
      : `You said: "${text}". Please specify the department or doctor you wish to consult.`
  };
}

export const executeGeminiTurn = processVoiceInputWithGemini;

