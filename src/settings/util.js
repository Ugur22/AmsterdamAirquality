import { rgb } from "d3-color";

import { scaleLinear } from "d3-scale";
import { interpolateCubehelix } from "d3-interpolate";

export const color = (value, range) => {
  const scale = scaleLinear()
    .domain([0, range[1], range[1], range[1]]).interpolate(interpolateCubehelix.gamma(0.5))
    .range(["#006837", "#fee08b", "#f46d43", "#a50026"]);

  return scale(value);
};

export const getColorArray = color => {
  const array = Object.values(rgb(color));
  array[3] = array[3] * 255;

  return array;
};
