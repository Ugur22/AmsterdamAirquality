import React from "react";
import mapboxgl from "mapbox-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import { color, getColorArray } from "./settings/util";
import Airqualityinfo from "./dataRange/Airqualityinfo";
import AccordionInfo from "./dataRange/AccordionInfo";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import InfoPanel from "./InfoPanel";
import MapboxCircle from "mapbox-gl-circle";
import { getNowHourISO } from "./settings/time";
import { Accordion, AccordionItem } from "react-sanfona";
import axios from "axios";

mapboxgl.accessToken = "pk.eyJ1IjoidWd1cjIyIiwiYSI6ImNqc2N6azM5bTAxc240M3J4MXZ1bDVyNHMifQ.rI_KbRwW8MShCcPNLsB6zA";

let directions = new MapboxDirections({
  accessToken: mapboxgl.accessToken,
  unit: "metric",
  profile: "mapbox/cycling",
  congestion: true,
  alternatives: false,
  flyTo: false,
  zoom: 13,
  interactive: true,
  // placeholderOrigin: "Kies een vetrekpunt of klik op de kaart",
  // placeholderDestination: "Kies een bestemming of klik op de kaart",
  controls: {
    instructions: false,
    profileSwitcher: false
  }
});

const { lng, lat, zoom } = {
  lng: 4.8972,
  lat: 52.3709,
  zoom: 13
};

let score, duration, data;

export default class Direction extends React.Component {
  constructor(props) {
    super();

    this.state = {
      data: [],
      render: false,
      score: 0,
      duration
    };

    this.closeInfoPanel = this.closeInfoPanel.bind(this);
  }

  closeInfoPanel() {
    this.setState({
      render: false
    });
  }

  // function to calculate the distance between two coordinates
  getDistanceFromLatLonInMeters(latitude1, longitude1, latitude2, longitude2) {
    var p = 0.017453292519943295;
    var c = Math.cos;
    var a = 0.5 - c((latitude2 - latitude1) * p) / 2 + (c(latitude1 * p) * c(latitude2 * p) * (1 - c((longitude2 - longitude1) * p))) / 2;
    var R = 6371;
    var dist = 2 * R * Math.asin(Math.sqrt(a) * 1000);

    return dist.toFixed(0);
  }

