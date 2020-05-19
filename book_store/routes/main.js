const express = require('express');
const router = express.Router();

const alertMessage = require('../helpers/messenger');

router.get('/', (req, res) => {
    const title = 'Bookstore Home Page';
    res.render('index', {            // renders views/index.handlebars
        title
    })
});

router.get('/index.html', (req, res) => {
    const title = 'Bookstore Home Page';
    res.render('index', {            // renders views/index.handlebars
        title
    })
});

router.get('/about.html', (req, res) => {
    const title = 'About Us';
    res.render('about', {            
        title
    })
});

router.get('/faq.html', (req, res) => {
    const title = 'FAQs';
    res.render('faq', {            
        title
    })
});

router.get('/shop.html', (req, res) => {
    const title = 'FAQs';
    res.render('shop', {            
        title
    })
});

router.get('/privacy-policy.html', (req, res) => {
    const title = 'Privacy Policy';
    res.render('privacy-policy', {            
        title
    })
});

router.get('/terms-conditions.html', (req, res) => {
    const title = 'Terms and Conditions';
    res.render('terms-conditions', {            
        title
    })
});

router.get('/products.html', (req, res) => {
    const title = 'Products';
    res.render('products', {            
        title
    })
});

router.get('/shipping.html', (req, res) => {
    const title = 'Shipping';
    res.render('shipping', {            
        title
    })
});

router.get('/product-single.html', (req, res) => {
    const title = 'Product-Single';
    res.render('product-single', {            
        title
    })
});

router.get('/login.html', (req, res) => {
    const title = 'Login Page';
    res.render('user/login', {            
        title
    })
});

router.get('/register.html', (req, res) => {
    const title = 'Registration Page';
    res.render('user/register', {            
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