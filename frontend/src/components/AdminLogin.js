import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    let navigate = useNavigate();
    let email = useRef();
    let password = useRef();
    let login = (e) => {
        e.preventDefault();

        let admin = {
            email: "admin@gmail.com",
            password: 123456
        }

        if (email.current.value == admin.email && password.current.value == admin.password) {
            // Navigate to admin Portal
            navigate("/admin/auth");
        }
        else {
            alert("Invalid admin credentials");
        }
    }
    return (
        <>

            <div className="adminForm"
                style={{
                    maxWidth: "400px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "10px 10px 20px #ccc",
                    padding: "3px",
                    borderRadius: "5px",
                    margin: "auto"
                }}>
                <h1>Admin Login</h1>
                <form onSubmit={login}>
                    <div className="adminEmail" style={{ textAlign: "center", padding: "3px" }}>
                        <input
                            ref={email}
                            type="email"
                            placeholder='Enter Your Email Address'
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ccc',
                                boxSizing: 'border-box'
                            }} />
                    </div>
                    <br />
                    <div className="adminPassword" style={{ textAlign: "center", padding: "3px" }}>
                        <input 
                        ref={password} 
                        type="password" 
                        placeholder='Enter Your Password'
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                            boxSizing: 'border-box'
                        }} />
                    </div>
                    <br />
                    <div className="loginBtn" style={{ alignItems: "center", display: "flex", justifyContent: "center", }}>
                    <button
                        type="submit"
                        style={{
                            padding: '10px 20px',
                            borderRadius: '5px',
                            border: 'none',
                            backgroundColor: '#ff9800',
                            color: '#fff',
                            cursor: 'pointer',
                            marginBottom: "20px"
                        }}
                    >
                        Login
                    </button>
                    </div>
                </form>
            </div>

        </>
    )
}

export default AdminLogin



