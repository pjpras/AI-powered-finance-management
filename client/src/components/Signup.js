import React from "react";
import { useState } from "react";
import axios from "axios";
import "./signup.css";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/signup`, {
        email,
        password,
      });
      alert("Account created successfully!");
      navigate("/login");
    } catch (err) {
      console.error("Error signing up:", err);
      setError(
        err.response?.data?.message ||
          "Error creating account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="signup-container">
        <h2 className="signup-title">Create Account</h2>
        {error && <div className="error-message">{error}</div>}

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <input
              className="email-input"
              type="email" // Changed from text to email
              name="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="input-wrapper">
            <input
              className="password-input"
              type="password" // Changed from text to password for security
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <button className="signup-button" type="submit" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login Here</Link>
        </p>
      </div>
    </>
  );
};

export default Signup;
