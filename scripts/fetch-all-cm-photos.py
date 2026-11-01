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

cms_data = {
    "andhra-pradesh": {"name": "N. Chandrababu Naidu", "honorific": "Shri", "party": "TDP", "color": "#FFD700", "state": "Andhra Pradesh", "wiki": "N. Chandrababu Naidu"},
    "arunachal-pradesh": {"name": "Pema Khandu", "honorific": "Shri", "party": "BJP", "color": "#FF6B00", "state": "Arunachal Pradesh", "wiki": "Pema Khandu"},
    "assam": {"name": "Himanta Biswa Sarma", "honorific": "Dr.", "party": "BJP", "color": "#FF6B00", "state": "Assam", "wiki": "Himanta Biswa Sarma"},
    "bihar": {"name": "Nitish Kumar", "honorific": "Shri", "party": "JD(U)", "color": "#006400", "state": "Bihar", "wiki": "Nitish Kumar"},
    "chhattisgarh": {"name": "Vishnu Deo Sai", "honorific": "Shri", "party": "BJP", "color": "#FF6B00", "state": "Chhattisgarh", "wiki": "Vishnu Deo Sai"},
    "delhi": {"name": "Atishi Marlena", "honorific": "Ms.", "party": "AAP", "color": "#0072B0", "state": "Delhi", "wiki": "Atishi Marlena"},
    "goa": {"name": "Pramod Sawant", "honorific": "Dr.", "party": "BJP", "color": "#FF6B00", "state": "Goa", "wiki": "Pramod Sawant"},
    "gujarat": {"name": "Bhupendrabhai Patel", "honorific": "Shri", "party": "BJP", "color": "#FF6B00", "state": "Gujarat", "wiki": "Bhupendrabhai Patel"},
    "haryana": {"name": "Nayab Singh Saini", "honorific": "Shri", "party": "BJP", "color": "#FF6B00", "state": "Haryana", "wiki": "Nayab Singh Saini"},
    "himachal-pradesh": {"name": "Sukhvinder Singh Sukhu", "honorific": "Shri", "party": "INC", "color": "#00AEEF", "state": "Himachal Pradesh", "wiki": "Sukhvinder Singh Sukhu"},
    "jammu-and-kashmir": {"name": "Omar Abdullah", "honorific": "Shri", "party": "JKNC", "color": "#DA251C", "state": "Jammu and Kashmir", "wiki": "Omar Abdullah"},
    "jharkhand": {"name": "Hemant Soren", "honorific": "Shri", "party": "JMM", "color": "#008000", "state": "Jharkhand", "wiki": "Hemant Soren"},
    "karnataka": {"name": "Siddaramaiah", "honorific": "Shri", "party": "INC", "color": "#00AEEF", "state": "Karnataka", "wiki": "Siddaramaiah"},
    "kerala": {"name": "Pinarayi Vijayan", "honorific": "Shri", "party": "CPI(M)", "color": "#CC0000", "state": "Kerala", "wiki": "Pinarayi Vijayan"},
    "madhya-pradesh": {"name": "Mohan Yadav", "honorific": "Dr.", "party": "BJP", "color": "#FF6B00", "state": "Madhya Pradesh", "wiki": "Mohan Yadav"},
    "maharashtra": {"name": "Eknath Shinde", "honorific": "Shri", "party": "SHS", "color": "#FF7722", "state": "Maharashtra", "wiki": "Eknath Shinde"},
    "manipur": {"name": "N. Biren Singh", "honorific": "Shri", "party": "BJP", "color": "#FF6B00", "state": "Manipur", "wiki": "N. Biren Singh"},
    "meghalaya": {"name": "Conrad Sangma", "honorific": "Shri", "party": "NPP", "color": "#000080", "state": "Meghalaya", "wiki": "Conrad Sangma"},
    "mizoram": {"name": "Lalduhoma", "honorific": "Shri", "party": "ZPM", "color": "#ED1C24", "state": "Mizoram", "wiki": "Lalduhoma"},
    "nagaland": {"name": "Neiphiu Rio", "honorific": "Shri", "party": "NDPP", "color": "#E30B5C", "state": "Nagaland", "wiki": "Neiphiu Rio"},
    "odisha": {"name": "Mohan Charan Majhi", "honorific": "Shri", "party": "BJP", "color": "#FF6B00", "state": "Odisha", "wiki": "Mohan Charan Majhi"},
    "puducherry": {"name": "N. Rangasamy", "honorific": "Shri", "party": "AINRC", "color": "#FFCC00", "state": "Puducherry", "wiki": "N. Rangaswamy"},
    "punjab": {"name": "Bhagwant Mann", "honorific": "Shri", "party": "AAP", "color": "#0072B0", "state": "Punjab", "wiki": "Bhagwant Mann"},
    "rajasthan": {"name": "Bhajan Lal Sharma", "honorific": "Shri", "party": "BJP", "color": "#FF6B00", "state": "Rajasthan", "wiki": "Bhajan Lal Sharma", "photo": "/images/leaders/cm_bhajanlal_sharma.jpg"},
    "sikkim": {"name": "Prem Singh Tamang", "honorific": "Shri", "party": "SKM", "color": "#D21034", "state": "Sikkim", "wiki": "Prem Singh Tamang"},
    "tamil-nadu": {"name": "M. K. Stalin", "honorific": "Thiru", "party": "DMK", "color": "#DD0000", "state": "Tamil Nadu", "wiki": "M. K. Stalin"},
    "telangana": {"name": "A. Revanth Reddy", "honorific": "Shri", "party": "INC", "color": "#00AEEF", "state": "Telangana", "wiki": "Anumula Revanth Reddy"},
    "tripura": {"name": "Manik Saha", "honorific": "Dr.", "party": "BJP", "color": "#FF6B00", "state": "Tripura", "wiki": "Manik Saha"},
    "uttar-pradesh": {"name": "Yogi Adityanath", "honorific": "Shri", "party": "BJP", "color": "#FF6B00", "state": "Uttar Pradesh", "wiki": "Yogi Adityanath"},
    "uttarakhand": {"name": "Pushkar Singh Dhami", "honorific": "Shri", "party": "BJP", "color": "#FF6B00", "state": "Uttarakhand", "wiki": "Pushkar Singh Dhami"},
    "west-bengal": {"name": "Mamata Banerjee", "honorific": "Kumari", "party": "AITC", "color": "#20B2AA", "state": "West Bengal", "wiki": "Mamata Banerjee"}
}

