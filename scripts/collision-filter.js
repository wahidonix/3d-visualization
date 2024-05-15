/*
* https://deck.gl/docs/api-reference/extensions/collision-filter-extension
*/

const {Deck, OrthographicView, ScatterplotLayer, IconLayer, TextLayer, LineLayer, CollisionFilterExtension} = deck;

const ICON_MISSING = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iLTQtNCA4IDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSByPSI0IiBmaWxsPSIjY2NjIi8+PHRleHQgeT0iLjUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiNmZmYiPj88L3RleHQ+PC9zdmc+';

const deckgl = new Deck({
  views: new OrthographicView(),
  initialViewState: {
    target: [1000, 1000, 0],
    zoom: -1,
    minZoom: -4
  },
  controller: true,
  pickingRadius: 3,
  getTooltip: ({object}) => object?.name
});

loadData();

async function loadData() {
  // Data source: https://github.com/jeffreylancaster/game-of-thrones
  const resp = await fetch('https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/got-graph.json');
  const data = await resp.json();

  const {nodes, links} = data;
  const characters = Object.values(nodes);

  // Count the number of links from/to each node
  // This will be used to determine the importance of a node
  for (const link of links) {
    const source = nodes[link[0]];
    source.links = (source.links || 0) + 1;
    const target = nodes[link[1]];
    target.links = (target.links || 0) + 1;
  }

  function getNodeSize(node) {
    return Math.sqrt(node.links) + 2;
  }
  
  const linkLayer = new LineLayer({
    id: 'links',
    data: links,
    getSourcePosition: link => {
      const source = nodes[link[0]];
      return [source.x, source.y];
    },
    getTargetPosition: link => {
      const target = nodes[link[1]];
      return [target.x, target.y];
    },
    getColor: [100, 100, 100],
    getWidth: 1,
    widthUnits: 'pixels'
  });
  
  const pointLayer = new ScatterplotLayer({
    id: 'points',
    data: characters,
    getPosition: node => [node.x, node.y],
    getRadius: getNodeSize,
    radiusScale: 1,
    radiusUnits: 'pixels',
    lineWidthUnits: 'pixels',
    stroked: true,
    pickable: true,
    autoHighlight: true,
    getFillColor: [222, 222, 222],
    getLineColor: [100, 100, 100]
  });

  const thumbnailLayer = new IconLayer({
    id: 'nodes',
    data: characters,
    getPosition: node => [node.x, node.y],
    getIcon: node => ({
      url: node.thumbnail || ICON_MISSING,
      width: 100,
      height: 100
    }),
    getSize: getNodeSize,
    sizeScale: 10,
    pickable: true,
    getCollisionPriority: node => node.links,
    collisionTestProps: {
      sizeScale: 20
    },
    extensions: [new CollisionFilterExtension()]
  });

  const labelLayer = new TextLayer({
    id: 'labels',
    data: characters,
    getPosition: node => [node.x, node.y],
    getText: node => node.name,
    getSize: 12,
    getAlignmentBaseline: 'top',
    getPixelOffset: node => [0, getNodeSize(node) * 5],
    background: true,
    extensions: [new CollisionFilterExtension()]
  });

  deckgl.setProps({layers: [linkLayer, pointLayer, labelLayer, thumbnailLayer]});
}