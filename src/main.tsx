import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './style.css';

// Import game scripts
import './data.js';
import './skill.js';
import './core.js';
import './ui.js';
import './bag.js';
import './pet.js';
import './equip.js';
import './event.js';
import './explore.js';
import './battle.js';
import './tribulation_ui.js';
import './tribulation.js';
import './mod.js';
import './plugins/auto_click.js';
import './plugins/cheat_mod.js';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
