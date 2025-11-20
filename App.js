import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SellerLogin from "./components/SellerLogin";
import SellerHomeScreen from "./components/SellerHomeScreen";
import SellerDashboard from "./components/SellerDashboard";
// ...existing imports...

function App() {
  return (
    <Router>
      <Routes>
        {/* ...existing routes... */}
        <Route path="/seller/login" element={<SellerLogin />} />
        <Route path="/seller/home" element={<SellerHomeScreen />} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
