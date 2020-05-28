const express = require('express');
const router = express.Router();

const Cart = require('../models/Cart');

router.get('/checkout', (req,res) => {
    const title = 'Check Out';
    res.render('delivery/checkOut', {            
        title,
        
    });

});

module.exports = router;
