const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Item = new Schema({
    itemName:{
        type: String
    },
    itemId:{
        type: Number
    },
    price:{
        type: Number
    },
    itemImage: { 
        type: String
    },
    address:{
        type: String
    },
    state:{
        type: Number
    },
    owner: {
        type: String
    },
    date: { type: Date, default: Date.now },
},{
    collection: 'item'
})

module.exports = mongoose.model('item', Item);