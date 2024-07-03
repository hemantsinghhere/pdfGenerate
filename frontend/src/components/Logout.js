import { Button } from '@mui/material';
import React from 'react'
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { authActions } from '../store';

const Logout = () => {
    const dispatch = useDispatch(); 

    return (
        <div style={{ display: "flex", margin: "auto", alignItems: "center"}}>
            <Button
                onClick={() => {
                    dispatch(authActions.logout());
                    localStorage.removeItem("isLoggedIn");
                    localStorage.removeItem("userId");
                }}
                LinkComponent={Link}
                to="/"
                variant='contained'
                sx={{ margin: 1, borderRadius: 10 }}
                color='warning'
            >
                LogOut
            </Button>
        </div>
    )
}

export default Logout
