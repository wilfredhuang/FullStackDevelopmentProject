const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Pending_Order = db.define('pending_order',
    {
        fullName: {type: Sequelize.STRING,},
        phoneNumber: {type: Sequelize.STRING},
        address: {type: Sequelize.STRING,},
        address1: {type: Sequelize.STRING,},
        city: {type: Sequelize.STRING,},
        country:{type: Sequelize.STRING,},
        postalCode: {type: Sequelize.STRING,},
        deliverFee:{type: Sequelize.FLOAT,},
        totalPrice:{type: Sequelize.FLOAT,},    
        shippingId:{type:Sequelize.STRING},
        addressId:{type: Sequelize.STRING,},
        trackingId:{type: Sequelize.STRING,},
        trackingCode:{type: Sequelize.STRING,},
        dateStart:{type: Sequelize.DATE,},
        dateEnd:{type:Sequelize.DATE,},
        deliveryStatus:{type:Sequelize.STRING,},
         /** 
         * 
         *  might need to add more things over here
         */
    });

module.exports = Pending_Order;