import urllib.request
import urllib.parse
import json
import ssl
import os
import time

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
headers = {'User-Agent': 'ApkaNetaCivicApp/1.0 (info@apkaneta.in)'}

mps_data = {
    "Alwar": {
        "mp": "Bhupender Yadav",
        "party": "BJP",
        "constituency": "Alwar Lok Sabha (No. 8)",
        "photo": "/images/leaders/mp_bhupender_yadav.jpg",
        "portfolio": "Cabinet Minister (MoEF&CC)",
        "myneta_url": "https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=360",
        "wiki": "Bhupender Yadav"
    },
    "Kota": {
        "mp": "Om Birla",
        "party": "BJP",
        "constituency": "Kota-Bundi Lok Sabha",
        "portfolio": "Hon'ble Speaker of Lok Sabha",
        "myneta_url": "https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=1418",
        "wiki": "Om Birla"
    },
    "Jodhpur": {
        "mp": "Gajendra Singh Shekhawat",
        "party": "BJP",
        "constituency": "Jodhpur Lok Sabha",
        "portfolio": "Cabinet Minister (Culture & Tourism)",
        "myneta_url": "https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=1138",
        "wiki": "Gajendra Singh Shekhawat"
    },
    "Bikaner": {
        "mp": "Arjun Ram Meghwal",
        "party": "BJP",
        "constituency": "Bikaner Lok Sabha",
        "portfolio": "Union Minister of State (Law & Justice)",
        "myneta_url": "https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=367",
        "wiki": "Arjun Ram Meghwal"
    },
    "Jaipur": {
        "mp": "Manju Sharma",
        "party": "BJP",
        "constituency": "Jaipur Lok Sabha",
        "portfolio": "Member of Parliament",
        "myneta_url": "https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=581",
        "wiki": "Manju Sharma (politician)"
    },
    "Jaipur Rural": {
        "mp": "Rao Rajendra Singh",
        "party": "BJP",
        "constituency": "Jaipur Rural Lok Sabha",
        "portfolio": "Member of Parliament",
        "myneta_url": "https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=592",
        "wiki": "Rao Rajendra Singh"
    },
    "Ajmer": {
        "mp": "Bhagirath Choudhary",
        "party": "BJP",
        "constituency": "Ajmer Lok Sabha",
        "portfolio": "Minister of State (Agriculture & Farmers Welfare)",
        "myneta_url": "https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=1134",
        "wiki": "Bhagirath Choudhary"
    },
    "Nagaur": {
        "mp": "Hanuman Beniwal",
        "party": "RLP",
        "constituency": "Nagaur Lok Sabha",
        "portfolio": "National Convener, RLP",
        "myneta_url": "https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=1152",
        "wiki": "Hanuman Beniwal"
    },
    "Barmer": {
        "mp": "Ummeda Ram Beniwal",
        "party": "INC",
        "constituency": "Barmer Lok Sabha",
        "portfolio": "Member of Parliament",
        "myneta_url": "https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=1142",
        "wiki": "Ummeda Ram Beniwal"
    },
    "Pali": {
        "mp": "P. P. Chaudhary",
        "party": "BJP",
        "constituency": "Pali Lok Sabha",
        "portfolio": "Member of Parliament",
        "myneta_url": "https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=1148",
        "wiki": "P. P. Chaudhary"
    },
    "Udaipur": {
        "mp": "Manna Lal Rawat",
        "party": "BJP",
        "constituency": "Udaipur Lok Sabha (ST)",
        "portfolio": "Member of Parliament",
        "myneta_url": "https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=1411",
        "wiki": "Manna Lal Rawat"
    },
    "Banswara": {
        "mp": "Rajkumar Roat",
        "party": "BAP",
        "constituency": "Banswara Lok Sabha (ST)",
        "portfolio": "Bharat Adivasi Party (BAP)",
        "myneta_url": "https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=1415",
        "wiki": "Rajkumar Roat"
    },
    "Chittorgarh": {
        "mp": "Chandra Prakash Joshi",
        "party": "BJP",
        "constituency": "Chittorgarh Lok Sabha",
        "portfolio": "State President, BJP Rajasthan",
        "myneta_url": "https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=1414",
        "wiki": "Chandra Prakash Joshi"
    },
    "Bharatpur": {
        "mp": "Sanjana Jatav",
        "party": "INC",
        "constituency": "Bharatpur Lok Sabha (SC)",
        "portfolio": "Member of Parliament",
        "myneta_url": "https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=574",
        "wiki": "Sanjana Jatav"
    },
    "Churu": {
        "mp": "Rahul Kaswan",
        "party": "INC",
        "constituency": "Churu Lok Sabha",
        "portfolio": "Member of Parliament",
        "myneta_url": "https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=372",
        "wiki": "Rahul Kaswan"
    },
    "Jhunjhunu": {
        "mp": "Brijendra Singh Ola",
        "party": "INC",
        "constituency": "Jhunjhunu Lok Sabha",
        "portfolio": "Member of Parliament",
        "myneta_url": "https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=375",
        "wiki": "Brijendra Singh Ola"
    },
    "Sikar": {
        "mp": "Amra Ram",
        "party": "CPI(M)",
        "constituency": "Sikar Lok Sabha",
        "portfolio": "Member of Parliament",
        "myneta_url": "https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=381",
        "wiki": "Amra Ram"
    },
    "Ganganagar": {
        "mp": "Kuldeep Indora",
        "party": "INC",
        "constituency": "Ganganagar Lok Sabha (SC)",
        "portfolio": "Member of Parliament",
        "myneta_url": "https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=364",
        "wiki": "Kuldeep Indora"
    },
    "Jhalawar": {
        "mp": "Dushyant Singh",
        "party": "BJP",
        "constituency": "Jhalawar-Baran Lok Sabha",
        "portfolio": "Member of Parliament (5th term)",
        "myneta_url": "https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=1420",
        "wiki": "Dushyant Singh"
    },
    "Bhilwara": {
        "mp": "Damodar Agarwal",
        "party": "BJP",
        "constituency": "Bhilwara Lok Sabha",
        "portfolio": "Member of Parliament",
        "myneta_url": "https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=1417",
        "wiki": "Damodar Agarwal"
    }
}

