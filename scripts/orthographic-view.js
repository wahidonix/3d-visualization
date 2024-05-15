/*
* https://deck.gl/docs/api-reference/core/orthographic-view
*/

const nodes = (async function() {
  const resp = await fetch('https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/world-countries.json');
  const data = await resp.json();
  const tree = d3.hierarchy(data).sum(d => d.population);
  const pack = d3.pack().size([1000, 1000]).padding(3);
  return pack(tree).leaves();
})();

const colorScale = d3.scaleLog()
  .domain([0.02, 20, 20000])
  .range([[145, 207, 96], [255, 255, 191], [215, 25, 28]]);

const {DeckGL, OrthographicView, ScatterplotLayer, TextLayer} = deck;

new DeckGL({
  views: new OrthographicView({
    flipY: false,
    // near: 0.1,
    // far: 1000,
  }),
  initialViewState: {
    target: [500, 500, 0],
    zoom: 0,
    minZoom: -2,
    maxZoom: 40
  },
  controller: true,
  
  layers: [
    new ScatterplotLayer({
      id: 'circles',
      data: nodes,
      getPosition: d => [d.x, d.y],
      getRadius: d => d.r,
      getFillColor: d => colorScale(d.data.population / d.data.area),
      getLineWidth: 1,
      lineWidthUnits: 'pixels',
      stroked: true
    }),
    new TextLayer({
      id: 'labels',
      data: nodes,
      getText: d => d.data.name,
      getPosition: d => [d.x, d.y],
      getSize: d => (d.r * 2 / d.data.name.length),
      getColor: [0, 0, 0],
      sizeUnits: 'meters',
      sizeMaxPixels: 64
    })
  ]
});