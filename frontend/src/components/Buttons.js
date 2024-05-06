import React, { useState } from 'react';
import "./Buttons.css";
import axios from "axios";

const Buttons = () => {
    const [pdfData, setPdfData] = useState(null);
    // https://vaptlabs.kalyanofficial.top/api/getReport/generatedPdf
    const handleDownloadPdf = async () => {
        try {
            const response = await axios.get("https://vaptlabs.kalyanofficial.top/api/getReport/generatedPdf", {
                responseType: 'arraybuffer', // This is important for binary data like PDFs
            });
            setPdfData(new Blob([response.data], { type: 'application/pdf' }));
        } catch (error) {
            console.error('Error fetching PDF:', error);
        }
    };
  return (
    <div className="component">
            <div className='button'>
                <h1>Make a PDF</h1>
                <button onClick={handleDownloadPdf}>Download PDF</button>
            </div>
            <div>
                {pdfData && (
                    <iframe
                        title="PDF Viewer"
                        style={{ width: '100%', height: '500px' }}
                        src={URL.createObjectURL(pdfData)}
                    />
                )}
            </div>

        </div>
  )
}

export default Buttons
