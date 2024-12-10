import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState('');

  useEffect(()=>{
    const fetchExpenses = async () => {
      try{
        const response = await axios.get('http://localhost:5000/api/expenses',{
          headers:{
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }catch(error){
        console.error('Error fetching expenses',error);
      }
    }
    fetchExpenses();
  },[]);

  const handleAddExpense = async () => {
    const expense = {description:newExpense,amount:Math.random()*100};
    setExpenses([...expenses,expense]);
    setNewExpense('');
  }

  return (
    <div>
      <h1>Welcome to Personal Finance Dashboard</h1>
      <div>
        <h3>Add Expense</h3>
        <ul>
          {expenses.map((expense,index)=>(
            <li key={index}>{expense.description} - ${expense.amount.toFixed(2)}</li>
          ))}
        </ul>
      </div>
      <input type='text' value={newExpense} onChange={(e)=>setNewExpense(e.target.value)}/>
      <button onClick={handleAddExpense}>Add Expense</button>
    </div>
  );
};

export default Dashboard;
