const express = require('express');
const itemRoutes = express.Router();
const multer = require('multer');
const path = require('path');

let Item = require("./item.model.js")

const {getAll} = require('./item.controller.js')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, '../client/public/uploads/'); // Save uploaded images to the 'uploads' directory
  },
  filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

itemRoutes.route('/create').post(upload.single('itemImage'),function (req, res) {
    let item = new Item({
      itemName: req.body.itemName,
      itemId: req.body.itemId,
      price: req.body.price,
      itemImage: req.file.filename,
      address: req.body.address,
      state: req.body.state,
      owner: req.body.owner,
      date: req.body.date,
    });
    item.save()
        .then(item => {
            res.status(200).json({'item': 'item in added successfully'});
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
});

itemRoutes.route('/update/:id').put(function(req,res){
    const id = req.params.id;
    const update = req.body;
    Item.updateOne({ _id:id }, { $set:update })
    .exec()
    .then(() => {
      res.status(200).json({
        success: true,
        message: 'Item Update state',
        updateItem: updateObject,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: 'Server error. Please try again.'
      });
    });
})


itemRoutes.route("/").get(getAll);

module.exports = itemRoutes;