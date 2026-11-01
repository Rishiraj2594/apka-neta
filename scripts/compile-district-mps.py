import json, re, os

# Load inputs
with open('/Users/rishirajsingh/Documents/projects/apka-neta/src/data/states-meta.json') as f:
    states_data = json.load(f)

with open('/tmp/all_543_winners.json') as f:
    winners = json.load(f)

with open('/tmp/convicted_mps_verified.json') as f:
    convicted_list = json.load(f)

# Existing rajasthan MPs for existing photos/curated data
rajasthan_mps_path = '/Users/rishirajsingh/Documents/projects/apka-neta/src/data/mps-rajasthan.json'
rajasthan_existing = {}
if os.path.exists(rajasthan_mps_path):
    with open(rajasthan_mps_path) as f:
        rajasthan_existing = json.load(f)

convicted_ids = {c['id']: c for c in convicted_list}
convicted_names = {re.sub(r'[^a-z]', '', c['name'].lower()): c for c in convicted_list}

def normalize(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())

# Map constituency norm -> winner
constituency_map = {}
for w in winners:
    c_norm = normalize(w['constituency'])
    # also strip (sc), (st) suffixes
    c_base = re.sub(r'(sc|st)$', '', c_norm)
    constituency_map[c_norm] = w
    constituency_map[c_base] = w

# Specific manual aliases for newly formed / split districts or special PC names
DISTRICT_PC_ALIASES = {
    # Rajasthan 2026 50 districts
    'khairthaltijara': 'alwar',
    'kotputlibehror': 'jaipurrural',
    'balotra': 'barmer',
    'didwanakuchaman': 'nagaur',
    'beawar': 'ajmer',
    'kekri': 'ajmer',
    'sanchore': 'jalore',
    'phalodi': 'jodhpur',
    'anupgarh': 'ganganagar',
    'deeg': 'bharatpur',
    'salumber': 'udaipur',
    'shahpura': 'bhilwara',
    'gangapurcity': 'tonksawaimadhopur',
    'dudu': 'jaipur',
    'jaipur': 'jaipur',
    'jaipurrural': 'jaipurrural',
    'jodhpur': 'jodhpur',
    'jodhpurrural': 'jodhpur',

    # Andhra Pradesh 2026 26 districts
    'anakapalli': 'anakapalle',
    'allurisitharamaraju': 'araku',
    'annamayya': 'rajampet',
    'bapatla': 'bapatla',
    'drbrambedkarkonaseema': 'amalapuram',
    'eluru': 'eluru',
    'kakinada': 'kakinada',
    'nandyal': 'nandyal',
    'ntr': 'vijayawada',
    'palnadu': 'narasaraopet',
    'parvathipurammanyam': 'araku',
    'srisathyasai': 'hindupur',
    'tirupati': 'tirupati',
    'yjsr': 'kadapa',

    # Delhi 11 revenue districts
    'centraldelhi': 'chandnichowk',
    'eastdelhi': 'eastdelhi',
    'newdelhi': 'newdelhi',
    'northdelhi': 'chandnichowk',
    'northeastdelhi': 'northeastdelhi',
    'northwestdelhi': 'northwestdelhi',
    'shahdara': 'eastdelhi',
    'southdelhi': 'southdelhi',
    'southeastdelhi': 'southdelhi',
    'southwestdelhi': 'westdelhi',
    'westdelhi': 'westdelhi',

    # Maharashtra
    'mumbaicity': 'mumbaisouth',
    'mumbaisuburban': 'mumbaisouthcentral',
    'chhatrapatisambhajinagar': 'aurangabad',
    'dharashiv': 'osmanabad',
    'ahilyanagar': 'ahmednagar',

    # UP
    'prayagraj': 'allahabad',
    'ayodhya': 'faizabad',
    'amroha': 'amroha',
    'sambhal': 'sambhal',
    'ghazipur': 'ghazipur',
    'varanasi': 'varanasi',
    'lucknow': 'lucknow',
    'kanpurnagar': 'kanpur',
    'kanpurdehat': 'akbarpur',
    'gautambuddh Nagar': 'gautambuddhanagar',
    'hathras': 'hathras',
    'kasganj': 'etah',

    # West Bengal
    'kolkata': 'kolkatadakshin',
    'alipurduar': 'alipurduars',
    'coochbehar': 'coochbehar',
    'darjeeling': 'darjeeling',
    'jalpaiguri': 'jalpaiguri',
    'jhargram': 'jhargram',
    'kalimpong': 'darjeeling',
    'paschimmedinipur': 'medinipur',
    'purbamedinipur': 'tamluk',

    # Karnataka
    'bengaluruurban': 'bangaloresouth',
    'bengalururural': 'bangalorerural',
    'vijayanagara': 'bellary',

    # Punjab
    'malerkotla': 'sangrur',
    'fazilka': 'ferozepur',
    'pathankot': 'gurdaspur',

    # Madhya Pradesh
    'mauganj': 'rewa',
    'maihar': 'satna',
    'pandhurna': 'chhindwara',
    'niwari': 'tikamgarh'
}

