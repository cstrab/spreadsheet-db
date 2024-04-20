import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div>
      <h1>Home Page</h1>
      <nav>
        <ul>
          <li>
            <Link to="/sample-table">Sample Table</Link>
          </li>
          <li>
            <Link to="/material-master">Material Master</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};
