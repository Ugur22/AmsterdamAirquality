import React from 'react'
import mapboxgl from 'mapbox-gl'
import DeckGL from "deck.gl";

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

  }

  

  render () {

   
    
    return (
   
      <div className="map-wrapper">
          
        <div ref={el => (this.mapContainer = el)} className="map" />
     
      </div>
    )
  }
}