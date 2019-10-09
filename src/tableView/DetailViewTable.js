import React from "react";
import { getNowHourISO, getMonthAgoHourISO } from "../settings/time.js";
import moment from "moment";
import localization from "moment/locale/nl-be";
import { XAxis, YAxis, CartesianGrid, Tooltip, Label, Brush, ResponsiveContainer, BarChart, Bar } from "recharts";

class DetailViewTable extends React.Component {
  constructor(props) {
    super();

    this.state = {
      data: null,
      stationInfo: null
    };
  }

  componentDidMount() {
    const station_number = this.props.clickedObject;
    let start = getMonthAgoHourISO();
    let end = getNowHourISO();

    const urls = [
      `https://data.waag.org/api/getOfficialStations?station_id=${station_number}`,
      `https://data.waag.org/api/getOfficialMeasurement?formula=NO2&&station_id=${station_number}&start=${start}&end=${end}`
    ];

    Promise.all(urls.map(url => fetch(url).then(resp => resp.json()))).then(([stationInfo, data]) => {
      this.setState({ data, stationInfo });
    });
  }

  xAxisTickFormatter(timestamp_measured) {
    return moment(timestamp_measured)
      .format("ll")
      .slice(0, 5);
  }

  CustomTooltip = ({ active, payload, label }) => {
    let time = moment(label).format("LT");
    let dateTip = moment(label)
      .format("llll")
      .slice(0, 10);

    let formattedDate = dateTip + " " + time;

    if (active) {
      return (
        <div className="custom-tooltip">
          <p className="label-tooltip">{`${formattedDate}`}</p>
          <p className="desc-tooltip">
            N02:
            <span className="value-tooltip">{` ${payload[0].value} μg/m3`}</span>
          </p>
        </div>
      );
    }

    return null;
  };

  render() {
    let { stationInfo, data } = this.state;
    moment().locale("nl-be", localization);
    return (
      <div>
        {this.state.data ? (
          <div className="table-panel-description">
            <h1 className="panel-header">Station: {stationInfo.data.location}</h1>
            <ResponsiveContainer width="100%" height={460}>
              <BarChart width={960} height={500} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid horizontal vertical={false} strokeDasharray="3 3" />
                <XAxis tickMargin={5} dataKey="timestamp_measured" tickFormatter={this.xAxisTickFormatter} />
                <YAxis type="number" domain={[0, 200]}>
                  <Label angle={-90} value="nitrogen dioxide (NO2)" position="insideLeft" style={{ textAnchor: "middle" }} />
                </YAxis>
                <Tooltip content={this.CustomTooltip} animationDuration={0} />
                <Bar dataKey="value" name="N02" fill="#00d1b2" />
                <Brush dataKey="timestamp_measured" tickFormatter={this.xAxisTickFormatter} travellerWidth={4} startIndex={Math.round(data.length * 0.75)} height={40} width={800} stroke="#34b5bb">
                  <BarChart>
                    <CartesianGrid />
                    <YAxis hide domain={["auto", "auto"]} />
                    <Bar dataKey="value" fill="#00d1b2" name="N02" dot={false} />
                  </BarChart>
                </Brush>
              </BarChart>
            </ResponsiveContainer>
            <p className="explain-N02">
             {stationInfo.data.description.EN}
            </p>
          </div>
        ) : (
          <div className="loading">
            <img src="asset/img/loader.gif" alt="Loading animation" />
          </div>
        )}
      </div>
    );
  }
}

export default DetailViewTable;
