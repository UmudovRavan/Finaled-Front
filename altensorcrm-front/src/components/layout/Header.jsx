import React from 'react';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <h2>Altensor CRM</h2>
      </div>
      <div className="header-actions">
        <span className="user-badge">Admin</span>
      </div>
    </header>
  );
};

export default Header;
