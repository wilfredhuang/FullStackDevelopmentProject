const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Product = db.define('product',
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


module.exports = Product;