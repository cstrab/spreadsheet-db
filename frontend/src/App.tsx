import React from 'react';
import './styles/styles.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { TablePage } from './pages/TablePage';
import { Header } from './components/common/Header';

const App: React.FC = () => {
  return (
    <Router>
    <Header pageTitle='spreadsheet-db' />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sample-table-types" element={<TablePage tableName="sample_table_types" />} />
        <Route path="/sample-table-users" element={<TablePage tableName="sample_table_users" />} />
      </Routes>
    </Router>
  );
};

export default App;
