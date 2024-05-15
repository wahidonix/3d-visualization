const { DeckGL, GeoJsonLayer } = deck;

const geojsonLayer = new GeoJsonLayer({
  data: "https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/geojson/vancouver-blocks.json",
  opacity: 0.8,
  stroked: false,
  filled: true,
  extruded: true,
  wireframe: true,
  fp64: true,

  getElevation: (f) => Math.sqrt(f.properties.valuePerSqm) * 10,
  getFillColor: (f) => colorScale(f.properties.growth),
  getLineColor: (f) => [255, 255, 255],

  pickable: true,
});

new DeckGL({
  mapStyle: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  initialViewState: {
    latitude: 49.254,
    longitude: -123.13,
    zoom: 11,
    maxZoom: 16,
    pitch: 45,
  },
  controller: true,
  layers: [geojsonLayer],
  getTooltip,
});

const COLOR_SCALE = [
  // negative
  [65, 182, 196],
  [127, 205, 187],
  [199, 233, 180],
  [237, 248, 177],

  // positive
  [255, 255, 204],
  [255, 237, 160],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [252, 78, 42],
  [227, 26, 28],
  [189, 0, 38],
  [128, 0, 38],
];

function colorScale(x) {
  const i = Math.round(x * 7) + 4;
  if (x < 0) {
    return COLOR_SCALE[i] || COLOR_SCALE[0];
  }
  return COLOR_SCALE[i] || COLOR_SCALE[COLOR_SCALE.length - 1];
}

function getTooltip({ object }) {
  return (
    object &&
    `Average Property Value
${object.properties.valuePerSqm}
Growth
${Math.round(object.properties.growth * 100)}`
  );
}
