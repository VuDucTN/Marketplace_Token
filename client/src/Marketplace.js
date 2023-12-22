import React, { Component } from "react";
import axios from 'axios';
import "./Marketplace.css"
import 'bootstrap/dist/css/bootstrap.min.css';


class Marketplace extends Component {
    state ={itemName: "",itemPrice: 0, listings: [], products: [], items:[], userTokens: 0,itemImage: null}

    componentDidMount = async() =>{
        await axios.get('http://localhost:4000/item')
        .then(response => {
          console.log(response.data);
          this.setState({items: [...this.state.items, response.data]});
      })
      .catch(function (error) {
          console.log(error);
      })

      for (var i = 0; i < this.state.items[0].data.length; i++) {
        const product =await this.state.items[0].data[i]
        this.setState({products: [...this.state.products, product]});
      }
    this.updateUserTokens()
    }

    handleListItem = async () => {
        try {
          const { itemName, itemPrice, itemImage } = this.state;
          const { myMarketplace,accounts, kycContract } = this.props;
          
      
          // Ensure that itemName is not empty and itemPrice is greater than 0
          if (!itemName || itemPrice <= 0) {
            alert("Please enter valid item details.");
            return;
          }

          if(await kycContract.methods.kycCompleted(accounts[0]).call() == false){
            alert("Account "+accounts[0]+" is not in whitelisted");
            return;
          }
      
          // Call the smart contract method to list a new item on the marketplace
          const resutl = await myMarketplace.methods.listNewItem(itemName,itemPrice).send({ from: accounts[0] });
      
          // Handle successful transaction
          alert(`Item "${itemName}" listed on the marketplace for ${itemPrice} SCT.`);
          
          // Optional: Update the UI or fetch updated marketplace listings
          // this.fetchMarketplaceListings();
          
          console.log(resutl.events.ItemListed.returnValues);
          const obj = {
            itemName: this.state.itemName,
            itemId: resutl.events.ItemListed.returnValues.listingId,
            price: this.state.itemPrice,
            itemImage: this.state.itemImage,
            address: accounts[0],
            state: resutl.events.ItemListed.returnValues._step,
            owner: resutl.events.ItemListed.returnValues.seller,
            date: new Date()
          };
          axios.post('http://localhost:4000/item/create', obj, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },    
          })
                .then(res => console.log(res.data));
          console.log(obj)
        } catch (error) {
          // Handle errors, e.g., transaction rejection or failure
          alert(`Failed to list the item. Error: ${error.message}`);
        }
      }
    
      handlePurchaseItem = async (itemId, productId) => {
        try {
            const { myToken,accounts,myMarketplace,kycContract } = this.props;
          const item = await myMarketplace.methods.getItemDetails(itemId).call();
          const balanceAccount = await myToken.methods.balanceOf(accounts[0]).call();
          console.log(item.price)
          if(balanceAccount < item.price){
            alert("Your current token is not enough!");
            return;
          }
    
           // Ensure the price is valid
           if (!item.price || item.price <= 0) {
            alert("Invalid item price.");
            return;
          }

          if(await kycContract.methods.kycCompleted(accounts[0]).call() == false){
            alert("Account "+accounts[0]+" is not in whitelisted");
            return;
          }

          // Call the smart contract method to purchase an item on the marketplace
          await myToken.methods.approve(myMarketplace._address, item.price).send({ from: accounts[0] });
          const resutl = await myMarketplace.methods.purchaseItem(itemId).send({ from: accounts[0] });
      
          // Handle successful transaction
          alert(`Item with Listing ID ${itemId} purchased.`);
          
     
          console.log(resutl.events.ItemListed.returnValues);
    
            const obj = {
              state: resutl.events.ItemListed.returnValues._step,
              address : accounts[0]
            };
            axios.put('http://localhost:4000/item//update/'+ productId, obj)
          .then(res => console.log(res.data));
          this.updateProductList();
          this.updateUserTokens()
        } catch (error) {
          // Handle errors, e.g., transaction rejection or failure
          alert(`Failed to purchase the item. Error: ${error.message}`);
        }
      }
    
      handleDeliverItem = async (itemid, productId) => {
        try {
            const { myToken,accounts,myMarketplace } = this.props;
            const item = await myMarketplace.methods.getItemDetails(itemid).call();
    
          // Call the smart contract method to purchase an item on the marketplace
          await myToken.methods.approve(myMarketplace._address, item.price).send({ from: accounts[0] });
          const resutl = await myMarketplace.methods.deliverItem(itemid).send({ from: accounts[0] });
      
          // Handle successful transaction
          alert(`Item with Listing ID ${itemid} delivery.`);
          
          // Optional: Update the UI or fetch updated marketplace listings
          // fetchMarketplaceListings();
    
          console.log(resutl.events.ItemListed.returnValues);
          const obj = {
            state: resutl.events.ItemListed.returnValues._step
          };
          axios.put('http://localhost:4000/item//update/'+ productId, obj)
        .then(res => console.log(res.data));
        this.updateProductList();
        this.updateUserTokens()
        } catch (error) {
          // Handle errors, e.g., transaction rejection or failure
          alert(`Failed to purchase the item. Error: ${error.message}`);
        }
      }
    
      handleReceivedItem = async(itemId, productId) => {
        try {
            const {accounts,myMarketplace,myToken } = this.props;
          const item = await myMarketplace.methods.getItemDetails(itemId).call();
    
          // Call the smart contract method to purchase an item on the marketplace
          await myToken.methods.approve(myMarketplace._address, item.price).send({ from: accounts[0] });
          const resutl = await myMarketplace.methods.receivedItem(itemId).send({ from: accounts[0] });
      
          // Handle successful transaction
          alert(`Item with Listing ID ${itemId} delivery.`);
          
          // Optional: Update the UI or fetch updated marketplace listings
          // this.fetchMarketplaceListings();
    
          console.log(resutl.events.ItemListed.returnValues);
          const obj = {
            state: resutl.events.ItemListed.returnValues._step
          };
          axios.put('http://localhost:4000/item//update/'+ productId, obj)
        .then(res => console.log(res.data));
        this.updateProductList();
        } catch (error) {
          // Handle errors, e.g., transaction rejection or failure
          alert(`Failed to purchase the item. Error: ${error.message}`);
        }
      }
      updateProductList = async () => {
        try {
            const { myMarketplace } = this.props;
          const totalListings = await myMarketplace.methods.getTotalListings().call();
          const listingIds = await myMarketplace.methods.getListingIds().call();
      
          const updatedListings = [];
      
          for (let i = 0; i < totalListings; i++) {
            const listingId = listingIds[i];
            const listingDetails = await myMarketplace.methods.getItemDetails(listingId).call();
            updatedListings.push({ listingId, ...listingDetails });
          }
      
          this.setState({ listings: updatedListings });
          console.log('Updated product list:', updatedListings);
        } catch (error) {
          console.error('Error updating product list:', error);
        }
      };
      
    
      listenToTokenTransfer = async() => {
        const {myToken} = this.state;
        myToken.events.Transfer({to: accounts[0]}).on("data", updateUserTokens);
      }
    
      listenIsOwner = async() => {
        const {myMarketplace} = this.state;
        const isOwner = await myMarketplace.methods.isOwner().call();
        this.setState({owner : isOwner})
      }

      handleItemInputChange = (event) => {
        const target = event.target;
        const value = target.type === "checkbox" ? target.checked : target.value;
        const name = target.name;
        this.setState({
          [name]: value
        });
      }

      handleItemImageChange = (event) => {
        const file = event.target.files[0];
        this.setState({ itemImage: file });
      };

      updateUserTokens = async() => {
        const {myToken, accounts} = this.props;
        let userTokens = await myToken.methods.balanceOf(accounts[0]).call();
        this.setState({userTokens: userTokens});
    }

      render(){
        const{accounts} = this.props
        return(
        <div className="container_marketplace">
          <div className="d-flex justify-content-between align-items-center p-3 text-black">
            <h1 className="m-0">Marketplace</h1>
            <div>
                <h3>My Token:</h3>
                <h5>{this.state.userTokens} <img src="/DDH_LOGO.png" alt="DDH Icon" style={{ width: '25px', height: '25px'}}/></h5> 
            </div>
          </div>  
          <h3>Create New Product</h3>
          <label>Name:</label>
          <input type="text" name="itemName" value={this.state.itemName} onChange={this.handleItemInputChange} />
          <label>Price <img src="/DDH_LOGO.png" alt="DDH Icon" style={{ width: '20px', height: '20px'}}/> <small>(DDH)</small>:</label>
          <input type="number" name="itemPrice" value={this.state.itemPrice} onChange={this.handleItemInputChange} />
          <label>Item Image:</label>
          <input type="file" name="itemImage" onChange={this.handleItemImageChange} />
          <button type="button" onClick={this.handleListItem}>Create</button>
            <hr></hr>
          <h3>Show list Item</h3>
          <div className="list_item list-item d-flex flex-wrap gap-3">
          {this.state.products && this.state.products.length > 0 ? (
            this.state.products.map((product, key) => {
                let text ="";
                if (product.state == 0){
                  text = "Stocking";
                }else if(product.state == 1){
                  text = "Waiting for shipping"
                } else if(product.state == 2) {
                  text = "Already shipped"
                } else if(product.state == 3){
                  text = "Delivery successful"
                }else{
                  text = "Cancel"
                }
              return (
                <div key={key} className="card mb-3" style={{ maxWidth: '25rem' }}>
                  <div className="card-body">
                    <h3 className="card-title">{product.itemName}</h3>
                    {product.itemImage && (
                      <center>
                      <img src={`uploads/${product.itemImage}`} alt={`Image for ${product.itemName}`} style={{ maxWidth: '100%', maxHeight: '200px'}} />
                      </center>
                      )}
                    <p className="card-text">{`Price: ${product.price}`} <span><img src="/DDH_LOGO.png" alt="DDH Icon" style={{ width: '18px', height: '18px'}}/></span></p>
                    <p className="card-text"  style={{fontSize: 13}}> {`Owner: ${product.address}`}</p>
                    <p className="card-text">{`State of Item: ${text}`}</p>
                    <div className="card-actions" style={{ color: 'green' }} >
                    { product.state == 0
          ? product.owner === accounts[0] ? "You are Ower" : <button
              onClick={() => {
                this.handlePurchaseItem(product.itemId, product._id)
              }}
            >
              Buy
            </button>
          : product.state == 1 ? product.owner === accounts[0] ? <button
          onClick={() => {
            this.handleDeliverItem(product.itemId, product._id)
          }}
        >
          Delivery
        </button> : null : product.state == 2 ? product.owner === accounts[0] ? "You are Owner" : <div>
        <button
          onClick={() => {
            this.handleReceivedItem(product.itemId,product._id)
          }}
        >
          Received
        </button>
        </div> : null
        }
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p>Không có hàng được bán...</p>
          )}
          </div>
          </div>
        )
      }
}

export default Marketplace;