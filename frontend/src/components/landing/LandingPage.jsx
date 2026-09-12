import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../store/AuthContext";
import i18n from "../../i18n/config";
import { Shield, ArrowRight, Menu, X, Landmark, IndianRupee, TrendingUp, Globe, Phone, ChevronLeft, ChevronRight } from "lucide-react";

function useScrollReveal(threshold) {
  var ref = useRef(null);
  var [visible, setVisible] = useState(false);
  useEffect(function() {
    var el = ref.current;
    if (!el) return;
    // Fallback timer — show content even if IntersectionObserver fails (SSR/headless)
    var fallback = setTimeout(function() { setVisible(true); }, 600);
    var obs = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) { setVisible(true); obs.disconnect(); clearTimeout(fallback); }
    }, { threshold: threshold || 0.05 });
    obs.observe(el);
    return function() { obs.disconnect(); clearTimeout(fallback); };
  }, []);
  return [ref, visible];
}

function AnimatedCounter(target, suffix) {
  suffix = suffix || "";
  var ref = useRef(null);
  var [count, setCount] = useState(0);
  var [started, setStarted] = useState(false);
  useEffect(function() {
    var el = ref.current;
    if (!el) return;
    var obs = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting && !started) { setStarted(true); obs.disconnect(); }
    }, { threshold: 0.5 });
    obs.observe(el);
    return function() { obs.disconnect(); };
  }, [started]);
  useEffect(function() {
    if (!started) return;
    var duration = 2000, startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1-p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [started, target]);
  return [ref, count + suffix];
}

function TricolorStripe() {
  return (<div className="fixed top-0 left-0 right-0 z-[60] h-1 flex"><div className="flex-1 bg-[#FF9933]" /><div className="flex-1 bg-white" /><div className="flex-1 bg-[#138808]" /></div>);
}
function AshokaChakra() {
  return (<svg viewBox="0 0 100 100" className="w-8 h-8" fill="none" stroke="#000080" strokeWidth="1.5"><circle cx="50" cy="50" r="45" /><circle cx="50" cy="50" r="12" />{Array.from({length:24},function(_,i){var a=(i*15)*Math.PI/180;return <line key={i} x1={50+12*Math.cos(a)} y1={50+12*Math.sin(a)} x2={50+45*Math.cos(a)} y2={50+45*Math.sin(a)} />})}</svg>);
}
function HeroIllustration() {
  return (<svg viewBox="0 0 400 350" className="w-full h-full" fill="none">
    <rect x="50" y="80" width="120" height="180" rx="8" fill="#138808" opacity="0.1" />
    <rect x="60" y="100" width="100" height="140" rx="4" fill="white" stroke="#138808" strokeWidth="2" />
    <rect x="70" y="115" width="80" height="8" rx="2" fill="#FF9933" />
    <rect x="70" y="130" width="60" height="6" rx="1" fill="#e5e7eb" />
    <rect x="70" y="142" width="70" height="6" rx="1" fill="#e5e7eb" />
    <rect x="70" y="154" width="50" height="6" rx="1" fill="#e5e7eb" />
    <circle cx="110" cy="200" r="20" fill="#FF9933" opacity="0.2" />
    <text x="110" y="206" textAnchor="middle" fill="#FF9933" fontSize="16" fontWeight="bold">₹</text>
    <rect x="230" y="60" width="140" height="100" rx="12" fill="white" stroke="#138808" strokeWidth="2" />
    <circle cx="270" cy="100" r="15" fill="#FF9933" />
    <rect x="300" y="90" width="50" height="6" rx="1" fill="#e5e7eb" />
    <rect x="300" y="102" width="40" height="6" rx="1" fill="#e5e7eb" />
    <rect x="250" y="125" width="100" height="20" rx="4" fill="#138808" />
    <text x="300" y="139" textAnchor="middle" fill="white" fontSize="10">Apply Now</text>
    <circle cx="300" cy="250" r="50" fill="#138808" opacity="0.1" />
    <circle cx="300" cy="250" r="35" fill="#138808" opacity="0.2" />
    <path d="M300 220 L300 280 M270 250 L330 250" stroke="#138808" strokeWidth="3" strokeLinecap="round" />
    <rect x="80" y="280" width="240" height="40" rx="20" fill="white" stroke="#FF9933" strokeWidth="2" />
    <text x="200" y="305" textAnchor="middle" fill="#000080" fontSize="12" fontWeight="600">Government Scheme Finder</text>
    <circle cx="100" cy="50" r="8" fill="#FF9933" opacity="0.3" />
    <circle cx="350" cy="30" r="6" fill="#138808" opacity="0.3" />
    <circle cx="380" cy="150" r="10" fill="#FF9933" opacity="0.2" />
  </svg>);
}
function BuildingIcon() {
  return (<svg viewBox="0 0 200 200" className="w-16 h-16" xmlns="http://www.w3.org/2000/svg"><g transform="translate(28,50) scale(2.25)"><path d="M32 6L58 20H6L32 6Z" fill="#6b4226"/><rect x="10" y="24" width="44" height="30" rx="2" fill="#6b4226"/><rect x="16" y="28" width="5" height="22" fill="#f4c98b"/><rect x="29.5" y="28" width="5" height="22" fill="#f4c98b"/><rect x="43" y="28" width="5" height="22" fill="#f4c98b"/><rect x="6" y="54" width="52" height="5" rx="1" fill="#6b4226"/><circle cx="32" cy="34" r="10" fill="#f4c98b" stroke="#6b4226" strokeWidth="2"/><text x="32" y="38.5" fontFamily="Arial" fontSize="15" fontWeight="bold" textAnchor="middle" fill="#6b4226">₹</text></g></svg>);
}
function DocumentIcon() {
  return (<svg viewBox="0 0 200 200" className="w-16 h-16" xmlns="http://www.w3.org/2000/svg"><g transform="translate(30,55) scale(2.2)"><path d="M32 4L60 18L32 32L4 18L32 4Z" fill="#d9827a"/><path d="M16 24V36C16 40 23 44 32 44C41 44 48 40 48 36V24L32 32L16 24Z" fill="#d9827a"/><line x1="58" y1="19" x2="58" y2="34" stroke="#d9827a" strokeWidth="2.5" strokeLinecap="round"/><circle cx="58" cy="37" r="3.5" fill="#d9827a"/></g></svg>);
}
function LocationPinIcon() {
  return (<svg viewBox="0 0 200 200" className="w-16 h-16" xmlns="http://www.w3.org/2000/svg"><g transform="translate(28,25) scale(2.3)"><path d="M32 56C32 56 8 40 8 22C8 12 15 6 23 6C27 6 30.5 8 32 12C33.5 8 37 6 41 6C49 6 56 12 56 22C56 40 32 56 32 56Z" fill="#4fa8a3"/><rect x="24" y="16" width="16" height="16" rx="3" fill="white"/><rect x="30" y="19" width="4" height="10" rx="1" fill="#4fa8a3"/><rect x="27" y="22" width="10" height="4" rx="1" fill="#4fa8a3"/></g></svg>);
}

