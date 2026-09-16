import React from 'react';
import { PhoneCall, Sparkles, QrCode, ShieldCheck, ArrowRight, CheckCircle2, HeartHandshake, Mic, ExternalLink, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function HeroBanner({ onStartVoice, onRunDemo, onRunMlDemo, onGoCheckin, onOpenSos }) {
  const { language, t } = useLanguage();

  return (
    <div className="relative overflow-hidden bg-linear-to-b from-sky-50 via-white to-slate-50 border-b border-slate-200 py-8 sm:py-16">
      {/* Background ambient accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Public Health Service Prototype Tag */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-5 sm:mb-6">
          <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-900 text-[11px] sm:text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse shrink-0" />
            <span>{t('hero.tagline')}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] sm:text-[11px] font-medium">
            <span className="font-bold">DEMO:</span>
            <span>{t('hero.demoDataBadge')}</span>
          </div>
        </div>

        {/* Main Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <h1 className="text-2xl min-[380px]:text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.2] break-words">
              {t('hero.titleLine1')} <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-700 via-sky-800 to-indigo-900">
                {t('hero.titleLine2')}
              </span>
            </h1>

            <p className="text-sm sm:text-lg text-slate-600 max-w-2xl leading-relaxed font-normal">
              {t('hero.subtitle')}
            </p>

            {/* Value Propositions */}
            <div className="grid grid-cols-1 min-[420px]:grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3 pt-1 sm:pt-2">
              <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-slate-800">{t('hero.featVoice')}</span>
              </div>
              <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-slate-800">{t('hero.featFamily')}</span>
              </div>
              <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-slate-800">{t('hero.featCheckin')}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col min-[440px]:flex-row flex-wrap items-stretch min-[440px]:items-center gap-2.5 sm:gap-3 pt-2">
              <button
                onClick={onStartVoice}
                className="w-full min-[440px]:w-auto flex-1 min-w-[140px] flex items-center justify-center gap-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold px-5 sm:px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg shadow-sky-900/20 transition-all text-sm group active:scale-95 cursor-pointer min-h-[48px]"
              >
                <div className="w-6 h-6 rounded-full bg-sky-600 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-3.5 h-3.5 text-white animate-pulse" />
                </div>
                <span>{t('hero.btnVoiceCall')}</span>
                <ArrowRight className="w-4 h-4 text-sky-200 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              {/* 1-Click Malayalam Demo Button */}
              <button
                onClick={onRunMlDemo}
                className="w-full min-[440px]:w-auto flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-linear-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold px-4 sm:px-5 py-3.5 rounded-xl shadow-md transition-all text-sm active:scale-95 cursor-pointer border border-emerald-500/30 ring-2 ring-emerald-600/20 min-h-[48px]"
                title="Run 1-Click Malayalam Voice Demo with Dr. Sharma"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin shrink-0" />
                <span>{t('hero.btnMlDemo')}</span>
              </button>

              {/* High-visibility Emergency SOS CTA */}
              <button
                onClick={onOpenSos}
                className="w-full min-[440px]:w-auto flex items-center justify-center gap-2 bg-linear-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black px-4 py-3.5 rounded-xl shadow-lg shadow-rose-950/20 border border-rose-400/40 transition-all text-sm active:scale-95 cursor-pointer ring-2 ring-rose-500/20 min-h-[48px]"
                title="Emergency SOS: Call Ambulance, Emergency Dept, or Share Location"
              >
                <div className="w-6 h-6 rounded-full bg-rose-800 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5 text-white animate-bounce" />
                </div>
                <span>{t('hero.btnSos')}</span>
              </button>

              <button
                onClick={onRunDemo}
                className="w-full min-[440px]:w-auto flex items-center justify-center gap-2 bg-white hover:bg-amber-50 text-slate-800 border-2 border-amber-400 font-bold px-4 py-3.5 rounded-xl shadow-xs transition-all text-sm active:scale-95 cursor-pointer min-h-[48px]"
              >
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{t('hero.btnDemoFlow')}</span>
              </button>

              <button
                onClick={onGoCheckin}
                className="w-full min-[440px]:w-auto flex items-center justify-center gap-1.5 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 font-semibold px-4 py-3.5 rounded-xl transition-all text-sm cursor-pointer min-h-[48px]"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{t('hero.btnStaffCheckin')}</span>
              </button>
            </div>

            {/* Government Booking Option for users without UHID */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">{t('hero.noUhidQuestion')}</span>
              <button
                onClick={() => window.open('https://ehealth.kerala.gov.in', '_blank', 'noopener,noreferrer')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-2xs hover:shadow-xs transition-all active:scale-95 text-xs cursor-pointer min-h-[36px]"
              >
                <span>{t('hero.btnGovtBooking')}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>

            <p className="text-xs text-slate-500 italic pt-1">
              {t('hero.motto')}
            </p>
          </div>

          {/* Right Hero Visual: Phone + Pass Mockup */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative mx-auto w-full max-w-[310px] min-[390px]:max-w-[340px] sm:max-w-sm rounded-3xl bg-slate-900 p-2.5 sm:p-3 shadow-2xl ring-4 sm:ring-8 ring-slate-800/20">
              
              {/* Phone Speaker & Camera Notch */}
              <div className="mx-auto h-4 w-28 rounded-full bg-slate-950 mb-2 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-700 mr-2" />
                <div className="h-1 w-10 rounded-full bg-slate-800" />
              </div>

              {/* Inside Phone Screen */}
              <div className="rounded-2xl bg-linear-to-b from-sky-950 via-slate-900 to-slate-950 p-3 sm:p-4 text-white space-y-3 sm:space-y-4 border border-slate-800">
                
                {/* Live Call Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">{t('hero.simLiveAgent')}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">01:14</span>
                </div>

                {/* AI Dialogue Bubble */}
                <div className="bg-sky-900/60 border border-sky-700/50 rounded-xl p-3 text-xs space-y-1 shadow-inner">
                  <div className="flex items-center gap-1.5 text-sky-300 text-[11px] font-semibold">
                    <Mic className="w-3 h-3 text-sky-400" />
                    <span>{t('hero.simAgentTitle')}</span>
                  </div>
                  <p className="text-slate-100 leading-snug">
                    {t('hero.simSpeechBubble')}
                  </p>
                </div>

                {/* Simulated Mini Digital Pass in Phone */}
                <div className="bg-white text-slate-900 rounded-xl p-3 shadow-md border-2 border-emerald-500 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <div>
                      <span className="text-[9px] font-bold text-sky-800 uppercase tracking-wider block">{t('hero.simPassType')}</span>
                      <p className="text-xs font-extrabold text-slate-900">Aarav ({t('common.child')} / 6y)</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {t('hero.simValidPass')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] py-0.5">
                    <div>
                      <p className="text-slate-500 text-[10px]">{t('hero.simDeptDoctor')}</p>
                      <p className="font-bold text-slate-800">Ophthalmology • Dr. Sharma</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 text-[10px]">{t('hero.simLocation')}</p>
                      <p className="font-bold text-sky-700">Room 204 • Floor 2</p>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <QrCode className="w-8 h-8 text-slate-900" />
                      <div className="text-[9px] text-slate-500 font-mono">
                        <span>{t('hero.simPassId')}</span><br />
                        <span className="font-bold text-slate-800">#APT-2026-8802</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-900 text-white font-semibold px-2 py-1 rounded-md">
                      {t('hero.simShowAtEntry')}
                    </span>
                  </div>
                </div>

                {/* Call Controls inside Phone */}
                <div className="pt-1 flex items-center justify-center gap-6">
                  <button 
                    onClick={onStartVoice}
                    className="w-11 h-11 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 cursor-pointer"
                  >
                    <PhoneCall className="w-5 h-5" />
                  </button>
                  <span className="text-xs text-slate-300 font-medium">{t('hero.simClickToTest')}</span>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
