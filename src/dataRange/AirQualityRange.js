import React from "react";
import { colorScale } from "../settings/colors";

class AirQualityRange extends React.Component {
  constructor(props) {
    super();

    this.state = {};
  }

  render() {
    return (
      <div className="airQualitygradient">
        <p>Luchtkwaliteit Koolstofdioxide(N02)</p>
        <div className="rating-info">
          <span className="good">0 μg/m3</span>
          <span className="bad">150 μg/m3</span>
        </div>
        <svg width="100%" height="15">
          <defs>
            <linearGradient id="legend" x1="0" y1="0" x2="100%" y2="15" gradientUnits="userSpaceOnUse">
              {colorScale[0].map((color, i) => {
                return <stop key={color} offset={`${0 + (i * 100) / (colorScale[0].length - 1)}%`} stopColor={color} />;
              })}
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100%" height="15" fill="url(#legend)" />
        </svg>{" "}
        <div className="rating">
          <span className="good">goed</span>
          <span className="middle">matig</span>
          <span className="bad">slecht</span>
        </div>
      </div>
    );
  }
}

export default AirQualityRange;
