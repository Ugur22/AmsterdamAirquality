import React from "react";
import { mapStyle } from "./mapStyle.js";
// import { data } from "./data.js";
import DeckGL from "deck.gl"; //TextLayer //ScreenGridLayer
import { StaticMap } from "react-map-gl";
import { TripsLayer } from "@deck.gl/geo-layers";

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
      loopLength = 1800, // unit corresponds to the timestamp in source data
      animationSpeed = 30 // unit time per second
    } = this.props;
    const timestamp = Date.now() / 1000;
    const loopTime = loopLength / animationSpeed;

    this.setState({
      time: ((timestamp % loopTime) / loopTime) * loopLength
    });
    this._animationFrame = window.requestAnimationFrame(
      this._animate.bind(this)
    );
  }

  render() {
    const { trailLength = 180 } = this.props;
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
                waypoints: [
                  { coordinates: [4.6101, 52.489], timestamp: 1554772579000 },
                  { coordinates: [4.5823, 52.4803], timestamp: 1554772579010 },
                  { coordinates: [4.5972, 52.4952], timestamp: 1554772580200 },
                  { coordinates: [4.5972, 52.4992], timestamp: 1554772580300 },
                ]
              }
            ],
            // deduct start timestamp from each data point to avoid overflow
            getPath: d =>
              d.waypoints.map(p => [
                p.coordinates[0],
                p.coordinates[1],
                p.timestamp - 1554772579000
              ]),
            getColor: [253, 128, 93],
            opacity: 1,
            widthMinPixels: 50,
            strokeWidth: 5,
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
