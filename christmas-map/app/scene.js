define([
  'esri/WebScene',
  'esri/views/SceneView',
  'esri/layers/VectorTileLayer',
  'esri/layers/FeatureLayer',
  'esri/config',

  'app/handleChange'
], function (
    WebScene, SceneView, VectorTileLayer, FeatureLayer, esriConfig,
    handleChange
  ) {

  function _init(container, store) {

    esriConfig.request.corsEnabledServers.push("https://zurich.maps.arcgis.com/");

    // create vector tile layer with the Christmas style
    var christmasLayer = new VectorTileLayer({
      url: "https://basemaps.arcgis.com/b2/arcgis/rest/services/World_Basemap/VectorTileServer"
    });
    christmasLayer.loadStyle("christmas-style.json");

    // create webscene with the vector tile layer as basemap
    var webscene = new WebScene({
      basemap: {
        baseLayers: [christmasLayer]
      },
      ground: {}
    });

    // create view and add webscene
    var view = new SceneView({
      container: container,
      map: webscene,
      camera : {
        heading: 35.7,
        tilt: 77.4,
        position: {
          x: -1531838.33985668,
          y: 3759521.621593286,
          z: 753037.8103598615,
          spatialReference: {
            wkid: 102100
          }
        }
      },
      viewingMode: "local",
      environment: {
        lighting: {
          directShadowsEnabled: true,
          ambientOcclusionEnabled: true
        }
      },
      // Set a custom color for the highlight
      highlightOptions: {
        color: "#ff635e",
        fillOpacity: 0
      },
      padding: {
        top: 200
      }
    });

    // clear the top-left corner - that's where the application menu is
    view.ui.empty("top-left");

    window.view = view;

    view.on("click", function (event) {

      view.hitTest(event).then(function (response) {

        var result = response.results[0];
        if (result && result.graphic) {
          return result.graphic;
        }

      }).then(function (graphic) {
        if (store.getState().onTour) {
          store.dispatch({
            type: 'TOUR STOPPED'
          });
        }
        store.dispatch({
          type: 'SELECT COUNTRY',
          selected: graphic
        });

      });
    });

    view.watch('interacting', function (newValue) {
      if (newValue) {
        var state = store.getState();
        if (state.onTour) {
          store.dispatch({
            type: 'TOUR STOPPED'
          });
        }
        if (state.selected) {
          store.dispatch({
            type: 'SELECT COUNTRY',
            selected: null
          });
        }

      }
    })

    // create and add the countries layer
    var options = ['Purple', 'Orange', 'Blue', 'Green'];
    var uniqueValueInfos = options.map((color, index) => {
      return {
        value: index,
        symbol: {
          type: 'point-3d',
          symbolLayers: [
            {
              type: 'object',
              resource: {
                href: "https://zurich.maps.arcgis.com/sharing/rest/content/items/bdf60a763af049d2b5dea9eea34953b5/resources/styles/web/resource/" + color + "Present.json"
              },
              height: 100000,
              anchor: "bottom"
            }
          ]
        }
      }
    });
    var graphics = store.getState().graphics;
    var fields = [
      {
        name: "ObjectID",
        alias: "ObjectID",
        type: "oid"
      },{
        name: "country",
        alias: "country",
        type: "string"
      },{
        name: "description",
        alias: "description",
        type: "string"
      }
    ]
    var layer = new FeatureLayer({
      source: graphics,
      fields: fields,
      objectIdField: "ObjectID",
      geometryType: "point",
      title: "cities",
      elevationInfo: {
        mode: "relative-to-ground"
      },
      screenSizePerspectiveEnabled: false,
      renderer: {
        type: 'unique-value',
        valueExpression: `$feature.ObjectID % 4`,
        uniqueValueInfos: uniqueValueInfos,
        visualVariables: [
          {
            type: "rotation",
            valueExpression: "Random()*360"
          }
        ]
      },
      outFields: ["*"],
      labelingInfo: [
        {
          labelPlacement: "left-center",
          labelExpressionInfo: {
            value: "{country}"
          },
          symbol: {
            type: 'label-3d',
            symbolLayers: [{
              type: 'text',
              material: {
                color: [250, 250, 250]
              },
              // Set a halo on the font to make the labels more visible with any kind of background
              halo: {
                size: 1,
                color: [250, 10, 10]
              },
              font: {
                family: 'Berkshire Swash'
              },
              size: 15
            }]
          }
        }],
      labelsVisible: true
    });

    webscene.add(layer);

    var highlight;

    function selectCountry(country) {
      view.whenLayerView(layer)
        .then(function(layerView) {
          highlight = layerView.highlight(country.attributes.ObjectID);
        });
      view.goTo({ target: country.geometry, zoom: 5, tilt: 60}, { speedFactor: 2 })
        .then(function(){
          view.popup.open({
            content: country.attributes.description,
            location: country.geometry,
          })
        });
    }

    function deselectCountry(){
      view.popup.close();
      if (highlight) {
        highlight.remove();
      }
    }

    var handleSelection = handleChange(store.getState, 'selected');

    store.subscribe( handleSelection(function(newVal, oldVal, property) {
      if (oldVal) { deselectCountry(); }
      if (newVal) { selectCountry(newVal); }
      }
    ));

  }

  return {
    init: _init
  }
});
