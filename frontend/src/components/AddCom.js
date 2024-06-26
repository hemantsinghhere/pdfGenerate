import axios from 'axios';
import React, { useState } from 'react'

const AddCom = ({ onClose, onFormSubmit }) => {
  const [comDetails, setComDetails] = useState({
    Name: '',
    Asset: 'Web Application',
    Application_url: ''
  })

  const handleSumbit = async(event) => {
    event.preventDefault();

    try {
      await axios.post('http://localhost:5000/company/addCompany', comDetails);

      console.log("form submitted successfully")
    }catch(error){
      console.error("Error submitting form:", error)
    }
    alert("New Company added Successfully");
    onFormSubmit();
    onClose();
  }

  const handleChange = (event) => {
    const {name, value} = event.target;
    setComDetails({
      ...comDetails,
      [name]: value
    })
  }

  
  return (
    <div className="form-container">
      <h2>Add Company</h2>
      <form encType="multipart/form-data" onSubmit={handleSumbit}>
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
