# 🇮🇳 ApkaNeta (आपका नेता)
### Hyperlocal Civic Transparency & Representative Accountability Platform

ApkaNeta is an open-source civic-tech platform designed to bring institutional transparency to Indian governance. It connects citizens with their elected representatives (Members of Parliament, Chief Ministers, and MLAs), audits local civic contracts and tenders, and visualizes criminal background and financial declarations sourced from the **Association for Democratic Reforms (ADR)** and **MyNeta**.

---

## 🌟 Key Capabilities

### 1. 2026 All-India Administrative Mapping (791 Districts)
- **36 States & Union Territories:** Complete coverage of all 28 states and 8 UTs.
- **Modern 2026 Boundaries:** Incorporates the latest district demarcations across India:
  - **Rajasthan (50 Districts):** Full mapping of newly formed administrative units (Khairthal-Tijara, Balotra, Didwana-Kuchaman, Beawar, Kotputli-Behror, Sanchore, Phalodi, etc.).
  - **Andhra Pradesh (26 Districts):** Reorganized district boundaries (NTR, Palnadu, Bapatla, Sri Sathya Sai, Konaseema, etc.).
  - **Delhi (11 Revenue Districts):** Modern geographic boundaries.
  - **Maharashtra, Madhya Pradesh, Karnataka, Punjab, etc.**
- **Zero-Latency TopoJSON Engine:** Inlined, optimized TopoJSON vector geometries rendered using `d3-geo` Mercator projection with sub-second state transitions.

### 2. MyNeta / ADR Criminal Heatmap & Conviction Warning
- **18th Lok Sabha Ingestion (543 MPs):** Directly ingests official candidate affidavits submitted to the Election Commission of India (ECI) and analyzed by the **Association for Democratic Reforms (ADR)**.
- **Dynamic 5-Tier Crime Heatmap:**
  - 🟢 **0 Cases (Clean Record):** Subtle emerald green
  - 🟡 **1–2 Minor Cases:** Amber yellow
  - 🟠 **3–5 Moderate Cases:** Orange
  - 🔴 **6+ Severe Cases:** Crimson red
  - 🚨 **Convicted in Criminal Case:** Deep crimson with `#991B1B` border, pulsating aura, and prominent **`⚠️`** warning sign.
- **Interactive Mode Switcher:** Instant toggling between **`[⚖️ ADR Crime Heatmap]`** and **`[🏛️ Civic View]`**.
- **Representative Scorecard:**
  - MP name, political party, and parliamentary constituency.
  - Declared criminal cases count and serious criminal charges.
  - **`⚠️ CONVICTED IN CRIMINAL CASE`** alert banner with exact court, case numbers, and legal sections.
  - Educational qualifications and declared assets.
  - Direct link to official candidate affidavit (`MyNeta Affidavit ↗`).

### 3. Hyperlocal Pilot (Bhiwadi / Khairthal-Tijara, Rajasthan)
- Deep-dive into local governance in Bhiwadi (Khairthal-Tijara district).
- Tracks urban local bodies (Bhiwadi Municipal Council, UIT), assembly constituencies (Tijara, Kishangarh Bas), local MLAs, ward councilors, and active municipal tenders.

---

## 🏛️ Architecture & Data Structure

```
apka-neta/
├── .agents/
│   └── hooks.json               # Antigravity session audit lifecycle hook
├── docs/
│   ├── ARCHITECTURE.md          # In-depth architectural & data pipeline guide
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
- Node.js 18.x or 20.x
- Python 3.9+ (for data ingestion scripts)

### Installation
```bash
# Clone repository
git clone https://github.com/your-username/apka-neta.git
cd apka-neta

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
npm run build
npm run start
```

---

## 🔄 Automated Lifecycle Hooks

ApkaNeta integrates with Google Antigravity's Customization System via [`.agents/hooks.json`](file:///.agents/hooks.json):
- **`session-audit` (`Stop` Hook):** Whenever a session turn completes, it executes [`scripts/session-update.sh`](file:///scripts/session-update.sh) to record the conversation ID, completion status, and workspace git status into [`docs/SESSION_LOG.md`](file:///docs/SESSION_LOG.md).

---

## ⚖️ Data Sources & Attribution
- **Election Commission of India (ECI):** Candidate affidavits, election results, and constituency demarcations.
- **Association for Democratic Reforms (ADR) & National Election Watch (MyNeta):** Criminal background reports, asset disclosures, and conviction records.
- **Survey of India & Ministry of Home Affairs:** Official administrative boundary lists.
