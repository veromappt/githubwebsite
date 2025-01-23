const view = new ol.View({
    center: ol.proj.fromLonLat([10, 51]),
    zoom: 5,
  });
  const url =
    "http://osmatrix.geog.uni-heidelberg.de:8080/geoserver/vboessler/wms";

  const wmsSource = new ol.source.TileWMS({
    url: url,
    params: {
      LAYERS: "amtsgerichte",
      TILED: true,
      FORMAT: "image/png",
      STYLES: "style_amtsgericht",
    },
  });
  const wmsLayer = new ol.layer.Tile({
    source: wmsSource,
  });
  const map = new ol.Map({
    target: "map",
    view: view,
    layers: [wmsLayer],
  });

  map.on("singleclick", function (evt) {
    const coordinate = evt.coordinate;
    const resolution = map.getView().getResolution();
    const projection = map.getView().getProjection();

    const url = wmsSource.getFeatureInfoUrl(
      coordinate,
      resolution,
      projection,
      {
        INFO_FORMAT: "text/html", 
        QUERY_LAYERS: "amtsgerichte", 
      }
    );

    if (url) {
      fetch(url)
        .then((response) => response.text())
        .then((data) => {
          document.getElementById("info").innerHTML = data;
        })
        .catch((error) => {
          console.error("Error fetching GetFeatureInfo data:", error);
          document.getElementById("info").innerHTML =
            "Fehler beim Laden der Daten.";
        });
    }
    console.log("Generated GetFeatureInfo URL:", url);
  });