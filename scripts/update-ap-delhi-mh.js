const fs = require('fs');
const path = require('path');
const topojsonServer = require('topojson-server');
const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJson(res.headers.location).then(resolve).catch(reject);
      }
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const outputDir = path.join(__dirname, '..', 'public', 'topojson', 'states');

  // 1. Andhra Pradesh (26 districts)
  console.log('Fetching Andhra Pradesh 26 districts GeoJSON...');
  const apGeo = await fetchJson('https://raw.githubusercontent.com/satishvmadala/andhrapradesh_opendata_locations/main/AndhraPradesh_Districts.geojson');
  
  // Standardize properties to match our app { district, st_nm }
  apGeo.features = apGeo.features.map(f => {
    const distName = f.properties.district_name || f.properties.NEW_DIST || 'District';
    return {
      type: 'Feature',
      properties: {
        district: distName.trim(),
        st_nm: 'Andhra Pradesh',
        year: '2026'
      },
      geometry: f.geometry
    };
  });

  const apTopo = topojsonServer.topology({ districts: apGeo });
  fs.writeFileSync(path.join(outputDir, 'andhra-pradesh.json'), JSON.stringify(apTopo));
  console.log(`Saved Andhra Pradesh TopoJSON with ${apTopo.objects.districts.geometries.length} districts.`);

  // 2. Delhi (11 districts)
  console.log('Fetching Delhi 11 districts GeoJSON...');
  const delhiGeo = await fetchJson('https://raw.githubusercontent.com/shuklaneerajdev/IndiaStateTopojsonFiles/master/Delhi.geojson');
  delhiGeo.features = delhiGeo.features.map(f => {
    const distName = f.properties.Dist_Name || f.properties.district || 'District';
    return {
      type: 'Feature',
      properties: {
        district: distName.trim(),
        st_nm: 'Delhi',
        year: '2026'
      },
      geometry: f.geometry
    };
  });

  const delhiTopo = topojsonServer.topology({ districts: delhiGeo });
  fs.writeFileSync(path.join(outputDir, 'delhi.json'), JSON.stringify(delhiTopo));
  console.log(`Saved Delhi TopoJSON with ${delhiTopo.objects.districts.geometries.length} districts.`);

  // 3. Maharashtra (36 districts)
  console.log('Fetching Maharashtra 36 districts GeoJSON...');
  const mhGeo = await fetchJson('https://raw.githubusercontent.com/shuklaneerajdev/IndiaStateTopojsonFiles/master/Maharashtra.geojson');
  mhGeo.features = mhGeo.features.map(f => {
    const distName = f.properties.Dist_Name || f.properties.district || 'District';
    return {
      type: 'Feature',
      properties: {
        district: distName.trim(),
        st_nm: 'Maharashtra',
        year: '2026'
      },
      geometry: f.geometry
    };
  });

  const mhTopo = topojsonServer.topology({ districts: mhGeo });
  fs.writeFileSync(path.join(outputDir, 'maharashtra.json'), JSON.stringify(mhTopo));
  console.log(`Saved Maharashtra TopoJSON with ${mhTopo.objects.districts.geometries.length} districts.`);

  console.log('Completed TopoJSON updates for AP, Delhi, and Maharashtra.');
}

main().catch(console.error);
