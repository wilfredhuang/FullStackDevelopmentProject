const Sequelize = require('sequelize');
const db = require('../config/DBConfig'); // added a ' here 

/* Creates a user(s) table in MySQL Database.     
Note that Sequelize automatically pleuralizes the entity name as the table name 
*/
const User = db.define('user', {
    name: { type: Sequelize.STRING },
    email: { type: Sequelize.STRING },
    password: { type: Sequelize.STRING },
    role: { type: Sequelize.STRING}

});
const facebookUser = db.define("facebookUser",{
    id: { type: Sequelize.STRING, primaryKey: true },
    token : { type: Sequelize.STRING },
    email: { type: Sequelize.STRING },
    name: { type: Sequelize.STRING },
})

module.exports = User; 
module.exports = facebookUser;