import React, { useState } from "react";
import Login from "./LoginRegister/login"; 
import Dashboard from "./Dashboard";         
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./LoginRegister/register";

function App() {
 
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
