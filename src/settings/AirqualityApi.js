import React from "react";

class AirqualityApi extends React.Component {
  constructor(props) {
    super();

    this.state = {
      AmsterdarSensors: null
    };
  }

  componentDidMount() {
    const urls = [`https://data.waag.org/api/getOfficialStations`];

    Promise.all(urls.map(url => fetch(url).then(resp => resp.json()))).then(
      ([data]) => {
        let AmsterdarSensors = []
        data.forEach(function(elem, i) {
          let municipality = data[i]["data"].municipality;

          if (municipality === "Amsterdam") {
            AmsterdarSensors.push(data[i])
          }
        });
        
        this.setState({ AmsterdarSensors });
      }
    );
  }

  render() {
    let { AmsterdarSensors } = this.state;
    console.log(AmsterdarSensors);
    return 0;
  }
}
export default AirqualityApi;
