import React from 'react';
import { AppBar, Stack, Toolbar, Typography } from '@mui/material';
import '../../assets/sample-logo.png';

const VER = process.env.REACT_APP_VERSION ? ` v. ${process.env.REACT_APP_VERSION}` : ` v. DEV`;

interface IHeaderProps {
  pageTitle: string;
  menu?: JSX.Element;
  sideLinks?: JSX.Element;
}

export const Header: React.FC<IHeaderProps> = ({ pageTitle, menu, sideLinks }) => {
  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: '#0075cf',
          display: 'grid',
          gridTemplateColumns: !!menu ? '50px auto 1fr auto' : '50px 1fr auto',
          gap: 'px',
          height: '52px',
          padding: '0 15px',
          alignItems: 'center',
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          displayPrint: 'none',
        }}
        component="nav"
      >
        <img src={require('../../assets/sample-logo.png')} alt="Logo" className="small-logo"/>
        <Typography component="h1" variant="h6" style={{ fontWeight: 'bold' }}>
          {pageTitle}
          {VER && <small style={{ fontWeight: 'normal', fontSize: '13px' }}>{VER}</small>}
        </Typography>
        {menu}
        <Stack direction="row" spacing={2}>
          {sideLinks}
        </Stack>
      </AppBar>
      <Toolbar style={{ minHeight: '52px' }} />
    </>
  );
};
