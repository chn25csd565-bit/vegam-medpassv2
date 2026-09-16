import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, Clock, Calendar, Stethoscope, 
  Search, RefreshCw, Filter, ArrowUpRight, ShieldCheck, Activity 
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function AdminDashboard({ onSelectPass }) {
  const { language, t } = useLanguage();
  const [stats, setStats] = useState({
    total_appointments: 0,
    checked_in: 0,
    waiting: 0,
    available_slots: 38,
    department_counts: {},
    recent_appointments: []
  });
  const [filterDept, setFilterDept] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadStats = async () => {
    setIsLoading(true);
    const data = await api.getAdminStats();
    setStats(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const appointments = stats.recent_appointments || [];
  const filteredAppointments = appointments.filter(a => {
    const matchesDept = filterDept === 'ALL' || a.department?.toLowerCase() === filterDept.toLowerCase();
    const matchesSearch = !searchQuery || 
      a.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.doctor?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-wider bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              {t('admin.headerTag')}
            </span>
            <span className="text-xs text-slate-500 font-medium">Real-Time OPD Telemetry</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {t('admin.headerTitle')}
          </h2>
          <p className="text-xs text-slate-600 mt-1">{t('admin.headerSubtitle')}</p>
        </div>

        <button
          onClick={loadStats}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{language === 'ml' ? 'വിവരങ്ങൾ പുതുക്കുക' : 'Refresh Telemetry'}</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Appointments */}
        <div className="bg-white p-3.5 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{t('admin.todayAppointments')}</span>
            <span className="p-1.5 sm:p-2 rounded-xl bg-sky-50 text-sky-700">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {stats.total_appointments}
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
            {language === 'ml' ? 'രജിസ്റ്റർ ചെയ്ത ഒ.പി. രോഗികൾ' : 'Registered Outpatients'}
          </p>
        </div>

        {/* Checked In */}
        <div className="bg-white p-3.5 sm:p-5 rounded-3xl border border-emerald-200 shadow-2xs space-y-1.5 sm:space-y-2 bg-linear-to-b from-white to-emerald-50/30">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{t('admin.checkedInCount')}</span>
            <span className="p-1.5 sm:p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight">
            {stats.checked_in}
          </p>
          <p className="text-[10px] sm:text-[11px] text-emerald-700 font-medium">
            {language === 'ml' ? 'കൺസൾട്ടേഷൻ മുറിയിൽ ഉള്ളവർ' : 'Active in consultation'}
          </p>
        </div>

        {/* Waiting / En Route */}
        <div className="bg-white p-3.5 sm:p-5 rounded-3xl border border-amber-200 shadow-2xs space-y-1.5 sm:space-y-2 bg-linear-to-b from-white to-amber-50/30">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{t('admin.waitingCount')}</span>
            <span className="p-1.5 sm:p-2 rounded-xl bg-amber-100 text-amber-700">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-800 tracking-tight">
            {stats.waiting}
          </p>
          <p className="text-[10px] sm:text-[11px] text-amber-700 font-medium">
            {language === 'ml' ? 'കിയോസ്‌കിൽ സ്കാൻ ചെയ്യാനുള്ളവർ' : 'Awaiting entry scan'}
          </p>
        </div>

        {/* Available Slots */}
        <div className="bg-white p-3.5 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{t('admin.availableSlotsCount')}</span>
            <span className="p-1.5 sm:p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {stats.available_slots}
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
            {language === 'ml' ? '6 ആശുപത്രി വിഭാഗങ്ങളിലായി' : 'Across 6 departments'}
          </p>
        </div>

      </div>

      {/* Per-Department Capacity Breakdown */}
      <div className="bg-white p-4 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 sm:space-y-5">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-sky-700 shrink-0" />
          <span>{t('admin.deptBreakdown')}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {[
            { name: "Ophthalmology", key: "Ophthalmology", max: 20 },
            { name: "Pediatrics", key: "Pediatrics", max: 15 },
            { name: "General Medicine", key: "General Medicine", max: 35 },
            { name: "Cardiology", key: "Cardiology", max: 12 },
            { name: "Orthopedics", key: "Orthopedics", max: 18 },
            { name: "ENT", key: "ENT (Ear, Nose & Throat)", max: 16 }
          ].map((dept) => {
            const count = stats.department_counts[dept.key] || stats.department_counts[dept.name] || 0;
            const pct = Math.min(100, Math.round((count / dept.max) * 100));

            return (
              <div 
                key={dept.name}
                onClick={() => setFilterDept(dept.name)}
                className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  filterDept === dept.name
                    ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-200'
                    : 'bg-slate-50 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="truncate">{dept.name}</span>
                  <span className="font-mono text-sky-700">{count}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      pct > 70 ? 'bg-amber-500' : 'bg-sky-600'
                    }`} 
                    style={{ width: `${Math.max(8, pct)}%` }} 
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Capacity: {dept.max} / day
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live OPD Patient Queue */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-4 sm:p-8">
        
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t('admin.recentPasses')}
            </h3>
            <p className="text-xs text-slate-500">
              {filteredAppointments.length} {t('dashboard.passesIssued')}
            </p>
          </div>

          <div className="flex flex-col min-[420px]:flex-row items-stretch min-[420px]:items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 min-[420px]:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'ml' ? "തിരയുക (രോഗി, ഡോക്ടർ, ഐഡി)..." : "Search patient, doctor, ID..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-sky-500 w-full sm:w-56 min-h-[38px]"
              />
            </div>

            {/* Department Filter */}
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold py-2 px-3 rounded-xl focus:outline-hidden cursor-pointer min-h-[38px]"
            >
              <option value="ALL">{language === 'ml' ? 'എല്ലാ വിഭാഗങ്ങളും' : 'All Departments'}</option>
              <option value="Ophthalmology">Ophthalmology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Orthopedics">Orthopedics</option>
            </select>
          </div>
        </div>

        {/* Mobile Cards View (Hidden on md+) */}
        <div className="block md:hidden space-y-3 pt-2">
          {filteredAppointments.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs italic">
              {language === 'ml' ? 'അപ്പോയിന്റ്മെന്റുകൾ കണ്ടെത്തിയില്ല.' : 'No appointments match the current filter.'}
            </div>
          ) : (
            filteredAppointments.map((apt) => (
              <div key={apt.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{apt.id}</span>
                    <h4 className="text-sm font-black text-slate-900">{apt.patient_name}</h4>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    apt.status === "Checked In" 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {apt.status === "Checked In" ? t('pass.statusCheckedIn') : apt.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2 rounded-xl border border-slate-200/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t('pass.departmentLabel')}</span>
                    <span className="font-semibold text-slate-800 truncate block">{apt.department}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{apt.doctor}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t('common.time')} & {t('pass.roomLocationLabel')}</span>
                    <span className="font-semibold text-slate-800 block">{apt.time}</span>
                    <span className="text-[10px] font-bold text-sky-700 block">{apt.room} (Fl {apt.floor})</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs">
                    <span className="text-[10px] text-slate-400 mr-1">{language === 'ml' ? 'ടോക്കൺ:' : 'Token:'}</span>
                    <span className="font-mono font-black text-emerald-800">{apt.token_number || '—'}</span>
                  </div>
                  <button
                    onClick={() => onSelectPass && onSelectPass(apt)}
                    className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer min-h-[36px]"
                  >
                    {t('pass.btnViewAll')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View (Hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Pass ID</th>
                <th className="py-3 px-4">{t('pass.patientLabel')}</th>
                <th className="py-3 px-4">{t('pass.departmentLabel')} & {t('pass.doctorLabel')}</th>
                <th className="py-3 px-4">{t('common.time')}</th>
                <th className="py-3 px-4">{t('pass.roomLocationLabel')}</th>
                <th className="py-3 px-4">{language === 'ml' ? 'ടോക്കൺ' : 'Queue Token'}</th>
                <th className="py-3 px-4">{language === 'ml' ? 'സ്റ്റാറ്റസ്' : 'Status'}</th>
                <th className="py-3 px-4 text-right">{language === 'ml' ? 'നടപടി' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    {language === 'ml' ? 'അപ്പോയിന്റ്മെന്റുകൾ കണ്ടെത്തിയില്ല.' : 'No appointments match the current filter.'}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {apt.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {apt.patient_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{apt.department}</span>
                      <span className="text-[11px] text-slate-500">{apt.doctor}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {apt.time}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-sky-800 block">{apt.room}</span>
                      <span className="text-[10px] text-slate-400">{t('common.floor')} {apt.floor}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                      {apt.token_number || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        apt.status === "Checked In" 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {apt.status === "Checked In" ? t('pass.statusCheckedIn') : apt.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectPass && onSelectPass(apt)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-sky-100 hover:text-sky-800 font-semibold text-[11px] rounded-lg text-slate-700 transition-colors cursor-pointer"
                      >
                        {t('pass.btnViewAll')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}

