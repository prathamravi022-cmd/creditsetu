/**
 * PartnerLocator — scrollable card list with search, sort, filter.
 * Theme-aware: readable in both light and dark mode.
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  MapPin, Phone, CheckCircle, XCircle, Navigation, Building2,
  Search, ExternalLink, Star,
  ChevronDown, ChevronUp, Map, ChevronRight, Users
} from 'lucide-react';
import PageBackdrop from '../art/PageBackdrop';
import { BANK_BRANCHES, BANK_TYPES, SORT_OPTIONS } from '../../data/bankBranches';
import { CSC_CENTERS } from '../../data/cscCenters';

const cardBtn =
  'flex items-center justify-center px-3 py-2 border border-slate-300 dark:border-white/20 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors';

export default function PartnerLocator() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('banks');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [filterType, setFilterType] = useState('all');
  const [radius, setRadius] = useState(50);
  const [expandedCard, setExpandedCard] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [MapComponent, setMapComponent] = useState(null);
  const [userLocation, setUserLocation] = useState([26.8467, 80.9462]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const heroRef = useRef(null);
  const inView = useInView(heroRef, { once: true, amount: 0.2 });
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showMap && !MapComponent) {
      import('./MapContainer').then((mod) => setMapComponent(() => mod.default));
    }
  }, [showMap, MapComponent]);

  const filteredBanks = useMemo(() => {
    let list = BANK_BRANCHES.filter((p) => p.distance_km <= radius);
    if (filterType !== 'all') list = list.filter((p) => p.bank_type === filterType);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.branch_name.toLowerCase().includes(q) ||
        p.ifsc.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'distance') list.sort((a, b) => a.distance_km - b.distance_km);
    else if (sortBy === 'npa') list.sort((a, b) => a.npa_percentage - b.npa_percentage);
    else if (sortBy === 'funds') list.sort((a, b) => (b.funds_remaining || 0) - (a.funds_remaining || 0));
    return list;
  }, [radius, filterType, searchQuery, sortBy]);

  const filteredCSC = useMemo(() => {
    let list = CSC_CENTERS.filter((p) => p.distance_km <= radius);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => a.distance_km - b.distance_km);
    return list;
  }, [radius, searchQuery]);

  const handleApply = (partner) => {
    toast.success(`Application routed to ${partner.name} — ${partner.branch_name || partner.address}! (Demo)`);
  };

  const handleCall = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleDirections = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const formatFunds = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${val.toLocaleString()}`;
  };

  const inputCls =
    'scale-card w-full pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 border border-slate-300 dark:border-white/20 focus:border-brand-light outline-none';
  const selectCls =
    'scale-card px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/20 focus:border-brand-light outline-none';
  const tabIdle =
    'text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30 hover:text-slate-900 dark:hover:text-white';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      <PageBackdrop variant="findbank" />
      <div aria-hidden="true" className="cs-orb cs-orb-green w-[340px] h-[340px] -top-24 right-[-8%] opacity-50" />

      {/* Premium brand header */}
      <div
        className="scale-card p-6 mb-6"
        style={{ transform: inView ? 'translateY(0)' : 'translateY(12px)', opacity: inView ? 1 : 0, transition: 'opacity 0.5s ease, transform 0.5s ease' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">
                <span className="gradient-brand">{t('map.title')}</span>
              </h1>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeTab === 'banks'
                ? `${filteredBanks.length} ${i18n.language === 'hi' ? 'बैंक शाखाएं' : 'bank branches'} ${radius} km ${i18n.language === 'hi' ? 'के भीतर' : 'within'} — find the nearest partner bank to submit your scheme application.`
                : `${filteredCSC.length} ${t('map.csc_tab')} ${radius} km ${i18n.language === 'hi' ? 'के भीतर' : 'within'} — connect with a local common service centre.`
              }
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowMap(!showMap)}
              className="scale-card inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-white/20 text-sm font-medium text-slate-700 dark:text-white hover:border-brand-light hover:bg-brand-soft transition-colors"
            >
              <Map className="w-4 h-4 text-brand" /> {showMap ? t('map.show_list') : t('map.show_map')}
            </button>
            <button
              onClick={() => navigate('/get-started')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl text-sm font-medium hover:bg-brand-hover transition-colors shadow-sm"
            >
              <ChevronRight className="w-3.5 h-3.5" /> {t('map.find_scheme')}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('banks')}
          className={`scale-card px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'banks' ? 'bg-brand text-white shadow-sm' : tabIdle}`}
        >
          <Building2 className="w-4 h-4 inline mr-1" /> {t('map.banks_tab')} ({BANK_BRANCHES.length})
        </button>
        <button
          onClick={() => setActiveTab('csc')}
          className={`scale-card px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'csc' ? 'bg-brand text-white shadow-sm' : tabIdle}`}
        >
          <Star className="w-4 h-4 inline mr-1" /> {t('map.csc_tab')} ({CSC_CENTERS.length})
        </button>
      </div>

      {/* Map panel */}
      {showMap && (
        <div className="mb-6 scale-card overflow-hidden">
          {MapComponent ? (
            <MapComponent
              center={userLocation}
              partners={activeTab === 'banks' ? filteredBanks : filteredCSC.map((c) => ({ ...c, npa_percentage: 0, funds_available: true, supported_schemes: [] }))}
              selectedPartner={selectedPartner}
              onSelectPartner={setSelectedPartner}
            />
          ) : (
            <div className="h-[400px] bg-slate-200 dark:bg-slate-800/60 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'banks' ? 'bank name, branch, IFSC, district...' : 'center name, district...'}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={inputCls}
          />
        </div>

        {activeTab === 'banks' && (
          <>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={selectCls}>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={selectCls}>
              {BANK_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </>
        )}

        <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} className={selectCls}>
          <option value={10}>{t('map.within_10')}</option>
          <option value={25}>{t('map.within_25')}</option>
          <option value={50}>{t('map.within_50')}</option>
          <option value={100}>{t('map.within_100')}</option>
          <option value={1000}>{t('map.all')}</option>
        </select>

        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => { setUserLocation([pos.coords.latitude, pos.coords.longitude]); toast.success('Location updated!'); },
                () => toast.error('Could not get location')
              );
            }
          }}
          className="scale-card flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-sm font-medium hover:bg-brand-hover transition-colors shadow-sm"
        >
          <Navigation className="w-4 h-4" /> {t('map.my_location')}
        </button>
      </div>

      {/* Hero visual — authentic Indian context */}
      <motion.div
        ref={heroRef}
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-2xl overflow-hidden mb-6 h-44 sm:h-52 w-full border border-slate-200 dark:border-white/10"
      >
        <img
          src="https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=1200&q=75"
          alt="Gateway of India, Mumbai — Indian cities where CreditSetu partner bank branches and service centres are located"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="relative z-10 p-4 text-sm text-white max-w-xl">
          <p className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand" />
            {t('map.hero_text')}
          </p>
        </div>
      </motion.div>

      {/* Results */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="scale-card p-5 border border-slate-200 dark:border-white/10 animate-pulse">
              <div className="flex justify-between mb-3">
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-48 bg-slate-200 dark:bg-white/10 rounded" />
                  <div className="h-3 w-32 bg-slate-200 dark:bg-white/10 rounded" />
                </div>
                <div className="h-6 w-20 bg-slate-200 dark:bg-white/10 rounded-full" />
              </div>
              <div className="h-3 w-full bg-slate-200 dark:bg-white/10 rounded mb-2" />
              <div className="flex gap-2">
                <div className="h-8 w-24 bg-slate-200 dark:bg-white/10 rounded-lg" />
                <div className="h-8 w-24 bg-slate-200 dark:bg-white/10 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'banks' ? (
        filteredBanks.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('map.no_results')}</h3>
            <p className="text-slate-500 dark:text-slate-400">{i18n.language === 'hi' ? 'त्रिज्या बढ़ाएं या खोज बदलें।' : 'Try increasing the radius or changing your search.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBanks.map((bank) => (
              <motion.div key={bank.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="scale-card overflow-hidden">
                {/* Card Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{bank.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          bank.bank_type === 'psb' || bank.bank_type === 'rrb'
                            ? 'bg-brand/20 text-brand'
                            : bank.bank_type === 'sca'
                            ? 'bg-purple-500/15 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300'
                            : bank.bank_type === 'nbfc_mfi'
                            ? 'bg-orange-500/15 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300'
                            : 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300'
                        }`}>
                          {bank.bank_type_display}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{bank.branch_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        <MapPin className="w-3 h-3 inline mr-1 text-brand" />{bank.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${bank.npa_percentage < 10 ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {bank.npa_percentage}% NPA
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{bank.distance_km} km</p>
                    </div>
                  </div>

                  {/* Status Row */}
                  <div className="flex items-center gap-3 mt-3">
                    {bank.funds_available ? (
                      <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 border border-green-200 dark:text-green-400 dark:bg-green-900/30 dark:border-green-800/40 px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" /> {t('map.funds')}: {formatFunds(bank.funds_remaining)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-700 bg-red-100 border border-red-200 dark:text-red-400 dark:bg-red-900/30 dark:border-red-800/40 px-2 py-1 rounded-full">
                        <XCircle className="w-3 h-3" /> {t('map.no_funds')}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{bank.ifsc}</span>
                  </div>
                </div>

                {/* Expandable Details */}
                {expandedCard === bank.id && (
                  <div className="px-4 pb-4 border-t border-slate-200 dark:border-white/10 pt-3">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Supported Schemes:</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {bank.supported_schemes.map((s, i) => (
                        <span key={i} className="text-xs bg-brand/10 text-brand border border-brand/30 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                      {bank.supported_schemes.length === 0 && <span className="text-xs text-slate-500 dark:text-slate-400">No specific schemes listed</span>}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">📞 {bank.contact_phone}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="px-4 py-3 bg-slate-50 dark:bg-white/5 flex items-center gap-2 border-t border-slate-200 dark:border-white/10">
                  {bank.funds_available && (
                    <button onClick={() => handleApply(bank)} className="flex-1 bg-brand text-white py-2 rounded-lg text-xs font-medium hover:bg-brand-hover transition-colors shadow-sm">
                      {t('map.apply_here')}
                    </button>
                  )}
                  <button onClick={() => handleCall(bank.contact_phone)} className={cardBtn} title={t('map.call_now')}>
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDirections(bank.lat, bank.lng)} className={cardBtn} title={t('map.get_directions')}>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setExpandedCard(expandedCard === bank.id ? null : bank.id)} className={cardBtn} title={t('map.details')}>
                    {expandedCard === bank.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        /* CSC Tab */
        filteredCSC.length === 0 ? (
          <div className="text-center py-16">
            <Star className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('map.no_results')}</h3>
            <p className="text-slate-500 dark:text-slate-400">{i18n.language === 'hi' ? 'त्रिज्या बढ़ाएं या खोज बदलें।' : 'Try increasing the radius or changing your search.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCSC.map((csc) => (
              <motion.div key={csc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="scale-card overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{csc.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 uppercase tracking-wider border border-amber-500/40 dark:border-amber-500/30">CSC</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{csc.address}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        <Users className="w-3 h-3 inline mr-1 text-brand" />VLE: {csc.vle_name} • <Phone className="w-3 h-3 inline mr-1" />{csc.contact}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{csc.distance_km} km</p>
                  </div>

                  {/* Services */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {csc.services.slice(0, 5).map((s, i) => (
                      <span key={i} className="text-[10px] bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                    {csc.services.length > 5 && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-500">+{csc.services.length - 5} more</span>
                    )}
                  </div>
                </div>

                <div className="px-4 py-3 bg-slate-50 dark:bg-white/5 flex items-center gap-2 border-t border-slate-200 dark:border-white/10">
                  <button onClick={() => handleCall(csc.contact)} className="flex items-center gap-1.5 px-3 py-2 bg-brand text-white rounded-lg text-xs font-medium hover:bg-brand-hover transition-colors shadow-sm">
                    <Phone className="w-3 h-3" /> {t('map.call_vle')}
                  </button>
                  <button onClick={() => handleDirections(csc.lat, csc.lng)} className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 dark:border-white/20 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                    <ExternalLink className="w-3 h-3" /> {t('map.get_directions')}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
