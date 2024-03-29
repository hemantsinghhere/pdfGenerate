import React, { useState } from 'react';
import "./Forms.css";
import axios from "axios";

const Forms = () => {

    // State to manage form data
    const [formData, setFormData] = useState({
        Title: '',
        Status: '',
        Severity: 'info',
        OWASP_Category: '',
        CVSS_Score: '',
        Affected_Hosts: '',
        Summary: '',
        images: null,
        Steps_of_Reproduce: [''],
        Impact: [''],
        Remediation_effort: 'Planned',
        Remediation: [''],
        Links: ['']
    });

    // State to manage CVSS score warning
    const [cvssWarning, setCvssWarning] = useState('');


    const sendRequest = async () => {
        
            const response = await axios.post('http://localhost:5000/api/getReport/submitReport', formData);
            console.log('Form submitted successfully:', response.data);
            // Reset the form after successful submission
            setFormData({
                Title: '',
                Status: '',
                Severity: 'info',
                OWASP_Category: '',
                CVSS_Score: '',
                Affected_Hosts: '',
                Summary: '',
                images: null,
                Steps_of_Reproduce: [''],
                Impact: [''],
                Remediation_effort: 'Planned',
                Remediation: [''],
                Links: [''],
            });

            return response.data;
        
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        sendRequest();
      };

    // Function to handle form field changes
    const handleChange = (event) => {
        const { name, value } = event.target;
        // Special handling for CVSS score
        if (name === 'CVSS_Score' && (value < 0 || value > 10)) {
            setCvssWarning('CVSS score must be between 0.0 and 10.0');
        } else {
            setCvssWarning('');
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    // Function to handle file upload
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setFormData({
            ...formData,
            images: file,
        });
    };

    // Function to add a new empty string to the array fields
    const addField = (field) => {
        setFormData({
            ...formData,
            [field]: [...formData[field], '']
        });
    };



    return (
        <div className="form-container">
            <h2>Submit Form</h2>
            <form onSubmit={handleSubmit}>
                <label>Title:</label>
                <input
                    type="text"
                    name="Title"
                    value={formData.Title}
                    onChange={handleChange}
                    required
                />
                <label>Status:</label>
                <input
                    type="text"
                    name="Status"
                    value={formData.Status}
                    onChange={handleChange}
                    required
                />
                <label>Severity:</label>
                <select
                    name="Severity"
                    value={formData.Severity}
                    onChange={handleChange}
                    required
                >
                    <option value="info">Info</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
                <label>OWASP Category:</label>
                <input
                    type="text"
                    name="OWASP_Category"
                    value={formData.OWASP_Category}
                    onChange={handleChange}
                    required
                />
                <label>CVSS Score:</label>
                <input
                    type="number"
                    name="CVSS_Score"
                    value={formData.CVSS_Score}
                    onChange={handleChange}
                    required
                />
                {cvssWarning && <span className="warning">{cvssWarning}</span>}
                <label>Affected Host:</label>
                <input
                    type="text"
                    name="Affected_Hosts"
                    value={formData.Affected_Hosts}
                    onChange={handleChange}
                    required
                />
                <label>Summary:</label>
                <textarea
                    name="Summary"
                    value={formData.Summary}
                    onChange={handleChange}
                    required
                />
                <label>Screenshot:</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    required
                />
                <label>Step of Reproduce:</label>
                {formData.Steps_of_Reproduce.map((step, index) => (
                    <input
                        key={index}
                        type="text"
                        value={step}
                        onChange={(e) => {
                            const updatedSteps = [...formData.Steps_of_Reproduce];
                            updatedSteps[index] = e.target.value;
                            setFormData({ ...formData, Steps_of_Reproduce: updatedSteps });
                        }}
                        required
                    />
                ))}
                <button type="button" onClick={() => addField('Steps Steps_of_Reproduce')}>
                    Add Step
                </button>
                <label>Impact:</label>
                {formData.Impact.map((impact, index) => (
                    <input
                        key={index}
                        type="text"
                        value={impact}
                        onChange={(e) => {
                            const updatedImpact = [...formData.Impact];
                            updatedImpact[index] = e.target.value;
                            setFormData({ ...formData, Impact: updatedImpact });
                        }}
                        required
                    />
                ))}
                <button type="button" onClick={() => addField('Impact')}>
                    Add Impact
                </button>
                <label>Remediation:</label>
                {formData.Remediation.map((remediation, index) => (
                    <input
                        key={index}
                        type="text"
                        value={remediation}
                        onChange={(e) => {
                            const updatedRemediation = [...formData.Remediation];
                            updatedRemediation[index] = e.target.value;
                            setFormData({ ...formData, Remediation: updatedRemediation });
                        }}
                        required
                    />
                ))}
                <button type="button" onClick={() => addField('Remediation')}>
                    Add Remediation
                </button>
                <label>Links:</label>
                {formData.Links.map((link, index) => (
                    <input
                        key={index}
                        type="text"
                        value={link}
                        onChange={(e) => {
                            const updatedLinks = [...formData.Links];
                            updatedLinks[index] = e.target.value;
                            setFormData({ ...formData, Links: updatedLinks });
                        }}
                        required
                    />
                ))}
                <button type="button" onClick={() => addField('links')}>
                    Add Link
                </button>
                <label>Remediation Effect:</label>
                <select
                    name="remediationEffect"
                    value={formData.Remediation_effort}
                    onChange={handleChange}
                    required
                >
                    <option value="Planned">Planned</option>
                    <option value="Quick">Quick</option>
                </select>
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default Forms
