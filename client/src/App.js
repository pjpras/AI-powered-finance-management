import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup";
import "./App.css";
import "./styles/theme.css";
import logo from "./assets/images/finLogo.png";

// Add font links to document head
const fontLinks = [
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap",
];

fontLinks.forEach((href) => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
});



// Protected route component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Navigation component with location awareness
const Navigation = () => {
  const [isLoggedIn, setIsLoggedIn] = useState();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  // Effect to check login status on mount and token changes
  useEffect(() => {
    const checkLoginStatus = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    checkLoginStatus();

  }, [isLoggedIn]);

  return (
    <div className="navbar">
      <div className="logo-container">
        <img className="logo" src={logo} alt="Financial Elegance" />
        <span className="app-name">AI Finance Management</span>
      </div>
      <nav className="nav-links">
        {isLoggedIn ? (
          <>
            <Link
              to="/dashboard"
              className={
                location.pathname.includes("/dashboard") ? "active" : ""
              }
            >
              Dashboard
            </Link>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className={location.pathname === "/login" ? "active" : ""}
            >
              Login
            </Link>
            <Link to="/" className={location.pathname === "/" ? "active" : ""}>
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="*"
            element={
              <>
                <Navigation />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/dashboard/*"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </main>
                <footer className="app-footer">
                  <p>
                    © {new Date().getFullYear()} FinSight | Your
                    Sophisticated Financial Companion
                  </p>
                </footer>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
