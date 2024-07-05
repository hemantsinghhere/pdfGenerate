import axios from 'axios';
import React, { useState } from 'react'

const AddCom = ({ onClose, onFormSubmit }) => {
  const user_id = localStorage.getItem("userId")
  const [comDetails, setComDetails] = useState({
    Name: '',
    Asset: 'Web Application',
    Application_url: ''
  })

  const handleSumbit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const comDataToSubmit = {
      user: user_id,
      Name: comDetails.Name,
      Asset: comDetails.Asset,
      Application_url: comDetails.Application_url
    };

    try {
      //admin
      await axios.post('http://localhost:5000/company/addCompany', comDataToSubmit, {
        headers: {
          'Content-Type': 'application/json'
        }

        // user
        // await axios.post('http://localhost:5000/company/addCompany/U', comDataToSubmit,{
        //   headers: { 
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${token}`
        //    }
      });

      console.log("form submitted successfully")

    } catch (error) {
      console.error("Error submitting form:", error)
    }
    alert("New Company added Successfully");
    onFormSubmit();
    onClose();
  }
  const handleChange = (event) => {
    const { name, value } = event.target;
    setComDetails({
      ...comDetails,
      [name]: value
    })
  }


  return (
    <div className="form-container">
      <h2>Add Company</h2>
      <form onSubmit={handleSumbit}>
        <label>Company Name:</label>
        <input
          type="text"
          name="Name"
          value={comDetails.Name}
          onChange={handleChange}
          required
        />


        <label>Application Url:</label>
        <input
          type="text"
          name="Application_url"
          value={comDetails.Application_url}
          onChange={handleChange}
          requireds
        />

        <label>Asset:</label>
        <select
          name="Asset"
          value={comDetails.Asset}
          onChange={handleChange}
          required
        >
          <option value="Web Application">Web Application</option>
          <option value="Android Application">Android Application</option>
          <option value="ios  Application">ios Application</option>
          <option value="ioT Application">ioT Application</option>
        </select>

        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default AddCom
