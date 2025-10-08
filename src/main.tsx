import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";  // 🔹 add this line
import Landing from "./pages/Landing";
import "./index.css";

const rootEl = document.getElementById("root");

if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <Router>
        <Routes>
          {/* Normal landing at root */}
          <Route path="/" element={<App />} />

          {/* MVP page at /Landing */}
          <Route path="/Landing" element={<Landing  />} />
        </Routes>
      </Router>
    </React.StrictMode>
  );
}

