const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Cart = db.define('cart',
    {
        title: { type: Sequelize.STRING },
        story: { type: Sequelize.STRING(2000) },
        language: { type: Sequelize.STRING },
        subtitles: { type: Sequelize.STRING, },
        author: { type: Sequelize.STRING },
        price: {type:Sequelize.INTEGER},
        quantity: {type:Sequelize.INTEGER},
        dateRelease: { type: Sequelize.DATE }
    });

module.exports = Cart;