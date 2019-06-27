import React from "react";
import mapboxgl from "mapbox-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";

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
  placeholderOrigin: "Kies een vetrekpunt of klik op de kaart",
  placeholderDestination: "Kies een bestemming of klik op de kaart",
  controls: {
    instructions: false,
    profileSwitcher: false
  }
});

const { lng, lat, zoom } = {
  lng: 4.8972,
  lat: 52.3709,
  zoom: 12
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

  getDistanceFromLatLonInMeters(latitude1, longitude1, latitude2, longitude2) {
    var p = 0.017453292519943295;
    var c = Math.cos;
    var a = 0.5 - c((latitude2 - latitude1) * p) / 2 + (c(latitude1 * p) * c(latitude2 * p) * (1 - c((longitude2 - longitude1) * p))) / 2;
    var R = 6371;
    var dist = 2 * R * Math.asin(Math.sqrt(a) * 1000);

    return dist.toFixed(0);
  }

  componentDidMount() {
    // score = this.state.score;
    let collectionMeasurements = [];

    let start = getNowHourISO();

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
    let circlesCenter = [];
    let steps = [];
    let radiusCircle = 1200;
    score = this.state.score;
    let data;

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
      data = collectionMeasurements[0];
      for (let i = 0; i < data.length; i++) {
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
      for (let i = 0; i < data.length; i++) {
        radiusAirQuality = new MapboxCircle({ lat: data[i].coordinates[0], lng: data[i].coordinates[1] }, radiusCircle, {
          editable: false,
          minRadius: 1500,
          strokeWeight: 1,
          refineStroke: true,
          strokeOpacity: 1,
          fillOpacity: 0.2,
          strokeColor: this.colorByValue(data[i].value),
          fillColor: this.colorByValue(data[i].value)
        });
        radiusAirQuality.addTo(map);
        circlesCenter.push(radiusAirQuality);
      }

      map.resize();
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

    directions.on("clear", origin => {
      this.setState({
        duration: 0,
        score: 0
      });
    });
    directions.on("route", direction => {
      console.log(direction);
      duration = direction.route[0].duration / 60;
      this.setState({
        duration: duration.toFixed(0)
      });
      steps = [];
      this.setState({
        score: (score = 0)
      });
      if (directions.getWaypoints().length > 0) {
        steps = [];
        for (let i = 0; i < direction.route[0].legs[0].steps.length; i++) {
          steps.push(direction.route[0].legs[0].steps[i]);
        }
        for (let i = 0; i < direction.route[0].legs[1].steps.length; i++) {
          steps.push(direction.route[0].legs[1].steps[i]);
        }
      } else {
        for (let i = 0; i < direction.route[0].legs[0].steps.length; i++) {
          steps.push(direction.route[0].legs[0].steps[i]);
        }
      }
      for (let j = 0; j < steps.length; j++) {
        locationsStep.push(steps[j].maneuver.location);
      }

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
      let durationCountFirstColor = 0;
      let durationCountSecondtColor = 0;
      let durationCountThirdColor = 0;
      let durationCountFourthColor = 0;
      let durationCountFivthColor = 0;
      for (let i = 0; i < circlesCenter.length; i++) {
        for (let j = 0; j < locationsStep.length; j++) {
          let checkHit = this.getDistanceFromLatLonInMeters(locationsStep[j][1], locationsStep[j][0], circlesCenter[i]._lastCenterLngLat[1], circlesCenter[i]._lastCenterLngLat[0]);
          if (checkHit <= radiusCircle) {
            checkhitCount++;

            if (circlesCenter[i].options.fillColor === "#55BD6D") {
              durationCountFirstColor += locationsStep[j].duration;
            }
            if (circlesCenter[i].options.fillColor === "#24ca4a") {
              durationCountSecondtColor += locationsStep[j].duration;
            }

            if (circlesCenter[i].options.fillColor === "#e67e22") {
              durationCountThirdColor += locationsStep[j].duration;
            }

            if (circlesCenter[i].options.fillColor === "#fdd082") {
              durationCountFourthColor += locationsStep[j].duration;
            }

            if (circlesCenter[i].options.fillColor === "#a50026") {
              durationCountFivthColor += locationsStep[j].duration;
            }
          }
        }
      }

      console.log(durationCountSecondtColor / 60);

      for (let i = 0; i < durationCountThirdColor / 10; i++) {
        this.setState({
          score: (score = score - 4)
        });
      }

      for (let i = 0; i < durationCountSecondtColor / 10; i++) {
        this.setState({
          score: (score = score + 4)
        });
      }

      for (let i = 0; i < durationCountFirstColor / 10; i++) {
        this.setState({
          score: (score = score + 6)
        });
      }

      for (let i = 0; i < durationCountFourthColor / 10; i++) {
        this.setState({
          score: (score = score - 3)
        });
      }

      for (let i = 0; i < durationCountFivthColor / 10; i++) {
        this.setState({
          score: (score = score - 6)
        });
      }

      if (checkhitCount <= 0) {
        this.setState({
          score: "De score kan niet berekent worden omdat er in dit gebied geen meetstations zijn",
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

  colorByValue(value) {
    let color;
    if (value > 0 && value <= 20) {
      color = "#24ca4a";
    }

    if (value > 20 && value <= 30) {
      color = "#fdd082";
    }

    if (value > 30 && value <= 50) {
      color = "#e67e22";
    }

    if (value > 50) {
      color = "#a50026";
    }

    return color;
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
            <AccordionItem className="itemUp" expanded={true} title={"Advies"} expandedClassName={"itemDown"} titleTag={"h5"}>
              <div className="score">
                {duration ? <p>Tijdsduur route: {duration} minuten</p> : null}
                {score ? <p> Score: {score}</p> : <p>Maak een route om een advies te krijgen</p>}
                {score > 0 && (
                  <div>
                    <span label="smile" role="img" aria-label="smile" className="emoji">
                      😀
                    </span>
                    <p>Dit is een veilige route je wordt nauwlijks blootgesteld aan luchtvervuiling.</p>
                  </div>
                )}
                {score < 0 && score > -300 && (
                  <div>
                    <span label="thinking" role="img" aria-label="thinking" className="emoji">
                      🤔
                    </span>
                    <p>Met deze route wordt je lichtelijk blootgesteld aan luchtvervuiling maar het kan beter!</p>
                  </div>
                )}
                {score < -300 && (
                  <div>
                    <span label="sick" role="img" aria-label="sick" className="emoji">
                      😷
                    </span>
                    <p>Er is teveel luchtvervuiling op deze route. Pas je route aan!</p>
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
                <h2>Wat is Koolstofdioxide(No2)?</h2>
                <p>
                  NO2 ontstaat uit een reactie tussen stikstofmonoxide en ozon. Het weer en de verkeersdrukte hebben grote invloed op de concentratie. De wettelijke norm is een jaargemiddelde van 40
                  (μg/m3).
                </p>

                <h2>Wat is de bedoeling van dit platform?</h2>
                <p>
                  De bedoeling van dit platform is om erachter te komen of fietser in Amsterdam bewuster over hoe luchtkwaliteit je gezondheid beinvloed. Verder zijn we ook aan het kijken hoe deze
                  kennis omgezet kan worden in gedragsverandeing.
                </p>

                <h2>Hoe werkt het?</h2>
                <p>
                  Op de kaart zie je verschillende stations in Amsterdam die luchtkwaliteit meten. Deze stations zijn van het RIVM en meten de NO2 waardes van dat gebied. Hoe hoger de waardes hoe
                  slechter de luchtkwaliteit is. Op basis de informatie die je op de kaart krijgt over de luchtkwaliteit kan je een route plannen. Maak gebruik van de route planner linksboven of kies
                  een bestemming en vetrekpunt door op de kaart te klikken. Op basis van je route krijg je een score met een uitleg die aangeeft hoe veilig de route voor je is.
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
