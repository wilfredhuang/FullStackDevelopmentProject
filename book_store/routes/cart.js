const express = require('express');
const router = express.Router();

const Cart = require('../models/Cart');

router.get('/checkout', (req, res) => {
    const title = 'Check Out';
    res.render('delivery/checkOut', {            
        title,
    });
});

router.post("/processCheckout", (req, res) => {
    let fullName = req.body.fullName
    console.log(fullName)
    let userId = 'hello'; //req.user.id
    Cart.create({
        fullName,
    })
});

module.exports = router;
