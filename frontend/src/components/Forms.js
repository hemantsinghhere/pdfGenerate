import React, { useContext, useState } from 'react';
import "./Forms.css";
import axios from "axios";
import { CompanyContext } from './CompanyProvider';

const Forms = ({ onClose, onFormSubmit }) => {
    const { companyId } = useContext(CompanyContext);

    // State to manage form data
    const [formData, setFormData] = useState({
        BugName: '',
        Title: '',
        Status: 'New',
        Severity: 'Info',
        OWASP_Category: 'A05-Security Misconfiguration',
        CVSS_Score: '',
        Affected_Hosts: [''],
        Summary: '',
        images: [],
        Steps_of_Reproduce: [''],
        Impact: [''],
        Remediation_effort: 'Planned',
        Remediation: [''],
        Links: [''],
        CVSS_URL: ''
    });

    // State to manage CVSS score warning
    const [cvssWarning, setCvssWarning] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const token = localStorage.getItem('token');
        const formDataToSubmit = new FormData();
        for (const [key, value] of Object.entries(formData)) {
            if (key === 'images') {
                for (let i = 0; i < value.length; i++) {
                    formDataToSubmit.append('images', value[i]);
                }
            }else if (Array.isArray(value)) {
                formDataToSubmit.append(key, JSON.stringify(value));
             } else {
                formDataToSubmit.append(key, value);
            }
        }
        // Add companyId to the form data
        formDataToSubmit.append('company', companyId);

        try {
            // admin
            // await axios.post('http://localhost:5000/api/getReport/submitReport', formDataToSubmit, {
            //     headers: { 
            //         'Content-Type': 'multipart/form-data',
            //      }
            // });
            //user
            await axios.post('http://localhost:5000/api/getReport/usubmitReport', formDataToSubmit, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                 }
            });
            console.log('Form submitted successfully');
            setFormData({
                BugName: '',
                Title: '',
                Status: 'New',
                Severity: 'Info',
                OWASP_Category: 'A05-Security Misconfiguration',
                CVSS_Score: '',
                Affected_Hosts: [''],
                Summary: '',
                images: [],
                Steps_of_Reproduce: [''],
                Impact: [''],
                Remediation_effort: 'Planned',
                Remediation: [''],
                Links: [''], 
                CVSS_URL: ''
            });
        } catch (error) {
            console.error('Error submitting form:', error);
        }
        alert("New Bug Submitted Successfully.")
        onFormSubmit();
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
                    <label>Bug Name:</label>
                    <input
                        type="text"
                        name="BugName"
                        value={formData.BugName}
                        onChange={handleChange}
                        required
                    />
                    <label>Title:</label>
                    <input
                        type="text"
                        name="Title"
                        value={formData.Title}
                        onChange={handleChange}
                        required
                    />
                    <label>Status:</label>
                    <select
                        name="Status"
                        value={formData.Status}
                        onChange={handleChange}
                        required
                    >
                        <option value="New">New</option>
                        <option value="Not Fixed">Not Fixed</option>
                        <option value="Fixed">Fixed</option>
                        <option value="Being Fix">Being Fix</option>
                        <option value="Won't Fix">Won't Fix</option>
                        <option value="In Progress">In Progress</option>
                    </select>
                    <label>Severity:</label>
                    <select
                        name="Severity"
                        value={formData.Severity}
                        onChange={handleChange}
                        required
                    >
                        <option value="Info">Info</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </select>
                    <label>OWASP Category:</label>
                    <select
                        name="OWASP_Category"
                        value={formData.OWASP_Category}
                        onChange={handleChange}
                        required
                    >
                        <option value="A01-Broken Access Control">A01-Broken Access Control</option>
                        <option value="A02-Cryptographic Failures">A02-Cryptographic Failures</option>
                        <option value="A03-Injection ">A03-Injection </option>
                        <option value="A04-Insecure Design">A04-Insecure Design</option>
                        <option value="A05-Security Misconfiguration">A05-Security Misconfiguration</option>
                        <option value="A06-Vulnerable and Outdated Components">A06-Vulnerable and Outdated Components</option>
                        <option value="A07-Identification and Authentication Failures">A07-Identification and Authentication Failures</option>
                        <option value="A08-Software and Data Integrity Failures">A08-Software and Data Integrity Failures</option>
                        <option value="A09-Security Logging and Monitoring Failures">A09-Security Logging and Monitoring Failures</option>
                        <option value="A10-ServerSide Request Forgery">A10-ServerSide Request Forgery </option>
                    </select>
                    
                    <label>CVSS Score:</label>
                    <input
                        type="number"
                        name="CVSS_Score"
                        value={formData.CVSS_Score}
                        onChange={handleChange}
                        required
                    />
                    <label>CVSS Url:</label>
                    <input
                        type="text"
                        name="CVSS_URL"
                        value={formData.CVSS_URL}
                        onChange={handleChange}
                    />
                    {cvssWarning && <span className="warning">{cvssWarning}</span>}
                    <label>Affected Host:</label>
                    {formData.Affected_Hosts.map((affected, index) => (
                        <input
                            key={index}
                            type="text"
                            value={affected}
                            onChange={(e) => {
                                const updatedAffect = [...formData.Affected_Hosts];
                                updatedAffect[index] = e.target.value;
                                setFormData({ ...formData, Affected_Hosts: updatedAffect });
                            }}
                            required
                        />
                    ))}
                    <button type="button" onClick={() => addField('Affected_Hosts')}>
                        Add Affected Host
                    </button>
                    {formData.Affected_Hosts.length > 1 && (
                        <button type="button" onClick={() => removeField('Affected_Hosts')}>
                            Remove
                        </button>
                    )}
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
