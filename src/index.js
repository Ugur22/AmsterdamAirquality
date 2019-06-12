import React from "react";
import ReactDOM from "react-dom";
import "./css/index.scss";
import "mapbox-gl/dist/mapbox-gl.css";
// import App from "./App";
// import TableView from "./tableView/TableView"
import Directions from "./Directions";
import * as serviceWorker from "./serviceWorker";
ReactDOM.render(<Directions />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
