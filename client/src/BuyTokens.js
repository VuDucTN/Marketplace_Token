    import React, { Component } from "react";
    import "./BuyToken.css"

    class BuyTokens extends Component {
    state = {
        amount: 0,
        tokenSaleAddress: "",
        userTokens: 0,
    };

    componentDidMount = async () => {
        const {myTokenSale} = this.props;
        this.setState({ tokenSaleAddress: myTokenSale._address }, this.updateUserTokens);
    }

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === "checkbox" ? target.checked : target.value;
        const name = target.name;
        this.setState({
        [name]: value
        });
    }


    handleBuyToken = async () => {
        const { amount } = this.state;
        const { kycContract,myTokenSale, accounts } = this.props;
        if(amount <= 0 ){
            alert("The value is currently 0!");
            return
        }
        if(await kycContract.methods.kycCompleted(accounts[0]).call() == false){
        alert("Account "+accounts[0]+" is not in whitelisted");
        }else{
        await myTokenSale.methods.buyTokens(accounts[0]).send({from: accounts[0], value: amount});
        }
        this.updateUserTokens();
        this.loadAmount()
    }

    updateUserTokens = async() => {
        const {myToken, accounts} = this.props;
        let userTokens = await myToken.methods.balanceOf(accounts[0]).call();
        this.setState({userTokens: userTokens});
    }

    loadAmount = async() => {
        this.setState({amount : 0})
    }

    render() {
        const { amount } = this.state;

        return (
        <div className="buy-tokens">
            <h2>Buy Tokens</h2>
            <p>Send Ether to this address: {this.state.tokenSaleAddress}</p>
            <p>You have: {this.state.userTokens} <span><img src="/DDH_LOGO.png" alt="DDH Icon" style={{ width: '25px', height: '25px'}}/></span></p> 
            <label htmlFor="amount">Enter the amount of tokens to buy:</label>
            <input
            type="number"
            id="amount"
            name="amount"
            value={amount}
            onChange={this.handleInputChange}
            />
            <button type="button" onClick={this.handleBuyToken}>
            Buy Tokens
            </button>
            {/* You can add other UI elements related to buying tokens */}
        </div>
        );
    }
    }

    export default BuyTokens;
