import React from 'react';
import './styles/styles.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { TablePage } from './pages/TablePage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/table-one" element={<TablePage tableName="table_one" />} />
        <Route path="/table-two" element={<TablePage tableName="table_two" />} />
        <Route path="/table-three" element={<TablePage tableName="table_three" />} />
      </Routes>
    </Router>
  );
};

export default App;
