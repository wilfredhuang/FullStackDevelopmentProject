const express = require('express');
const router = express.Router();
const cartItem = require('../models/CartItem');
// List videos belonging to current logged in user 



router.get('/listProduct', (req, res) => {
    const title = 'Products';
    res.render('products/listProduct', {
        title
    })
});

router.get('/individualProduct1', (req, res) => {
    const title = 'Products';
    res.render('products/individualProduct1', {
        title
    })
});

router.get('/individualProduct2', (req, res) => {
    const title = 'Products';
    res.render('products/individualProduct2', {
        title
    })
});

router.get('/individualProduct3', (req, res) => {
    const title = 'Products';
    res.render('products/individualProduct3', {
        title
    })
});

router.get('/individualProduct4', (req, res) => {
    const title = 'Products';
    res.render('products/individualProduct4', {
        title
    })
});

module.exports = router;