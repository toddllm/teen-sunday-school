import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { LessonProvider } from './contexts/LessonContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LessonProvider>
      <App />
    </LessonProvider>
  </React.StrictMode>
);
