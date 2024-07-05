import React, { useContext, useState } from 'react';
import "./Buttons.css";
import axios from "axios";
import Modal from 'react-modal';
import { CompanyContext } from './CompanyProvider';

Modal.setAppElement('#root');

const Buttons = () => {
    const { companyId } = useContext(CompanyContext);
    console.log("company id in pdf", companyId)
    const [pdfData, setPdfData] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };


    const handleDownloadPdf = async () => {
        try {
            const token = localStorage.getItem('token');

            //admin
            // const response = await axios.get(`http://localhost:5000/api/getReport/generatedPdf/${companyId}`, {
            //     responseType: 'arraybuffer', // This is important for binary data like PDFs
            //     headers: {
            //         'Authorization': `Bearer ${token}`, // Add authorization token if required
            //     }
            // });

            // user
            const response = await axios.get(`http://localhost:5000/api/getReport/ugeneratedPdf/${companyId}`, {
                responseType: 'arraybuffer', // This is important for binary data like PDFs
                headers: {
                    'Authorization': `Bearer ${token}`, // Add authorization token if required
                }
            });
            setPdfData(new Blob([response.data], { type: 'application/pdf' }));
            toggleModal();
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
            <Modal
                isOpen={isModalOpen}
                onRequestClose={toggleModal}
                contentLabel="Add New Item"
                style={{
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                    },
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: '-50%',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80%',
                        maxHeight: '100vh',
                        overflowY: 'auto',
                        padding: '20px'
                    }
                }}
            >
                {pdfData && (
                    <iframe
                        title="PDF Viewer"
                        style={{ width: '100%', height: '100vh' }}
                        src={URL.createObjectURL(pdfData)}
                    />
                )}

            </Modal>
            

        </div>
    )
}

export default Buttons
