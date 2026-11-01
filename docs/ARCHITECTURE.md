# ApkaNeta — Architecture & Data Pipeline Guide

This document details the internal technical architecture, data processing workflows, and legal classification criteria powering **ApkaNeta**.

---

## 1. System Overview

ApkaNeta operates on a 3-tier hierarchical navigation paradigm:
1. **Level 1 (National):** Pan-India overview displaying all 36 States and Union Territories with executive leadership (Chief Ministers) and national statistics.
2. **Level 2 (State):** District-level administrative map showcasing all modern administrative districts, elected Members of Parliament, and the interactive **ADR Crime Heatmap**.
3. **Level 3 (Hyperlocal / Pilot):** Subdivision, assembly constituency (MLA), and municipal ward-level tender tracking (piloted in Bhiwadi, Khairthal-Tijara district).

---

## 2. Criminality & ADR Data Classification

### Background: Raw Cases vs. Crime Severity
In Indian political datasets, raw aggregate case counts can be misleading without understanding case nature:
- **Political & Protest FIRs:** Leaders who lead student movements, farmers' agitations, or political rallies often accumulate multiple FIRs under:
  - IPC 143/147/149: Unlawful assembly / public demonstration
  - IPC 188: Disobedience to Section 144 promulgation
  - IPC 283/341: Obstruction of public road during demonstrations
- **Serious Criminal Charges (ADR Standard):**
  1. Maximum statutory punishment of 5+ years.
  2. Non-bailable offenses.
  3. Violent crimes (Murder IPC 302, Attempt to murder IPC 307, Kidnapping).
  4. Crimes against women (Rape IPC 376, Outraging modesty IPC 354, Cruelty IPC 498A).
  5. Corruption and economic fraud (Prevention of Corruption Act, PMLA).
  6. Electoral offenses (Bribery, voter intimidation).

### Conviction Verification Criteria
A candidate is flagged as `convicted: true` when their official ECI Form 26 affidavit / MyNeta profile contains non-nil entries under the section `Cases where Convicted`, verified against ADR's official analysis of the 18th Lok Sabha.

---

## 3. TopoJSON & Geo-Boundary Processing

Vector maps in ApkaNeta are pre-projected and rendered directly using `d3-geo`:
- **Projection:** `geoMercator()` dynamically fit to SVG viewport `[[15, 15], [485, 535]]` for India, and `[[15, 15], [485, 435]]` for state district maps.
- **Centroid Calculation:** Pre-computes polygon centroids (`pathGen.centroid(feat)`) to dynamically pin MP portraits, warning icons (`⚠️`), and district labels.
- **Modern 2026 Adjustments:** State TopoJSON boundaries match the updated 791 administrative districts specified in `src/data/states-meta.json`.

---

## 4. Antigravity Lifecycle Hook Integration

The platform includes an automated session audit hook:
- **Configuration:** [`.agents/hooks.json`](file:///.agents/hooks.json)
- **Lifecycle Event:** `Stop` (triggers when the agent execution loop finishes).
- **Execution:** Calls [`scripts/session-update.sh`](file:///scripts/session-update.sh) which runs [`scripts/session_hook.py`](file:///scripts/session_hook.py).
- **Audit Target:** Writes conversation ID, completion status, and workspace git status to [`docs/SESSION_LOG.md`](file:///docs/SESSION_LOG.md).
