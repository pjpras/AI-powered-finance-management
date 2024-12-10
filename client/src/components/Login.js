import React from "react";
import { useState } from "react";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const response = await axios.post('http://localhost:5000/api/auth/login',{email,password})
      localStorage.setItem('token',response.data.token)
      alert('User logged in')
    }catch(err){
      console.error('Error logging in',err);
      alert('invalid credentials')
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
      <input type='text' name='email' placeholder='email' value={email} onChange={(e)=>setEmail(e.target.value)}/>
      <input type='text' name='password' placeholder='password' value={password} onChange={(e)=>setPassword(e.target.value)}/>
      <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
