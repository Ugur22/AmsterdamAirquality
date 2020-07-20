import React from "react";
import DeckGL, { GridCellLayer } from "deck.gl";
import { StaticMap } from "react-map-gl";

import { color, getColorArray } from "./settings/util";
import { scaleLinear } from "d3-scale";
import { getNowHourISO } from "./settings/time";
import InfoPanel from "./InfoPanel";
import AirQualityRange from "./dataRange/AirQualityRange";
import Detailgraph from "./detailview/Detailgraph";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import Airqualityinfo from "./dataRange/Airqualityinfo";
import { Accordion, AccordionItem } from "react-sanfona";

const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoidWd1cjIyIiwiYSI6ImNqc2N6azM5bTAxc240M3J4MXZ1bDVyNHMifQ.rI_KbRwW8MShCcPNLsB6zA";
const mapStyle = "mapbox://styles/ugur22/cjw1xdexp03td1crpzxagiywf";
const INITIAL_VIEW_STATE = {
  longitude: 4.8972,
  latitude: 52.3709,
  zoom: 13,
  maxZoom: 16,
  minZoom: 5,
  pitch: 60,
  bearing: 5,
  scrollZoom: false
};

let data;
let controlsOn = true;

export default class App extends React.Component {
  state = {};

  constructor(props) {
    super();

    this.state = {
      data: [],
      stationInfo: null,
      render: false
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
          <ul className="hoveredObjectData">
            <li>
              {" "}
              <span>{hoveredObject.name}</span>
            </li>
            <li>measured compound: {hoveredObject.formula}</li>
            <li> last hourly average: {hoveredObject.value} μg/m3</li>
          </ul>
        </div>
      )
    );
  }

  closeInfoPanel() {
    controlsOn = true;
    this.setState({
      clickedObject: null,
      render: false
    });
  }

  renderStation() {
    const { clickedObject } = this.state || {};

    if (clickedObject != null) {
      controlsOn = false;
      return (
        <InfoPanel closeInfoPanel={this.closeInfoPanel}>
          <Detailgraph clickedObject={clickedObject.station_number} />
        </InfoPanel>
      );
    }
  }

  componentDidMount() {
    document.title = "Airquality insight platform";
    let start = getNowHourISO();
    const urls = [
      `https://data.waag.org/api/getOfficialMeasurement?formula=NO2&start=${start}&end=${start}&station_id=NL10404&station_id=NL10445&station_id=NL10246&station_id=NL49553&station_id=NL49573&station_id=NL49572&station_id=NL49703&station_id=NL49556&station_id=NL49546&station_id=NL49002&station_id=NL49003&station_id=NL49007&station_id=NL49014&station_id=NL49016&station_id=NL49017&station_id=NL49019&station_id=NL49020&station_id=NL49021&station_id=NL49022&station_id=NL49012&station_id=NL10446&station_id=NL53015&station_id=NL49701&station_id=NL53001&station_id=NL53004&station_id=NL53016&station_id=NL53020&station_id=NL01496&station_id=NL10918&station_id=NL49704&station_id=NL10301&station_id=NL10938&station_id=NL01485&station_id=NL01491&station_id=NL01493&station_id=NL01487&station_id=NL01484&station_id=NL10107&station_id=NL10722&station_id=NL10818&station_id=NL10934&station_id=NL10929&station_id=NL10617&station_id=NL54004&station_id=NL54010&station_id=NL10538&station_id=NL10741&station_id=NL01488&station_id=NL10418&station_id=NL10937&station_id=NL10738&station_id=NL10138&station_id=NL01494&station_id=NL50004&station_id=NL50007&station_id=NL50009&station_id=NL50010&station_id=NL50002&station_id=NL50003&station_id=NL10133&station_id=NL10131&station_id=NL50006&station_id=NL10235&station_id=NL10230&station_id=NL10241&station_id=NL10442&station_id=NL10236&station_id=NL10237&station_id=NL10247&station_id=NL10550&station_id=NL49561&station_id=NL49565&station_id=NL10641&station_id=NL10807&station_id=NL10633&station_id=NL10636&station_id=NL10643&station_id=NL10318&station_id=NL10136&station_id=NL10240&station_id=NL10639&station_id=NL10644&station_id=NL10742&station_id=NL10821&station_id=NL01489&station_id=NL01912&station_id=NL10437&station_id=NL10444&station_id=NL49551&station_id=NL49570&station_id=NL49564&station_id=NL01908&station_id=NL01492&station_id=NL01495&station_id=NL10449`
    ];

    Promise.all(urls.map(url => fetch(url).then(resp => resp.json()))).then(([results]) => {
      const data = results.map(station => {
        return station;
      });

      this.setState({ data });
    });
  }

  render() {
    data = this.state.data;

    const cellSize = 100;
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
        getColor: d => getColorArray(color(d.value, [0, 55])),
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
        <DeckGL layers={layers} initialViewState={INITIAL_VIEW_STATE} controller={controlsOn} >
          <StaticMap mapStyle={mapStyle} mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} />
          {this.renderTooltip.bind(this)}
          {this.renderStation.bind(this)}
        </DeckGL>
        <Airqualityinfo>
          <div className="accordion">
            <Accordion>
              <AccordionItem className="itemUp info" title={"Good to know"} expandedClassName={"itemDown"} titleTag={"h5"}>
                <Accordion>
                  <AccordionItem title={"What is NO2?"} titleTag={"h5"}>
                    <p>
                      NO2 is caused by a reaction between nitrogen dioxide and ozone. Weather and traffic have a major impact on concentration. The legal standard is an annual average of 40 (μg / m3).
                    </p>
                  </AccordionItem>

                  <AccordionItem title={"What is the effect of NO2 on our health?"} titleTag={"h5"}>
                    <p>Lung irritation, reduced resistance, respiratory infections. Chronic exposure to current NO2 levels leads to an average lifespan reduction of 4 months.</p>
                  </AccordionItem>
                  <AccordionItem title={"What is the purpose of this platform?"} titleTag={"h5"}>
                    <p>
                      The purpose of this platform is to find out whether cyclists in Amsterdam become more aware of how air quality influences your health. We are also researching
                      how this knowledge can be converted into behavioral change.
                    </p>
                  </AccordionItem>
                  <AccordionItem title={"How does it work?"} titleTag={"h5"}>
                    <p>
                      On the map you can see various stations in Amsterdam that measure air quality. These stations are from RIVM and measure the NO2 values of that area. The higher the values the how
                      the air quality is worse. Furthermore, by hovering at a station you can be the last hourly average of that station. By clicking on the station you can create a view a detailed
                      overview showing the hourly average for the entire month.
                    </p>
                  </AccordionItem>
                </Accordion>
              </AccordionItem>
            </Accordion>
            <Accordion>
              <AccordionItem title={"Legend"} expanded={true} titleTag={"h5"} expandedClassName={"itemDown"} className="itemUp info">
                <AirQualityRange />
              </AccordionItem>
            </Accordion>
          </div>
        </Airqualityinfo>
        {this.state.render ? (
          <div className="explainPopup">
            <InfoPanel closeInfoPanel={this.closeInfoPanel}>
              <header>
                <h1>Airquality insight platform</h1>
              </header>

              <h2>What is nitrogen dioxide (No2)?</h2>
              <p>NO2 is caused by a reaction between nitrogen dioxide and ozone. Weather and traffic have a major impact on concentration. The legal standard is an annual average of 40 (μg / m3).</p>

              <h2>What is the effect of NO2 on our health?</h2>
              <p>Lung irritation, reduced resistance, respiratory infections. Chronic exposure to current NO2 levels leads to an average lifespan reduction of 4 months.</p>

              <h2>What is the purpose of this platform?</h2>
              <p>
                The purpose of this platform is to ind out whether cyclists in Amsterdam become more aware of how air quality influences your health. We are also researching how this knowledge can be
                converted into behavioral change.
              </p>

              <h2>How does it work?</h2>
              <p>
                On the map you can see various stations in Amsterdam that measure air quality. These stations are from RIVM and measure the NO2 values of that area. The higher the values the how the
                air quality is worse. Furthermore, by hovering at a station you can be the last hourly average of that station. By clicking on the station you can create a view a detailed overview
                showing the hourly average for the entire month.
              </p>
            </InfoPanel>
          </div>
        ) : null}
      </div>
    );
  }
}
