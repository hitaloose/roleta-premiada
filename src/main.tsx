import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { MachineProvider } from './state/MachineContext';
import { ConfigProvider } from './state/ConfigContext';
import { RotatedViewport } from './components/ui/RotatedViewport';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider>
      <MachineProvider>
        <RotatedViewport>
          <App />
        </RotatedViewport>
      </MachineProvider>
    </ConfigProvider>
  </StrictMode>,
);
