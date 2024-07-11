import { IconButton } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import Modal from 'react-modal';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCom from './AddCom';
import axios from "axios";
import { Table } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { CompanyContext } from './CompanyProvider';
import UpdateCom from './UpdateCom';
import Logout from "./Logout";
import { useLocation } from 'react-router-dom';


Modal.setAppElement('#root');

const Company = () => {
  let loc = useLocation();
  let temp = loc.pathname.startsWith("/admin")
  const navigate = useNavigate();
  const { setCompanyId } = useContext(CompanyContext);
  const user_id = localStorage.getItem("userId")

  const [Id, setId] = useState(null);

  const [comData, setComData] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add' or 'edit'

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleAdd = () => {
    setModalType('add')
    toggleModal();
  };

  const handleEdit = (id) => {
    setId(id);
    setModalType('edit')
    toggleModal();
  };

  const fetchDetails = async () => {
    const token = localStorage.getItem('token');
    let res;
    if (temp) {
      // admin
      res = await axios.get(`http://localhost:5000/company/user/${user_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(err => console.log(err));
    } else {
      // user
      res = await axios.get(`http://localhost:5000/company/user/U/${user_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(err => console.log(err));
    }

    if (res && res.data) {
      const data = await res.data;
      setComData(data.company);
    }

    //admin
    // const res = await axios.get(`http://localhost:5000/company/user/${user_id}`,{
    //   headers: {
    //     'Authorization': `Bearer ${token}`
    //  }

    // user
    // const res = await axios.get(`http://localhost:5000/company/user/U/${user_id}`,{
    //   headers: {
    //     'Authorization': `Bearer ${token}`
    //  }
    // }).catch(err => console.log(err));

    // const data = await res.data;
    // setComData(data.company)
  }

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.delete(`http://localhost:5000/company/delete/U/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 200) {
        alert("Bug Deleted Successfully");
        setComData(prevData => prevData.filter(com => com._id !== id));
      }
    } catch (err) {
      console.log(err);
      alert("Failed to delete the bug report");
    }
  };

  const handleCom = async (id, name) => {
    setCompanyId(id);
    {
      temp ? navigate(`/admin/${name}`) : navigate(`/user/${name}`)
    }
  }

  useEffect(() => {
    fetchDetails()
  }, [])

  return (
    <div className='table-container' style={{ margin: "20px" }}>
      <div className="compy">
        <h1 style={{ textAlign: "center" }}>All Company</h1>
        <Table style={{ borderCollapse: 'collapse', width: '100%', fontSize: "12px", }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid black', padding: '8px' }}>ID</th>
              <th style={{ border: '1px solid black', padding: '8px' }}>COMPANY NAME</th>
              <th style={{ border: '1px solid black', padding: '8px' }}>ASSET</th>
              {temp && <th style={{ border: '1px solid black', padding: '8px' }}>Update / Delete</th>}
            </tr>
          </thead>
          <tbody>
            {
              comData.map((data, index) => (
                <tr style={{ border: '1px solid black', padding: '8px', textAlign: "center" }} >
                  <td style={{ border: '1px solid black', padding: '8px' }}>
                    {index + 1}
                  </td>
                  <td style={{ border: '1px solid black', padding: '8px' }} onClick={() => handleCom(data._id, data.Name)}>
                    {data.Name}
                  </td>

                  <td style={{ border: '1px solid black', padding: '8px' }}>{data.Asset}</td>
                  {temp && (
                    <td style={{ border: '1px solid black', padding: '8px' }}>
                      <IconButton>
                        <EditIcon color="warning" onClick={() => { handleEdit(data._id) }} />
                      </IconButton>
                      <IconButton>
                        <DeleteIcon color='error' onClick={() => { handleDelete(data._id) }} />
                      </IconButton>
                    </td>
                  )}
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
        {modalType === 'add' ? <AddCom onClose={toggleModal} onFormSubmit={fetchDetails} /> : <UpdateCom id={Id} onClose={toggleModal} onFormSubmit={fetchDetails} />}
      </Modal>
      <div className="logout" style={{ display: "flex", margin: "auto", alignItems: "center" }}>
        <Logout />
      </div>

    </div>
  )
}

export default Company
