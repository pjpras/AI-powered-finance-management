import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup"; 

function App() {
  const isAuthenticated = !!localStorage.getItem('token');
  return (
    <Router>
      <div className="App">
      <h1>Personal Finance Dashboard</h1>
        <Routes>
          <Route path='/signup' element={<Signup/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/dashboard' element={(isAuthenticated)?<Dashboard/>:<Navigate to='/login'/>}/>
        </Routes>
        
      </div>
    </Router>
  );
}

export default App;
