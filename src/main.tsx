import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext.tsx';
import App from './App.tsx';
import HousesPage from './HousesPage.tsx';
import PropertyDetails from './PropertyDetails.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/houses" element={<HousesPage />} />
          <Route path="/property/:propertyId" element={<PropertyDetails />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
