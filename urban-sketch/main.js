require([
  "esri/WebScene",
  "esri/views/SceneView",
  "esri/layers/SceneLayer",
  "dojo/domReady!"
], function (WebScene, SceneView,
  SceneLayer) {

  var webscene = new WebScene({
    portalItem: {
      id: "74904be5976b418f9a4647db3dd3e989"
    }
  });

  var view = new SceneView({
    container: "viewDiv",
    map: webscene
  });
  view.environment.lighting.directShadowsEnabled = true;

  const sitePlanLayer = new SceneLayer({
    url: "https://tiles.arcgis.com/tiles/74bZbbuf05Ctvbzv/arcgis/rest/services/SitePlan_Clean/SceneServer",
    renderer: {
      type: "simple",
      symbol: {
        type: "mesh-3d",
        symbolLayers: [{
          type: "fill",
          material: {
            color: "#ffffff",
            colorMixMode: "tint"
          },
          edges: {
            type: "sketch",
            color: [0, 0, 0, 0.65],
            extensionLength: 10,
            size: 1.5
          }
        }]
      }
    }
  });

  const buildingsLayer = new SceneLayer({
    url: "https://tiles.arcgis.com/tiles/74bZbbuf05Ctvbzv/arcgis/rest/services/Buildings/SceneServer",
    renderer: {
      type: "simple",
      symbol: {
        type: "mesh-3d",
        symbolLayers: [{
          type: "fill",
          material: {
            color: "#ffffff",
            colorMixMode: "replace"
          },
          edges: {
            type: "sketch",
            color: [0, 0, 0, 0.65],
            extensionLength: 10,
            size: 1.5
          }
        }]
      }
    }
  });

  const proposedProjectLayer = new SceneLayer({
    url: "https://tiles.arcgis.com/tiles/74bZbbuf05Ctvbzv/arcgis/rest/services/Option2_r/SceneServer",
    renderer: {
      type: "simple",
      symbol: {
        type: "mesh-3d",
        symbolLayers: [{
          type: "fill",
          material: {
            color: "#ffffff",
            colorMixMode: "replace"
          },
          edges: {
            type: "sketch",
            color: [0, 0, 0, 0.65],
            extensionLength: 10,
            size: 1.5
          }
        }]
      }
    }
  });

  webscene.addMany([sitePlanLayer, proposedProjectLayer, buildingsLayer]);

});
