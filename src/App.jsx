import { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Login from "./pages/login/index.jsx";
import CapsulPage from "./pages/capsul/index.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Capsul routes */}
        <Route path="/capsul" element={<CapsulPage />} />

      </Routes>
    </Router>
  );
}

export default App;
