<div align="center">

# 🇮🇳 CreditSetu

### AI-Driven Government Credit Scheme Discovery Platform

**Empowering India's underserved entrepreneurs with intelligent scheme matching**

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![Django](https://img.shields.io/badge/Django-4.2-green?logo=django)](https://www.djangoproject.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-orange?logo=firebase)](https://firebase.google.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Live Demo](https://creditsetu-gray.vercel.app/) · [Report Bug](https://github.com/prathamravi022-cmd/CreditSetu/issues) · [Request Feature](https://github.com/prathamravi022-cmd/CreditSetu/issues)

</div>

---

## 📋 Problem Statement

India has **200+ government credit schemes** for marginalized entrepreneurs (SC/ST/Women, annual income ≤ ₹5 Lakhs), but most beneficiaries **cannot find or access** the right schemes. Complex eligibility criteria, language barriers, and lack of digital literacy prevent millions from benefiting.

**CreditSetu bridges this gap** with AI-powered scheme matching, multilingual support, and voice-based interaction.

---

## ✨ Key Features

### 🎯 Smart Scheme Matching
- AI-driven recommendation engine matching users with eligible government schemes
- Approval probability scoring based on income, category, location, and project cost
- Real-time eligibility assessment across 21+ government schemes

### 🌐 7 Indian Languages
| Language | Code |
|----------|------|
| English | EN |
| Hindi | HI |
| Tamil | TA |
| Telugu | TE |
| Bengali | BN |
| Marathi | MR |
| Kannada | KN |

### 🔐 Secure Authentication
- Firebase Phone OTP verification
- Google OAuth sign-in
- Secure admin authentication with test OTP support

### 🌙 Dark Mode
- Full dark mode toggle for comfortable viewing
- Persists across sessions

### 📱 Offline PWA Support
- Progressive Web App — works offline on weak internet
- Installable on mobile and desktop

### 🎤 Voice Input
- Web Speech API integration for hands-free form filling
- Ideal for low-literacy users

### 📤 Share & Export
- SMS / WhatsApp share buttons for scheme results
- PDF export of scheme details and EMI calculations

### 🏦 Interactive Map
- Leaflet-powered map to find nearest eligible banks
- PostGIS geospatial queries for partner discovery

### 📊 Admin Dashboard
- Real-time analytics and user management
- Usage statistics and audit logs
- District-wise heatmap visualization

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18, Vite 5 | SPA framework + build tool |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS |
| **Animation** | Framer Motion | Page transitions & micro-interactions |
| **State** | Zustand | Lightweight state management |
| **i18n** | react-i18next | 7-language support |
| **Maps** | React Leaflet + OpenStreetMap | Free geo-spatial queries |
| **Charts** | Recharts | Admin dashboard analytics |
| **PDF** | jsPDF + html2canvas | Scheme report export |
| **Auth** | Firebase (Phone OTP + Google) | Secure authentication |
| **Backend** | Django 4.2 + DRF | REST API server |
| **Database** | PostgreSQL + PostGIS | Geospatial queries |
| **SMS** | MSG91 (India-focused) | OTP delivery |
| **Deployment** | Vercel (frontend) | Automatic CI/CD |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **PostgreSQL** 15+ with PostGIS extension
- **Firebase** project with Phone Auth enabled

### 1. Clone the Repository

```bash
git clone https://github.com/prathamravi022-cmd/CreditSetu.git
cd CreditSetu
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase credentials

# Start development server
npm run dev
```

The frontend runs at `http://localhost:5173`.

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database and MSG91 credentials

# Setup PostgreSQL
createdb creditsetu
psql creditsetu -c "CREATE EXTENSION postgis;"

# Run migrations
python manage.py makemigrations accounts schemes partners applications grievance admin_dashboard
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Load seed data
python manage.py loaddata fixtures/seed_data.json

# Start server
python manage.py runserver
```

The backend runs at `http://localhost:8000`.

---

## 📁 Project Structure

```
CreditSetu/
├── README.md                          # This file
├── LICENSE                            # MIT License
├── .gitignore                         # Comprehensive ignore rules
│
├── frontend/                          # React + Vite + Tailwind
│   ├── public/                        # PWA manifest, service worker, icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── landing/               # Hero, features, CTA sections
│   │   │   ├── onboarding/            # 4-step progressive wizard
│   │   │   ├── results/               # Scheme cards, EMI calculator, glossary
│   │   │   ├── map/                   # Bank locator with Leaflet
│   │   │   ├── admin/                 # Admin dashboard + login
│   │   │   ├── auth/                  # Login screen
│   │   │   ├── grievance/             # Complaint ticketing
│   │   │   ├── legal/                 # Privacy policy, terms
│   │   │   ├── common/                # Navbar, Footer, ErrorBoundary, 404
│   │   │   └── ui/                    # Reusable UI components
│   │   ├── config/                    # Firebase config
│   │   ├── data/                      # Static data (schemes, etc.)
│   │   ├── hooks/                     # Custom hooks (voice input, etc.)
│   │   ├── i18n/                      # Internationalization
│   │   │   ├── config.js              # i18n configuration
│   │   │   └── locales/               # 7 language files (en, hi, ta, te, bn, mr, kn)
│   │   ├── services/                  # API service layer
│   │   ├── store/                     # Auth context, Dark mode context
│   │   └── utils/                     # PDF export, helpers
│   ├── .env.example                   # Firebase + API env template
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── vercel.json
│
└── backend/                           # Django + DRF + PostGIS
    ├── config/                        # Settings, URLs, WSGI
    ├── apps/
    │   ├── accounts/                  # User model, OTP, JWT auth, SMS service
    │   ├── schemes/                   # Recommender engine, EMI calculator
    │   ├── partners/                  # PostGIS geo-spatial partner queries
    │   ├── applications/              # Loan application tracking
    │   ├── grievance/                 # Complaint ticketing
    │   ├── notifications/             # SMS notification service
    │   └── admin_dashboard/           # Analytics + heatmap APIs
    ├── data/                          # Scheme JSON configurations
    ├── fixtures/                      # Database seed data
    ├── manage.py
    ├── requirements.txt
    └── .env.example                   # Django + DB + MSG91 env template
```

---

## 🏛️ Application Flow

### Phase 1: Progressive Onboarding (4 Steps)
1. **Auth & Basics** — Mobile OTP verification, language, gender, age
2. **Location** — State, district, pincode, urban/rural
3. **Social Category** — SC/ST/OBC/General, disability status
4. **Financial Intent** — BPL status, income, loan purpose, project cost

### Phase 2: AI Recommender Engine
- Rule-based matching against government schemes
- Approval probability scoring (0–100%)
- Factors: income, category, project cost, BPL, location, purpose

### Phase 3: Results Dashboard
- Matched scheme cards with probability badges
- Interactive EMI calculator with moratorium support
- Financial glossary tooltips (Moratorium, NPA, Subsidy, etc.)
- PDF export of scheme details + amortization schedule

### Phase 4: Geo-Spatial Partner Locator
- Interactive map with nearest eligible banks
- Filters: radius, bank type, NPA < 10%, funds available

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp/` | Send OTP via Firebase/MSG91 |
| POST | `/api/auth/verify-otp/` | Verify OTP + get JWT |
| POST | `/api/schemes/recommend/` | Get matched schemes |
| POST | `/api/schemes/calculate-emi/` | Calculate EMI with moratorium |
| GET | `/api/partners/nearby/?lat=&lng=` | Find nearest banks |
| POST | `/api/applications/create/` | Submit loan application |
| POST | `/api/grievance/create/` | Raise grievance ticket |
| GET | `/api/admin/dashboard/` | Admin summary analytics |
| GET | `/api/admin/heatmap/` | District heatmap data |

---

## 🎨 Design System

| Element | Color | Usage |
|---------|-------|-------|
| **Base (60%)** | White / Light Gray | Backgrounds, cards |
| **Primary (30%)** | Trust Green `#15803d` | Buttons, success states |
| **Accent (10%)** | Saffron `#f97316` | CTAs, warnings |
| **Headings** | Navy Blue `#0f2440` | Typography |

---

## 🔒 Security

- ✅ Firebase API keys moved to environment variables
- ✅ OTP hashed (SHA-256) with 60-second expiry
- ✅ Single-use OTP (deleted after verification)
- ✅ Max 5 verification attempts per OTP
- ✅ Rate limiting on OTP endpoints
- ✅ No secrets committed to repository
- ✅ `.env.example` templates provided without real values

---

## 🔮 Future Improvements

- [ ] **DigiLocker Integration** — Zero-upload document verification
- [ ] **Real-time Chat Support** — WhatsApp Business API integration
- [ ] **Advanced Analytics** — ML-based scheme recommendation improvements
- [ ] **Multi-state Expansion** — Cover all 28 states + 8 UTs
- [ ] **Offline Form Submission** — Queue and sync when online
- [ ] **SMS Notifications** — Real-time application status updates via MSG91
- [ ] **Accessibility** — WCAG 2.1 AA compliance audit
- [ ] **Performance** — Lighthouse score optimization to 95+
- [ ] **Unit Tests** — Jest + React Testing Library coverage
- [ ] **CI/CD Pipeline** — GitHub Actions for automated testing + deployment

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Pratham Ravi**
- GitHub: [@prathamravi022-cmd](https://github.com/prathamravi022-cmd)

---

<div align="center">

**Built with ❤️ for Smart India Hackathon 2024**
Ministry of Social Justice and Empowerment — Problem Statement 26092

🇮🇳 *Empowering India's entrepreneurs, one scheme at a time*

</div>
