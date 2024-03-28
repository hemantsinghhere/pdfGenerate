import React, { useState } from 'react';
import "./Forms.css";
import axios from "axios";

const Forms = () => {

    // State to manage form data
    const [formData, setFormData] = useState({
        title: '',
        status: '',
        severity: 'info',
        owaspCategory: '',
        cvssScore: '',
        affectedHost: '',
        summary: '',
        proofOfSummary: null,
        stepsToReproduce: [''],
        impact: [''],
        remediationEffect: 'Planned',
        remediation: [''],
        links: ['']
    });

    // State to manage CVSS score warning
    const [cvssWarning, setCvssWarning] = useState('');



    // Function to handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        // Perform any validation before submitting

        try {
            const response = await axios.post('http://localhost:5000/api/getReport/generatedPdf', formData);
            console.log('Form submitted successfully:', response.data);
            // Reset the form after successful submission
            setFormData({ // Reset form data
                title: '',
                status: '',
                severity: 'info',
                owaspCategory: '',
                cvssScore: '',
                affectedHost: '',
                summary: '',
                proofOfSummary: null,
                stepsToReproduce: [''],
                impact: [''],
                remediationEffect: 'Planned',
                remediation: [''],
                links: ['']
            });
        } catch (error) {
            console.error('Error submitting form:', error);
            // Handle error
        }
    };

    // Function to handle form field changes
    const handleChange = (event) => {
        const { name, value } = event.target;
        // Special handling for CVSS score
        if (name === 'cvssScore' && (value < 0 || value > 10)) {
            setCvssWarning('CVSS score must be between 0.0 and 10.0');
        } else {
            setCvssWarning('');
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    // Function to add a new empty string to the array fields
    const addField = (field) => {
        setFormData({
            ...formData,
            [field]: [...formData[field], '']
        });
    };
    // Function to handle changes in array fields (Step of Reproduce, Impact)
    // const handleArrayChange = (event, field) => {
    //     const index = parseInt(event.target.dataset.index);
    //     const value = event.target.value;
    //     const updatedArray = [...formData[field]];
    //     updatedArray[index] = value;
    //     setFormData({
    //         ...formData,
    //         [field]: updatedArray
    //     });
    // };


    return (
        <div className="form-container">
            <h2>Submit Form</h2>
            <form onSubmit={handleSubmit}>
                <label>Title:</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />
                <label>Status:</label>
                <input
                    type="text"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                />
                <label>Severity:</label>
                <select
                    name="severity"
                    value={formData.severity}
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
                    name="owaspCategory"
                    value={formData.owaspCategory}
                    onChange={handleChange}
                    required
                />
                <label>CVSS Score:</label>
                <input
                    type="number"
                    name="cvssScore"
                    value={formData.cvssScore}
                    onChange={handleChange}
                    required
                />
                {cvssWarning && <span className="warning">{cvssWarning}</span>}
                <label>Affected Host:</label>
                <input
                    type="text"
                    name="affectedHost"
                    value={formData.affectedHost}
                    onChange={handleChange}
                    required
                />
                <label>Summary:</label>
                <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleChange}
                    required
                />
                <label>Screenshot:</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, proofOfSummary: e.target.files[0] })}
                    required
                />
                <label>Step of Reproduce:</label>
                {formData.stepsToReproduce.map((step, index) => (
                    <input
                        key={index}
                        type="text"
                        value={step}
                        onChange={(e) => {
                            const updatedSteps = [...formData.stepsToReproduce];
                            updatedSteps[index] = e.target.value;
                            setFormData({ ...formData, stepsToReproduce: updatedSteps });
                        }}
                        required
                    />
                ))}
                <button type="button" onClick={() => addField('stepsToReproduce')}>
                    Add Step
                </button>
                <label>Impact:</label>
                {formData.impact.map((impact, index) => (
                    <input
                        key={index}
                        type="text"
                        value={impact}
                        onChange={(e) => {
                            const updatedImpact = [...formData.impact];
                            updatedImpact[index] = e.target.value;
                            setFormData({ ...formData, impact: updatedImpact });
                        }}
                        required
                    />
                ))}
                <button type="button" onClick={() => addField('impact')}>
                    Add Impact
                </button>
                <label>Remediation:</label>
                {formData.remediation.map((remediation, index) => (
                    <input
                        key={index}
                        type="text"
                        value={remediation}
                        onChange={(e) => {
                            const updatedRemediation = [...formData.remediation];
                            updatedRemediation[index] = e.target.value;
                            setFormData({ ...formData, remediation: updatedRemediation });
                        }}
                        required
                    />
                ))}
                <button type="button" onClick={() => addField('remediation')}>
                    Add Remediation
                </button>
                <label>Links:</label>
                {formData.links.map((link, index) => (
                    <input
                        key={index}
                        type="text"
                        value={link}
                        onChange={(e) => {
                            const updatedLinks = [...formData.links];
                            updatedLinks[index] = e.target.value;
                            setFormData({ ...formData, links: updatedLinks });
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
                    value={formData.remediationEffect}
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
