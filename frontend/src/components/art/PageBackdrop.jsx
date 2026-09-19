/**
 * PageBackdrop — unique decorative SVG scene per page.
 * Pure vector art: zero network cost, offline-safe, crisp at any size.
 * All scenes: aria-hidden, pointer-events none, brand palette only,
 * low opacity so content readability is never compromised.
 *
 * Variants: login | admin | dashboard | onboarding | results |
 *           findbank | profile | legal | notfound
 */

var GREEN = '#138808';
var SAFFRON = '#FF9933';
var NAVY = '#000080';

function SceneLogin() {
  // Floating rupee coins + connecting arcs — credit flowing to the user
  return (
    <svg className="page-art-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="lg-arc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={SAFFRON} />
          <stop offset="100%" stopColor={GREEN} />
        </linearGradient>
      </defs>
      <path d="M-100 750 Q 400 550 720 620 T 1540 380" fill="none" stroke="url(#lg-arc)" strokeWidth="2" opacity="0.18" strokeDasharray="1 14" strokeLinecap="round" />
      <path d="M-100 820 Q 500 640 900 700 T 1540 520" fill="none" stroke={GREEN} strokeWidth="1.5" opacity="0.12" />
      {[
        { cx: 1160, cy: 180, r: 52, o: 0.16 },
        { cx: 1300, cy: 340, r: 34, o: 0.12 },
        { cx: 1040, cy: 420, r: 22, o: 0.1 },
        { cx: 180, cy: 200, r: 40, o: 0.1 },
        { cx: 90, cy: 420, r: 24, o: 0.08 },
      ].map(function (c, i) {
        return (
          <g key={i} opacity={c.o}>
            <circle cx={c.cx} cy={c.cy} r={c.r} fill="none" stroke={SAFFRON} strokeWidth="2.5" />
            <text x={c.cx} y={c.cy + c.r * 0.32} textAnchor="middle" fill={SAFFRON} fontSize={c.r * 0.9} fontWeight="700">₹</text>
          </g>
        );
      })}
      <circle cx="1240" cy="620" r="120" fill="none" stroke={GREEN} strokeWidth="1.5" opacity="0.1" />
      <circle cx="1240" cy="620" r="80" fill="none" stroke={GREEN} strokeWidth="1.5" opacity="0.14" />
    </svg>
  );
}

function SceneAdmin() {
  // Shield outline + fine security grid + keyhole dots — restricted zone
  return (
    <svg className="page-art-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g opacity="0.1" stroke={NAVY} strokeWidth="1">
        {Array.from({ length: 9 }, function (_, i) { return <line key={'v' + i} x1={i * 180} y1="0" x2={i * 180} y2="900" />; })}
        {Array.from({ length: 6 }, function (_, i) { return <line key={'h' + i} x1="0" y1={i * 180} x2="1440" y2={i * 180} />; })}
      </g>
      <g transform="translate(1150, 190)" opacity="0.14">
        <path d="M140 10 L250 55 V190 C250 285 200 345 140 375 C80 345 30 285 30 190 V55 Z"
          fill="none" stroke={GREEN} strokeWidth="3" />
        <path d="M140 55 L215 87 V190 C215 258 180 302 140 326 C100 302 65 258 65 190 V87 Z"
          fill="none" stroke={SAFFRON} strokeWidth="1.5" opacity="0.7" />
        <circle cx="140" cy="175" r="26" fill="none" stroke={NAVY} strokeWidth="3" />
        <rect x="131" y="195" width="18" height="42" rx="6" fill={NAVY} opacity="0.8" />
      </g>
      {[
        [120, 140], [210, 220], [95, 330], [260, 120], [170, 430], [1310, 640], [1220, 720], [1360, 540],
      ].map(function (p, i) {
        return <circle key={i} cx={p[0]} cy={p[1]} r="4" fill={GREEN} opacity="0.22" />;
      })}
    </svg>
  );
}