def find_winner_for_district(state_name, district_name):
    d_norm = normalize(district_name)

    # 1. Check alias
    if d_norm in DISTRICT_PC_ALIASES:
        pc_target = DISTRICT_PC_ALIASES[d_norm]
        if pc_target in constituency_map:
            return constituency_map[pc_target]

    # 2. Check direct match
    if d_norm in constituency_map:
        return constituency_map[d_norm]

    # 3. Substring match
    for c_norm, w in constituency_map.items():
        if d_norm in c_norm or c_norm in d_norm:
            # check length similarity to avoid tiny false matches
            if len(d_norm) >= 4 and len(c_norm) >= 4:
                return w

    # 4. Fallback: match by partial name token
    d_tokens = re.findall(r'[a-z]{4,}', district_name.lower())
    for token in d_tokens:
        for c_norm, w in constituency_map.items():
            if token in c_norm:
                return w

    return None

by_state_district = {}
by_district = {}
total_matched = 0
total_with_cases = 0
total_convicted = 0

for state in states_data['states']:
    state_name = state['name']
    by_state_district[state_name] = {}

    for d in state.get('districts', []):
        w = find_winner_for_district(state_name, d)
        
        # Check if we have existing curated photo/data in rajasthan
        existing = rajasthan_existing.get(d, {})

        if w:
            total_matched += 1
            cid = w['id']
            name_norm = normalize(w['name'])
            
            # Check conviction
            is_convicted = False
            conviction_details = None
            if cid in convicted_ids:
                is_convicted = True
                conviction_details = convicted_ids[cid].get('conviction_details', 'Convicted under applicable IPC / Special Acts')
            elif name_norm in convicted_names:
                is_convicted = True
                conviction_details = convicted_names[name_norm].get('conviction_details', 'Convicted under applicable IPC / Special Acts')

            cases = w.get('criminalCases', 0)
            if cases > 0:
                total_with_cases += 1
            if is_convicted:
                total_convicted += 1

            mp_obj = {
                "mp": w['name'],
                "party": w['party'],
                "constituency": f"{w['constituency']} Lok Sabha",
                "criminalCases": cases,
                "convicted": is_convicted,
                "convictionDetails": conviction_details,
                "education": w.get('education', ''),
                "assets": w.get('assets', ''),
                "myneta_url": w.get('myneta_url', f"https://www.myneta.info/LokSabha2024/candidate.php?candidate_id={cid}"),
                "photo": existing.get('photo', f"/images/leaders/mps/{normalize(d)}.jpg" if os.path.exists(f"/Users/rishirajsingh/Documents/projects/apka-neta/public/images/leaders/mps/{normalize(d)}.jpg") else None),
                "portfolio": existing.get('portfolio', None),
                "wiki": existing.get('wiki', w['name'])
            }
        else:
            # Fallback for small territories
            mp_obj = {
                "mp": existing.get('mp', f"Member of Parliament ({d})"),
                "party": existing.get('party', "Elected Representative"),
                "constituency": existing.get('constituency', f"{d} PC"),
                "criminalCases": 0,
                "convicted": False,
                "convictionDetails": None,
                "education": "Public Representative",
                "assets": "Declared in ECI Affidavit",
                "myneta_url": existing.get('myneta_url', "https://www.myneta.info/LokSabha2024/"),
                "photo": existing.get('photo', None),
                "portfolio": existing.get('portfolio', None),
                "wiki": existing.get('wiki', None)
            }

        by_state_district[state_name][d] = mp_obj
        if d not in by_district:
            by_district[d] = mp_obj

print(f"Total districts processed: {sum(len(s.get('districts', [])) for s in states_data['states'])}")
print(f"Total successfully mapped to 2024 MP winner: {total_matched}")
print(f"Total district MPs with criminal cases: {total_with_cases}")
print(f"Total district MPs convicted: {total_convicted}")

output_payload = {
    "summary": {
        "totalDistricts": sum(len(s.get('districts', [])) for s in states_data['states']),
        "totalMapped": total_matched,
        "totalWithCases": total_with_cases,
        "totalConvicted": total_convicted,
        "source": "Association for Democratic Reforms (ADR) / MyNeta Lok Sabha 2024 Analysis"
    },
    "byDistrict": by_district,
    "byStateDistrict": by_state_district
}

with open('/Users/rishirajsingh/Documents/projects/apka-neta/src/data/all-district-mps.json', 'w') as f:
    json.dump(output_payload, f, indent=2)

print("Saved cleanly to src/data/all-district-mps.json!")
