import React from "react";
import { mapStyle } from "./mapStyle.js";
// import { data } from "./data.js";
import DeckGL from "deck.gl"; //TextLayer //ScreenGridLayer
import { StaticMap } from "react-map-gl";
import { TripsLayer } from "@deck.gl/geo-layers";


const DATA_URL = {
  BUILDINGS:
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/buildings.json', // eslint-disable-line
  TRIPS:
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/trips.json' // eslint-disable-line
};


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 0
    };
  }
  componentDidMount() {
    this._animate();
  }

  componentWillUnmount() {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame);
    }
  }

  _animate() {
    const {
      loopLength = 1000, // unit corresponds to the timestamp in source data
      animationSpeed = 100 // unit time per second
    } = this.props;
    const timestamp = Date.now() / 1000;
    const loopTime = loopLength / animationSpeed;
    // console.log( Math.fround(1555528823442));

    this.setState({
      time: ((timestamp % loopTime) / loopTime) * loopLength
    });
    this._animationFrame = window.requestAnimationFrame(
      this._animate.bind(this)
    );
  }

  render() {
    const { trips = DATA_URL.TRIPS, trailLength = 500} = this.props;
    return (
      <DeckGL
        initialViewState={{
          longitude: 4.5984,
          latitude: 52.4952,
          zoom: 14,
          pitch: 50
        }}
        controller={true}
        layers={[
          new TripsLayer({
            id: "trips-layer",
            data: [
           
              {
                vendor: 1,
                segments: [
                  { coordinates: [4.844318, 52.40476], timestamp: 1554772579000 },
                  { coordinates: [4.5823, 52.4805], timestamp: 1554772579010 },
                  { coordinates: [4.5972, 52.4956], timestamp: 1554772580200 },
                ]
              }
            ],
            // deduct start timestamp from each data point to avoid overflow
            getPath: d => d.segments.map(p => [p.coordinates[0], p.coordinates[1], p.timestamp - 1554772579000]),
              
            getColor: d => (d.vendor === 0 ? [253, 128, 93] : [23, 184, 190]),
            opacity: 1,
            widthMinPixels: 5,
            rounded: true,
            trailLength,
            currentTime: this.state.time
          })
        ]}
      >
        <StaticMap mapStyle={mapStyle} />
      </DeckGL>
    );
  }
}
export default App;
