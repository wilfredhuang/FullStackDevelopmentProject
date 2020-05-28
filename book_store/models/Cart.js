const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Cart = db.define('cart',
    {
        title: { type: Sequelize.STRING },
        story: { type: Sequelize.STRING(2000) },
        language: { type: Sequelize.STRING },
        subtitles: { type: Sequelize.STRING, },
        author: { type: Sequelize.STRING },
        price: {type:Sequelize.FLOAT},
        quantity: {type:Sequelize.INTEGER},
        dateOrder: { type: Sequelize.DATE },
        address: {type: Sequelize.STRING},
        address1: {type: Sequelize.STRING},
        country:{type: Sequelize.STRING},
        deliverFee:{type: Sequelize.FLOAT},
        totalPrice:{type: Sequelize.FLOAT}
    });

module.exports = Cart;