import React from "react";
import DeckGL, { GridCellLayer } from "deck.gl";
import { StaticMap } from "react-map-gl";
// import {mapStyle} from './settings/mapStyle'

import { color, getColorArray } from "./settings/util";
import { scaleLinear } from "d3-scale";
import { getNowHourISO } from "./settings/time";
import InfoPanel from "./InfoPanel";
import AirQualityRange from "./dataRange/AirQualityRange";
import Detailgraph from "./detailview/Detailgraph";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";

import Airqualityinfo from "./dataRange/Airqualityinfo";
import RangePanel from "./dataRange/RangePanel";
import { Accordion, AccordionItem } from "react-light-accordion";
import "react-light-accordion/demo/css/index.css";

const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoidWd1cjIyIiwiYSI6ImNqc2N6azM5bTAxc240M3J4MXZ1bDVyNHMifQ.rI_KbRwW8MShCcPNLsB6zA";
const mapStyle = "mapbox://styles/ugur22/cjw1xdexp03td1crpzxagiywf";

const INITIAL_VIEW_STATE = {
  longitude: 4.8972,
  latitude: 52.3709,
  zoom: 13,
  maxZoom: 16,
  minZoom: 12,
  pitch: 60,
  bearing: 5
};

let data;

export default class App extends React.Component {
  state = {};

  constructor(props) {
    super();

    this.state = {
      data: [],
      stationInfo: null,
      render: true
    };

    this.closeInfoPanel = this.closeInfoPanel.bind(this);
  }

  renderTooltip() {
    let { hoveredObject, pointerX, pointerY } = this.state || {};

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
          }}>
          <span>{hoveredObject.formula}</span>
          <br />
          Laatste uurgemiddelde: {hoveredObject.value} μg/m3
        </div>
      )
    );
  }

  closeInfoPanel() {
    this.setState({
      clickedObject: null,
      render: false
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

  componentDidMount() {
    let start = getNowHourISO();
    const urls = [
      `https://data.waag.org/api/getOfficialMeasurement?formula=NO2&start=${start}&end=${start}&
      station_id=NL01908&station_id=NL10545&station_id=NL49007&station_id=NL10520&station_id=NL49002&station_id=NL49020&&station_id=NL49021&&station_id=NL49003&station_id=NL49022&station_id=NL49019&station_id=NL10544&station_id=NL49017&station_id=NL49012&station_id=NL49014&station_id=NL49016`
    ];

    Promise.all(urls.map(url => fetch(url).then(resp => resp.json()))).then(([results]) => {
      const data = results.map(station => {
        station.coordinates = station.coordinates.reverse();
        return station;
      });

      this.setState({ data });
    });
  }

  render() {
    data = this.state.data;
    const cellSize = 50;
    const elevation = scaleLinear([0, 10], [0, 1]);

    const layers = [
      new GridCellLayer({
        id: "grid-cell-layer",
        data,
        ...this.props,
        pickable: true,
        extruded: true,
        getPosition: d => d.coordinates,
        cellSize: cellSize,
        elevationScale: 50,
        getColor: d => getColorArray(color(d.value, [0, 60])),
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
      <div>
        <DeckGL layers={layers} initialViewState={INITIAL_VIEW_STATE} controller={true}>
          <StaticMap mapStyle={mapStyle} mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} />
          {this.renderTooltip.bind(this)}
          {this.renderStation.bind(this)}
        </DeckGL>
        <Airqualityinfo>
          <Accordion atomic={true}>
            <AccordionItem title="Wat is NO2?">
              <p>
                NO2 ontstaat uit een reactie tussen stikstofmonoxide en ozon. Het weer en de verkeersdrukte hebben grote invloed op de concentratie. De wettelijke norm is een jaargemiddelde van 40
                (μg/m3).
              </p>
            </AccordionItem>

            <AccordionItem title="Wat is de bedoeling van dit platform?">
              <p>
                De bedoeling van dit platform is om erachter te komen of fietser in Amsterdam bewuster over hoe luchtkwaliteit je gezondheid beinvloed. Verder zijn we ook aan het kijken hoe deze
                kennis omgezet kan worden in gedragsverandeing.
              </p>
            </AccordionItem>

            <AccordionItem title="Hoe werkt het?">
              <p>
                Op de kaart zie je verschillende stations in Amsterdam die luchtkwaliteit meten. Deze stations zijn van het RIVM en meten de NO2 waardes van dat gebied. Hoe hoger de waardes hoe
                slechter de luchtkwaliteit is. Verder kan je door te hoveren op een station het laatste uurgemiddelde zijn van dat station. Door op het station te klikken kan je een detailoverzicht
                zien die het uurgemiddelde toont over de gehele maand.
              </p>
            </AccordionItem>
          </Accordion>
        </Airqualityinfo>
        <RangePanel>
          <AirQualityRange />
        </RangePanel>
        {this.state.render ? (
          <div className="explainPopup">
            <InfoPanel closeInfoPanel={this.closeInfoPanel}>
              <h1>Wat is Koolstofdioxide(No2)?</h1>
              <p>
                NO2 ontstaat uit een reactie tussen stikstofmonoxide en ozon. Het weer en de verkeersdrukte hebben grote invloed op de concentratie. De wettelijke norm is een jaargemiddelde van 40
                (μg/m3).
              </p>

              <h1>Wat is de bedoeling van dit platform?</h1>
              <p>
                De bedoeling van dit platform is om erachter te komen of fietser in Amsterdam bewuster over hoe luchtkwaliteit je gezondheid beinvloed. Verder zijn we ook aan het kijken hoe deze
                kennis omgezet kan worden in gedragsverandeing.
              </p>

              <h1>Hoe werkt het?</h1>
              <p>
                Op de kaart zie je verschillende stations in Amsterdam die luchtkwaliteit meten. Deze stations zijn van het RIVM en meten de NO2 waardes van dat gebied. Hoe hoger de waardes hoe
                slechter de luchtkwaliteit is. Verder kan je door te hoveren op een station het laatste uurgemiddelde zijn van dat station. Door op het station te klikken kan je een detailoverzicht
                zien die het uurgemiddelde toont over de gehele maand.
              </p>
            </InfoPanel>
          </div>
        ) : null}
      </div>
    );
  }
}
