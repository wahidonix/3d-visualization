/*
* https://deck.gl/docs/api-reference/extensions/terrain-extension
*/

const {Deck, TerrainLayer, GeoJsonLayer, _TerrainExtension} = deck;

const COLOR_SCHEME = {
  easy: [20, 200, 0],
  intermediate: [0, 80, 240],
  advanced: [235, 40, 0],
  other: [100, 100, 100]
};

new Deck({
  initialViewState: {
    longitude: 7.785,
    latitude: 45.985,
    zoom: 12,
    pitch: 55,
    bearing: 110
  },
  controller: {maxPitch: 89},
  pickingRadius: 3,
  layers: [
    new TerrainLayer({
      id: 'terrain-source',
      // Data source: https://www.mapzen.com/blog/terrain-tile-service/
      elevationData: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
      elevationDecoder: {
        rScaler: 256,
        gScaler: 1,
        bScaler: 1 / 256,
        offset: -32768
      },
      texture: null,
      maxZoom: 14,
      material: {
        diffuse: 1
      },
      operation: 'terrain+draw'
    }),
    new GeoJsonLayer({
      id: 'zermatt-ski-trails',
      // Data source https://www.openstreetmap.org. Converted to GeoJSON with http://overpass-turbo.eu/ under ODbL.
      data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/ski.geojson',
      getLineColor: f => COLOR_SCHEME[f.properties.difficulty] || COLOR_SCHEME.other,
      getFillColor: f => COLOR_SCHEME[f.properties.difficulty] || COLOR_SCHEME.other,
      getLineWidth: 20,
      stroked: false,
      getPointRadius: 50,
      lineWidthMinPixels: 2,
      pointType: 'circle',
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 200, 0],
      extensions: [new _TerrainExtension()]
    })
  ],
  getTooltip
});

function getTooltip({object}) {
  return object && `\
    ${object.properties.name || ''} (${object.properties.type})
    Difficulty: ${object.properties.difficulty || 'Not rated'}`;
}