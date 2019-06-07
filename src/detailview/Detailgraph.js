import React from "react";
import { getNowHourISO, getMonthAgoHourISO } from "../settings/time.js";
import moment from "moment";
import localization from "moment/locale/nl-be"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
  Brush,
  ResponsiveContainer,
  Legend
} from "recharts";

class Detailgraph extends React.Component {
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

    Promise.all(urls.map(url => fetch(url).then(resp => resp.json()))).then(
      ([stationInfo, data]) => {
        this.setState({ data, stationInfo });
      }
    );
  }

  xAxisTickFormatter(timestamp_measured) {
    return moment(timestamp_measured)
      .format("ll")
      .slice(0, 5);
  }



   CustomTooltip = ({ active, payload, label }) => {
    let time = moment(label).format('LT');
    let dateTip = moment(label).format("llll")
    .slice(0, 10);

    let formattedDate = dateTip + " " + time;

    if (active) {
      return (
        <div className="custom-tooltip">
          <p className="label-tooltip">{`${formattedDate}`}</p>
          <p className="desc-tooltip">N02:
          <span className="value-tooltip">
          {` ${payload[0].value} μg/m3`}
          </span>   
           </p>
        </div>
      );
    }
  
    return null;
  };

  render() {
    let { stationInfo, data } = this.state;
    moment()
      .locale("nl-be", localization)
    return (
      <div>
        {this.state.data ? (
          <div className="panel-description">
            <h1 className="panel-header">
              Station: {stationInfo.data.location}
            </h1>

            <p className="Panel-subtext">
              {stationInfo.data.description.NL}
            </p>
            <ResponsiveContainer width="100%" height={460}>
            <LineChart
              width={920}
              height={500}
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5
              }}
            >
              <CartesianGrid
                horizontal
                vertical={false}
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="timestamp_measured"
                tickFormatter={this.xAxisTickFormatter}
              />
              <YAxis type="number" domain={[0, 150]}  >
              <Label angle={-90} value='stikstofdioxide (NO2)'  position='insideLeft' style={{textAnchor: 'middle'}} />
              </YAxis>
              <Tooltip content={this.CustomTooltip} />
        
              <Legend
                 margin={{
                  top: 25
                }}
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
                verticalAlign="top"
                height={36}
                payload={
                  [
                  
                  ]
                 }
              />
              <Line
                dataKey="value"
                stroke="#000000"
                name="N02"
                type="natural"
                dot={false}
                travellerWidth={4}
                strokeWidth={1}
                activeDot={{ r: 5 }}
              />
              <Brush
                dataKey="timestamp_measured"
                tickFormatter={this.xAxisTickFormatter}
                height={40}
                width={850}
                stroke="#34b5bb"
              >
                <LineChart>
                  <CartesianGrid />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Line
                    dataKey="value"
                    stroke="#000000"
                    name="N02"
                    dot={false}
                  />
                </LineChart>
              </Brush>
            </LineChart>
            </ResponsiveContainer>
            <p className="explain-N02"> 
        De hoogste concentraties stikstofdioxide (NO2) komen voor tijdens de ochtend- en avondspits. Deze stof komt vrij door het (weg)verkeer, energieproductie en industrie. Daarnaast ontstaat NO2 uit een reactie tussen stikstofmonoxide en ozon. Het weer en de verkeersdrukte hebben grote invloed op de concentratie. De wettelijke norm is een jaargemiddelde van 40 (μg/m3)
        </p>
          </div>
        ) : (
          <div className="loading">
          <img src="asset/img/loader.gif" alt="Loading animation"/>
        </div>
        )}
      </div>
    );
  }
}


export default Detailgraph;
