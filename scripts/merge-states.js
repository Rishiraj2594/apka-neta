// Script to merge district-level TopoJSON into state-level TopoJSON
// Run: node scripts/merge-states.js

const topojson = require('topojson-client')
const topojsonServer = require('topojson-server')
const polygonClipping = require('polygon-clipping')
const fs = require('fs')
const path = require('path')

const inputPath = path.join(__dirname, '..', 'public', 'topojson', 'india-states.json')
const outputPath = path.join(__dirname, '..', 'public', 'topojson', 'india-merged-states.json')

const data = JSON.parse(fs.readFileSync(inputPath, 'utf-8'))
const objectKey = Object.keys(data.objects)[0]

// Convert TopoJSON to GeoJSON
const geojson = topojson.feature(data, data.objects[objectKey])

// Group features by state name (st_nm)
const stateGroups = {}
geojson.features.forEach((feat) => {
  const stateName = feat.properties.st_nm
  if (!stateGroups[stateName]) {
    stateGroups[stateName] = []
  }
  stateGroups[stateName].push(feat)
})

function ringSignedArea(coords) {
  let area = 0
  for (let i = 0; i < coords.length - 1; i++) {
    area += (coords[i + 1][0] - coords[i][0]) * (coords[i + 1][1] + coords[i][1])
  }
  return area / 2
}

// Merge districts of each state into a single polygon
const mergedFeatures = Object.entries(stateGroups).map(([stateName, features]) => {
  const districtGeometries = data.objects[objectKey].geometries.filter(
    (g) => g.properties.st_nm === stateName
  )

  let merged = topojson.merge(data, districtGeometries)

  // Fix Gujarat sliver seam:
  // In the source topology, Banaskantha/Vav-Tharad were digitised slightly separately
  // resulting in two mainland MultiPolygon pieces that share a boundary line.
  // We perform an exact geometric union on the two mainland pieces to dissolve the line.
  if (stateName === 'Gujarat' && merged.type === 'MultiPolygon' && merged.coordinates.length >= 3) {
    const p0 = merged.coordinates[0] // Southern / Western mainland
    const p1 = merged.coordinates[1] // Island / enclave
    const p2 = merged.coordinates[2] // Northern mainland (Banaskantha & Vav-Tharad)

    const unionResult = polygonClipping.union(p0, p2)
    if (unionResult.length > 0 && unionResult[0].length > 0) {
      let outerRing = unionResult[0][0]
      // Ensure positive winding order (counter-clockwise for outer ring in standard GIS/d3-geo)
      if (ringSignedArea(outerRing) < 0) {
        outerRing = [...outerRing].reverse()
      }

      merged = {
        type: 'MultiPolygon',
        coordinates: [[outerRing], p1],
      }
      console.log('✅ Successfully united Gujarat mainland pieces into a seamless boundary (no internal seam line).')
    }
  }

  return {
    type: 'Feature',
    properties: {
      name: stateName,
      st_code: features[0].properties.st_code,
      districts_count: features.length,
    },
    geometry: merged,
  }
})

const mergedGeoJSON = {
  type: 'FeatureCollection',
  features: mergedFeatures,
}

// Convert back to TopoJSON for smaller file size
const topology = topojsonServer.topology({ states: mergedGeoJSON })

fs.writeFileSync(outputPath, JSON.stringify(topology))

console.log(`✅ Merged ${geojson.features.length} districts into ${mergedFeatures.length} states`)
console.log(`   Output: ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`)
