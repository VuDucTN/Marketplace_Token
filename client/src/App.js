// App.js
import React, { Component } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// import "./styles.css";
import MyMarketplace from "./contracts/MyMarketplace.json";
import MyToken from "./contracts/MyToken.json";
import MyTokenSale from "./contracts/MyTokenSale.json";
import KycContract from "./contracts/KycContract.json";
import getWeb3 from "./getWeb3";
import KYCForm from "./KYCForm";
import BuyTokens from "./BuyTokens";
import Marketplace from "./Marketplace";
import Header from "./Header";
import Home from "./Home"


class App extends Component {
  state = { 
    loaded: false,
    web3: null,
    accounts: [],
    myToken: null,
    myTokenSale: null,
    kycContract: null,
    myMarketplace: null,
    loaded: false,
    owner: "", 
    kyc : false
  }

  componentDidMount = async () => {
    try {
        // Get network provider and web3 instance.
        this.web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        const accounts = await this.web3.eth.getAccounts();

        // Get the contract instance.
        //this.networkId = await this.web3.eth.net.getId(); <<- this doesn't work with MetaMask anymore
        this.networkId = await this.web3.eth.getChainId();   
        
        const myToken = new this.web3.eth.Contract(
          MyToken.abi,
          MyToken.networks[this.networkId] && MyToken.networks[this.networkId].address
        );
        const myTokenSale = new this.web3.eth.Contract(
          MyTokenSale.abi,
          MyTokenSale.networks[this.networkId] && MyTokenSale.networks[this.networkId].address
        );
        const kycContract = new this.web3.eth.Contract(
          KycContract.abi,
          KycContract.networks[this.networkId] && KycContract.networks[this.networkId].address
        );
        const myMarketplace = new this.web3.eth.Contract(
          MyMarketplace.abi,
          MyMarketplace.networks[this.networkId] && MyMarketplace.networks[this.networkId].address
        );
  
        this.setState({
          web3,
          accounts,
          myToken,
          myTokenSale,
          kycContract,
          myMarketplace,
          loaded: true,
        });
        this.listenIsOwner()
        console.log(this.state.owner)
        console.log(this.state.accounts[0])
        const iskyc = await kycContract.methods.kycCompleted(accounts[0]).call()
        this.setState({kyc : iskyc})
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  
  listenIsOwner = async() => {
    const{myMarketplace} = this.state
    const isOwner = await myMarketplace.methods.getOwner().call();
    console.log(isOwner)
    this.setState({owner : isOwner})
  }
  render() {
    const { loaded, ...contractProps } = this.state;
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <Router>
      <div className="container">
        <Header 
          accounts={this.state.accounts}
          kycContract={this.state.kyc}
          owner = {this.state.owner}
          />
        <nav>
          <ul>
          <li>
                <Link to="/">Home</Link>
              </li>
              {this.state.owner === this.state.accounts[0] && <li>
              <Link to="/kyc">KYC Form</Link>
              </li>}
            <li>
              <Link to="/buy">Buy Tokens</Link>
            </li>
            <li>
              <Link to="/marketplace">Marketplace</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/kyc" element={<KYCForm {...contractProps} />} />
          <Route path="/buy" element={<BuyTokens {...contractProps}/>} />
          <Route path="/marketplace" element={<Marketplace {...contractProps} />} />
        </Routes>
      </div>
    </Router>
    );
  }
}

export default App;
