import { rgb } from "d3-color";

import { scaleLinear } from "d3-scale";
import { interpolateCubehelix } from "d3-interpolate";

import { colorScale } from "./colors.js";

// colorscale used for mapboc circles and legend
export const color = (value, range) => {
  const scale = scaleLinear()
    .domain([0,50,150,200])
    .interpolate(interpolateCubehelix.gamma(0.5))
    .range(colorScale[0]);

  return scale(value);
};

export const getColorArray = color => {
  const array = Object.values(rgb(color));
  array[3] = array[3] * 255;

  return array;
};
