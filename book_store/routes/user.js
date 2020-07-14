const express = require('express');
const router = express.Router();
// User register URL using HTTP post => /user/register
const User = require('../models/User');
const alertMessage = require('../helpers/messenger');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const cartItem = require("../models/CartItem");
const order = require("../models/Order");

//EasyPost API
const EasyPost = require("@easypost/api");
const apiKey = "EZTK29b55ab4ee7a437890e19551520f5dd0uaJjPiW9XsVqXYFNVI0kog"; //EasyPost API
const api = new EasyPost(apiKey);

const ensureAuthenticated = require('../helpers/auth');

router.get("/auth/facebook", passport.authenticate("facebook",{scope: 'email'}));

router.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", {
      successRedirect: "/",
      failureRedirect: "/login"
    })
  );

router.get('/userPage',(req, res) => {
    const title = 'User Information';
    res.render("user/userpage", {
        title
    });
});

router.get('/userRecentOrder', (req, res) => {
    const title = 'Order History';
    order.findAll({
        // where:{
        //     userId: req.user.id,
        // }
    })
    .then((order) => {
        //console.log(order)
        // var i;
        // for (i = 0; i<order.length; i++){
        //     console.log(i,"th")
        //     console.log(order[i].dataValues)
        //     let shipmentId = order[i].dataValues.shipmentId
        //     api.Shipment.retrieve(shipmentId).then(console.log);
        // }
        
        //console.log(order[0].dataValues)
        console.log("===================================")
        let shipmentIdInfo = order[0].dataValues.shippingId
        console.log('hello')
        console.log()
        api.Shipment.retrieve(shipmentIdInfo)//.then((o)=>{
            //console.log(o)
            // let dateReceived = o.tracker.est_delivery_date
            // console.log(dateReceived)
            res.render("user/userRecentOrder", {
                order:order,
                title
            });
        //});
        console.log("boi")
        
    })
    .catch(err => console.log(err));
});

router.get('/userCart', (req, res) => {
    const title = 'Cart';
    cartItem.findAll({
        //where:{
          //  userId = req.user.id,
        //},
    })
    .then((cartItem) =>{
    res.render("user/userCart", {
        cartItem:cartItem,
        title
    });
})
});


// Ignore, from practical 


// router.post('/register', (req, res) => {
//     let errors = [];
//     // Retrieves fields from register page from request body
//     let { name, email, password, password2 } = req.body;
//     // Checks if both passwords entered are the same
//     if (password !== password2) {
//         errors.push({ text: 'Passwords do not match' });
//     }

//     // Checks that password length is more than 4
//     if (password.length < 4) {
//         errors.push({ text: 'Password must be at least 4 characters' })
//     }

//     if (errors.length > 0) {
//         res.render('user/register', {
//             errors,
//             name,
//             email,
//             password,
//             password2,
//         });
//     }

//     else {
//         // if all is well, checks if user is already registered
//         User.findOne({ where: { email: req.body.email } })
//             .then(user => {
//                 if (user) {
//                     // If user is found, means email has already been registered
//                     res.render('user/register', {
//                         error: user.email + 'already registered',
//                         name,
//                         email,
//                         password,
//                         password2
//                     });
//                 } 
//                 else {
//                     // Create new user account
//                     bcrypt.genSalt(10, function(err, salt) {
//                         bcrypt.hash(password, salt, function(err, hash) {
//                             User.create({ name, email, password: hash })
//                                 .then(user => {
//                                     alertMessage(res, 'success', user.name + ' added. Please login', 
//                                     'fas fa-sign-in-alt', true);
//                                     res.redirect('/showLogin');
//                                 })
//                                 .catch(err => console.log(err));
//                         });
//                     });
//                 }
//             });
//         }
//     });

// // Login Form POST => /user/login
// router.post('/login', (req, res, next) => {
//     passport.authenticate('local', {
//         successRedirect: '/video/listVideos', // Route to /video/listVideos URL
//         failureRedirect: '/user/login', // Route to /login URL
//         failureFlash: true
//         /* Setting the failureFlash option to true instructs Passport to flash an error message using the
//        message given by the strategy's verify callback, if any. When a failure occur passport passes the message
//        object as error */
//     })(req, res, next);
// });
router.get('/login', (req, res) => {
	res.render('user/login'); 
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/', 
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/register', (req, res) => {
	res.render('user/register'); 
});

router.post('/register', (req, res) => {
    errors = [];
    let {email,name, password, password2 } = req.body;
    if (password !== password2){
        errors.push({ text: 'Passwords do not match' });
    }
    if (password.length < 4) {
        errors.push({ text: 'Password must be at least 4 characters' });
    }
    if (errors.length > 0) {
        res.render('user/register', {
            errors,
            name,
            email,
            password,
            password2
        });
    }
    else {
        User.findOne({ where: { email: req.body.email } })
            .then(user => {
                if (user) {
                    res.render('user/register', {
                        error: user.email + ' already registered',
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    bcrypt.genSalt(10, function(err, salt) {
                        if (err) return next(err);
                        bcrypt.hash(password, salt, function(err, hash) {
                            if (err) return next(err);
                             password = hash;
                             role = "user";
                             User.create({ name, email, password,role})
                                .then(user => {
                                    alertMessage(res, 'success', user.name + ' added.Please login', 'fas fa-sign-in-alt', true);
                                    res.redirect('/user/login');
                                })
                                .catch(err => console.log(err));                            
                        });
                    });
                }
            });
    }
});

router.get('/userPage',ensureAuthenticated,(req,res) =>{
    res.render('user/register'); 
});

router.get('/userPage/changeinfo',ensureAuthenticated,(req,res) =>{
    res.render('user/changeinfo');
});

module.exports = router;