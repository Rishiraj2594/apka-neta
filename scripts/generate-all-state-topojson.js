const fs = require('fs');
const path = require('path');
const topojsonClient = require('topojson-client');
const topojsonServer = require('topojson-server');

const inputPath = path.join(__dirname, '..', 'public', 'topojson', 'india-states.json');
const outputDir = path.join(__dirname, '..', 'public', 'topojson', 'states');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

const rawData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
const key = Object.keys(rawData.objects)[0];
const allDistricts = topojsonClient.feature(rawData, rawData.objects[key]).features;

const statesMap = {};

allDistricts.forEach((feat) => {
  const stateName = feat.properties.st_nm;
  if (!statesMap[stateName]) {
    statesMap[stateName] = [];
  }
  statesMap[stateName].push(feat);
});

const metadata = [];

for (const [stateName, features] of Object.entries(statesMap)) {
  const stateSlug = slugify(stateName);
  const districtList = Array.from(new Set(features.map(f => f.properties.district))).sort();

  const topology = topojsonServer.topology({
    districts: {
      type: 'FeatureCollection',
      features: features
    }
  });

  const filePath = path.join(outputDir, `${stateSlug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(topology));

  const stats = fs.statSync(filePath);
  metadata.push({
    name: stateName,
    slug: stateSlug,
    districtsCount: districtList.length,
    districts: districtList,
    sizeKb: (stats.size / 1024).toFixed(1),
    hasPilot: stateName === 'Rajasthan'
  });
}

metadata.sort((a, b) => a.name.localeCompare(b.name));

const metaPath = path.join(__dirname, '..', 'src', 'data', 'states-meta.json');
fs.writeFileSync(metaPath, JSON.stringify({ states: metadata }, null, 2));

console.log(`Successfully generated ${metadata.length} state TopoJSON files in ${outputDir}`);
console.log(`Saved metadata to ${metaPath}`);