  componentDidMount() {
    document.title = "N02 bicycle route planner";
    let collectionMeasurements = [];

    let start = getNowHourISO();


    // data ophalen van luchtmeetnet API RIVM
    axios
      .get(
        `https://data.waag.org/api/getOfficialMeasurement?formula=NO2&start=${start}&end=${start}&
        station_id=NL01908&station_id=NL10545&station_id=NL49007&station_id=NL10520&station_id=NL49002&station_id=NL49020&&station_id=NL49021&&station_id=NL49003&station_id=NL49022&station_id=NL49019&station_id=NL10544&station_id=NL49017&station_id=NL49012&station_id=NL49014&station_id=NL49016`
      )
      .then(response => {
        if (response.status === 200 && response != null) {
          this.setState({
            data: response.data
          });
          collectionMeasurements.push(response.data);
        } else {
          throw new Error("no data available");
        }
      })
      .catch(function(error) {
        console.log(error);
        return [];
      });

    let radiusAirQuality;
    let locationsStep = [];
    let durationSteps = [];

    let steps = [];
    let radiusCircle = 500;
    score = this.state.score;
    let data;
    let circlesCenter = [];
    let stations = {
      type: "FeatureCollection",
      features: []
    };

    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: "mapbox://styles/ugur22/cjvpc96ky16c91ck6woz0ih5d",
      center: [lng, lat],
      zoom
    });

    map.on("load", () => {
      function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      }
      function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
      }

      
      data = collectionMeasurements[0];
      for (let i = 0; i < data.length; i++) {
        let colorsArray = getColorArray(color(data[i].value, [0, 55]));
        let colorToHex = rgbToHex(colorsArray[0], colorsArray[1], colorsArray[2]);

        // Draw the circles
        radiusAirQuality = new MapboxCircle({ lat: data[i].coordinates[0], lng: data[i].coordinates[1] }, radiusCircle, {
          editable: false,
          minRadius: 500,
          strokeWeight: 1,
          refineStroke: true,
          strokeOpacity: 1,
          fillOpacity: 0.2,
          strokeColor: colorToHex,
          fillColor: colorToHex
        });
        // add  the circles to the map
        radiusAirQuality.addTo(map);
        circlesCenter.push({
          radiusAirQuality,
          value: data[i].value
        });

        // create Geojson object to add to map 
        stations.features.push({
          type: "Feature",
          properties: {
            value: data[i].value + " μg/m3"
          },
          geometry: {
            type: "Point",
            coordinates: [data[i].coordinates[1], data[i].coordinates[0]]
          }
        });
      }

      map.resize();

         // add airquality measuring value to center of cirkel on the map
      map.addSource("stations", {
        type: "geojson",
        data: stations
      });
     
      map.addLayer({
        id: "poi-labels",
        type: "symbol",
        source: "stations",
        layout: {
          "icon-optional": true,
          "text-field": ["get", "value"],
          "text-variable-anchor": ["top", "bottom", "left", "right"],
          "text-radial-offset": 0.5,
          "text-justify": "auto",
          "text-size": 14
        },
        paint: {
          "text-color": "#ffffff"
        }
      });
      map.addLayer({
        id: "circles",
        type: "circle",
        source: "stations",
        paint: {
          "circle-color": "#ffffff"
        }
      });
    });

    // clear score after starting new route
    directions.on("clear", origin => {
      this.setState({
        duration: 0,
        score: 0
      });
    });


    
    directions.on("route", direction => {
      duration = direction.route[0].duration / 60;
      this.setState({
        duration: duration.toFixed(0)
      });
      steps = [];
      this.setState({
        score: (score = 0)
      });

      // Check if route has multiple waypoints
      if (directions.getWaypoints().length > 0) {
        steps = [];
        for (let i = 0; i < direction.route[0].legs[0].steps.length; i++) {
          steps.push(direction.route[0].legs[0].steps[i]);
        }
        for (let i = 0; i < direction.route[0].legs[1].steps.length; i++) {
          steps.push(direction.route[0].legs[1].steps[i]);
        }

        // returns only one waypoint
      } else {
        for (let i = 0; i < direction.route[0].legs[0].steps.length; i++) {
          steps.push(direction.route[0].legs[0].steps[i]);
        }
      }

      // push all parts of a route in an array
      for (let j = 0; j < steps.length; j++) {
        locationsStep.push(steps[j].maneuver.location);
      }

        // push the duruation of each part of the route to an array
      for (let x = 0; x < steps.length; x++) {
        durationSteps.push(steps[x].duration);
      }


      for (let i = 0; i < locationsStep.length; i++) {
        for (let j = 0; j < durationSteps.length; j++) {
          locationsStep[i]["duration"] = parseInt(durationSteps[j].toFixed(2));
          i++;
        }
      }

      let checkhitCount = 0;
      let durationCount = 0;
      let totalScore = 0;

      // check the distance between two coordinates
      for (let i = 0; i < circlesCenter.length; i++) {
        for (let j = 0; j < locationsStep.length; j++) {
          let checkHit = this.getDistanceFromLatLonInMeters(
            locationsStep[j][1],
            locationsStep[j][0],
            circlesCenter[i].radiusAirQuality._lastCenterLngLat[1],
            circlesCenter[i].radiusAirQuality._lastCenterLngLat[0]
          );
          if (checkHit <= radiusCircle) {
            checkhitCount++;
            durationCount += (locationsStep[j].duration / 60).toFixed(0) * circlesCenter[i].value;
          }
        }
      }

      totalScore = durationCount / checkhitCount;

      this.setState({
        score: totalScore.toFixed(0)
      });

      if (checkhitCount <= 0) {
        this.setState({
          score: "The score cannot be calculated because there are no measuring stations in this area",
          duration: null
        });
      }
      locationsStep = [];
      durationSteps = [];
    });
    map.addControl(directions, "top-left");
  }

  componentWillUnmount() {
    this.map.remove();
  }

  render() {
    const style = {
      position: "absolute",
      top: 0,
      bottom: 0,
      width: "100%"
    };

    const { data, score, duration } = this.state;

    return (
      <div className="map-wrapper">
        <div id="map" style={style} ref={el => (this.mapContainer = el)} className="map" />
        <Airqualityinfo>
          <Accordion>
            <AccordionItem className="itemUp" expanded={true} title={"recommendation"} expandedClassName={"itemDown"} titleTag={"h5"}>
              <div className="score">
                {duration ? <p>duration route: {duration} minutes</p> : null}
                {score ? <p> Score: {score}</p> : <p>Create a route to get a recommendation</p>}
                {score > 0 && score < 45 && (
                  <div>
                    <span label="smile" role="img" aria-label="smile" className="emoji">
                      😀
                    </span>
                    <p>This is a safe route and you will hardly be exposed to air pollution.</p>
                  </div>
                )}
                {score >= 45 && score < 100 && (
                  <div>
                    <span label="thinking" role="img" aria-label="thinking" className="emoji">
                      🤔
                    </span>
                    <p>This route slightly exposes you to air pollution, but you could get a cleaner route</p>
                  </div>
                )}
                {score >= 100 && (
                  <div>
                    <span label="sick" role="img" aria-label="sick" className="emoji">
                      😷
                    </span>
                    <p>There is too much air pollution on this route. Adjust your route!</p>
                  </div>
                )}
              </div>
            </AccordionItem>
          </Accordion>
          <AccordionInfo />
        </Airqualityinfo>

        {this.state.render ? (
          <div className="explainPopup">
            <InfoPanel closeInfoPanel={this.closeInfoPanel}>
              <div className="direction-pop-up">
                <h1>N02 bicycle route planner</h1>
                <h2>What is nitrogen dioxide (No2)?</h2>
                <p>
                  NO2 is caused by a reaction between nitrogen dioxide and ozone. Weather and traffic have a major impact on concentration. The legal standard is an annual average of 40 (μg / m3).
                </p>

                <h2>What is the effect of NO2 on our health?</h2>
                <p>Lung irritation, reduced resistance, respiratory infections. Chronic exposure to current NO2 levels leads to an average lifespan reduction of 4 months.</p>

                <h2>What is the purpose of this platform?</h2>
                <p>
                  The purpose of this platform is to ind out whether cyclists in Amsterdam become more aware of how air quality influences your health. We are also researching how this knowledge can
                  be converted into behavioral change.                       
                </p>

                <h2>How does it work?</h2>
                <p>
                  On the map you can see various stations in Amsterdam that measure air quality. These stations are from RIVM and measure the NO2 values of that area. The higher the values the how the
                  air quality is worse. You can plan a route based on the information you get on the map about air quality. Use the route planner at the top left or choose a destination and departure
                  point by clicking on the map. Based on your route you will receive a score with an explanation that indicates how safe the route is for you.
                </p>
                <div className="explainApp">
                  <img src="asset/img/explain-1.png" alt="stap 1 kies een vetrekpunt" />
                  <img src="asset/img/explain-2.png" alt=" stap 2 maak ene route " />
                  <img src="asset/img/explain-3.png" alt="stap 3 check je score" />
                </div>
              </div>
            </InfoPanel>
          </div>
        ) : null}
      </div>
    );
  }
}
