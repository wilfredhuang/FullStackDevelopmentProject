// Dont touch this file for now.. - W


const express = require('express');
// const Product = require('../models/product'); // Bring in Sequelize object 'Product'
// // const CartItems = require('../models/cart_items');
const router = express.Router();
// // const alertMessage=require('../helpers/messenger');
// // const Order = require('../models/order');
// // const OrderItem = require('../models/order');

// // const stripe = require('stripe')('sk_test_ns9DyHTray5Wihniw93C2ANH00IMJTVjKw', {
// //     apiVersion: '2020-03-02',
// //   });

router.get('/checkout123', (req, res) => {
    res.render('checkout/checkout', {
        title:"Testing"
    })
});

module.exports = router;