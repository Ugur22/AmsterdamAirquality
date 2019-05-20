import React from 'react'
import mapboxgl from 'mapbox-gl'
import DeckGL from "deck.gl";
import { GridCellLayer } from "@deck.gl/layers";
import { color, getColorArray } from "../settings/util";
import { scaleLinear } from "d3-scale";
import Detailgraph from "../detailview/Detailgraph";
import { getNowHourISO } from "../settings/time";
import InfoPanel from "../InfoPanel";
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'
import './direction.scss';


import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css' // Updating node module will keep css up to date.

mapboxgl.accessToken = 'pk.eyJ1IjoidWd1cjIyIiwiYSI6ImNqc2N6azM5bTAxc240M3J4MXZ1bDVyNHMifQ.rI_KbRwW8MShCcPNLsB6zA'


const INITIAL_VIEW_STATE = {
    longitude: 4.8972,
    latitude: 52.3709,
    zoom: 13,
    pitch: 50
  };

export default class Direction extends React.Component {
    constructor(props) {
        super();
    
        this.state = {
          data: []
        };

    }

  componentDidMount () {
    const { lng, lat, zoom } = {
      lng: 4.8972 ,
      lat:  52.3709,
      zoom: 13
    }
    
    const map = new mapboxgl.Map({
      container: this.mapContainer, // See https://blog.mapbox.com/mapbox-gl-js-react-764da6cc074a
      style: 'mapbox://styles/ugur22/cjvpc96ky16c91ck6woz0ih5d',
      center: [lng, lat],
      zoom
    })

    var directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: 'metric',
      profile: 'mapbox/cycling'
    })

    map.addControl(directions, 'top-left')

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

  render () {

    const data = this.state.data;
    const cellSize = 50;
    const elevation = scaleLinear([0, 10], [0, 2]);
    const { viewstate } = this.props;

    const layer = [
        new GridCellLayer({
          ...this.props,
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
   
      <div className="map-wrapper">
        <div ref={el => (this.mapContainer = el)} className="map" />
      </div>
    )
  }
}