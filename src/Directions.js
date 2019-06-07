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
import {
  CircleMode,
  DirectMode,
  SimpleSelectMode
} from "mapbox-gl-draw-circle";
import MapboxCircle from "mapbox-gl-circle";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

mapboxgl.accessToken =
  "pk.eyJ1IjoidWd1cjIyIiwiYSI6ImNqc2N6azM5bTAxc240M3J4MXZ1bDVyNHMifQ.rI_KbRwW8MShCcPNLsB6zA";

let directions = new MapboxDirections({
  accessToken: mapboxgl.accessToken,
  unit: "metric",
  profile: "mapbox/cycling",
  congestion: true,
  alternatives: true,
  styles: [
    {
      id: "directions-route-line-alt",
      type: "line",
      source: "directions",
      layout: {
        "line-cap": "round",
        "line-join": "round"
      },
      paint: {
        "line-color": "rgba(195, 195, 195, 0.6)",
        "line-width": 10
      },
      filter: [
        "all",
        ["in", "$type", "LineString"],
        ["in", "route", "alternate"]
      ]
    }
  ],
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

export default class Direction extends React.Component {
  constructor(props) {
    super();

    this.state = {
      data: [],
      render: true
    };

    this.closeInfoPanel = this.closeInfoPanel.bind(this);
  }

  closeInfoPanel() {
    this.setState({
      render: false
    });
  }

  componentDidMount() {
    const map = new mapboxgl.Map({
      container: this.mapContainer, // See https://blog.mapbox.com/mapbox-gl-js-react-764da6cc074a
      style: "mapbox://styles/ugur22/cjvpc96ky16c91ck6woz0ih5d",
      center: [lng, lat],
      zoom,
      containerStyle: {
        height: "100vh",
        width: "100vw"
      }
    });

    map.on("load", () => {
      map.resize();
    });

    let myCircle = new MapboxCircle({ lat: 52.366811, lng: 4.793344 }, 1200, {
      editable: false,
      minRadius: 1500,
      fillColor: "#24ca4a"
    }).addTo(map);

    let myCircle2 = new MapboxCircle({ lat: 52.320692, lng: 4.988397 }, 1200, {
      editable: false,
      minRadius: 1500,
      fillColor: "#24ca4a"
    }).addTo(map);

    let myCircle3 = new MapboxCircle({ lat: 52.374786, lng: 4.860319 }, 1200, {
      editable: false,
      minRadius: 1500,
      fillColor: "#fdd082"
    }).addTo(map);

    let myCircle4 = new MapboxCircle({ lat: 52.372056, lng: 4.9044 }, 1200, {
      editable: false,
      minRadius: 1500,
      fillColor: "#55bd6d"
    }).addTo(map);

    let myCircle5 = new MapboxCircle({ lat: 52.359714, lng: 4.866208 }, 1200, {
      editable: false,
      minRadius: 1500,
      fillColor: "#a50026"
    }).addTo(map);

    let myCircle6 = new MapboxCircle({ lat: 52.389983, lng: 4.887811 }, 1200, {
      editable: false,
      minRadius: 1500,
      fillColor: "#a50026"
    }).addTo(map);

    let myCircle7 = new MapboxCircle({ lat: 52.381331, lng: 4.845233 }, 1200, {
      editable: false,
      minRadius: 1500,
      fillColor: "#fdd082"
    }).addTo(map);

    let myCircle8 = new MapboxCircle({ lat: 52.389314, lng: 4.943822 }, 1200, {
      editable: false,
      minRadius: 1500,
      fillColor: "#fdd082"
    }).addTo(map);

    let myCircle9 = new MapboxCircle({ lat: 52.385422, lng: 4.87575 }, 1200, {
      editable: false,
      minRadius: 1500,
      fillColor: "#fdd082"
    }).addTo(map);

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
