import React from "react";
import ChatUI from "./components/ChatUI";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GeneralHealth from "./components/GeneralHealth";
import Medications from "./components/Medications";
import Nutrition from "./components/Nutrition";
import MentalWellness from "./components/MentalWellness";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatUI />} />
        <Route path="/general-health" element={<GeneralHealth />} />
        <Route path="/medications" element={<Medications />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/mental-wellness" element={<MentalWellness />} />
      </Routes>
    </Router>
  );
}

export default App;