function LangToggle() {
  var langs = [{c:"en",l:"EN"},{c:"hi",l:"HI"},{c:"ta",l:"TA"},{c:"te",l:"TE"},{c:"bn",l:"BN"},{c:"mr",l:"MR"},{c:"kn",l:"KN"}];
  var current = i18n.language || "en";
  var idx = langs.findIndex(function(x){return x.c===current});
  if(idx===-1) idx=0;
  var next = langs[(idx+1)%langs.length];
  return (<button onClick={function(){i18n.changeLanguage(next.c)}} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 dark:border-gray-600 hover:border-[#138808] hover:bg-[#138808]/5 transition-all text-gray-600" aria-label={"Switch language to " + next.l} title={"Switch to " + next.l}><Globe className="w-3.5 h-3.5" />{next.l}</button>);
}

export default function LandingPage() {
  var { t } = useTranslation();
  var { isAuthenticated } = useAuth();
  var ctaPath = isAuthenticated ? "/get-started" : "/login";
  var [menuOpen, setMenuOpen] = useState(false);
  var [heroRef, heroVisible] = useScrollReveal(0.1);
  var [stepsRef, stepsVisible] = useScrollReveal(0.1);
  var [schemesRef, schemesVisible] = useScrollReveal(0.1);
  var [testiRef, testiVisible] = useScrollReveal(0.15);
  var [ctaRef, ctaVisible] = useScrollReveal(0.15);
  var [s1Ref, s1Val] = AnimatedCounter(21, "+");
  var [s2Ref, s2Val] = AnimatedCounter(500, "+");
  var [s3Ref, s3Val] = AnimatedCounter(500, "Cr+");
  var [s4Ref, s4Val] = AnimatedCounter(690, "");

  var steps = [
    { icon: BuildingIcon, title: t("landing.features.step1.title"), desc: t("landing.features.step1.desc") },
    { icon: DocumentIcon, title: t("landing.features.step2.title"), desc: t("landing.features.step2.desc") },
    { icon: LocationPinIcon, title: t("landing.features.step3.title"), desc: t("landing.features.step3.desc") },
  ];
  var schemes = [
    { icon: IndianRupee, name: t("landing.schemes.micro.name"), desc: t("landing.schemes.micro.desc"), range: "Up to ₹1.40 Lakh", rate: "6.5% p.a.", badge: t("results.highly_recommended") },
    { icon: TrendingUp, name: t("landing.schemes.term.name"), desc: t("landing.schemes.term.desc"), range: "₹1.40L - ₹50L", rate: "8% p.a.", badge: "Popular" },
    { icon: Landmark, name: t("landing.schemes.edu.name"), desc: t("landing.schemes.edu.desc"), range: "Up to ₹10 Lakh", rate: "7.5% p.a.", badge: "For Students" },
  ];
  var testimonials = [
    { name: "Ramesh Kumar", loc: "Lucknow, UP", quote: "I got ₹2.5 lakh loan for my tailoring business in just 3 days. The AI matched me with the perfect MUDRA scheme.", scheme: "PM MUDRA" },
    { name: "Priya Devi", loc: "Jaipur, Rajasthan", quote: "As a woman entrepreneur, I didn’t know which scheme I qualified for. This platform found 3 schemes for me instantly.", scheme: "Stand-Up India" },
    { name: "Suresh Patel", loc: "Ahmedabad, Gujarat", quote: "The nearest bank locator saved me hours. I applied online and got approval within a week.", scheme: "NSFDC Term Loan" },
  ];
  var helpline = "1800-11-0031";

  var animBase = "transition-all duration-700 ease-out";
  var fadeUp = animBase + (heroVisible ? " opacity-100 translate-y-0" : " opacity-0 translate-y-8");
  var fadeUpS = animBase + (stepsVisible ? " opacity-100 translate-y-0" : " opacity-0 translate-y-8");
  var fadeUpSc = animBase + (schemesVisible ? " opacity-100 translate-y-0" : " opacity-0 translate-y-8");
  var fadeUpT = animBase + (testiVisible ? " opacity-100 translate-y-0" : " opacity-0 translate-y-8");
  var fadeUpC = animBase + (ctaVisible ? " opacity-100 translate-y-0" : " opacity-0 translate-y-8");

  return (<div className="min-h-screen bg-white dark:bg-gray-900">
    <TricolorStripe />
    <nav className="fixed top-1 left-0 right-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-[#138808] flex items-center justify-center"><Landmark className="w-5 h-5 text-white" /></div><div className="flex flex-col"><span className="text-[#000080] font-bold text-lg leading-tight">CreditSetu</span><span className="text-gray-500 text-[10px] uppercase tracking-wider">Scheme Finder</span></div></Link>
        <div className="hidden lg:flex items-center gap-8"><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-[#138808] text-sm font-medium transition-colors">{t("landing.nav.features")}</a><a href="#schemes" className="text-gray-600 dark:text-gray-300 hover:text-[#138808] text-sm font-medium transition-colors">{t("landing.nav.schemes")}</a><a href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-[#138808] text-sm font-medium transition-colors">{t("landing.nav.how_it_works")}</a><a href="#contact" className="text-gray-600 dark:text-gray-300 hover:text-[#138808] text-sm font-medium transition-colors">{t("landing.nav.contact")}</a></div>
        <div className="flex items-center gap-3"><LangToggle /><Link to={ctaPath} className="hidden sm:inline-flex px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#FF9933] hover:bg-[#e68a2d] transition-colors shadow-md">{t("landing.hero.get_started_btn")}</Link><button onClick={function(){setMenuOpen(!menuOpen)}} className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} title={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button></div>
      </div></nav>
    <section ref={heroRef} className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-16 min-h-[70vh] md:min-h-[80vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0"><img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600&q=80" alt="" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/50" /><div className="absolute inset-0 bg-[#065f46]/5" /></div>
      <div className="max-w-7xl mx-auto relative z-10 w-full">
        <div className={"max-w-2xl transition-all duration-700 ease-out " + (heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")} style={{transitionDelay:"0.1s"}}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#138808]/10 border border-[#138808]/20 mb-5">
            <Shield className="w-4 h-4 text-[#138808]" />
            <span className="text-[#138808] text-sm font-medium">{t("landing.hero.badge")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#000080] leading-tight mb-5">{t("landing.hero.title")}</h1>
          <p className="text-base sm:text-lg text-gray-700 mb-8 leading-relaxed max-w-xl">{t("landing.hero.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link to={ctaPath} className="inline-flex items-center justify-center gap-2 px-7 py-3.5 sm:px-8 sm:py-4 rounded-lg text-white font-semibold bg-[#138808] hover:bg-[#0f6d06] transition-colors shadow-lg text-sm sm:text-base">{t("landing.hero.cta")} <ArrowRight className="w-5 h-5" /></Link>
            <Link to="/get-started" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 sm:px-8 sm:py-4 rounded-lg font-semibold border-2 border-[#FF9933] text-[#FF9933] hover:bg-[#FF9933]/10 transition-colors text-sm sm:text-base">{t("landing.hero.view_all")}</Link>
          </div>
        </div>
      </div>
    </section>
    <section className="py-10 sm:py-12 px-4 sm:px-6 lg:px-16 bg-[#138808]"><div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8"><div ref={s1Ref} className="text-center"><div className="text-3xl md:text-4xl font-extrabold text-white mb-1">{s1Val}</div><div className="text-sm text-white/70 uppercase tracking-wider">{t("landing.stats.schemes")}</div></div><div ref={s2Ref} className="text-center"><div className="text-3xl md:text-4xl font-extrabold text-white mb-1">{s2Val}</div><div className="text-sm text-white/70 uppercase tracking-wider">{t("landing.stats.partners")}</div></div><div ref={s3Ref} className="text-center"><div className="text-3xl md:text-4xl font-extrabold text-white mb-1">₹{s3Val}</div><div className="text-sm text-white/70 uppercase tracking-wider">{t("landing.stats.disbursed")}</div></div><div ref={s4Ref} className="text-center"><div className="text-3xl md:text-4xl font-extrabold text-white mb-1">{s4Val}</div><div className="text-sm text-white/70 uppercase tracking-wider">{t("landing.stats.districts")}</div></div></div></section>

    <section id="how-it-works" ref={stepsRef} className="py-16 sm:py-20 px-4 sm:px-6 lg:px-16 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className={"text-center mb-12 sm:mb-16 transition-all duration-700 " + (stepsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#000080] mb-3">How CreditSetu Works</h2>
          <div className="w-16 h-1 bg-[#FF9933] mx-auto rounded-full mb-4" />
          <p className="text-gray-500 max-w-lg mx-auto text-sm sm:text-base">A simple 4-step journey to discover and apply for the right government credit scheme</p>
        </div>
        {/* Desktop: horizontal journey with connecting lines */}
        <div className="hidden md:grid grid-cols-4 gap-4 relative">
          {/* Connecting line */}
          <div className="absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#FF9933] via-[#138808] to-[#000080] z-0" />
          {[
            { step: "01", color: "bg-[#FF9933]", icon: "form", title: t("landing.process.step1.title") || "Tell Us About Yourself", desc: t("landing.process.step1.desc") || "Answer simple questions about your business, income, and location." },
            { step: "02", color: "bg-[#138808]", icon: "ai", title: t("landing.process.step2.title") || "AI Analyzes Your Eligibility", desc: t("landing.process.step2.desc") || "Our AI engine matches your profile against 21+ government schemes." },
            { step: "03", color: "bg-[#000080]", icon: "doc", title: t("landing.process.step3.title") || "Get Personalized Matches", desc: t("landing.process.step3.desc") || "See schemes ranked by eligibility with requirements and benefits." },
            { step: "04", color: "bg-[#FF9933]", icon: "bank", title: t("landing.process.step4.title") || "Apply With Guidance", desc: t("landing.process.step4.desc") || "Get document checklist, bank locator, and official application links." },
          ].map(function(item, i) {
            var iconEl;
            if (item.icon === "form") iconEl = (<svg className="w-8 h-8" viewBox="0 0 48 48" fill="none"><rect x="8" y="6" width="32" height="36" rx="4" stroke="currentColor" strokeWidth="2.5"/><line x1="14" y1="16" x2="34" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="14" y1="22" x2="30" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="14" y1="28" x2="26" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>);
            else if (item.icon === "ai") iconEl = (<svg className="w-8 h-8" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2.5"/><circle cx="24" cy="24" r="6" fill="currentColor" opacity="0.2"/><path d="M24 8v4M24 36v4M8 24h4M36 24h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>);
            else if (item.icon === "doc") iconEl = (<svg className="w-8 h-8" viewBox="0 0 48 48" fill="none"><path d="M12 8h18l8 8v24a4 4 0 01-4 4H12a4 4 0 01-4-4V12a4 4 0 014-4z" stroke="currentColor" strokeWidth="2.5"/><path d="M30 8v8h8" stroke="currentColor" strokeWidth="2.5"/><path d="M16 24h16M16 30h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>);
            else iconEl = (<svg className="w-8 h-8" viewBox="0 0 48 48" fill="none"><rect x="6" y="20" width="36" height="22" rx="3" stroke="currentColor" strokeWidth="2.5"/><path d="M16 20V14a8 8 0 0116 0v6" stroke="currentColor" strokeWidth="2.5"/><circle cx="24" cy="31" r="3" fill="currentColor"/></svg>);
            return (
              <div key={i} className={"relative flex flex-col items-center text-center z-10 transition-all duration-500 " + (stepsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")} style={{transitionDelay: (i*120)+"ms"}}>
                <div className={"w-12 h-12 rounded-full " + item.color + " text-white flex items-center justify-center font-bold text-sm shadow-lg mb-4 relative z-10 bg-white border-4 border-current " + item.color}>
                  {item.step}
                </div>
                <div className={"w-16 h-16 rounded-2xl " + item.color + "/10 flex items-center justify-center mb-3 text-" + item.color.replace("bg-", "")}>
                  <span className={item.color.replace("bg-", "text-")}>{iconEl}</span>
                </div>
                <h3 className="font-bold text-[#000080] mb-2 text-sm">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed max-w-[200px]">{item.desc}</p>
              </div>
            );
          })}
        </div>
        {/* Mobile: vertical timeline */}
        <div className="md:hidden space-y-0 relative pl-8">
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#FF9933] via-[#138808] to-[#000080]" />
          {[
            { step: "01", color: "bg-[#FF9933]", title: t("landing.process.step1.title") || "Tell Us About Yourself", desc: t("landing.process.step1.desc") || "Answer simple questions about your business, income, and location." },
            { step: "02", color: "bg-[#138808]", title: t("landing.process.step2.title") || "AI Analyzes Your Eligibility", desc: t("landing.process.step2.desc") || "Our AI engine matches your profile against 21+ government schemes." },
            { step: "03", color: "bg-[#000080]", title: t("landing.process.step3.title") || "Get Personalized Matches", desc: t("landing.process.step3.desc") || "See schemes ranked by eligibility with requirements and benefits." },
            { step: "04", color: "bg-[#FF9933]", title: t("landing.process.step4.title") || "Apply With Guidance", desc: t("landing.process.step4.desc") || "Get document checklist, bank locator, and official application links." },
          ].map(function(item, i) {
            return (
              <div key={i} className={"relative pb-8 transition-all duration-500 " + (stepsVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4")} style={{transitionDelay: (i*120)+"ms"}}>
                <div className={"absolute -left-5 w-6 h-6 rounded-full " + item.color + " text-white flex items-center justify-center font-bold text-[10px] shadow-md z-10"}>{item.step}</div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm ml-2">
                  <h3 className="font-bold text-[#000080] mb-1 text-sm">{item.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-center text-xs text-gray-400 mt-8 max-w-lg mx-auto">CreditSetu helps users discover relevant government credit schemes based on their profile. Always verify eligibility on the official scheme website.</p>
      </div>
    </section>

    <section id="schemes" ref={schemesRef} className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-16 overflow-hidden"><div className="absolute inset-0 z-0"><img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1600&q=80" alt="" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gray-50/95 dark:bg-gray-900/95" /></div><div className="max-w-7xl mx-auto relative z-10"><div className={"text-center mb-16 transition-all duration-700 " + (schemesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}><h2 className="text-3xl md:text-4xl font-bold text-[#000080] mb-4">{t("landing.schemes.title")}</h2><div className="w-16 h-1 bg-[#138808] mx-auto rounded-full" /></div><div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">{schemes.map(function(scheme, i) { var SchemeIcon = scheme.icon; return (<div key={i} className={"relative p-5 sm:p-6 md:p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 " + (schemesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")} style={{transitionDelay: (i*150)+"ms"}}><div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-[#FF9933]/10 text-[#FF9933] border border-[#FF9933]/20">{scheme.badge}</div><div className="w-14 h-14 rounded-xl bg-[#138808]/10 flex items-center justify-center mb-6"><SchemeIcon className="w-7 h-7 text-[#138808]" /></div><h3 className="text-xl font-bold text-[#000080] mb-3">{scheme.name}</h3><p className="text-gray-600 text-sm leading-relaxed mb-6">{scheme.desc}</p><div className="flex items-center justify-between pt-5 border-t border-gray-100"><span className="text-sm text-gray-500">{scheme.range}</span><span className="text-sm font-bold text-[#138808]">{scheme.rate}</span></div></div>);})}</div></div></section>
    <section ref={testiRef} className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-16 bg-white dark:bg-gray-900"><div className="max-w-7xl mx-auto"><div className={"text-center mb-8 sm:mb-12 md:mb-16 transition-all duration-700 " + (testiVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}><h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#000080] mb-3 sm:mb-4">{t("landing.process.title")}</h2><div className="w-16 h-1 bg-[#FF9933] mx-auto rounded-full" /><p className="text-gray-500 mt-3 sm:mt-4 max-w-xl mx-auto text-sm sm:text-base">{t("landing.process.subtitle")}</p></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">{[{ icon: "form", step: "01", title: t("landing.process.step1.title"), desc: t("landing.process.step1.desc") },{ icon: "ai", step: "02", title: t("landing.process.step2.title"), desc: t("landing.process.step2.desc") },{ icon: "doc", step: "03", title: t("landing.process.step3.title"), desc: t("landing.process.step3.desc") },{ icon: "bank", step: "04", title: t("landing.process.step4.title"), desc: t("landing.process.step4.desc") }].map(function(item, i) { var iconEl; if (item.icon === "form") iconEl = (<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none"><rect x="8" y="6" width="32" height="36" rx="4" stroke="#FF9933" strokeWidth="2.5" fill="none"/><line x1="14" y1="16" x2="34" y2="16" stroke="#FF9933" strokeWidth="2" strokeLinecap="round"/><line x1="14" y1="22" x2="30" y2="22" stroke="#FF9933" strokeWidth="2" strokeLinecap="round"/><line x1="14" y1="28" x2="26" y2="28" stroke="#FF9933" strokeWidth="2" strokeLinecap="round"/><circle cx="34" cy="34" r="6" fill="#138808"/><path d="M31 34l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>); else if (item.icon === "ai") iconEl = (<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="16" stroke="#138808" strokeWidth="2.5" fill="none"/><circle cx="24" cy="24" r="6" fill="#138808" opacity="0.2"/><path d="M24 8v4M24 36v4M8 24h4M36 24h4" stroke="#138808" strokeWidth="2" strokeLinecap="round"/><path d="M13 13l3 3M32 32l3 3M13 35l3-3M32 16l3-3" stroke="#138808" strokeWidth="2" strokeLinecap="round"/></svg>); else if (item.icon === "doc") iconEl = (<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none"><path d="M12 8h18l8 8v24a4 4 0 01-4 4H12a4 4 0 01-4-4V12a4 4 0 014-4z" stroke="#FF9933" strokeWidth="2.5" fill="none"/><path d="M30 8v8h8" stroke="#FF9933" strokeWidth="2.5" fill="none"/><path d="M16 24h16M16 30h10" stroke="#FF9933" strokeWidth="2" strokeLinecap="round"/><circle cx="34" cy="34" r="6" fill="#138808"/><path d="M31 34l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>); else iconEl = (<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none"><rect x="6" y="20" width="36" height="22" rx="3" stroke="#138808" strokeWidth="2.5" fill="none"/><path d="M16 20V14a8 8 0 0116 0v6" stroke="#138808" strokeWidth="2.5" fill="none"/><circle cx="24" cy="31" r="3" fill="#138808"/><path d="M24 34v3" stroke="#138808" strokeWidth="2" strokeLinecap="round"/><path d="M14 12l4 4M34 12l-4 4" stroke="#138808" strokeWidth="2" strokeLinecap="round"/></svg>); return (<div key={i} className={"relative p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center " + (testiVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")} style={{transitionDelay: (i*150)+"ms"}}><div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#FF9933] text-white flex items-center justify-center font-bold text-xs">{item.step}</div><div className="flex justify-center mb-4 mt-2">{iconEl}</div><h3 className="font-bold text-[#000080] mb-2">{item.title}</h3><p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p></div>);})}</div></div></section><section ref={ctaRef} className={"relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-16 overflow-hidden transition-all duration-700 bg-[#138808] dark:bg-gray-950 " + (ctaVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}><div className="max-w-4xl mx-auto text-center"><h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">{t("landing.cta.title")}</h2><p className="text-sm sm:text-lg text-white/80 mb-6 sm:mb-10">{t("landing.cta.subtitle")}</p><Link to={ctaPath} className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg text-[#138808] font-semibold bg-white hover:bg-gray-100 transition-colors shadow-lg">{t("landing.hero.get_started")} <ArrowRight className="w-5 h-5" /></Link></div></section>

    <footer id="contact" className="bg-[#000080] py-8 sm:py-12 px-4 sm:px-6 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#FF9933]/10 border border-[#FF9933]/20 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-10 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4"><div className="flex items-center gap-3"><Phone className="w-6 h-6 text-[#FF9933]" /><div><div className="text-white font-semibold text-lg">{t("landing.footer.helpline")}</div><div className="text-[#FF9933] font-bold text-xl">{helpline}</div></div></div><div className="text-white/50 text-sm text-center md:text-right">{t("landing.footer.available_247")}</div></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-10 mb-8 sm:mb-12">
          <div><div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 rounded-lg bg-[#138808] flex items-center justify-center"><Landmark className="w-4 h-4 text-white" /></div><span className="text-white font-semibold text-lg">CreditSetu</span></div><p className="text-white/60 text-sm mb-4">{t("landing.footer.government_scheme_finder")}</p><div className="flex items-center gap-3"><a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-[#138808] hover:text-white transition-all"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></a><a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-[#138808] hover:text-white transition-all"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.148 0 7.372 2.96 7.372 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.633 0 12.017 0z"/></svg></a><a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-[#138808] hover:text-white transition-all"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg></a></div></div>
          <div><h4 className="text-white/80 font-semibold text-sm uppercase tracking-wider mb-4">{t("landing.footer.quick_links")}</h4><ul className="space-y-2.5"><li><Link to="/" className="text-white/50 hover:text-white text-sm transition-colors">{t("landing.footer.home")}</Link></li><li><Link to="/get-started" className="text-white/50 hover:text-white text-sm transition-colors">{t("landing.footer.check_eligibility")}</Link></li><li><Link to="/find-bank" className="text-white/50 hover:text-white text-sm transition-colors">{t("landing.footer.find_bank")}</Link></li></ul></div>
          <div><h4 className="text-white/80 font-semibold text-sm uppercase tracking-wider mb-4">{t("landing.footer.legal")}</h4><ul className="space-y-2.5"><li><Link to="/privacy-policy" className="text-white/50 hover:text-white text-sm transition-colors">{t("landing.footer.privacy")}</Link></li><li><Link to="/terms" className="text-white/50 hover:text-white text-sm transition-colors">{t("landing.footer.terms")}</Link></li><li><Link to="/feedback" className="text-white/50 hover:text-white text-sm transition-colors">{t("landing.footer.feedback")}</Link></li></ul></div>
          <div><h4 className="text-white/80 font-semibold text-sm uppercase tracking-wider mb-4">{t("landing.footer.ministry")}</h4><div className="flex items-center gap-2 mb-3"><AshokaChakra /><div className="text-white/70 text-xs leading-tight">Government of India<br/>Ministry of Social Justice<br/>&amp; Empowerment</div></div><ul className="space-y-2.5"><li><span className="text-white/40 text-xs">SIH — PS 26092</span></li></ul></div>
        </div>
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4"><AshokaChakra /><p className="text-white/50 text-sm">Made with ❤️ by Team Codivra — Smart India Hackathon 2026</p></div>
          <p className="text-white/40 text-sm">© 2026 CreditSetu Scheme Finder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>);
}
