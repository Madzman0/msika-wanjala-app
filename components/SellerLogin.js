import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SellerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    // Mock authentication logic
    if (email === "seller@example.com" && password === "password") {
      navigate("/seller/home");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div>
      <h2>Seller Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default SellerLogin;
