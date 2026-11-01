# 🇮🇳 ApkaNeta (आपका नेता)
### Hyperlocal Civic Transparency & Representative Accountability Platform

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.3_(Turbopack)-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![ADR MyNeta](https://img.shields.io/badge/Data_Source-ADR_/_MyNeta-DC2626?style=for-the-badge)](https://www.myneta.info/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**ApkaNeta** is an open-source civic-tech platform bringing radical transparency to Indian public governance. It empowers citizens to explore all **36 States & Union Territories**, inspect their modern **791 administrative districts**, track elected **Members of Parliament (MPs)** and **Chief Ministers**, audit public civic tenders, and visualize judicial & financial disclosures sourced directly from the **Association for Democratic Reforms (ADR)** and **MyNeta**.

---

## 📑 Table of Contents
- [Key Capabilities](#-key-capabilities)
- [Administrative Geography vs. Electoral Geography (791 vs. 543)](#-administrative-geography-vs-electoral-geography)
- [ADR Crime Heatmap & Severity Classification](#-adr-crime-heatmap--severity-classification)
- [100% Rajasthan MP Coverage](#-100-rajasthan-mp-coverage)
- [Hyperlocal Pilot: Bhiwadi (Khairthal-Tijara)](#-hyperlocal-pilot-bhiwadi-khairthal-tijara)
- [Project Architecture & Directory Structure](#-project-architecture--directory-structure)
- [Getting Started](#-getting-started)
- [Automated Lifecycle Hooks](#-automated-lifecycle-hooks)
- [Data Sources & Attribution](#-data-sources--attribution)

---

## 🌟 Key Capabilities

### 1. 2026 All-India Administrative Mapping (791 Districts)
- **All 36 States & Union Territories:** Complete interactive vector coverage.
- **Modern 2026 Demarcations:** Includes all recently carved administrative districts:
  - **Rajasthan (50 Districts):** Khairthal-Tijara, Balotra, Didwana-Kuchaman, Beawar, Kotputli-Behror, Sanchore, Phalodi, Anupgarh, Deeg, Salumber, Shahpura, etc.
  - **Andhra Pradesh (26 Districts):** NTR, Palnadu, Bapatla, Sri Sathya Sai, Dr. B.R. Ambedkar Konaseema, Annamayya, etc.
  - **Delhi (11 Revenue Districts):** Modern revenue boundaries.
  - **Madhya Pradesh (55 Districts), Maharashtra (36 Districts), Karnataka (31 Districts), Punjab (23 Districts), etc.**
- **Zero-Latency TopoJSON Engine:** Pre-projected vector geometries rendered using `d3-geo` Mercator projection with sub-second transitions and no external map API keys required.

### 2. MyNeta / ADR Criminal Heatmap & Conviction Warning
- **18th Lok Sabha Ingestion:** Directly ingests verified candidate affidavits submitted to the Election Commission of India (ECI) and analyzed by ADR.
- **Dynamic 5-Tier Color Shading:**
  - 🟢 **0 Cases (Clean Record):** Subtle emerald green tint
  - 🟡 **1–2 Minor Cases:** Amber yellow tint
  - 🟠 **3–5 Moderate Cases:** Orange tint
  - 🔴 **6+ Severe Cases:** Crimson red tint
  - 🚨 **Convicted in Criminal Case:** Deep crimson with `#991B1B` border, pulsating red aura, and a prominent **`⚠️`** warning badge on the district polygon.
- **Interactive Mode Switcher:** Toggle smoothly between **`[⚖️ ADR Crime Heatmap]`** and **`[🏛️ Civic View]`**.
- **Representative Scorecards:**
  - MP name, political party, and parliamentary constituency.
  - Declared criminal cases count and serious charges.
  - **`⚠️ CONVICTED IN CRIMINAL CASE`** alert banner with exact court name and legal sections.
  - Educational qualifications and declared assets.
  - One-click link to the official candidate affidavit (`MyNeta Affidavit ↗`).

---

## 🗺️ Administrative Geography vs. Electoral Geography

A frequent question in Indian civic data: ***"If India has 543 Parliamentary Constituencies, how can there be 791 Districts?"***

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Parliamentary Constituencies (543 Lok Sabha Seats)       │ ── Elects MPs (National Level)
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 2. Administrative Districts (791 Districts in 2026)          │ ── Run by IAS District Magistrates (State Level)
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 3. Assembly Constituencies (4,123 Vidhan Sabha Seats)        │ ── Elects MLAs (State Legislature)
└─────────────────────────────────────────────────────────────┘
```

1. **Districts (791):** Created and reorganized by **State Governments** for administrative convenience, law and order, revenue collection, and civic governance. In 1971, India had ~350 districts; today there are 791.
2. **Parliamentary Constituencies (543):** Demarcated by the **Delimitation Commission of India** to elect Lok Sabha MPs. Total seats were frozen at 543 by constitutional amendments based on the 1971 Census (until the post-2026 Delimitation).

### How They Overlap:
- **1 MP covering Multiple Districts (Rural areas):** e.g., the *Barmer Lok Sabha Seat* spans **Barmer**, **Jaisalmer**, and **Balotra** districts. *Kota-Bundi* spans Kota and Bundi districts. *Jhalawar-Baran* spans Jhalawar and Baran districts.
- **1 District containing Multiple MPs (Urban centers):** e.g., *Bengaluru Urban* contains **3 entire Lok Sabha seats** (Bangalore North, South, Central). *Mumbai* (2 revenue districts) is split into **6 Lok Sabha seats**.

**ApkaNeta solves this cleanly:** Clicking any of India's 791 administrative districts immediately resolves to the corresponding Lok Sabha MP representing that district's citizens in Parliament.

---

## ⚖️ ADR Crime Heatmap & Severity Classification

In Indian electoral transparency, raw case counts can be misleading without understanding case nature:

| Case Nature | Typical IPC / Legal Sections | ADR Classification | Example |
| :--- | :--- | :--- | :--- |
| **Political & Protest FIRs** | IPC 143, 147, 149 (Unlawful assembly), IPC 188 (Sec 144 breach), IPC 283 (Rasta roko) | Non-Serious / Political Agitation | Student/farmer dharnas, public rallies, traffic blockades |
| **Serious Criminal Charges** | IPC 302 (Murder), IPC 307 (Attempt to murder), IPC 376 (Crimes against women), Corruption Act, PMLA | **Serious Criminal Cases** (Non-bailable, 5+ yrs punishment) | Violent crimes, financial fraud, abuse of power |
| **Convictions** | Court rulings resulting in imprisonment or fines | **Convicted Cases** | Flagged with prominent **`⚠️ CONVICTED`** warning banners |

ApkaNeta makes this distinction transparent in every representative's scorecard so citizens can differentiate between political agitation and serious criminality.

---

## 🇮🇳 100% Rajasthan MP Coverage

Every single district in Rajasthan is mapped with its verified 18th Lok Sabha representative and official candidate portrait:

| District | Parliamentary Constituency | MP Name | Party | Photo |
| :--- | :--- | :--- | :--- | :--- |
| **Alwar** | Alwar (No. 8) | Bhupender Yadav | BJP | Cabinet Minister Portrait |
| **Jaipur** | Jaipur | Manju Sharma | BJP | Unique ECI Portrait |
| **Jaipur Rural** | Jaipur Rural | Rao Rajendra Singh | BJP | Unique ECI Portrait |
| **Ganganagar** & **Hanumangarh** | Ganganagar (SC) | Kuldeep Indora | INC | Unique ECI Portrait |
| **Bhilwara** & **Shahpura** | Bhilwara | Damodar Agarwal (⚠️ Convicted) | BJP | Unique ECI Portrait |
| **Jhunjhunu** | Jhunjhunu | Brijendra Singh Ola | INC | Unique ECI Portrait |
| **Jhalawar** & **Baran** | Jhalawar-Baran | Dushyant Singh | BJP | Unique ECI Portrait |
| **Kota** & **Bundi** | Kota-Bundi | Om Birla | BJP | Hon'ble Speaker Portrait |
| **Barmer** & **Jaisalmer** | Barmer | Ummeda Ram Beniwal | INC | Unique ECI Portrait |
| **Jalore** & **Sirohi** | Jalore | Lumbaram Choudhary | BJP | Unique ECI Portrait |
| **Banswara** & **Dungarpur** | Banswara (ST) | Rajkumar Roat | BAP | Unique ECI Portrait |
| **Chittorgarh** & **Pratapgarh**| Chittorgarh | C.P. Joshi | BJP | Unique ECI Portrait |
| **Dausa** | Dausa (ST) | Murari Lal Meena | INC | Unique ECI Portrait |
| **Karauli** & **Dholpur** | Karauli-Dholpur (SC) | Bhajan Lal Jatav | INC | Unique ECI Portrait |
| **Tonk** & **Sawai Madhopur**| Tonk-Sawai Madhopur | Harish Chandra Meena | INC | Unique ECI Portrait |
| **Rajsamand** | Rajsamand | Mahima Kumari Mewar | BJP | Unique ECI Portrait |
| **Ajmer**, **Beawar**, **Kekri**| Ajmer | Bhagirath Choudhary | BJP | MoS Agriculture Portrait |
| **Nagaur** & **Kuchaman** | Nagaur | Hanuman Beniwal | RLP | Unique Portrait |
| **Jodhpur** & **Phalodi** | Jodhpur | Gajendra Singh Shekhawat | BJP | Cabinet Minister Portrait |
| **Pali** | Pali | P.P. Chaudhary | BJP | Unique Portrait |
| **Bikaner** | Bikaner (SC) | Arjun Ram Meghwal | BJP | MoS Law & Justice Portrait |
| **Churu** | Churu | Rahul Kaswan | INC | Unique Portrait |
| **Sikar** | Sikar | Amra Ram | CPI(M) | Unique Portrait |
| **Bharatpur** & **Deeg** | Bharatpur (SC) | Sanjana Jatav | INC | Unique Portrait |
| **Udaipur** & **Salumber** | Udaipur (ST) | Manna Lal Rawat | BJP | Unique Portrait |

---

## 🔍 Hyperlocal Pilot: Bhiwadi (Khairthal-Tijara)

Accessible at [`/rajasthan/khairthal-tijara/bhiwadi`](http://localhost:3000/rajasthan/khairthal-tijara/bhiwadi):
- **Local Governance Auditing:** Tracks the Bhiwadi Municipal Council, Urban Improvement Trust (UIT), and RIICO industrial sectors.
- **Assembly Constituencies (MLAs):** Detailed profiles of Tijara (Baba Balak Nath) and Kishangarh Bas (Deepchand Kheria).
- **Public Tender Tracker:** Audits active civil and sanitation contracts, awarded contractor names, project values, and status.

---

## 🏛️ Project Architecture & Directory Structure

```
apka-neta/
├── .agents/
│   └── hooks.json               # Antigravity session audit lifecycle hook
├── docs/
│   ├── ARCHITECTURE.md          # Architectural & legal data pipeline guide
│   └── SESSION_LOG.md           # Automated session audit log
├── public/
│   ├── images/leaders/          # Official photos of Chief Ministers & MPs
│   │   ├── mps/                 # Dedicated portraits for Lok Sabha MPs
│   │   └── cms/                 # Official portraits for State Chief Ministers
│   └── topojson/                # Vector TopoJSON boundary maps
│       ├── india-merged-states.json
│       └── states/              # State-specific district TopoJSON files
├── scripts/
│   ├── compile-district-mps.py  # All-India MP and MyNeta crime data compiler
│   ├── update-rajasthan-mps.py  # High-precision Rajasthan 25 MP pipeline
│   ├── session_hook.py          # Session logging hook execution logic
│   └── session-update.sh        # Shell entrypoint for Antigravity hook
└── src/
    ├── app/                     # Next.js App Router (Turbopack)
    ├── components/
    │   └── map/IndiaMap.tsx     # Vector SVG map with Heatmap & Avatar badges
    └── data/
        ├── states-meta.json     # All 36 States/UTs with 791 official 2026 districts
        ├── chief-ministers.json # All 36 State Chief Ministers & Governors
        ├── all-district-mps.json# Consolidated All-India MP & ADR criminality dataset
        └── mps-rajasthan.json   # Curated 25 Rajasthan Lok Sabha MPs
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** `v18.x` or `v20.x`
- **npm:** `v9+`
- **Python:** `3.9+` (for running data ingestion scripts)

### Installation
```bash
# Clone the repository
git clone https://github.com/Rishiraj2594/apka-neta.git
cd apka-neta

# Install npm dependencies
npm install

# Start the Turbopack development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
npm run build
npm run start
```

---

## 🔄 Automated Lifecycle Hooks

ApkaNeta integrates with Google Antigravity's Customization System via [`.agents/hooks.json`](file:///.agents/hooks.json):
- **`session-audit` (`Stop` Hook):** Automatically triggers when an agent session turn completes.
- **Audit Logger:** Executes [`scripts/session-update.sh`](file:///scripts/session-update.sh) to append the session ID, timestamp, and workspace status to [`docs/SESSION_LOG.md`](file:///docs/SESSION_LOG.md).

---

## ⚖️ Data Sources & Attribution
- **Election Commission of India (ECI):** Candidate affidavits (Form 26), election returns, and official delimitation maps.
- **Association for Democratic Reforms (ADR) & National Election Watch (MyNeta):** Candidate criminal background analysis, serious IPC classification, and financial disclosures.
- **Government of Rajasthan & State Portals:** Revenue district notifications and municipal council tender notices.