out_dir = "/Users/rishirajsingh/Documents/projects/apka-neta/public/images/leaders/mps"

for dist, item in mps_data.items():
    if "photo" in item and os.path.exists("/Users/rishirajsingh/Documents/projects/apka-neta/public" + item["photo"]):
        continue

    wiki_title = item.get("wiki", item["mp"])
    slug = dist.lower().replace(" ", "-")
    filename = f"{slug}.jpg"
    filepath = os.path.join(out_dir, filename)

    downloaded = False
    if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
        downloaded = True
    else:
        api_url = f"https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(wiki_title)}&prop=pageimages&format=json&pithumbsize=200"
        try:
            req = urllib.request.Request(api_url, headers=headers)
            with urllib.request.urlopen(req, context=ctx, timeout=6) as r:
                data = json.loads(r.read().decode())
                pages = data.get("query", {}).get("pages", {})
                for pid in pages:
                    thumb_url = pages[pid].get("thumbnail", {}).get("source")
                    if thumb_url:
                        img_req = urllib.request.Request(thumb_url, headers=headers)
                        with urllib.request.urlopen(img_req, context=ctx, timeout=6) as ir:
                            img_data = ir.read()
                            with open(filepath, 'wb') as f:
                                f.write(img_data)
                            downloaded = True
                            print(f"Downloaded MP photo for {dist}: {item['mp']} ({len(img_data)} bytes)")
                        break
        except Exception as e:
            print(f"Error fetching {item['mp']}: {e}")

    if downloaded:
        item["photo"] = f"/images/leaders/mps/{filename}"
    else:
        item["photo"] = "/images/leaders/mp_bhupender_yadav.jpg"

    time.sleep(0.1)

json_path = "/Users/rishirajsingh/Documents/projects/apka-neta/src/data/mps-rajasthan.json"
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(mps_data, f, indent=2, ensure_ascii=False)

print(f"Saved {len(mps_data)} Rajasthan MPs to {json_path}")
