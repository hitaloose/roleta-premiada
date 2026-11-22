import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { MachineProvider } from './state/MachineContext';
import './styles/global.css';
import { applyBrand } from './brands';

applyBrand();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MachineProvider>
      <App />
    </MachineProvider>
  </StrictMode>,
);
