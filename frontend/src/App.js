
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Company from './components/Company';
import Applications from './components/Applications';
import { CompanyProvider } from './components/CompanyProvider';

function App() {
  return (
    <CompanyProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Company />} />
          <Route path='/:name' element={<Applications />} />
        </Routes>
      </BrowserRouter>
    </CompanyProvider>
  );
}

export default App;
