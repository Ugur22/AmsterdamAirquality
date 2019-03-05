import React from "react"
import { random } from "./util.js"
import { colors } from "./settings.js"
import { mapStyle } from "./mapStyle.js"
import { data } from "./data.js"
import DeckGL, {
  //ScreenGridLayer
  ScatterplotLayer
  //TextLayer
} from "deck.gl"
import { StaticMap } from "react-map-gl"


class App extends React.Component {
  render() {
    return (
      <DeckGL
        initialViewState={{ longitude: 4.5984, latitude: 52.4952, zoom: 14, pitch: 50 }}
        controller={true}
        layers={[
          new ScatterplotLayer({
            id: "scatterplot-layer",
            data: data,
            opacity: 1,
            pickable: true,
            filled: true,
            stroked: false,
            radiusScale: 6,
            radiusMinPixels: 6,
            radiusMaxPixels: 50,
            getPosition: d => d.coordinates,
            getFillColor: () => colors[random(0,4,3)]
          })
        ]}
      >
        <StaticMap mapStyle={mapStyle} />
      </DeckGL>
    )
  }
  //<StaticMap mapStyle="https://api.myjson.com/bins/jdrq2"/>

  componentDidMount() {
    // fetch('https://api.luchtmeetnet.nl/open_api/measurements?start=2018-12-01T09:00:00Z&end=2018-12-02T09:00:00Z&station_number=&formula=&page=&order_by=timestamp_measured&order_direction=desc').then(resp => resp.json()).then(data => console.log(data))
    // // returns a promise object
    // fetch("https://api.luchtmeetnet.nl/open_api/stations/NL01908")
    //   .then(resp => resp.json())
    //   .then(data => data["data"]["geometry"]["coordinates"])
  }
}
export default App
