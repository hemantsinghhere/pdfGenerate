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
import { useLocation } from 'react-router-dom';
import UpdateStatus from './UpdateStatus';

Modal.setAppElement('#root');

const Applications = () => {

  let loc = useLocation();
  let temp = loc.pathname.startsWith("/admin")
  const user_id = localStorage.getItem("userId")

  const { companyId } = useContext(CompanyContext);
  const [comData, setComData] = useState([]);

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
    const token = localStorage.getItem('token');
    try {
      const [bugRes, comRes] = await Promise.all([
        temp
          ? axios.get(`http://localhost:5000/api/getReport/company/${companyId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          })
          : axios.get(`http://localhost:5000/api/getReport/company/u/${companyId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        temp
          ? axios.get(`http://localhost:5000/company/user/${user_id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          })
          : axios.get(`http://localhost:5000/company/user/U/${user_id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
      ]);

      if (bugRes && bugRes.data) {
        setBugData(bugRes.data);
      }

      if (comRes && comRes.data) {
        console.log("com res", comRes)
        setComData(comRes.data.company);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [])





  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`http://localhost:5000/api/getReport/delete/u/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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
            <th style={{ border: '1px solid black', padding: '8px' }}>Bug Name</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>VULNERABILITY NAME</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>RISK</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>LATEST DISCOVERY </th>
            <th style={{ border: '1px solid black', padding: '8px' }}>ASSETS AFFECTED</th>
            {
              temp ? (
                <th style={{ border: '1px solid black', padding: '8px' }}>Update / Delete</th>
              ) :
                (
                  <th style={{ border: '1px solid black', padding: '8px' }}>Update Status</th>
                )
            }

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
                  {data.BugName}
                </td>
                <td style={{ border: '1px solid black', padding: '8px' }}>
                  {data.Title}
                </td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{data.Severity}</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>
                  {new Date(data.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </td>
                <td style={{ border: '1px solid black', padding: '8px' }}>
                  {comData.find((com) => com._id === data.company)?.Asset || 'N/A'}
                </td>
                {
                  temp ? (
                    <td style={{ border: '1px solid black', padding: '8px' }}>
                      <IconButton >
                        <EditIcon color="warning" onClick={() => { handleEdit(data._id) }} />
                      </IconButton>
                      <IconButton>
                        <DeleteIcon color='error' onClick={() => { handleDelete(data._id) }} />
                      </IconButton>
                    </td>
                  ) : (
                    <IconButton >
                      <EditIcon color="warning" onClick={() => { handleEdit(data._id) }} />
                    </IconButton>
                  )
                }

              </tr>
            ))
          }

        </tbody>
      </Table>

      {
        temp &&
        <div className="add" style={{ border: '2px solid black', padding: '8px', textAlign: "center", margin: "10px 0" }} onClick={handleAdd}>
          add
        </div>
      }

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
        {modalType === 'add' ?
          (
            <Forms onClose={toggleModal} onFormSubmit={fetchDetails} />
          )
          :
          (
            temp ?
              <UpdateBug id={Id} onClose={toggleModal} onFormSubmit={fetchDetails} />
              :
              <UpdateStatus id={Id} onClose={toggleModal} onFormSubmit={fetchDetails} />
          )
        }
      </Modal>
      <Buttons />
    </div>
  )
}

export default Applications
