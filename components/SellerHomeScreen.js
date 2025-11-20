import React from "react";
import { useNavigate } from "react-router-dom";

const SellerHomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Welcome, Seller!</h2>
      <button onClick={() => navigate("/seller/dashboard")}>
        Go to Dashboard
      </button>
    </div>
  );
};

export default SellerHomeScreen;