out_dir = "/Users/rishirajsingh/Documents/projects/apka-neta/public/images/leaders/cms"
res_cms = {}

for slug, item in cms_data.items():
    if "photo" in item and os.path.exists("/Users/rishirajsingh/Documents/projects/apka-neta/public" + item["photo"]):
        res_cms[slug] = item
        continue

    wiki_title = item.get("wiki", item["name"])
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
                        # download image
                        img_req = urllib.request.Request(thumb_url, headers=headers)
                        with urllib.request.urlopen(img_req, context=ctx, timeout=6) as ir:
                            img_data = ir.read()
                            with open(filepath, 'wb') as f:
                                f.write(img_data)
                            downloaded = True
                            print(f"Downloaded CM photo for {item['state']}: {item['name']} ({len(img_data)} bytes)")
                        break
        except Exception as e:
            print(f"Error fetching {item['name']}: {e}")

    item_copy = dict(item)
    if downloaded:
        item_copy["photo"] = f"/images/leaders/cms/{filename}"
    else:
        item_copy["photo"] = "/images/leaders/cm_bhajanlal_sharma.jpg" # fallback

    res_cms[slug] = item_copy
    time.sleep(0.1)

json_path = "/Users/rishirajsingh/Documents/projects/apka-neta/src/data/chief-ministers.json"
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(res_cms, f, indent=2, ensure_ascii=False)

print(f"Saved {len(res_cms)} Chief Ministers to {json_path}")
