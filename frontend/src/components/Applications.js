import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { Table } from 'react-bootstrap'
import Forms from './Forms';
import Modal from 'react-modal';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UpdateBug from './UpdateBug';
import { CompanyContext } from './CompanyProvider';
import Buttons from './Buttons';

Modal.setAppElement('#root');

const Applications = () => {
  const { companyId } = useContext(CompanyContext);
  console.log("companyId in application", companyId)

  const [Id, setId] = useState(null);

  const [bugData, setBugData] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [modalType, setModalType] = useState(''); // 'add' or 'edit'

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleEdit = (id) => {
    setId(id);
    setModalType('edit');
    toggleModal();
  };

  const handleAdd = () => {
    setModalType('add');
    toggleModal();
  };



  const fetchDetails = async () => {
    const res = await axios.get(`http://localhost:5000/api/getReport/company/${companyId}`).catch(err => console.log(err));

    const data = await res.data;
    console.log("bug data company", data)
    setBugData(data)
  }

  useEffect(() => {
    fetchDetails()
  }, [])





  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/getReport/delete/${id}`);
      if (res.status === 200) {
        alert("Bug Deleted Successfully");
        setBugData(prevData => prevData.filter(bug => bug._id !== id));
      }
    } catch (err) {
      console.log(err);
      alert("Failed to delete the bug report");
    }
  };


  return (
    <div className='table-container' style={{ margin: "20px" }} >
      <Table style={{ borderCollapse: 'collapse', width: '100%', fontSize: "12px", }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px' }}>ID</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>VULNERABILITY NAME</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>RISK</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Update / Delete</th>
          </tr>
        </thead>
        <tbody>
          {
            bugData.map((data, index) => (
              <tr style={{ border: '1px solid black', padding: '8px', textAlign: "center" }} >
                <td style={{ border: '1px solid black', padding: '8px' }}>
                  {index + 1}
                </td>
                <td style={{ border: '1px solid black', padding: '8px' }}>
                  {data.Title}
                </td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{data.Severity}</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>
                  <IconButton >
                    <EditIcon color="warning" onClick={() => { handleEdit(data._id) }} />
                  </IconButton>
                  <IconButton>
                    <DeleteIcon color='error' onClick={() => { handleDelete(data._id) }} />
                  </IconButton>
                </td>
              </tr>
            ))
          }

        </tbody>
      </Table>

      <div className="add" style={{ border: '2px solid black', padding: '8px', textAlign: "center", margin: "10px 0" }} onClick={handleAdd}>
        add
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
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '50%',
            maxHeight: '80vh',
            overflowY: 'auto',
            padding: '20px'
          }
        }}
      >
        {modalType === 'add' ? <Forms onClose={toggleModal} onFormSubmit={fetchDetails} /> : <UpdateBug onClose={toggleModal} id={Id} />}
      </Modal>
      <Buttons />
    </div>
  )
}

export default Applications
