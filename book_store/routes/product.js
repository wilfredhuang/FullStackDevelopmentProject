const express = require('express');
const router = express.Router();
const product = require('../models/Product');
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

router.post('/addProduct1', (req, res) => {
    let title = "7 DAY SELF PUBLISH HOW TO WRITE A BOOK";
    let price = 3.37;
    let amount = 1;
    product.create({
        title, price, amount,
    }).then((product) => {
        res.redirect('/product/listproduct')
    })
        .catch(err => console.log(err))
});

module.exports = router;