function SceneDashboard() {
  // Rising bar chart + trend arrow — command center
  return (
    <svg className="page-art-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g transform="translate(90, 380)" opacity="0.14">
        {[
          { x: 0, h: 90, c: SAFFRON }, { x: 70, h: 140, c: GREEN },
          { x: 140, h: 110, c: NAVY }, { x: 210, h: 190, c: GREEN },
          { x: 280, h: 240, c: SAFFRON }, { x: 350, h: 310, c: GREEN },
        ].map(function (b, i) {
          return <rect key={i} x={b.x} y={340 - b.h} width="46" height={b.h} rx="8" fill={b.c} opacity="0.55" />;
        })}
        <path d="M20 300 L 95 240 L 165 270 L 235 190 L 305 130 L 375 60" fill="none" stroke={GREEN} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M375 60 L 340 58 M375 60 L 372 96" stroke={GREEN} strokeWidth="3.5" strokeLinecap="round" />
      </g>
      <g opacity="0.1">
        <circle cx="1200" cy="700" r="150" fill="none" stroke={SAFFRON} strokeWidth="1.5" />
        <circle cx="1200" cy="700" r="100" fill="none" stroke={SAFFRON} strokeWidth="1.5" opacity="0.6" />
        <path d="M1050 700 H 1350 M1200 550 V 850" stroke={SAFFRON} strokeWidth="1" strokeDasharray="4 6" />
      </g>
      <path d="M700 -40 L 1440 220" stroke={NAVY} strokeWidth="1" opacity="0.06" />
      <path d="M660 0 L 1440 300" stroke={NAVY} strokeWidth="1" opacity="0.05" />
    </svg>
  );
}

function SceneOnboarding() {
  // Tilted document sheets + progress dots — telling your story
  return (
    <svg className="page-art-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g transform="translate(1100, 120) rotate(8)" opacity="0.16">
        <rect x="0" y="0" width="230" height="300" rx="14" fill="none" stroke={GREEN} strokeWidth="2.5" />
        <rect x="26" y="-26" width="230" height="300" rx="14" fill="none" stroke={SAFFRON} strokeWidth="2" opacity="0.7" />
        <rect x="30" y="42" width="130" height="9" rx="4.5" fill={SAFFRON} opacity="0.5" />
        <rect x="30" y="70" width="170" height="6" rx="3" fill={GREEN} opacity="0.4" />
        <rect x="30" y="92" width="150" height="6" rx="3" fill={GREEN} opacity="0.3" />
        <rect x="30" y="114" width="165" height="6" rx="3" fill={GREEN} opacity="0.3" />
        <circle cx="160" cy="220" r="34" fill="none" stroke={GREEN} strokeWidth="2.5" />
        <path d="M146 220 l10 10 20 -22" stroke={GREEN} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g transform="translate(80, 560) rotate(-6)" opacity="0.1">
        <rect x="0" y="0" width="180" height="230" rx="12" fill="none" stroke={NAVY} strokeWidth="2" />
        <rect x="24" y="36" width="100" height="7" rx="3.5" fill={NAVY} />
        <rect x="24" y="60" width="130" height="5" rx="2.5" fill={NAVY} opacity="0.6" />
        <rect x="24" y="80" width="115" height="5" rx="2.5" fill={NAVY} opacity="0.5" />
      </g>
      <g opacity="0.2">
        {[
          [720, 180, SAFFRON], [800, 250, GREEN], [880, 200, NAVY],
          [340, 120, GREEN], [420, 90, SAFFRON],
        ].map(function (d, i) {
          return <circle key={i} cx={d[0]} cy={d[1]} r={i % 2 ? 6 : 4} fill={d[2]} />;
        })}
      </g>
    </svg>
  );
}

