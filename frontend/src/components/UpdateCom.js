import axios from 'axios';
import React, { useEffect, useState } from 'react'

const UpdateCom = ({ id, onClose, onFormSubmit }) => {
    const [comDetails, setComDetails] = useState({
        Name: '',
        Asset: 'Web Application',
        Application_url: ''
    })

    useEffect(() => {
        // Fetch existing data
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`http://localhost:5000/company/${id}`,{
                    headers: {
                        'Authorization': `Bearer ${token}` 
                     }
                });
                const data = response.data.company;
                console.log("data are:", data)
                setComDetails({
                    Name: data.Name,
                    Asset: data.Asset,
                    Application_url: data.Application_url
                })
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [id]);

    const handleSumbit = async (event) => {
        event.preventDefault();
        const token = localStorage.getItem('token');

        try {
            await axios.put(`http://localhost:5000/company/update/${id}`, comDetails,{
                headers: {
                    'Authorization': `Bearer ${token}`
                 }
            });

            console.log("form update successfully");
            setComDetails({
                Name: comDetails.Name,
                Asset: comDetails.Asset,
                Application_url: comDetails.Application_url
            })
        } catch (error) {
            console.error("Error submitting form:", error)
        }
        alert("Company Details update Successfully");
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

export default UpdateCom
