import React from "react";
import { useState } from "react";
import axios from "axios";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const handleSubmit = (e) => {
    e.preventDefault();
    try{
        axios.post('http://localhost:5000/api/auth/signup',{email,password})
        alert('User created')
    }catch(err){
        console.error('Error signing up',err);
        alert('error registering user')
    }
  };


  return (
    <div>
      <h1>Signup</h1>
      <form action="/signup" method="POST">
        <input type="text" name="email" placeholder="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input type="text" name="password" placeholder="password" value={password} onChange={(e)=>setPassword(e.target.value)}/>
        <button type="submit" onClick={handleSubmit}>Signup</button>
      </form>
    </div>
  );
};

export default Signup;