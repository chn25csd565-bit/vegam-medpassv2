/**
 * API Service for VEGAM
 * Communicates with FastAPI backend (http://localhost:8000)
 * with transparent client-side fallback for offline / standalone prototype usage.
 */

import { INITIAL_PATIENTS, INITIAL_DEPARTMENTS, getStoredAppointments, saveStoredAppointments } from "../data/mockData";

const API_BASE = "http://localhost:8000";

// Helper fetch with timeout
async function safeFetch(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    // Return null to trigger fallback
    return null;
  }
}

export const api = {
  // 1. Check UHID by Phone
  async checkUhid(phone) {
    const cleanPhone = String(phone).replace(/\D/g, "");
    const backendResult = await safeFetch("/check_uhid", {
      method: "POST",
      body: JSON.stringify({ phone: cleanPhone })
    });
    if (backendResult) return backendResult;

    // Fallback logic
    const patient = INITIAL_PATIENTS.find(p => p.phone === cleanPhone);
    if (patient && patient.uhid) {
      return {
        success: true,
        patient_id: patient.id,
        name: patient.name,
        uhid: patient.uhid,
        message: "Patient identified. Demo verification code sent (Code: 583921)."
      };
    }
    return {
      success: false,
      message: "No registered UHID found for this mobile number."
    };
  },

  // 2. Verify OTP
  async verifyOtp(phone, otp) {
    const cleanPhone = String(phone).replace(/\D/g, "");
    const cleanOtp = String(otp).trim();
    const backendResult = await safeFetch("/verify_otp", {
      method: "POST",
      body: JSON.stringify({ phone: cleanPhone, otp: cleanOtp })
    });
    if (backendResult) return backendResult;

    // Fallback logic (accepts 583921 or any 6-digit in demo)
    if (cleanOtp === "583921" || cleanOtp.length === 6) {
      const patient = INITIAL_PATIENTS.find(p => p.phone === cleanPhone) || INITIAL_PATIENTS[1];
      return {
        verified: true,
        session_id: `sess_local_${Date.now()}`,
        patient,
        message: "Phone authentication successful."
      };
    }
    return {
      verified: false,
      message: "Incorrect verification code. Please enter valid code (Demo: 583921)."
    };
  },

  // 3. Get Dependents
  async getDependents(patientId) {
    const backendResult = await safeFetch(`/dependents/${patientId}`);
    if (backendResult) return backendResult.dependents || [];

    const patient = INITIAL_PATIENTS.find(p => p.id === Number(patientId));
    return patient ? patient.dependents : [];
  },

  // 4. Search Department
  async searchDept(query = "") {
    const backendResult = await safeFetch(`/search_dept?query=${encodeURIComponent(query)}`);
    if (backendResult) return backendResult.departments;

    const q = query.trim().toLowerCase();
    if (!q) return INITIAL_DEPARTMENTS;
    return INITIAL_DEPARTMENTS.filter(d => 
      d.name.toLowerCase().includes(q) ||
      (d.synonyms && d.synonyms.some(s => s.toLowerCase().includes(q) || q.includes(s.toLowerCase())))
    );
  },

  // 5. Get Doctors
  async getDoctors(departmentName) {
    const backendResult = await safeFetch(`/doctors/${encodeURIComponent(departmentName)}`);
    if (backendResult) return backendResult.doctors;

    const dept = INITIAL_DEPARTMENTS.find(d => 
      d.name.toLowerCase() === departmentName.toLowerCase() ||
      (d.synonyms && d.synonyms.some(s => departmentName.toLowerCase().includes(s.toLowerCase())))
    );
    return dept ? dept.doctors : [];
  },

  // 6. Get Slots
  async getSlots(departmentName, doctorName, date) {
    const backendResult = await safeFetch(`/slots?department=${encodeURIComponent(departmentName)}&doctor=${encodeURIComponent(doctorName || "")}&date=${encodeURIComponent(date || "")}`);
    if (backendResult) return backendResult.slots;

    const doctors = await this.getDoctors(departmentName);
    const doc = doctors.find(d => !doctorName || d.name.toLowerCase().includes(doctorName.toLowerCase()));
    return doc ? doc.slots : ["09:30 AM", "10:00 AM", "11:15 AM", "02:00 PM"];
  },

  // 7. Book Appointment
  async bookAppointment({ patientId, department, doctor, date, time, appointmentId }) {
    const backendResult = await safeFetch("/book", {
      method: "POST",
      body: JSON.stringify({
        patient_id: Number(patientId),
        department,
        doctor,
        date,
        time
      })
    });
    if (backendResult) {
      const aptId = appointmentId || backendResult.appointment_id;
      // Sync local copy
      const appointments = getStoredAppointments();
      const normalizedApt = {
        id: aptId,
        appointment_id: aptId,
        patient_id: Number(patientId),
        patient_name: backendResult.patient_name,
        uhid: backendResult.qr_token, // or masked
        department: backendResult.department,
        doctor: backendResult.doctor,
        date: backendResult.date,
        time: backendResult.time,
        block: backendResult.block,
        floor: backendResult.floor,
        room: backendResult.room,
        status: "Booked",
        token_number: backendResult.token_number || null,
        qr_token: backendResult.qr_token
      };

      const existingIdx = appointments.findIndex(a => (a.id && a.id === aptId) || (a.appointment_id && a.appointment_id === aptId));
      if (existingIdx !== -1) {
        appointments[existingIdx] = { ...appointments[existingIdx], ...normalizedApt };
      } else {
        appointments.unshift(normalizedApt);
      }
      saveStoredAppointments(appointments);
      return {
        ...backendResult,
        ...normalizedApt
      };
    }

    // Client-side booking fallback
    let patientName = "Patient";
    let uhid = "1234567890123456";
    // Check patients & dependents
    for (const p of INITIAL_PATIENTS) {
      if (p.id === Number(patientId)) {
        patientName = p.name;
        uhid = p.uhid;
        break;
      }
      const dep = p.dependents?.find(d => d.id === Number(patientId));
      if (dep) {
        patientName = dep.name;
        uhid = dep.uhid;
        break;
      }
    }

    const dept = INITIAL_DEPARTMENTS.find(d => d.name.toLowerCase().includes(department.toLowerCase())) || INITIAL_DEPARTMENTS[0];
    const randId = Math.floor(1000 + Math.random() * 9000);
    const aptId = appointmentId || `APT-2026-${randId}`;
    const qrToken = `medipass_token_${aptId.replace(/\D/g, '') || randId}_${Math.random().toString(36).substring(2, 6)}`;

    const newApt = {
      id: aptId,
      appointment_id: aptId,
      patient_id: Number(patientId),
      patient_name: patientName,
      uhid: uhid,
      department: dept.name,
      doctor: doctor || dept.doctors[0].name,
      date: date || "2026-09-15",
      time: time || "10:00 AM",
      block: dept.block,
      floor: dept.floor,
      room: dept.room,
      status: "Booked",
      token_number: null,
      checked_in_at: null,
      qr_token: qrToken
    };

    const appointments = getStoredAppointments();
    const existingIdx = appointments.findIndex(a => (a.id && a.id === aptId) || (a.appointment_id && a.appointment_id === aptId));
    if (existingIdx !== -1) {
      appointments[existingIdx] = { ...appointments[existingIdx], ...newApt };
    } else {
      appointments.unshift(newApt);
    }
    saveStoredAppointments(appointments);

    return {
      success: true,
      id: aptId,
      appointment_id: aptId,
      patient_name: patientName,
      department: dept.name,
      doctor: newApt.doctor,
      date: newApt.date,
      time: newApt.time,
      room: dept.room,
      floor: dept.floor,
      block: dept.block,
      qr_token: qrToken,
      token_number: null,
      status: "Booked"
    };
  },

  // 8. Get Appointment by ID
  async getAppointment(id) {
    const backendResult = await safeFetch(`/appointment/${id}`);
    if (backendResult) return backendResult;

    const appointments = getStoredAppointments();
    return appointments.find(a => (a.id && a.id === id) || (a.appointment_id && a.appointment_id === id)) || null;
  },

  // 9. Check In Patient
  async checkIn({ appointmentId, qrToken }) {
    const backendResult = await safeFetch("/checkin", {
      method: "POST",
      body: JSON.stringify({
        appointment_id: appointmentId,
        qr_token: qrToken
      })
    });
    if (backendResult) {
      // Sync local copy
      const appointments = getStoredAppointments();
      const idx = appointments.findIndex(a => a.id === appointmentId || a.appointment_id === appointmentId || a.qr_token === qrToken);
      if (idx !== -1) {
        appointments[idx].status = "Checked In";
        appointments[idx].token_number = backendResult.token_number;
        appointments[idx].checked_in_at = backendResult.checked_in_at;
        saveStoredAppointments(appointments);
      }
      return backendResult;
    }

    // Client fallback check-in
    const appointments = getStoredAppointments();
    const apt = appointments.find(a => 
      (appointmentId && (a.id === appointmentId || a.appointment_id === appointmentId)) || 
      (qrToken && a.qr_token === qrToken)
    );
    if (!apt) {
      return {
        success: false,
        message: "No matching appointment found for this QR token or ID."
      };
    }

    const now = new Date();
    const checkedInAt = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " Today";
    const roomNum = apt.room.replace(/\D/g, "") || "101";
    const tokenNum = apt.token_number || `OPD-${roomNum}-#0${Math.floor(Math.random() * 9) + 1}`;

    apt.status = "Checked In";
    apt.token_number = tokenNum;
    apt.checked_in_at = checkedInAt;
    saveStoredAppointments([...appointments]);

    return {
      success: true,
      message: "Patient check-in successful. Token slip generated.",
      appointment: apt,
      token_number: tokenNum,
      checked_in_at: checkedInAt
    };
  },

  // 10. Get Admin Stats & Appointments
  async getAdminStats() {
    const backendResult = await safeFetch("/admin/stats");
    if (backendResult) return backendResult;

    const appointments = getStoredAppointments();
    const total = appointments.length;
    const checkedIn = appointments.filter(a => a.status === "Checked In").length;
    const waiting = appointments.filter(a => a.status === "Booked").length;

    const deptCounts = {};
    for (const a of appointments) {
      const d = a.department || "General";
      deptCounts[d] = (deptCounts[d] || 0) + 1;
    }

    return {
      total_appointments: total,
      checked_in: checkedIn,
      waiting: waiting,
      available_slots: 38,
      department_counts: deptCounts,
      recent_appointments: appointments
    };
  },

  // 11. Generate Digital Pass
  async generatePass(appointmentId) {
    const backendResult = await safeFetch("/generate_pass", {
      method: "POST",
      body: JSON.stringify({ appointment_id: appointmentId })
    });
    if (backendResult) return backendResult;

    const appointments = getStoredAppointments();
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) return null;

    return {
      appointment_id: apt.id,
      qr_payload: apt.qr_token,
      patient_name: apt.patient_name,
      department: apt.department,
      doctor: apt.doctor,
      date: apt.date,
      time: apt.time,
      room: apt.room,
      floor: apt.floor,
      block: apt.block,
      status: apt.status,
      token_number: apt.token_number
    };
  },

  // 12. Cancel Appointment
  async cancelAppointment(appointmentId) {
    const backendResult = await safeFetch(`/appointment/${encodeURIComponent(appointmentId)}/cancel`, {
      method: "POST"
    });
    if (backendResult) {
      const appointments = getStoredAppointments();
      const idx = appointments.findIndex(a => a.id === appointmentId);
      if (idx !== -1) {
        appointments[idx].status = "Cancelled";
        saveStoredAppointments(appointments);
      }
      return backendResult;
    }

    // Client fallback
    const appointments = getStoredAppointments();
    const idx = appointments.findIndex(a => a.id === appointmentId);
    if (idx !== -1) {
      appointments[idx].status = "Cancelled";
      saveStoredAppointments([...appointments]);
      return {
        success: true,
        message: `Appointment ${appointmentId} has been cancelled successfully.`,
        appointment_id: appointmentId,
        status: "Cancelled"
      };
    }

    return {
      success: false,
      message: "Appointment not found."
    };
  },

  // 13. Get Voice Tools Schemas
  async getVoiceTools() {
    const backendResult = await safeFetch("/voice/tools");
    if (backendResult) return backendResult.tools;
    return [];
  }
};

