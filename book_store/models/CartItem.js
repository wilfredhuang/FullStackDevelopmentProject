const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const CartItem = db.define('cartItem',
    {
        title: {
            type: Sequelize.STRING
        },
        price: {
            type: Sequelize.STRING
        },
        amount: {
            type: Sequelize.STRING
        },
    });


module.exports = CartItem;