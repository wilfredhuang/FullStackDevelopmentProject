const express = require('express');
const router = express.Router();
const cartItem = require("../models/CartItem");
const alertMessage = require('../helpers/messenger');

router.get('/', (req, res) => {
    const title = 'Bookstore Home Page';
    res.render('index', {            // renders views/index.handlebars
        title
    })
});

router.get('/index', (req, res) => {
    const title = 'Bookstore Home Page';
    res.render('index', {            // renders views/index.handlebars
        title
    })
});

router.get('/about', (req, res) => {
    const title = 'About Us';
    res.render('about', {            
        title
    })
});

router.get('/faq', (req, res) => {
    const title = 'FAQs';
    res.render('faq', {            
        title
    })
});

router.get('/privacy-policy', (req, res) => {
    const title = 'Privacy Policy';
    res.render('privacy-policy', {            
        title
    })
});

router.get('/terms-conditions', (req, res) => {
    const title = 'Terms and Conditions';
    res.render('terms-conditions', {            
        title
    })
});

//create Product page


//list Product Pages for Admin


//update existing product page
/* 
router.get('/', (req, res) => {
    const title = "Update Product"
    res.render('product/', {
        title
    })
});

*/
//Shipping Details Page
router.get('/shipping', (req, res) => {
    const title = 'Shipping';
    res.render('shipping', {            
        title
    })
});
/* later add this in
router.get('/product-single.html', (req, res) => {
    const title = 'Product-Single';
    res.render('product-single', {            
        title
    })
});
*/


//forgetPassword page
router.get('/forgetPassword', (req, res) => {
    const title = 'Forget Password';
    res.render('user/forgetPassword', {            
        title
    })
});

// // Exercise 2 solution
// router.get('/about', (req, res) => {
//     const author = 'Denzel Washington';
//     alertMessage(res, 'success', 'This is an important message', 'fas fa-sign-in-alt', true);
//     alertMessage(res, 'danger', 'Unauthorised access to video', 'fas fa-exclamation-circle', false);
//     let error = 'Error message using error object';
//     let errors = [{text:'First error message'}, {text:'Second error message'}, {text:'Third error message'}];
//     let success_msg = 'Success message!';
//     let error_msg = 'Error message using error_msg';

//     res.render('about', {            // renders views/about.handlebars, passing author as variable
//         author: author,
//         error: error,
//         errors: errors,
//         success_msg: success_msg,
//         error_msg: error_msg
//     })
// });


module.exports = router;