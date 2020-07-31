const mySQLDB = require('./DBConfig');
const user = require('../models/User');
const cartItem = require('../models/CartItem');
const order = require('../models/Order'); 

// If drop is true, all existing tables are dropped and recreated 
const setUpDB = (drop) => {
    mySQLDB.authenticate()
        .then(() => {
            console.log('Bookshop database connected');
        })
        .then(() => {
            /*               Defines the relationship where a user has many videos.               
            In this case the primary key from user will be a foreign key               
            in video.             */

            //user.hasMany
            //order.hasMany(cartItem);

            //Priority work by Hasan 31/7/2020
            //user.hasMany(order)
            mySQLDB.sync({ // Creates table if none exists                 
                force: drop
            })
                .then(() => {
                    console.log('Create tables if none exists')
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log('Error: ' + err));
};


module.exports = { setUpDB };