import { globalInit } from './preset';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

const renderRoot = async (App) => {
  const globalPreset = await globalInit();
  return root.render(<App themeToken={globalPreset.themeToken} globalPreset={globalPreset} />);
};

renderRoot(App);
