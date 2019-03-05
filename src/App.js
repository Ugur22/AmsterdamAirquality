import React from "react";
import DeckGL, {
  /*ScreenGridLayer*/ ScatterplotLayer /*TextLayer*/
} from "deck.gl";
import { StaticMap } from "react-map-gl";

// const data =
//   "https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/screen-grid/ca-transit-stops.json";

class App extends React.Component {
  render() {
    return (
      <DeckGL
        initialViewState={{ longitude: 4.5984, latitude: 52.4952, zoom: 14 }}
        controller={true}
        layers={[
          new ScatterplotLayer({
            id: "scatterplot-layer",
            data: [
              // Oranje begin
              {
                coordinates: [4.5881, 52.4965],
                color: [254, 118, 42],
                radius: 1000
              },
              {
                coordinates: [4.5962, 52.4877],
                color: [254, 118, 42],
                radius: 1000
              },
              {
                coordinates: [4.6101, 52.489],
                color: [254, 118, 42],
                radius: 1000
              },
              {
                coordinates: [4.5823, 52.4803],
                color: [254, 118, 42],
                radius: 1000
              },
              {
                coordinates: [4.5972, 52.4952],
                color: [254, 118, 42],
                radius: 1000
              },
              // Beige begin
              {
                coordinates: [4.604, 52.4893],
                color: [255, 254, 206],
                radius: 1000
              },
              {
                coordinates: [4.5953, 52.4962],
                color: [255, 254, 206],
                radius: 1000
              },
              {
                coordinates: [4.5906, 52.4884],
                color: [255, 254, 206],
                radius: 1000
              },
              {
                coordinates: [4.6046, 52.4852],
                color: [255, 254, 206],
                radius: 1000
              },
              {
                coordinates: [4.615, 52.4871],
                color: [255, 254, 206],
                radius: 1000
              },
              //  geel begin
              {
                coordinates: [4.616, 52.4954],
                color: [255, 252, 77],
                radius: 1000
              },
              {
                coordinates: [4.626, 52.4844],
                color: [255, 252, 77],
                radius: 1000
              },
              {
                coordinates: [4.6052, 52.4946],
                color: [255, 252, 77],
                radius: 1000
              },
              {
                coordinates: [4.584, 52.489],
                color: [255, 252, 77],
                radius: 1000
              },
              {
                coordinates: [4.5985, 52.4952],
                color: [255, 252, 77],
                radius: 1000
              }
            ],
            opacity: 1,
            stroked: true,
            pickable: true,
            filled: true,
            radiusScale: 6,
            radiusMinPixels: 10,
            radiusMaxPixels: 100,
            lineWidthMinPixels: 2,
            getPosition: d => d.coordinates,
            getFillColor: d => d.color,
            getLineColor: [255, 255, 255]
          })
          // new TextLayer({
          //   id: "text-layer",
          //   data: [
          //     { position: [5.0702, 52.7574], text: "35.33" },
          //     { position: [5.0702, 52.5574], text: "3.15" },
          //     { position: [5.0702, 52.4574], text: "3.45" }
          //   ]
          // })
        ]}
      >
        <StaticMap mapStyle="https://api.myjson.com/bins/jdrq2" />
      </DeckGL>
    );
  }

  componentDidMount() {
    // fetch('https://api.luchtmeetnet.nl/open_api/measurements?start=2018-12-01T09:00:00Z&end=2018-12-02T09:00:00Z&station_number=&formula=&page=&order_by=timestamp_measured&order_direction=desc').then(resp => resp.json()).then(data => console.log(data))
    // // returns a promise object
    // fetch("https://api.luchtmeetnet.nl/open_api/stations/NL01908")
    //   .then(resp => resp.json())
    //   .then(data => data["data"]["geometry"]["coordinates"]);
  }
}
export default App;
