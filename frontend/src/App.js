
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Company from './components/Company';
import Applications from './components/Applications';
import { CompanyProvider } from './components/CompanyProvider';
import { useDispatch, useSelector } from "react-redux";
import { authActions } from './store';
import { useEffect } from 'react';
import Auth from './components/Auth';
import LandingPage from './LandingPage';
import AdminLogin from './components/AdminLogin';
import UserLogin from './components/UserLogin';

function App() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(state => state.isLoggedIn);
  useEffect(() => {
    if (localStorage.getItem("userId")) {
      dispatch(authActions.login())
    }
  }, [dispatch])
  return (
    <CompanyProvider>
      <BrowserRouter>
        <Routes>
          {/* {
            !isLoggedIn ? (
              <Route path="/" element={<Auth />} />
            ) : (
              <>
                <Route path="/userportal" element={<Company />} />
                <Route path='/:name' element={<Applications />} /> 
              </>
            )
          } */}

          <Route path="/" element={<LandingPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/auth" element={<Auth />} />

          <Route
            path="/admin/companylist"
            element={isLoggedIn ? <Company /> : <Navigate to="/admin" />}
          />
          <Route
            path="/admin/:name"
            element={isLoggedIn ? <Applications /> : <Navigate to="/admin" />}
          />



          {/* User Routes */}
          <Route path="/user" element={!isLoggedIn ? <UserLogin /> : <Navigate to="/user/auth" />} />
          <Route path="/user/auth" element={isLoggedIn ? <Company /> : <Navigate to="/user" />} />


          <Route
            path="/user/companylist"
            element={isLoggedIn ? <Company /> : <Navigate to="/user" />}
          />
          <Route
            path="/user/:name"
            element={isLoggedIn ? <Applications /> : <Navigate to="/user" />}
          />


        </Routes>
      </BrowserRouter>
    </CompanyProvider>
  );
}

export default App;
