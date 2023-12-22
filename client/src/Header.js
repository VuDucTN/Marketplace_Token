// Header.js
import React from "react";
import "./Header.css"

const Header = ({ accounts, kycContract, owner}) => {
  return (
    <header className="d-flex justify-content-between align-items-center p-3 text-black">
      <h1 className="m-0">DDH Marketplace</h1>
      <div className="account-info">
        <span>Account : {accounts[0]}</span>
        {kycContract && !(owner === accounts[0]) && <span style={{ color: 'green' }} >Verified account</span>}
        {!kycContract && !(owner === accounts[0]) && <span style={{ color: 'red' }}>Account is not verified</span>}
        {owner === accounts[0] && <span style={{ color: 'blue' }}>ADMIN</span>}
      </div>
    </header>
  );
};

export default Header;
