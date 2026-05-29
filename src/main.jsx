import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./assets/styles/style.css";
import { injectStore } from "./lib/axios";
import { store } from "./store";

injectStore(store);
ReactDOM.createRoot(document.getElementById("app")).render(<App />);
