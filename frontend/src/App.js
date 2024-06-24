
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Buttons from './components/Buttons';
import Company from './components/Company';
import Applications from './components/Applications';

function App() {
  return (
      <BrowserRouter>
        <Company />
        {/* <Applications /> */}
        <Buttons />
        <Routes>
          <Route path='/:name' element={<Applications />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
