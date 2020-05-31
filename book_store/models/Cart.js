const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Cart = db.define('cart',
    {
        fullName: {type: Sequelize.STRING,},
        phoneNumber: {type: Sequelize.STRING},
        address: {type: Sequelize.STRING,},
        address1: {type: Sequelize.STRING,},
        city: {type: Sequelize.STRING,},
        country:{type: Sequelize.STRING,},
        postalCode: {type: Sequelize.STRING,},
        deliverFee:{type: Sequelize.FLOAT,},
        totalPrice:{type: Sequelize.FLOAT,}
    });

module.exports = Cart;