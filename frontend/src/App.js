
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Company from './components/Company';
import Applications from './components/Applications';
import { CompanyProvider } from './components/CompanyProvider';
import { useDispatch, useSelector } from "react-redux";
import { authActions } from './store';
import { useEffect } from 'react';
import Auth from './components/Auth';

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
         {
            !isLoggedIn ? (
              <Route path="/" element={<Auth />} />
            ) : (
              <>
                <Route path="/user" element={<Company />} />
                <Route path='/:name' element={<Applications />} /> 
              </>
            )
          }  
        </Routes>
      </BrowserRouter>
    </CompanyProvider>
  );
}

export default App;
