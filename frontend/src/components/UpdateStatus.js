import axios from 'axios';
import React, { useEffect, useState } from 'react'

const UpdateStatus = ({ id, onClose, onFormSubmit}) => {

    const [formData, setFormData] = useState({
        Status: 'New',
    });

    useEffect(() => {
        // Fetch existing data
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5000/api/getReport/u/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = response.data.bug;
                setFormData({
                    Status: data.Status,
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.put(`http://localhost:5000/api/getReport/updateStatus/u/${id}`, { Status: formData.Status }, {
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Form update successfully');

            alert("Bug Update Successfully.");
            onFormSubmit();
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        }); 
    };



    return (
        <div className="form-container">
            <h2>Update Status</h2>
            <form onSubmit={handleSubmit} >
                
            <label>Status:</label>
                <select
                    name="Status"
                    value={formData.Status}
                    onChange={handleChange}
                >
                    <option value="New">New</option>
                    <option value="Not Fixed">Not Fixed</option>
                    <option value="Fixed">Fixed</option>
                    <option value="Being Fix">Being Fix</option>
                    <option value="Won't Fix">Won't Fix</option>
                    <option value="In Progress">In Progress</option>
                </select>
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default UpdateStatus
