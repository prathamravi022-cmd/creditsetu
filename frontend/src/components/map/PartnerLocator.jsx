/**
 * PartnerLocator — scrollable card list with search, sort, filter.
 * Changes: Full card list as primary view, search bar, sort dropdown,
 * filter chips, CSC tab, skeleton loading, empty state, result count.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { BANK_BRANCHES, BANK_TYPES, SORT_OPTIONS } from '../../data/bankBranches';
import { CSC_CENTERS, CSC_SERVICES_LIST } from '../../data/cscCenters';
import {
  MapPin, Phone, CheckCircle, XCircle, Navigation, Building2,
  Search, ArrowUpDown, Filter, Banknote, ExternalLink, Star,
  ChevronDown, ChevronUp, Map
} from 'lucide-react';
import PageBackdrop from '../art/PageBackdrop';

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      <PageBackdrop variant="findbank" />
      <div aria-hidden="true" className="cs-orb cs-orb-green w-[340px] h-[340px] -top-24 right-[-8%] opacity-50" />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-green-900">{t('map.title')}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {activeTab === 'banks'
              ? `${t('map.title')} — ${filteredBanks.length} ${i18n.language === 'hi' ? 'बैंक शाखाएं' : 'bank branches'} ${radius} km ${i18n.language === 'hi' ? 'के भीतर' : 'within'}`
              : `${filteredCSC.length} ${t('map.csc_tab')} — ${radius} km ${i18n.language === 'hi' ? 'के भीतर' : 'within'}`
            }
          </p>
        </div>
        <button onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          <Map className="w-4 h-4" /> {showMap ? t('map.show_list') : t('map.show_map')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('banks')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'banks' ? 'bg-green-700 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
          <Building2 className="w-4 h-4 inline mr-1" /> {t('map.banks_tab')} ({BANK_BRANCHES.length})
        </button>
        <button onClick={() => setActiveTab('csc')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'csc' ? 'bg-green-700 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
          <Star className="w-4 h-4 inline mr-1" /> {t('map.csc_tab')} ({CSC_CENTERS.length})
        </button>
      </div>

      {/* Map Toggle */}
      {showMap && (
        <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200">
          {MapComponent ? (
            <MapComponent center={userLocation} partners={activeTab === 'banks' ? filteredBanks : filteredCSC.map(c => ({...c, npa_percentage: 0, funds_available: true, supported_schemes: []}))} selectedPartner={selectedPartner} onSelectPartner={setSelectedPartner} />
          ) : (
            <div className="h-[400px] bg-slate-200 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder={`Search ${activeTab === 'banks' ? 'bank name, branch, IFSC, district...' : 'center name, district...'}`}
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-green-700 outline-none" />
        </div>

        {activeTab === 'banks' && (
          <>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-green-700 outline-none">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-green-700 outline-none">
              {BANK_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </>
        )}

        <select value={radius} onChange={(e) => setRadius(Number(e.target.value))}
          className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-green-700 outline-none">
          <option value={10}>{t('map.within_10')}</option>
          <option value={25}>{t('map.within_25')}</option>
          <option value={50}>{t('map.within_50')}</option>
          <option value={100}>{t('map.within_100')}</option>
          <option value={1000}>{t('map.all')}</option>
        </select>

        <button onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => { setUserLocation([pos.coords.latitude, pos.coords.longitude]); toast.success('Location updated!'); },
              () => toast.error('Could not get location')
            );
          }
        }} className="flex items-center gap-2 px-4 py-2.5 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition-colors">
          <Navigation className="w-4 h-4" /> {t('map.my_location')}
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 animate-pulse">
              <div className="flex justify-between mb-3">
                <div className="space-y-2 flex-1"><div className="h-5 w-48 bg-slate-200 rounded" /><div className="h-3 w-32 bg-slate-200 rounded" /></div>
                <div className="h-6 w-20 bg-slate-200 rounded-full" />
              </div>
              <div className="h-3 w-full bg-slate-100 rounded mb-2" />
              <div className="flex gap-2"><div className="h-8 w-24 bg-slate-200 rounded-lg" /><div className="h-8 w-24 bg-slate-200 rounded-lg" /></div>
            </div>
          ))}
        </div>
      ) : activeTab === 'banks' ? (
        filteredBanks.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">{t('map.no_results')}</h3>
            <p className="text-slate-400">{i18n.language === 'hi' ? 'त्रिज्या बढ़ाएं या खोज बदलें।' : 'Try increasing the radius or changing your search.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBanks.map((bank) => (
              <motion.div key={bank.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">

                {/* Card Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-green-900 text-sm">{bank.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${bank.bank_type === 'psb' ? 'bg-green-100 text-green-700' : bank.bank_type === 'rrb' ? 'bg-green-100 text-green-700' : bank.bank_type === 'sca' ? 'bg-purple-100 text-purple-700' : bank.bank_type === 'nbfc_mfi' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
                          {bank.bank_type_display}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{bank.branch_name}</p>
                      <p className="text-xs text-slate-400 mt-1"><MapPin className="w-3 h-3 inline mr-1" />{bank.address}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${bank.npa_percentage < 10 ? 'text-green-700' : 'text-red-600'}`}>
                        {bank.npa_percentage}% NPA
                      </p>
                      <p className="text-xs text-slate-400">{bank.distance_km} km</p>
                    </div>
                  </div>

                  {/* Status Row */}
                  <div className="flex items-center gap-3 mt-3">
                    {bank.funds_available ? (
                      <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" /> {t('map.funds')}: {formatFunds(bank.funds_remaining)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        <XCircle className="w-3 h-3" /> {t('map.no_funds')}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">{bank.ifsc}</span>
                  </div>
                </div>

                {/* Expandable Details */}
                {expandedCard === bank.id && (
                  <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                    <p className="text-xs font-medium text-slate-500 mb-2">Supported Schemes:</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {bank.supported_schemes.map((s, i) => (
                        <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                      {bank.supported_schemes.length === 0 && <span className="text-xs text-slate-400">No specific schemes listed</span>}
                    </div>
                    <p className="text-xs text-slate-400">📞 {bank.contact_phone}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="px-4 py-3 bg-slate-50 flex items-center gap-2 border-t border-slate-100">
                  {bank.funds_available && (
                    <button onClick={() => handleApply(bank)} className="flex-1 bg-green-700 text-white py-2 rounded-lg text-xs font-medium hover:bg-green-800 transition-colors">
                      {t('map.apply_here')}
                    </button>
                  )}
                  <button onClick={() => handleCall(bank.contact_phone)}
                    className="flex items-center justify-center px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" title={t('map.call_now')}>
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDirections(bank.lat, bank.lng)}
                    className="flex items-center justify-center px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" title={t('map.get_directions')}>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setExpandedCard(expandedCard === bank.id ? null : bank.id)}
                    className="flex items-center justify-center px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" title={t('map.details')}>
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
            <Star className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">{t('map.no_results')}</h3>
            <p className="text-slate-400">{i18n.language === 'hi' ? 'त्रिज्या बढ़ाएं या खोज बदलें।' : 'Try increasing the radius or changing your search.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCSC.map((csc) => (
              <motion.div key={csc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-green-900 text-sm">{csc.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wider">CSC</span>
                      </div>
                      <p className="text-xs text-slate-500">{csc.address}</p>
                      <p className="text-xs text-slate-400 mt-1">VLE: {csc.vle_name} • 📞 {csc.contact}</p>
                    </div>
                    <p className="text-xs text-slate-400">{csc.distance_km} km</p>
                  </div>

                  {/* Services */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {csc.services.slice(0, 5).map((s, i) => (
                      <span key={i} className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                    {csc.services.length > 5 && (
                      <span className="text-[10px] text-slate-400">+{csc.services.length - 5} more</span>
                    )}
                  </div>
                </div>

                <div className="px-4 py-3 bg-slate-50 flex items-center gap-2 border-t border-slate-100">
                  <button onClick={() => handleCall(csc.contact)} className="flex items-center gap-1.5 px-3 py-2 bg-green-700 text-white rounded-lg text-xs font-medium hover:bg-green-800 transition-colors">
                    <Phone className="w-3 h-3" /> {t('map.call_vle')}
                  </button>
                  <button onClick={() => handleDirections(csc.lat, csc.lng)} className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
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
