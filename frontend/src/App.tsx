import React from 'react';
import './styles/styles.css';
import { ItemsPage } from './pages/ItemsPage';

const App: React.FC = () => {
  return (
    <div>
      <h1>Items</h1>
      <ItemsPage />
    </div>
  );
};

export default App;
