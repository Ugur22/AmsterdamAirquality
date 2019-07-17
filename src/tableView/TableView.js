import React from "react";
import "react-bulma-components/dist/react-bulma-components.min.css";
import { Table } from "react-bulma-components";
import { getNowHourISO } from "../settings/time";
import InfoPanel from "../InfoPanel";
import DetailViewTable from "./DetailViewTable";

let data, render, number_station;

class TableView extends React.Component {
  state = {};

  constructor(props) {
    super();

    this.state = {
      data: [],
      stationInfo: null,
      render: false,
      number_station: ""
    };
  }

  closeInfoPanel() {
    this.setState({
      render: false
    });
  }

  renderStation = (e, station_number) => {
    this.setState({
      render: true,
      number_station: station_number
    });
  };

  componentDidMount() {
    document.title = "tableview airquality";
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
    number_station = this.state.number_station;
    this.closeInfoPanel = this.closeInfoPanel.bind(this);
    this.renderStation = this.renderStation.bind(this);
    data = this.state.data;

    console.log(data);
    return (
      <div>
        {this.state.render ? (
          <InfoPanel closeInfoPanel={this.closeInfoPanel}>
            <DetailViewTable clickedObject={this.state.number_station} />
          </InfoPanel>
        ) : null}
        {this.state.data ? (
          <Table className="table">
            <thead>
              <tr>
                <th>station locatie</th>
                <th>station ID</th>
                <th>laatste uurgemiddelde</th>
                <th>stof</th>
              </tr>
            </thead>
            <tbody>
              {this.state.data.map(item => (
                <tr key={item.station_number} onClick={e => this.renderStation(e, item.station_number)}>
                  <td> {item.name} </td>
                  <td>{item.station_number}</td>
                  <td> {item.value} µg/m3</td>
                  <td> {item.formula}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="loading">
            <img src="asset/img/loader.gif" alt="Loading animation" />
          </div>
        )}
      </div>
    );
  }
}

export default TableView;
