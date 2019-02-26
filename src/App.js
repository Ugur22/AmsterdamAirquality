import React from "react";
import DeckGL, { ScreenGridLayer, ScatterplotLayer, TextLayer } from "deck.gl";
import { StaticMap } from "react-map-gl";

// const data =
//   "https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/screen-grid/ca-transit-stops.json";

class App extends React.Component {
  render() {
    return (
      <DeckGL
        initialViewState={{ longitude: 5.0702, latitude: 52.3574, zoom: 8 }}
        controller={true}
        layers={[
          new ScatterplotLayer({
            id: "scatterplot-layer",
            data: [
              {
                position: [5.0702, 52.7574],
                color: [255, 155, 200],
                radius: 1000
              }
            ],
            opacity: 1,
            stroked: true,
            filled: true,
            getFillColor: d => [255, 140, 0],
            getLineColor: d => [0, 0, 0]
          }),
          new TextLayer({
            id: "text-layer",
            data: [
              { position: [5.0702, 52.7574], text: "35.33" },
              { position: [5.0702, 52.5574], text: "3.15" },
              { position: [5.0702, 52.4574], text: "3.45" }
            ]
          })
        ]}
      >
        <StaticMap mapStyle="https://api.myjson.com/bins/jdrq2" />
      </DeckGL>
    );
  }

  componentDidMount() {
    // fetch('https://api.luchtmeetnet.nl/open_api/measurements?start=2018-12-01T09:00:00Z&end=2018-12-02T09:00:00Z&station_number=&formula=&page=&order_by=timestamp_measured&order_direction=desc').then(resp => resp.json()).then(data => console.log(data))
    // // returns a promise object

    fetch("https://api.luchtmeetnet.nl/open_api/stations/NL01908")
      .then(resp => resp.json())
      .then(data => data["data"]["geometry"]["coordinates"]);

  }
}
export default App;
