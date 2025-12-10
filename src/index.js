import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Hier holt er sich deine App.jsx
import "./index.css"; // Falls du styles hast, sonst wird es ignoriert

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
