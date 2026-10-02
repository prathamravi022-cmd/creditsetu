/**
 * Landing-page scheme showcase.
 *
 * Exactly three cards per category chip, so every filter — Agriculture,
 * Education, Health, Business, Women, SC/ST/OBC, Housing — fills its row
 * completely instead of landing on "no schemes match".
 *
 * These are showcase entries (real scheme names, representative terms) that
 * mirror src/services/schemesData.json; the recommender still ranks from that
 * dataset. `tKey` entries reuse the existing landing.schemes translations so
 * the translated copy is not lost.
 */
import {
  BadgePercent, Briefcase, GraduationCap, HeartPulse, Home, IndianRupee,
  Landmark, ShieldCheck, Sprout, Store, TrendingUp, Tractor, Users, Wallet,
} from 'lucide-react';

const IMG = (id) => `https://images.unsplash.com/${id}?w=800&q=80`;

export const LANDING_SCHEMES = [
  /* ---- Agriculture ---- */
  {
    cat: 'agriculture', icon: Sprout, img: IMG('photo-1500937386664-56d1dfef3854'),
    name: 'Kisan Credit Card', desc: 'Short-term crop and allied activity credit at concessional rates.',
    range: 'Up to ₹3 Lakh', rate: '7% p.a.', badge: 'Farmer favourite',
  },
  {
    cat: 'agriculture', icon: Tractor, img: IMG('photo-1464226184884-fa280b87c399'),
    name: 'PM-KUSUM Pump Finance', desc: 'Solar pump and irrigation equipment financing with subsidy support.',
    range: 'Up to ₹5 Lakh', rate: '6% p.a.', badge: 'Green energy',
  },
  {
    cat: 'agriculture', icon: Landmark, img: IMG('photo-1526304640581-d334cdbbf45e'),
    name: 'NABARD Farm Term Loan', desc: 'Long-term investment credit for farm infrastructure and equipment.',
    range: '₹50K – ₹10L', rate: '8.5% p.a.', badge: 'Long tenure',
  },

  /* ---- Education ---- */
  {
    cat: 'education', featured: true, tKey: 'landing.schemes.edu', icon: GraduationCap,
    img: IMG('photo-1503676260728-1c00da094a0b'),
    range: 'Up to ₹10 Lakh', rate: '7.5% p.a.', badge: 'For Students',
  },
  {
    cat: 'education', icon: GraduationCap, img: IMG('photo-1523240795612-9a054b0db644'),
    name: 'Post-Matric Scholarship', desc: 'Tuition and maintenance support for post-matriculation study.',
    range: 'Up to ₹1.2 Lakh', rate: 'Subsidy', badge: 'SC/ST/OBC',
  },
  {
    cat: 'education', icon: Wallet, img: IMG('photo-1531973576160-7125cd663d86'),
    name: 'Skill India Training Loan', desc: 'Short vocational course financing with placement support.',
    range: 'Up to ₹1.5 Lakh', rate: '7% p.a.', badge: 'Short course',
  },

  /* ---- Health ---- */
  {
    cat: 'health', icon: HeartPulse, img: IMG('photo-1576091160399-112ba8d25d1d'),
    name: 'Ayushman Bharat Support', desc: 'Cashless secondary and tertiary hospital care for eligible families.',
    range: 'Up to ₹5 Lakh', rate: 'Subsidy', badge: 'Family cover',
  },
  {
    cat: 'health', icon: IndianRupee, img: IMG('photo-1526304640581-d334cdbbf45e'),
    name: 'MUDRA Medical Loan', desc: 'Small-ticket credit for urgent medical and treatment expenses.',
    range: 'Up to ₹50,000', rate: '10% p.a.', badge: 'Emergency',
  },
  {
    cat: 'health', icon: Store, img: IMG('photo-1595246140625-573b715d11dc'),
    name: 'Clinic Equipment Finance', desc: 'Diagnostics and clinic equipment financing with guarantee cover.',
    range: '₹5L – ₹50L', rate: '9% p.a.', badge: 'For clinics',
  },

  /* ---- Business / MSME ---- */
  {
    cat: 'business', featured: true, tKey: 'landing.schemes.micro', icon: IndianRupee,
    img: IMG('photo-1610030469983-98e550d6193c'),
    range: 'Up to ₹1.40 Lakh', rate: '6.5% p.a.', badge: 'Micro finance',
  },
  {
    cat: 'business', icon: BadgePercent, img: IMG('photo-1595246140625-573b715d11dc'),
    name: 'PMEGP Subsidy Loan', desc: 'Margin money subsidy paired with bank credit for new units.',
    range: '₹10L – ₹50L', rate: '6% p.a.', badge: 'Subsidy',
  },
  {
    cat: 'business', icon: ShieldCheck, img: IMG('photo-1531973576160-7125cd663d86'),
    name: 'CGTMSE Credit Guarantee', desc: 'Guarantee cover that unlocks collateral-free term loans.',
    range: 'Up to ₹2 Crore', rate: '9% p.a.', badge: 'No collateral',
  },

  /* ---- Women empowerment ---- */
  {
    cat: 'women', icon: Users, img: IMG('photo-1573497019940-1c28c88b4f3e'),
    name: 'Stand-Up India', desc: 'Composite loan for women and SC/ST entrepreneurs setting up units.',
    range: '₹10L – ₹1 Crore', rate: '7.5% p.a.', badge: 'For women',
  },
  {
    cat: 'women', icon: Briefcase, img: IMG('photo-1610030469983-98e550d6193c'),
    name: 'Mahila Udyam Nidhi', desc: 'Softer terms and lower margin for women-led small enterprises.',
    range: 'Up to ₹10 Lakh', rate: '6% p.a.', badge: 'Women-led',
  },
  {
    cat: 'women', icon: Users, img: IMG('photo-1500937386664-56d1dfef3854'),
    name: 'SHG Group Financing', desc: 'Group credit for women self-help groups with repayment flexibility.',
    range: 'Up to ₹5 Lakh', rate: '7% p.a.', badge: 'SHG group',
  },

  /* ---- SC / ST / OBC ---- */
  {
    cat: 'sc-st', featured: true, tKey: 'landing.schemes.term', icon: TrendingUp,
    img: IMG('photo-1601050690597-df0568f70950'),
    range: '₹1.40L - ₹50L', rate: '8% p.a.', badge: 'Popular',
  },
  {
    cat: 'sc-st', icon: IndianRupee, img: IMG('photo-1464226184884-fa280b87c399'),
    name: 'NSFDC Micro Finance', desc: 'Small loans for SC/ST micro enterprises and self-employment.',
    range: 'Up to ₹1.40 Lakh', rate: '6.5% p.a.', badge: 'SC / ST',
  },
  {
    cat: 'sc-st', icon: Landmark, img: IMG('photo-1541888946425-d81bb19240f5'),
    name: 'NMDFC Term Loan (OBC)', desc: 'Term loan for OBC entrepreneurs at concessional interest.',
    range: '₹5L – ₹20L', rate: '8.5% p.a.', badge: 'OBC',
  },

  /* ---- Housing ---- */
  {
    cat: 'housing', icon: Home, img: IMG('photo-1560518883-ce09059eeffa'),
    name: 'PMAY Urban Interest Subsidy', desc: 'Interest subsidy on home loans for eligible urban families.',
    range: 'Up to ₹18 Lakh', rate: '6.5% p.a.', badge: 'Subsidy',
  },
  {
    cat: 'housing', icon: Landmark, img: IMG('photo-1541888946425-d81bb19240f5'),
    name: 'NSFDC Housing Loan', desc: 'Housing credit for SC/ST families for construction or repair.',
    range: 'Up to ₹15 Lakh', rate: '7% p.a.', badge: 'SC / ST',
  },
  {
    cat: 'housing', icon: Home, img: IMG('photo-1560518883-ce09059eeffa'),
    name: 'HUDCO Shelter Finance', desc: 'Long-tenure finance for house construction and extension.',
    range: '₹5L – ₹25L', rate: '8% p.a.', badge: 'Long tenure',
  },
];
