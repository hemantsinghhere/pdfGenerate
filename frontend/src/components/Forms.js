import React, { useState } from 'react';
import "./Forms.css";
import axios from "axios";

const Forms = ({ onClose }) => {

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

    // http://103.133.214.149:3000/api/getReport/generatedPdf

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
            await axios.post('http://localhost:5000/api/getReport/submitReport', formDataToSubmit, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log('Form submitted successfully');
            console.log("sumitted form data: ",formData)
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

        onClose()
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

    const addField = (field) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [field]: [...prevFormData[field], '']
        }));
    };


    // Function to remove a field from the array
    const removeField = (field) => {
        const updatedFields = [...formData[field]];
        updatedFields.pop();
        setFormData({
            ...formData,
            [field]: updatedFields
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
                        <option value="Informational">Info</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
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
                    {formData.Steps_of_Reproduce.length > 1 && (
                        <button type="button" onClick={() => removeField('Steps_of_Reproduce')}>
                            Remove
                        </button>
                    )}
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
                    {formData.Impact.length > 1 && (
                        <button type="button" onClick={() => removeField('Impact')}>
                            Remove
                        </button>
                    )}
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
                    {formData.Remediation.length > 1 && (
                        <button type="button" onClick={() => removeField('Remediation')}>
                            Remove
                        </button>
                    )}
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
                    {formData.Links.length > 1 && (
                        <button type="button" onClick={() => removeField('Links')}>
                            Remove
                        </button>
                    )}
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
