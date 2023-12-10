import React, { Component } from "react";
import MyToken from "./contracts/MyToken.json";
import MyTokenSale from "./contracts/MyTokenSale.json";
import KycContract from "./contracts/KycContract.json";
import MyMarketplace from "./contracts/MyMarketplace.json";
import getWeb3 from "./getWeb3";

import "./styles.css"

class App extends Component {

  state = { loaded: false, kycAddress: "0x123", tokenSaleAddress: "", userTokens: 0, itemName: "",
  itemPrice: 0, listings: []};

  componentDidMount = async () => {
    try {
        // Get network provider and web3 instance.
        this.web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        this.accounts = await this.web3.eth.getAccounts();

        // Get the contract instance.
        //this.networkId = await this.web3.eth.net.getId(); <<- this doesn't work with MetaMask anymore
        this.networkId = await this.web3.eth.getChainId();      

        this.myToken = new this.web3.eth.Contract(
          MyToken.abi,
          MyToken.networks[this.networkId] && MyToken.networks[this.networkId].address,
        );

        this.myTokenSale = new this.web3.eth.Contract(
          MyTokenSale.abi,
          MyTokenSale.networks[this.networkId] && MyTokenSale.networks[this.networkId].address,
        );
        this.kycContract = new this.web3.eth.Contract(
          KycContract.abi,
          KycContract.networks[this.networkId] && KycContract.networks[this.networkId].address,
        );
        this.myMarketplace = new this.web3.eth.Contract(
          MyMarketplace.abi,
          MyMarketplace.networks[this.networkId] && MyMarketplace.networks[this.networkId].address,
        );
        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.
        this.listenToTokenTransfer();
        this.updateProductList();
        this.setState({ loaded:true, tokenSaleAddress: this.myTokenSale._address }, this.updateUserTokens);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
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
    if(await this.kycContract.methods.kycCompleted(kycAddress).call() == false){
      await this.kycContract.methods.setKycCompleted(kycAddress).send({from: this.accounts[0]});
      alert("Account "+kycAddress+" is now whitelisted");
    }else{
      alert("Account "+kycAddress+" is already whitelisted");
    }
    
  }

  handleBuyToken = async () => {
    await this.myTokenSale.methods.buyTokens(this.accounts[0]).send({from: this.accounts[0], value: 1});
  }

  handleItemInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleListItem = async () => {
    try {
      const { itemName, itemPrice } = this.state;
  
      // Ensure that itemName is not empty and itemPrice is greater than 0
      if (!itemName || itemPrice <= 0) {
        alert("Please enter valid item details.");
        return;
      }
  
      // Call the smart contract method to list a new item on the marketplace
      await this.myMarketplace.methods.listNewItem(itemName,itemPrice).send({ from: this.accounts[0] });
  
      // Handle successful transaction
      alert(`Item "${itemName}" listed on the marketplace for ${itemPrice} SCT.`);
      
      // Optional: Update the UI or fetch updated marketplace listings
      // this.fetchMarketplaceListings();
    } catch (error) {
      // Handle errors, e.g., transaction rejection or failure
      alert(`Failed to list the item. Error: ${error.message}`);
    }
  }

  handlePurchaseItem = async (listingId) => {
    try {
      const price = this.state.listings.find(item => item.listingId === listingId)?.price;

       // Ensure the price is valid
       if (!price || price <= 0) {
        alert("Invalid item price.");
        return;
    }
      // Call the smart contract method to purchase an item on the marketplace
      await this.myToken.methods.approve(this.myMarketplace._address, price).send({ from: this.accounts[0] });
      await this.myMarketplace.methods.purchaseItem(listingId).send({ from: this.accounts[0] });
  
      // Handle successful transaction
      alert(`Item with Listing ID ${listingId} purchased.`);
      
      // Optional: Update the UI or fetch updated marketplace listings
      // this.fetchMarketplaceListings();
      this.updateProductList();
    } catch (error) {
      // Handle errors, e.g., transaction rejection or failure
      alert(`Failed to purchase the item. Error: ${error.message}`);
    }
  }

  handleDeliverItem = async (listingId) => {
    try {
      const price = this.state.listings.find(item => item.listingId === listingId)?.price;

      // Call the smart contract method to purchase an item on the marketplace
      await this.myToken.methods.approve(this.myMarketplace._address, price).send({ from: this.accounts[0] });
      await this.myMarketplace.methods.deliverItem(listingId).send({ from: this.accounts[0] });
  
      // Handle successful transaction
      alert(`Item with Listing ID ${listingId} delivery.`);
      
      // Optional: Update the UI or fetch updated marketplace listings
      // this.fetchMarketplaceListings();
      this.updateProductList();
    } catch (error) {
      // Handle errors, e.g., transaction rejection or failure
      alert(`Failed to purchase the item. Error: ${error.message}`);
    }
  }

  updateUserTokens = async() => {
    let userTokens = await this.myToken.methods.balanceOf(this.accounts[0]).call();
    this.setState({userTokens: userTokens});
  }

  updateProductList = async () => {
    try {
      const totalListings = await this.myMarketplace.methods.getTotalListings().call();
      const listingIds = await this.myMarketplace.methods.getListingIds().call();
  
      const updatedListings = [];
  
      for (let i = 0; i < totalListings; i++) {
        const listingId = listingIds[i];
        const listingDetails = await this.myMarketplace.methods.getItemDetails(listingId).call();
        updatedListings.push({ listingId, ...listingDetails });
      }
  
      this.setState({ listings: updatedListings });
      console.log('Updated product list:', updatedListings);
    } catch (error) {
      console.error('Error updating product list:', error);
    }
  };
  

  listenToTokenTransfer = async() => {
    this.myToken.events.Transfer({to: this.accounts[0]}).on("data", this.updateUserTokens);
  }

  

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Capuccino Token for StarDucks</h1>

      <h2>Enable your account</h2>
      Address to allow: <input type="text" name="kycAddress" value={this.state.kycAddress} onChange={this.handleInputChange} />
        <button type="button" onClick={this.handleKycSubmit}>Add Address to Whitelist</button>
        <h2>Buy Cappucino-Tokens</h2>
        <p>Send Ether to this address: {this.state.tokenSaleAddress}</p>
        <p>You have: {this.state.userTokens}</p>
        <button type="button" onClick={this.handleBuyToken}>Buy more tokens</button>
        <br></br>
        <h2>My Marketplace</h2>
        <div>
          <h3>List a New Item</h3>
          <label>Item Name:</label>
          <input type="text" name="itemName" value={this.state.itemName} onChange={this.handleItemInputChange} />
          <label>Item Price (SCT):</label>
          <input type="number" name="itemPrice" value={this.state.itemPrice} onChange={this.handleItemInputChange} />
          <button type="button" onClick={this.handleListItem}>List Item</button>

          <div>
            <h3>Marketplace Listings</h3>
            {this.state.listings && this.state.listings.length > 0 ? (
              <div>
                {this.state.listings.map((item, index) => (
                  <div key={index}>
                    <p>{`Listing ID: ${item.listingId} - Item Name: ${item.name} - Seller: ${item.seller} - Price: ${item.price}  SCT - Supply: ${item._state}`}</p>
                    {/* Add other details or buttons as needed */}
                    {item._state == 0 ? (
            <button type="button" onClick={() => this.handlePurchaseItem(item.listingId)}>
              Purchase
            </button>
          ) : item.seller == this.accounts[0] ? (item._state == 1 ?<button type="button" onClick={() => this.handleDeliverItem(item.listingId)}>
          Delivery
        </button> : <p>This item has been delivered.</p>) : (
            <p>This item has been sold.</p>
          )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No items available in the marketplace.</p>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