function SceneResults() {
  // Constellation of matched nodes with check marks — matches found
  return (
    <svg className="page-art-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g opacity="0.12" stroke={GREEN} strokeWidth="1">
        <line x1="180" y1="200" x2="340" y2="130" /><line x1="340" y1="130" x2="500" y2="220" />
        <line x1="500" y1="220" x2="440" y2="400" /><line x1="180" y1="200" x2="440" y2="400" />
        <line x1="1150" y1="180" x2="1300" y2="300" /><line x1="1300" y1="300" x2="1220" y2="460" />
        <line x1="1150" y1="180" x2="1010" y2="320" /><line x1="1010" y1="320" x2="1220" y2="460" />
      </g>
      {[
        { x: 180, y: 200, r: 16 }, { x: 340, y: 130, r: 12 }, { x: 500, y: 220, r: 20, check: true },
        { x: 440, y: 400, r: 10 }, { x: 1150, y: 180, r: 14 }, { x: 1300, y: 300, r: 18, check: true },
        { x: 1220, y: 460, r: 11 }, { x: 1010, y: 320, r: 9 },
      ].map(function (n, i) {
        return (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={n.r} fill={n.check ? GREEN : 'none'} stroke={n.check ? GREEN : SAFFRON} strokeWidth="2" opacity={n.check ? 0.28 : 0.2} />
            {n.check && (
              <path d={'M' + (n.x - n.r * 0.4) + ' ' + n.y + ' l' + (n.r * 0.3) + ' ' + (n.r * 0.35) + ' l' + (n.r * 0.55) + ' ' + (-n.r * 0.7)}
                stroke={GREEN} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            )}
          </g>
        );
      })}
      <path d="M-50 700 Q 360 600 720 680 T 1500 560" fill="none" stroke={SAFFRON} strokeWidth="1.5" opacity="0.1" strokeDasharray="2 10" strokeLinecap="round" />
    </svg>
  );
}

function SceneFindBank() {
  // Street grid + roads + location pins + dashed route — navigation
  return (
    <svg className="page-art-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g opacity="0.09" stroke={NAVY} strokeWidth="1.5">
        {Array.from({ length: 10 }, function (_, i) { return <line key={'v' + i} x1={i * 160} y1="0" x2={i * 160} y2="900" />; })}
        {Array.from({ length: 7 }, function (_, i) { return <line key={'h' + i} x1="0" y1={i * 150} x2="1440" y2={i * 150} />; })}
      </g>
      <path d="M0 760 C 300 700 500 820 760 740 S 1200 620 1440 700" fill="none" stroke={SAFFRON} strokeWidth="3" opacity="0.2" strokeDasharray="12 10" strokeLinecap="round" />
      <g transform="translate(1180, 210)" opacity="0.2">
        <path d="M40 0 C 18 0 0 18 0 40 C 0 70 40 110 40 110 S 80 70 80 40 C 80 18 62 0 40 0 Z" fill="none" stroke={GREEN} strokeWidth="3" />
        <circle cx="40" cy="38" r="14" fill={GREEN} opacity="0.6" />
      </g>
      <g transform="translate(140, 300)" opacity="0.13">
        <path d="M30 0 C 13 0 0 13 0 30 C 0 53 30 83 30 83 S 60 53 60 30 C 60 13 47 0 30 0 Z" fill="none" stroke={SAFFRON} strokeWidth="2.5" />
        <circle cx="30" cy="28" r="10" fill={SAFFRON} opacity="0.5" />
      </g>
      <g opacity="0.1" fill={GREEN}>
        <rect x="640" y="160" width="70" height="46" rx="6" />
        <rect x="740" y="160" width="70" height="46" rx="6" opacity="0.7" />
        <rect x="640" y="240" width="70" height="46" rx="6" opacity="0.5" />
        <rect x="740" y="240" width="70" height="46" rx="6" opacity="0.35" />
      </g>
    </svg>
  );
}

function SceneProfile() {
  // ID card outline with avatar + field lines — your identity
  return (
    <svg className="page-art-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g transform="translate(1080, 200) rotate(-5)" opacity="0.15">
        <rect x="0" y="0" width="300" height="190" rx="16" fill="none" stroke={GREEN} strokeWidth="2.5" />
        <rect x="0" y="0" width="300" height="42" rx="16" fill={SAFFRON} opacity="0.25" />
        <circle cx="62" cy="108" r="30" fill="none" stroke={NAVY} strokeWidth="2.5" />
        <circle cx="62" cy="98" r="10" fill={NAVY} opacity="0.5" />
        <path d="M40 128 C 44 114 80 114 84 128" fill="none" stroke={NAVY} strokeWidth="2.5" />
        <rect x="112" y="88" width="150" height="8" rx="4" fill={GREEN} opacity="0.5" />
        <rect x="112" y="110" width="120" height="6" rx="3" fill={GREEN} opacity="0.35" />
        <rect x="112" y="128" width="135" height="6" rx="3" fill={GREEN} opacity="0.25" />
      </g>
      <g transform="translate(60, 520) rotate(4)" opacity="0.09">
        <rect x="0" y="0" width="220" height="140" rx="12" fill="none" stroke={NAVY} strokeWidth="2" />
        <circle cx="46" cy="70" r="22" fill="none" stroke={NAVY} strokeWidth="2" />
        <rect x="84" y="52" width="110" height="7" rx="3.5" fill={NAVY} opacity="0.6" />
        <rect x="84" y="72" width="90" height="5" rx="2.5" fill={NAVY} opacity="0.4" />
      </g>
      <path d="M840 -60 L 1440 160" stroke={GREEN} strokeWidth="1" opacity="0.07" />
      <path d="M800 -20 L 1440 210" stroke={SAFFRON} strokeWidth="1" opacity="0.06" />
    </svg>
  );
}

