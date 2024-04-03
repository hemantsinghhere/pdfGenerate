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
        images: [],
        Steps_of_Reproduce: [''],
        Impact: [''],
        Remediation_effort: 'Planned',
        Remediation: [''],
        Links: ['']
    });

    // State to manage CVSS score warning
    const [cvssWarning, setCvssWarning] = useState('');

    // http://localhost:5000/api/getReport/submitReport
    // https://pdfgenerate-0339.onrender.com/api/getReport/submitReport
    // const sendRequest = async () => {
    //     console.log(formData)
    //     const response = await axios.post('https://pdfgenerate-0339.onrender.com/api/getReport/submitReport', formData, {
    //         headers: {
    //             'Content-Type': "multipart/form-data",
    //         },
    //     });


    //     console.log('Form submitted successfully:', response.data);
    //     // Reset the form after successful submission
    //     setFormData({
    //         Title: '',
    //         Status: '',
    //         Severity: 'info',
    //         OWASP_Category: '',
    //         CVSS_Score: '',
    //         Affected_Hosts: '',
    //         Summary: '',
    //         images: [],
    //         Steps_of_Reproduce: [''],
    //         Impact: [''],
    //         Remediation_effort: 'Planned',
    //         Remediation: [''],
    //         Links: [''],
    //     });

    //     return response.data;

    // };

    // const handleSubmit = (event) => {
    //     event.preventDefault();


    //     const formDataToSubmit = new FormData();
    //     Object.entries(formData).forEach(([key, value]) => {
    //         if (key === 'images') {
    //             for (let i = 0; i < value.length; i++) {
    //                 formDataToSubmit.append('images', value[i]);
    //             }
    //         } else {
    //             formDataToSubmit.append(key, value);
    //         }
    //     });

    //     sendRequest().then((data) => console.log(data));
    // };
    const handleSubmit = async (event) => {
        event.preventDefault();

        const formDataToSubmit = new FormData();
        for (const [key, value] of Object.entries(formData)) {
            if (key === 'images') {
                for (let i = 0; i < value.length; i++) {
                    formDataToSubmit.append('images', value[i]);
                }
            } else {
                formDataToSubmit.append(key, value);
            }
        }

        try {
            await axios.post('https://pdfgenerate-0339.onrender.com/api/getReport/submitReport', formDataToSubmit, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log('Form submitted successfully');
            setFormData({
                Title: '',
                Status: '',
                Severity: 'info',
                OWASP_Category: '',
                CVSS_Score: '',
                Affected_Hosts: '',
                Summary: '',
                images: [],
                Steps_of_Reproduce: [''],
                Impact: [''],
                Remediation_effort: 'Planned',
                Remediation: [''],
                Links: ['']
            });
        } catch (error) {
            console.error('Error submitting form:', error);
        }
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
        const files = Array.from(event.target.files);
        setFormData({
            ...formData,
            images: files,
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
            <form onSubmit={handleSubmit} encType="multipart/form-data">
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
                    multiple
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
                <button type="button" onClick={() => addField('Steps_of_Reproduce')}>
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
                <label>Reference:</label>
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
                <button type="button" onClick={() => addField('Links')}>
                    Add Link
                </button>
                <label>Remediation Effect:</label>
                <select
                    name="Remediation_effort"
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
