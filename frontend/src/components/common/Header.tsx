import React, { useState } from 'react';
import { NavLink, useMatch } from 'react-router-dom';
import { AppBar, Menu, MenuItem, Stack, Toolbar, Typography } from '@mui/material';
import '../../assets/sample-logo.png';
import '../../styles/styles.css';

const VER = process.env.REACT_APP_VERSION ? ` v. ${process.env.REACT_APP_VERSION}` : ` v. DEV`;

interface IHeaderProps {
  pageTitle: string;
  menu?: JSX.Element;
  sideLinks?: JSX.Element;
}

export const Header: React.FC<IHeaderProps> = ({ pageTitle, menu, sideLinks }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const tableMatches = [
    useMatch({ path: '/sample-table', end: false }),
    useMatch({ path: '/material-master', end: false }),
  ].filter(Boolean);

  const isTableActive = tableMatches.length > 0;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: '#0075cf',
          display: 'grid',
          gridTemplateColumns: '50px auto 1fr auto',
          gap: 'px',
          height: '60px',
          padding: '0 15px',
          alignItems: 'center',
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          displayPrint: 'none',
        }}
        component="nav"
      >
        <img src={require('../../assets/sample-logo.png')} alt="Logo" className="small-logo" />
        <Typography component="h1" variant="h6" style={{ fontWeight: 'bold' }}>
          {pageTitle}
          {VER && <small style={{ fontWeight: 'normal', fontSize: '13px', marginRight: '40px' }}>{VER}</small>}
        </Typography>
        <Stack direction="row" spacing={2} >
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}>
            Home
          </NavLink>
          <div onClick={handleMenuOpen} className={`nav-link ${isTableActive ? 'nav-link-active' : ''}`}>Tables</div>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            <MenuItem onClick={handleMenuClose}>
              <NavLink to="/sample-table" className="dropdown-link">Sample Table</NavLink>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <NavLink to="/material-master" className="dropdown-link">Material Master</NavLink>
            </MenuItem>
          </Menu>
        </Stack>
      </AppBar>
      <Toolbar className='header-toolbar' />
    </>
  );
};
