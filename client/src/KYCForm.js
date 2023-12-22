// KYCForm.js
import React, { Component } from "react";
import "./KYCForm.css"

class KYCForm extends Component {
  state = {
    kycAddress: "0x123",
    isKYCCompleted: false,
    listKYC:[]
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }


  handleKycSubmit = async () => {
    const {kycAddress} = this.state;
    const { kycContract, accounts } = this.props;
    if(await kycContract.methods.kycCompleted(kycAddress).call() == false){
      await kycContract.methods.setKycCompleted(kycAddress).send({from: accounts[0]});
      alert("Account "+kycAddress+" is now whitelisted");
      this.setState((prevState) => ({
        listKYC: [...prevState.listKYC, kycAddress],
      }))
    }else{
      alert("Account "+kycAddress+" is already whitelisted");
    }
  }
  render() {
    const { kycAddress, isKYCCompleted } = this.state;

    return (
      <div className="kyc-form">
        <h2>KYC Form</h2>
        <form>
          <label htmlFor="kycAddress">Address to allow:</label>
          <input
            type="text"
            className="form-control"
            id="kycAddress"
            name="kycAddress"
            value={kycAddress}
            onChange={this.handleInputChange}
          />
          <button type="button" className="btn btn-primary" onClick={this.handleKycSubmit}>
            Add Address to Whitelist
          </button>
        </form>
        <div>
          <h3>Addresses with KYC:</h3>
          <ul>
            {this.state.listKYC.map((address, index) => (
              <li key={index}>{address}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default KYCForm;
