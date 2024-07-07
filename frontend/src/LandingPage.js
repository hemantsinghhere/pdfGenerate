import React from 'react'
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="landingPage" style={{ textAlign: "center"}}>
        <h1> VAPT LABS </h1>
        <div className="loginOption" style={{margin: "10px", display: "flex", justifyContent: "space-around", border: "1px solid black", padding: "10px"}}>
            <Link to="/admin" >Admin Login</Link>
            <Link to="/user" >User Login</Link>
        </div>
    </div>
  )
}

export default LandingPage
