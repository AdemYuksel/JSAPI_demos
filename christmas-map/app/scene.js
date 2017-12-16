define([
  'esri/WebScene',
  'esri/views/SceneView',
  'esri/layers/VectorTileLayer',
  'esri/layers/FeatureLayer',
  'esri/config'
], function (WebScene, SceneView, VectorTileLayer, FeatureLayer, esriConfig) {


  function _init(store) {

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
      }
    });

    // create view and add webscene
    var view = new SceneView({
      container: "viewDiv",
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

    // Clear the top-left corner - that's where the application menu is
    view.ui.empty("top-left");

    window.view = view;

    view.on("click", function (event) {

      view.hitTest(event).then(function (response) {

        var result = response.results[0];
        if (result && result.graphic) {
          return result.graphic;
        }

      }).then(function (graphic) {

        var objectid = graphic.attributes.objectid;
        store.dispatch({
          type: 'SELECT COUNTRY',
          selected: graphic
        });

      });
    });

    view.watch('interacting', function (newValue) {
      if (newValue) {
        var state = store.getState();
        if (state && state.selected) {
          store.dispatch({
            type: 'SELECT COUNTRY',
            selected: null
          })
        }
      }
    })

    /************************************
     * Create and add the countries layer
     ***********************************/

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

    var layer = new FeatureLayer({
      url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/World_Cities_analysis/FeatureServer/0",
      title: "cities",
      elevationInfo: {
        mode: "relative-to-ground"
      },
      definitionExpression: "STATUS = 'National and provincial capital'",
      renderer: {
        type: 'unique-value',
        valueExpression: `$feature.OBJECTID % 4`,
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
            value: "{CNTRY_NAME}"
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

      view.whenLayerView(layer).then(function(layerView) {
        highlight = layerView.highlight(country);
      });
      view.goTo({ target: country, zoom: 5})
      .then(function(){
        view.popup.open({
          content: '<div>Christmas is one of those holidays that just seems to be filled with cheer and wonder. Whether you are celebrating a secular or religious Christmas, your day is sure to be filled with happiness, especially with a little help from wikiHow. Read some steps on how to celebrate a secular, religious, kid-friendly, or consumer-free Christmas after the jump. Happy Holidays!</div>',
          location: country.geometry,
        })
      });
    }

    function deselect(){
      view.popup.close();
      highlight.remove();
    }

    store.subscribe( function() {
      var state = store.getState();
      if (state.lastAction === 'SELECT COUNTRY') {
        if (state.selected) {
          selectCountry(state.selected);
        }
        else {
          deselect();
        }
      }
    });
  }

  return {
    init: _init
  }
});
