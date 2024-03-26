import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div>
      <h1>Home Page</h1>
      <nav>
        <ul>
          <li>
            <Link to="/table-one">Table One</Link>
          </li>
          <li>
            <Link to="/table-two">Table Two</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};