function SceneLegal() {
  // Stacked paper sheets + seal — fine print
  return (
    <svg className="page-art-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g transform="translate(1120, 150) rotate(7)" opacity="0.13">
        <rect x="18" y="18" width="200" height="260" rx="10" fill="none" stroke={NAVY} strokeWidth="2" />
        <rect x="9" y="9" width="200" height="260" rx="10" fill="none" stroke={GREEN} strokeWidth="2" />
        <rect x="0" y="0" width="200" height="260" rx="10" fill="none" stroke={SAFFRON} strokeWidth="2.5" />
        <rect x="26" y="42" width="110" height="8" rx="4" fill={SAFFRON} opacity="0.55" />
        <rect x="26" y="66" width="148" height="5" rx="2.5" fill={GREEN} opacity="0.4" />
        <rect x="26" y="84" width="130" height="5" rx="2.5" fill={GREEN} opacity="0.3" />
        <rect x="26" y="102" width="140" height="5" rx="2.5" fill={GREEN} opacity="0.3" />
        <circle cx="150" cy="200" r="30" fill="none" stroke={NAVY} strokeWidth="2" strokeDasharray="4 3" />
        <path d="M150 186 l5 10 11 1 -8 8 2 11 -10 -5 -10 5 2 -11 -8 -8 11 -1 Z" fill={NAVY} opacity="0.4" />
      </g>
      <g transform="translate(70, 600)" opacity="0.08">
        <circle cx="0" cy="0" r="90" fill="none" stroke={GREEN} strokeWidth="2" />
        <circle cx="0" cy="0" r="64" fill="none" stroke={GREEN} strokeWidth="1.5" strokeDasharray="5 4" />
      </g>
    </svg>
  );
}

function SceneNotFound() {
  // Dashed path ending in a "?" pin — lost
  return (
    <svg className="page-art-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <path d="M-60 520 C 240 460 420 620 660 540 S 1010 420 1105 470"
        fill="none" stroke={SAFFRON} strokeWidth="3" opacity="0.2" strokeDasharray="14 12" strokeLinecap="round" />
      <g transform="translate(1065, 300)" opacity="0.22">
        <path d="M45 0 C 20 0 0 20 0 45 C 0 78 45 122 45 122 S 90 78 90 45 C 90 20 70 0 45 0 Z" fill="none" stroke={GREEN} strokeWidth="3" />
        <text x="45" y="56" textAnchor="middle" fill={GREEN} fontSize="42" fontWeight="700">?</text>
      </g>
      {[
        [220, 300], [330, 220], [480, 340], [880, 680], [1010, 740], [200, 700],
      ].map(function (p, i) {
        return <circle key={i} cx={p[0]} cy={p[1]} r={i % 2 ? 5 : 3.5} fill={i % 2 ? GREEN : NAVY} opacity="0.16" />;
      })}
    </svg>
  );
}

var SCENES = {
  login: SceneLogin,
  admin: SceneAdmin,
  dashboard: SceneDashboard,
  onboarding: SceneOnboarding,
  results: SceneResults,
  findbank: SceneFindBank,
  profile: SceneProfile,
  legal: SceneLegal,
  notfound: SceneNotFound,
};

export default function PageBackdrop({ variant }) {
  var Scene = SCENES[variant] || null;
  if (!Scene) return null;
  return (
    <div className="page-art" aria-hidden="true">
      <Scene />
    </div>
  );
}
