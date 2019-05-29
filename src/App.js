import React from "react";
import DeckGL, { GridCellLayer } from "deck.gl";
import ReactMapGL, { Marker } from "react-map-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import { MapboxLayer } from "@deck.gl/mapbox";
// import {mapStyle} from './settings/mapStyle'

import { color, getColorArray } from "./settings/util";
import { scaleLinear } from "d3-scale";
import Detailgraph from "./detailview/Detailgraph";
import { getNowHourISO } from "./settings/time";
import InfoPanel from "./InfoPanel";

import "./css/direction.scss";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoidWd1cjIyIiwiYSI6ImNqc2N6azM5bTAxc240M3J4MXZ1bDVyNHMifQ.rI_KbRwW8MShCcPNLsB6zA";
const mapStyle = "mapbox://styles/ugur22/cjw1xdexp03td1crpzxagiywf";

const INITIAL_VIEW_STATE = {
  longitude: 4.8972,
  latitude: 52.3709,
  zoom: 13,
  pitch: 50
};

let data;

let directions = new MapboxDirections({
  accessToken: MAPBOX_ACCESS_TOKEN,
  unit: "metric",
  profile: "mapbox/cycling",
  congestion: true,
  alternatives: true,
  flyTo: false,
  controls: {
    // instructions:false
  }
});

export default class App extends React.Component {
  state = {};

  constructor(props) {
    super();

    this.state = {
      data: [],
      stationInfo: null,
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

   
    let { hoveredObject, pointerX, pointerY,stationName } = this.state || {};


if(hoveredObject) {


  const urlInfo = [
    `https://data.waag.org/api/getOfficialStations?station_id=${hoveredObject.station_number}`,
  ];

  
  Promise.all(urlInfo.map(url => fetch(url).then(resp => resp.json()))).then(
    ([stationInfo]) => {
      stationName = stationInfo.data.location;
      this.setState({stationName });
    }
  );
}
  
  
    return (
      hoveredObject && (
        <div
          className="data-hover"
          style={{
            position: "absolute",
            zIndex: 1000,
            pointerEvents: "none",
            left: pointerX,
            top: pointerY,
          }}
        >
          <span>{stationName}</span>  
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

    // directions.on("profile", function(Profile) {
    //   console.log(Profile);

    //   directions.setOrigin([4.89792, 52.37894]);
    //   directions.addWaypoint(0, [4.89792, 52.37894]);
    //   directions.addWaypoint(1, [4.8963, 52.3797]);
    //   directions.addWaypoint(2, [4.8926, 52.3762]);
    //   directions.setDestination([4.8926, 52.3762]);

    //   console.log(directions.getWaypoints());

    //   console.log(data.length);
    //   for (let i = 0; i < data.length; i++) {
    //     console.log(data[i].coordinates);
    //   }
    // });

    map.addControl(directions, "top-left");

    // map.addLayer(new MapboxLayer({ id: "grid-cell-layer", deck }));
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
    data = this.state.data;
    const cellSize = 50;
    const elevation = scaleLinear([0, 10], [0, 2]);

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
        mapStyle={mapStyle}
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
        maxZoom={25}
        minZoom={9}
        onLoad={this._onMapLoad}
        {...this.state.viewport}
        onViewportChange={viewport => this.setState({ viewport })}
        ref={ref => {
          // save a reference to the mapboxgl.Map instance
          this._map = ref && ref.getMap();
        }}
      >
        <Marker
          latitude={52.37894}
          longitude={4.89792}
          offsetLeft={-20}
          offsetTop={-10}
        >
          <div className="marker" />
        </Marker>
        <DeckGL
          ref={ref => {
            // save a reference to the Deck instance
            this._deck = ref && ref.deck;
          }}
          layers={layers}
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
        >
          {this.renderTooltip.bind(this)}
          {this.renderStation.bind(this)}
        </DeckGL>
      </ReactMapGL>
    );
  }
}
