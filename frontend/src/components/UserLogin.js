import React, { useState } from 'react'
import { Alert, Box, Button, Snackbar, TextField, Typography } from '@mui/material'
import { useDispatch } from 'react-redux';
import { authActions } from "../store"
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const UserLogin = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isSignup, setIsSignup] = useState(false);
    const [inputs, setInputs] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);

    const handleChange = (e) => {
        setInputs((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };



    const sendRequest = async (type = "login") => {
        try {
            const res = await axios.post(`http://localhost:5000/user/${type}`, {
                name: inputs.name,
                email: inputs.email,
                password: inputs.password
            });
            const data = await res.data;
            return data;

        } catch (err) {
            console.log("error", err)
            setError(err.response.data.message || 'Something went wrong');
            setOpen(true);
            return null;
        }
    };



    const handleSubmit = (e) => {
        e.preventDefault();
        const requestType = isSignup ? 'signup' : 'login';
        sendRequest(requestType)
            .then((data) => {
                if (data) {
                    localStorage.setItem("userId", data.user._id);
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem("token", data.token);
                    dispatch(authActions.login());
                    navigate("/userportal");

                    // Decode the token to get the expiration time
                    const decodedToken = jwtDecode(data.token);
                    const expirationTime = decodedToken.exp * 1000 - new Date().getTime();


                    // Set a timeout to log out the user when the token expires
                    setTimeout(() => {
                        alert("Session expired. You will be logged out.");
                        handleLogout();
                    }, expirationTime);
                }
            })
            .catch((err) => console.error(err));
    };

    const handleLogout = () => {
        dispatch(authActions.logout());
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userId");
        localStorage.removeItem("token");
        navigate("/");
    };
    return (
        <>
            <form onSubmit={handleSubmit} >
                <Box
                    maxWidth="400px"
                    display='flex'
                    flexDirection='column'
                    justifyContent='center'
                    alignItems='center'
                    boxShadow="10px 10px 20px #ccc"
                    padding={3}
                    borderRadius={5}
                    marginTop={5}
                    margin="auto">
                    <Typography
                        padding={3}
                        textAlign='center'
                        variant='h4'>
                        User Login
                    </Typography>

                    {/* {
                        isSignup &&
                        <TextField
                            name="name"
                            onChange={handleChange}
                            value={inputs.name}
                            placeholder='Name'
                            margin="normal"
                        />
                    } */}

                    <TextField
                        onChange={handleChange}
                        name='email'
                        type={"email"}
                        value={inputs.email}
                        placeholder='Email'
                        margin="normal"
                    />

                    <TextField
                        onChange={handleChange}
                        name='password'
                        type={"password"}
                        value={inputs.password}
                        placeholder='Password'
                        margin="normal"
                    />

                    <Button
                        varient="contained"
                        sx={{ borderRadius: 3, marginTop: 3 }}
                        color='warning'
                        type='submit'
                    >
                        Submit
                    </Button>
                    {/* <Button
                        sx={{ borderRadius: 3, marginTop: 3 }}
                        onClick={() => setIsSignup(!isSignup)}
                    >
                        Change to {isSignup ? "Login" : "Signup"}
                    </Button> */}
                </Box>
            </form>
            <Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)}>
                <Alert onClose={() => setOpen(false)} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </>
    )
}

export default UserLogin
