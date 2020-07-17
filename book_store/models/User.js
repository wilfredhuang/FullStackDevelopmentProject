
const Sequelize = require('sequelize');
const db = require('../config/DBConfig'); // added a ' here 

/* Creates a user(s) table in MySQL Database.     
Note that Sequelize automatically pleuralizes the entity name as the table name 
*/
const User = db.define('user', {
    id: { type: Sequelize.STRING, primaryKey: true },
    name: { type: Sequelize.STRING },
    email: { type: Sequelize.STRING },
    password: { type: Sequelize.STRING },
    isadmin: { type: Sequelize.BOOLEAN},
    facebookId: { type: Sequelize.STRING },
    facebookToken : { type: Sequelize.STRING }
});

module.exports = User; 

