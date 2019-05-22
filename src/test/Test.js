import React from "react";
import DeckGL, { GridCellLayer } from "deck.gl";
import ReactMapGL from "react-map-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "./direction.scss";
import { MapboxLayer } from "@deck.gl/mapbox";
import { color, getColorArray } from "../settings/util";
import { scaleLinear } from "d3-scale";
import Detailgraph from "../detailview/Detailgraph";
import { getNowHourISO } from "../settings/time";
import InfoPanel from "../InfoPanel";
import "./direction.scss";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoidWd1cjIyIiwiYSI6ImNqc2N6azM5bTAxc240M3J4MXZ1bDVyNHMifQ.rI_KbRwW8MShCcPNLsB6zA";

const INITIAL_VIEW_STATE = {
  longitude: 4.8972,
  latitude: 52.3709,
  zoom: 13,
  pitch: 50
};

export default class Test extends React.Component {
  state = {};

  constructor(props) {
    super();

    this.state = {
      data: [],
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        longitude: 4.8972,
        latitude: 52.3709,
        zoom: 13,
        pitch: 50
      }
    };

    this.closeInfoPanel = this.closeInfoPanel.bind(this);
  }

  renderTooltip() {
    const { hoveredObject, pointerX, pointerY } = this.state || {};

    return (
      hoveredObject && (
        <div
          className="data-hover"
          style={{
            position: "absolute",
            zIndex: 1000,
            pointerEvents: "none",
            left: pointerX,
            top: pointerY
          }}
        >
          ID: {hoveredObject.station_number}
          <br />
          Laatste uurgemiddelde: {hoveredObject.value} μg/m3
        </div>
      )
    );
  }

  closeInfoPanel() {
    this.setState({
      clickedObject: null
    });
  }

  renderStation() {
    const { clickedObject } = this.state || {};

    if (clickedObject != null) {
      return (
        <InfoPanel closeInfoPanel={this.closeInfoPanel}>
          <Detailgraph clickedObject={clickedObject.station_number} />
        </InfoPanel>
      );
    }
  }

  // Add deck layer to mapbox
  _onMapLoad = () => {
    const map = this._map;
    const deck = this._deck;

    var directions = new MapboxDirections({
      accessToken: MAPBOX_ACCESS_TOKEN,
      unit: "metric",
      profile: "mapbox/cycling"
    });

    map.addControl(directions, "top-left");

    map.addLayer(new MapboxLayer({ id: "grid-cell-layer", deck }));
  };

  componentDidMount() {
    let start = getNowHourISO();
    const urls = [
      `https://data.waag.org/api/getOfficialMeasurement?formula=NO2&start=${start}&end=${start}&
      station_id=NL01908&station_id=NL10545&station_id=NL49007&station_id=NL10520&station_id=NL49002&station_id=NL49020&&station_id=NL49021&&station_id=NL49003&station_id=NL49022&station_id=NL49019&station_id=NL10544&station_id=NL49017&station_id=NL49012&station_id=NL49014&station_id=NL49016`
    ];

    Promise.all(urls.map(url => fetch(url).then(resp => resp.json()))).then(
      ([results]) => {
        const data = results.map(station => {
          station.coordinates = station.coordinates.reverse();
          return station;
        });

        this.setState({ data });
      }
    );
  }

  render() {
    const { gl } = this.state;
    const data = this.state.data;
    const cellSize = 50;
    const elevation = scaleLinear([0, 10], [0, 2]);
    const { viewstate } = this.props;

    const layers = [
      new GridCellLayer({
        id: "grid-cell-layer",
        data,
        pickable: true,
        extruded: true,
        getPosition: d => d.coordinates,
        cellSize: cellSize,
        elevationScale: 50,
        getColor: d => getColorArray(color(d.value, [0, 25])),
        getElevation: d => elevation(d.value),
        onHover: info =>
          this.setState({
            hoveredObject: info.object,
            pointerX: info.x,
            pointerY: info.y
          }),
        onClick: info =>
          this.setState({
            clickedObject: info.object
          })
      })
    ];

    return (
      <ReactMapGL
        mapStyle={"mapbox://styles/ugur22/cjvpc96ky16c91ck6woz0ih5d"}
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
        maxZoom="25"
        minZoom="12"
        onLoad={this._onMapLoad}
        {...this.state.viewport}
        onViewportChange={viewport => this.setState({ viewport })}
        ref={ref => {
          // save a reference to the mapboxgl.Map instance
          this._map = ref && ref.getMap();
        }}
      >
        <DeckGL
          ref={ref => {
            // save a reference to the Deck instance
            this._deck = ref && ref.deck;
          }}
          layers={layers}
          controller={true}
        >
          {this.renderTooltip.bind(this)}
          {this.renderStation.bind(this)}
        </DeckGL>
      </ReactMapGL>
    );
  }
}
