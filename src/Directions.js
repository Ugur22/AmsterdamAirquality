import React from "react";
import mapboxgl from "mapbox-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css"; // Updating node module will keep css up to date.
import TrafficRange from "./dataRange/TrafficRange";
import AirQualityRange from "./dataRange/AirQualityRange";
import Airqualityinfo from "./dataRange/Airqualityinfo";
import RangePanel from "./dataRange/RangePanel";
import AccordionInfo from "./dataRange/AccordionInfo";
import "react-light-accordion/demo/css/index.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import InfoPanel from "./InfoPanel";
import { circles } from "./settings/radiusCircles";
import MapboxCircle from "mapbox-gl-circle";

mapboxgl.accessToken =
  "pk.eyJ1IjoidWd1cjIyIiwiYSI6ImNqc2N6azM5bTAxc240M3J4MXZ1bDVyNHMifQ.rI_KbRwW8MShCcPNLsB6zA";

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
  zoom: 13
};

let score;

export default class Direction extends React.Component {
  constructor(props) {
    super();

    this.state = {
      data: [],
      render: true,
      score: 0
    };

    this.closeInfoPanel = this.closeInfoPanel.bind(this);
  }

  closeInfoPanel() {
    this.setState({
      render: false
    });
  }

  getDistanceFromLatLonInMeters(latitude1, longitude1, latitude2, longitude2) {
    var p = 0.017453292519943295; //This is  Math.PI / 180
    var c = Math.cos;
    var a =
      0.5 -
      c((latitude2 - latitude1) * p) / 2 +
      (c(latitude1 * p) *
        c(latitude2 * p) *
        (1 - c((longitude2 - longitude1) * p))) /
        2;
    var R = 6371;
    var dist = 2 * R * Math.asin(Math.sqrt(a) * 1000);

    return dist.toFixed(0);
  }

  componentDidMount() {
    score = this.state.score;

    const map = new mapboxgl.Map({
      container: this.mapContainer, // See https://blog.mapbox.com/mapbox-gl-js-react-764da6cc074a
      style: "mapbox://styles/ugur22/cjvpc96ky16c91ck6woz0ih5d",
      center: [lng, lat],
      zoom
    });

    map.on("load", () => {
      map.resize();
    });
    let radiusAirQuality;
    let coordinatesCirkels = [];
    let locationsStep = [];
    let circlesCenter = [];
    let steps = [];

    for (let i = 0; i < circles.length; i++) {
      radiusAirQuality = new MapboxCircle(
        { lat: circles[i].geometry.lat, lng: circles[i].geometry.lng },
        1200,
        {
          editable: false,
          minRadius: 1500,
          strokeWeight: 1,
          refineStroke: true,
          strokeOpacity: 1,
          strokeColor: "#000000",
          fillColor: circles[i].color
        }
      );
      radiusAirQuality.addTo(map);
      circlesCenter.push(radiusAirQuality);
      coordinatesCirkels.push(radiusAirQuality._circle);
    }

    directions.on("route", direction => {
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

      console.log(locationsStep);

      for (let i = 0; i < circlesCenter.length; i++) {
        for (let j = 0; j < locationsStep.length; j++) {
          let checkHit = this.getDistanceFromLatLonInMeters(
            locationsStep[j][1],
            locationsStep[j][0],
            circlesCenter[i]._lastCenterLngLat[1],
            circlesCenter[i]._lastCenterLngLat[0]
          );

          if (checkHit <= 1200) {

            
            if (circlesCenter[i].options.fillColor === "#fdd082") {
              console.log("#fdd082")
              this.setState({
                score: (score = score - 4)
              });
            }

            if (circlesCenter[i].options.fillColor === "#24ca4a") {
              console.log("#24ca4a")
              this.setState({
                score: (score = score + 8)
              });
            }

            if (circlesCenter[i].options.fillColor === "#a50026") {
              console.log("#a50026")
              this.setState({
                score: (score = score - 8)
              });
            }

            if (circlesCenter[i].options.fillColor === "#55BD6D") {
              console.log("#55BD6D")
              this.setState({
                score: (score = score + 4)
              });
            }

            if (circlesCenter[i].options.fillColor === "#fdd082") {
              console.log("#fdd082")
              this.setState({
                score: (score = score - 2)
              });
            }
          }
        }
      }
      locationsStep = [];

    });

    for (let i = 0; i < coordinatesCirkels.length; i++) {
      // let circleOuterBounds = coordinatesCirkels[i].geometry.coordinates[0];
      // for (let j = 0; j < circleOuterBounds.length; j++) {
      //   // console.log( circleOuterBounds[j][1]);
      //   // console.log( circleOuterBounds[j][0]);
      //   let radiusAirQualitys = new MapboxCircle(
      //     {
      //       lat: circleOuterBounds[j][1],
      //       lng: circleOuterBounds[j][0]
      //     },
      //     10,
      //     {
      //       editable: false,
      //       minRadius: 1500,
      //       fillOpacity: 1,
      //       fillColor: "#000000"
      //     }
      //   );
      //   radiusAirQualitys.addTo(map);
      // }
    }
    map.addControl(directions, "top-left");
  }

  render() {
    const style = {
      position: "absolute",
      top: 0,
      bottom: 0,
      width: "100%"
    };
    return (
      <div className="map-wrapper">
        <div
          id="map"
          style={style}
          ref={el => (this.mapContainer = el)}
          className="map"
        />
        <Airqualityinfo>
          <div className="score">
            <h3>Score: {this.state.score}</h3>
            {this.state.score > 0 && (
              <p role="image" aria-label="hamburger">
                😀 Met deze route wordt je minder blootgesteld aan
                luchtvervuiling
              </p>
            )}
            {this.state.score < 0 && (
              <p role="image" aria-label="hamburger">
                😧 Er is teveel luchtvervuiling op deze route. Pas je route aan
              </p>
            )}
          </div>
          <AccordionInfo />
        </Airqualityinfo>
        <RangePanel>
          <AirQualityRange />
          <TrafficRange />
        </RangePanel>
        {this.state.render ? (
          <div className="explainPopup">
            <InfoPanel closeInfoPanel={this.closeInfoPanel}>
              <h1>Wat is Koolstofdioxide(No2)?</h1>
              <p>
                NO2 ontstaat uit een reactie tussen stikstofmonoxide en ozon.
                Het weer en de verkeersdrukte hebben grote invloed op de
                concentratie. De wettelijke norm is een jaargemiddelde van 40
                (μg/m3).
              </p>

              <h1>Wat is de bedoeling van dit platform?</h1>
              <p>
                De bedoeling van dit platform is om erachter te komen of fietser
                in Amsterdam bewuster over hoe luchtkwaliteit je gezondheid
                beinvloed. Verder zijn we ook aan het kijken hoe deze kennis
                omgezet kan worden in gedragsverandeing.
              </p>

              <h1>Hoe werkt het?</h1>
              <p>
                Op de kaart zie je verschillende stations in Amsterdam die
                luchtkwaliteit meten. Deze stations zijn van het RIVM en meten
                de NO2 waardes van dat gebied. Hoe hoger de waardes hoe slechter
                de luchtkwaliteit is. Op basis de informatie die je op de kaart
                krijgt over de luchtkwaliteit kan je een route plannen. Maak
                gebruik van de route planner linksboven of kies een bestemming
                en vetrekpunt door op de kaart te klikken.
              </p>
            </InfoPanel>
          </div>
        ) : null}
      </div>
    );
  }
}
