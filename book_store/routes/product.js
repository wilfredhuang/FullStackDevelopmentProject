const express = require('express');
const router = express.Router();
const moment = require('moment');
const product = require('../models/Product');
const productadmin = require('../models/ProductAdmin');
const cartItem = require('../models/CartItem');
const order = require('../models/Order');

const alertMessage=require('../helpers/messenger');
const Coupon = require('../models/coupon');


// Stripe Payment - secret key
const stripe = require('stripe')('sk_test_ns9DyHTray5Wihniw93C2ANH00IMJTVjKw', {
    apiVersion: '2020-03-02',
  });

const paynow = require('paynow-generator').paynowGenerator
const QRCode = require('qrcode');
const { CheckboxRadioContainer } = require('admin-bro');

// variables below for coupon feature, dont change - wilfred
// switched req.session.userCart to global variable @app.js
// const req.session.userCart = {}
let coupon_type;
let discount = 0;
let discount_limit = 0;
let discounted_price = 0;
let shipping_discount = 0;
let shipping_discount_limit = 0;
let shipping_discounted_price = 0;
let sub_discount = 0;
let sub_discount_limit = 0;
let sub_discounted_price = 0;
let full_total_price = 0;

router.get('/listProduct', (req, res) => {
    productadmin.findAll({
        order: [
            ['product_name', 'ASC']
        ],
        raw: true
    })
        .then((productadmin) => {
            res.render('products/listProduct', {
                productadmin: productadmin
            });
        })
});

router.get('/individualProduct/:id', (req, res) => {
    productadmin.findOne({
        where: {
            id: req.params.id
        }
    })
        .then((product) => {
            res.render('products/individualProduct', {
                product
            });
        })
});

router.get('/individualProduct2', (req, res) => {
    const title = 'Products';
    res.render('products/individualProduct2', {
        title
    })
});

router.get('/individualProduct3', (req, res) => {
    const title = 'Products';
    res.render('products/individualProduct3', {
        title
    })
});

router.get('/individualProduct4', (req, res) => {
    const title = 'Products';
    res.render('products/individualProduct4', {
        title
    })
});

router.post('/addProduct1', (req, res) => {
    let title = "7 DAY SELF PUBLISH HOW TO WRITE A BOOK";
    let price = 3.37;
    let amount = 1;
    product.create({
        title, price, amount,
    }).then((product) => {
        res.redirect('/product/listproduct')
    })
        .catch(err => console.log(err))
});

router.get('/createProduct', (req, res) => {
    const title = "Create Product"
    res.render('products/createProduct', {
        title
    })
});

router.post('/addProductAdmin', (req, res) => {
    let product_name = req.body.product_name;
    console.log(product_name)
    let author = req.body.author;
    let publisher = req.body.publisher;
    let genre = req.body.genre;
    let price = req.body.price;
    let stock = req.body.stock;
    let details = req.body.details;
    let weight = req.body.weight;
    let product_image = req.body.product_image;
    productadmin.create({
        product_name, author, publisher, genre, price, stock, details, weight,product_image,
    }).then((product) => {
        res.redirect('/product/listProductAdmin')
    })
        .catch(err => console.log(err))
});

router.get('/listProductAdmin', (req, res) => {
    productadmin.findAll({
        order: [
            ['product_name', 'ASC']
        ],
        raw: true
    })
        .then((productadmin) => {
            res.render('products/listProductAdmin', {
                productadmin: productadmin
            });
        })
});

router.get('/delete/:id', (req, res) => {
    productadmin.findOne({
        where: {
            id: req.params.id,
        },
    }).then((productadmin) => {
        productadmin.destroy({
            where: {
                id: req.params.id,
            }
        }).then((productadmin) => {
            res.redirect("/product/listProductAdmin");
        });
    })
});

router.get('/updateProductAdmin/:id', (req, res) => {
    productadmin.findOne({
        where: {
            id: req.params.id
        }
    })
        .then((product) => {
            res.render('products/updateProduct', {
                product
            });
        })
});

router.get('/detailsProductAdmin/:id', (req, res) => {
    productadmin.findOne({
        where: {
            id: req.params.id
        }
    })
        .then((product) => {
            res.render('products/detailsProduct', {
                product
            });
        })
});

router.put('/updateProductAdmin/:id', (req, res) => {
    let product_name = req.body.product_name;
    let author = req.body.author;
    let publisher = req.body.publisher;
    let genre = req.body.genre;
    let price = req.body.price;
    let stock = req.body.stock;
    let details = req.body.details;
    let weight = req.body.weight;
    let product_image = req.body.product_image;
    productadmin.update({
        product_name, author, publisher, genre, price, stock, details, weight,product_image,
    }, {
        where: {
            id: req.params.id
        }
    })
        .then(() => {
            res.redirect('/product/listProductAdmin')
        })
        .catch(err => console.log(err))
});

// Here is the start of Cart and Payment Features - Wilfred

router.get('/listproduct/:id', (req, res, next) => {
    // 'Add to Cart' button passes value of product id to server
    // queries product id with database
    // stores each cartitesm with id, name and quantity
    console.log("ADDDDDING")
    productadmin.findOne({
        where: {
            id: req.params.id // Button with name: id
        }
    })

    .then((product) => {
        var id = product.id;
        let name = product.product_name;
        let author = product.author;
        let publisher = product.publisher;
        let genre = product.genre;
        let price =product.price;
        let stock = product.stock;
        let details = product.details;
        let weight = product.weight;
        let image = product.product_image;

        console.log('ID IS ' + id)
        // if statement probably not working already due to length only available for array and not objects
        // however leave it as it works fine due to the else statement
        if (req.session.userCart.length < 1) {
            let qty = 1 
            // Image field not decided yet, the rest is done.
            // Double square bracket to store variable 'keys'
            req.session.userCart[[id]] = {"ID":id, "Name":name, "Author":author, "Publisher":publisher, "Genre":genre, "Price":price, "Stock":stock,
            "Weight":weight, "Image":image, "Quantity":qty, "SubtotalPrice":price, "SubtotalWeight":weight}
            console.log(req.session.userCart)
        }
    
        else {
            var check = false;
            for (z in req.session.userCart) {
                if (z == id) {
                    console.log("FOUND EXISTING PRODUCT IN CART")
                    req.session.userCart[z].Quantity += 1
                    req.session.userCart[z].SubtotalPrice = (parseFloat(req.session.userCart[z].SubtotalPrice) + parseFloat(product.price)).toFixed(2)
                    req.session.userCart[z].SubtotalWeight = (parseFloat(req.session.userCart[z].SubtotalWeight) + parseFloat(product.weight)).toFixed(2)
                    check = true;
                    console.log(req.session.userCart)
                }
            }
            if (check == false) {
                let qty = 1 
                // Again, the Image field not decided yet, the rest is done.
                // req.session.userCart[[id]] = {"ID":id, "Name":name, "Image":image, "Quantity":qty, "SubtotalPrice":product.price}
                req.session.userCart[[id]] = {"ID":id, "Name":name, "Author":author, "Publisher":publisher, "Genre":genre, "Price":price, "Stock":stock,
                "Weight":weight, "Image":image, "Quantity":qty, "SubtotalPrice":price, "SubtotalWeight":weight}
                console.log(req.session.userCart)
            }
        }
        req.session.save();
    })

    res.redirect('/product/listproduct')
    console.log("Added to cart");
    console.log(req.session.userCart);
});

// Add Cart - individual page

router.post('/individualProduct/:id', (req, res, next) => {
    // 'Add to Cart' button passes value of product id to server
    // queries product id with database
    // stores each cartitesm with id, name and quantity
    console.log("ADDDDDING")
    productadmin.findOne({
        where: {
            id: req.params.id // Button with name: id
        }
    })

    .then((product) => {
        var id = product.id;
        let name = product.product_name;
        let author = product.author;
        let publisher = product.publisher;
        let genre = product.genre;
        let price =product.price;
        let stock = product.stock;
        let details = product.details;
        let weight = product.weight;
        let image = product.product_image;

        console.log('ID IS ' + id)
        if (req.session.userCart.length < 1) {
            let qty = 1 
            // Image field not decided yet, the rest is done.
            req.session.userCart[[id]] = {"ID":id, "Name":name, "Author":author, "Publisher":publisher, "Genre":genre, "Price":price, "Stock":stock,
            "Weight":weight, "Image":image, "Quantity":qty, "SubtotalPrice":price, "SubtotalWeight":weight}
            console.log(req.session.userCart)
        }
    
        else {
            var check = false;
            for (z in req.session.userCart) {
                if (z == id) {
                    console.log("FOUND EXISTING PRODUCT IN CART")
                    req.session.userCart[z].Quantity += 1
                    req.session.userCart[z].SubtotalPrice = (parseFloat(req.session.userCart[z].SubtotalPrice) + parseFloat(product.price)).toFixed(2)
                    req.session.userCart[z].SubtotalWeight = (parseFloat(req.session.userCart[z].SubtotalWeight) + parseFloat(product.weight)).toFixed(2)
                    check = true;
                    console.log(req.session.userCart)
                }
            }
            if (check == false) {
                let qty = 1 
                // Again, the Image field not decided yet, the rest is done.
                // req.session.userCart[[id]] = {"ID":id, "Name":name, "Image":image, "Quantity":qty, "SubtotalPrice":product.price}
                req.session.userCart[[id]] = {"ID":id, "Name":name, "Author":author, "Publisher":publisher, "Genre":genre, "Price":price, "Stock":stock,
                "Weight":weight, "Image":image, "Quantity":qty, "SubtotalPrice":price, "SubtotalWeight":weight}
                console.log(req.session.userCart)
            }
        }
        req.session.save();
    })

    res.redirect(`/product/individualProduct/${req.params.id}`)
    console.log("Added to cart");
    console.log(req.session.userCart);
});

// Retrieve Cart
// Done
router.get('/cart', (req, res) => { 
    // let time = moment("2020-05-10", "YYYY/MM/DD");
    // let time2 = time.toString();
    // console.log(time2)
    
    // Get Subtotal Price of each item
    for (z in req.session.userCart) {
        req.session.userCart[z].SubtotalPrice = (req.session.userCart[z].Quantity * req.session.userCart[z].Price).toFixed(2);
    }
    
    for (z in req.session.userCart) {
        req.session.userCart[z].SubtotalWeight = (req.session.userCart[z].Quantity * req.session.userCart[z].Weight)
        // console.log(`Subtotal Weight is ${req.session.userCart[z].SubtotalWeight}`)
    }
    
    // Get the full subtotal price of all items
    let full_subtotal_price = 0;
    
    // Get full total price (Subtotal of all items + shipping after discounts(if any))
    // let full_total_price = 0;
    let shipping_fee = (10).toFixed(2);
    let total_weight = 0;
    let total_weight_oz = 0;
    
    for (z in req.session.userCart) {
        total_weight = total_weight + req.session.userCart[z].SubtotalWeight
    }
    
    // Round up to next number regardless of decimal value with ceil function
    total_weight_oz = Math.ceil((total_weight * 0.035274))
    
    if (coupon_type == "OVERALL") {
        console.log("Coupon TYPE IS OVERALL")
        for (z in req.session.userCart) {
            full_subtotal_price = (parseFloat(full_subtotal_price) + parseFloat(req.session.userCart[z].SubtotalPrice)).toFixed(2)
            console.log(full_subtotal_price)
        }
        discounted_price = ((parseFloat(full_subtotal_price) + parseFloat(shipping_fee)) * (parseFloat(discount))).toFixed(2)
        if (parseFloat(discounted_price) > parseFloat(discount_limit)) {
            discounted_price = discount_limit
            full_total_price = ((parseFloat(full_subtotal_price) + parseFloat(shipping_fee)) - parseFloat(discount_limit)).toFixed(2)
    }
        else {
            // full_total_price = (parseFloat(full_subtotal_price) + parseFloat(shipping_fee)).toFixed(2) * (1- parseFloat(discount)).toFixed(2)
            full_total_price = ((parseFloat(full_subtotal_price) + parseFloat(shipping_fee)) * (1.00 - parseFloat(discount))).toFixed(2)
        }
    }
    
    else if (coupon_type == "SHIP") {
        console.log("Coupon TYPE IS SHIP")
        for (z in req.session.userCart) {
            full_subtotal_price = (parseFloat(full_subtotal_price) + parseFloat(req.session.userCart[z].SubtotalPrice)).toFixed(2)
            console.log(full_subtotal_price)
        }
        shipping_discounted_price = parseFloat(shipping_fee) * (shipping_discount)
        if (parseFloat(shipping_discounted_price) > parseFloat(shipping_discount_limit)) {
            discounted_price = shipping_discount_limit
            shipping_fee = (parseFloat(shipping_fee) - parseFloat(discount_limit)).toFixed(2)
            full_total_price = (parseFloat(full_subtotal_price) + parseFloat(shipping_fee)).toFixed(2)
        }
    
        else {
            discounted_price = ((parseFloat(shipping_fee)) * (parseFloat(shipping_discount))).toFixed(2)
            shipping_fee = ((parseFloat(shipping_fee)) * (1-parseFloat(shipping_discount))).toFixed(2)
            full_total_price = (parseFloat(full_subtotal_price) + parseFloat(shipping_fee)).toFixed(2)
        }
    }
    
    else if (coupon_type == "SUB") {
        console.log("Coupon TYPE IS SUB")
        for (z in req.session.userCart) {
            full_subtotal_price = (parseFloat(full_subtotal_price) + parseFloat(req.session.userCart[z].SubtotalPrice)).toFixed(2)
            console.log(full_subtotal_price)
        }
        sub_discounted_price = parseFloat(full_subtotal_price) * (sub_discount)
        if (parseFloat(sub_discounted_price) > parseFloat(sub_discount_limit)) {
            discounted_price = sub_discount_limit
            console.log(full_subtotal_price)
            full_subtotal_price = (parseFloat(full_subtotal_price) - parseFloat(sub_discount_limit)).toFixed(2)
            console.log(full_subtotal_price)
            full_total_price = (parseFloat(full_subtotal_price) + parseFloat(shipping_fee)).toFixed(2)
        }
    
        else {
            discounted_price = (parseFloat(full_subtotal_price) * parseFloat(sub_discount)).toFixed(2)
            full_subtotal_price = (parseFloat(full_subtotal_price) * parseFloat(1 - sub_discount)).toFixed(2)
            full_total_price = (parseFloat(full_subtotal_price) + parseFloat(shipping_fee)).toFixed(2)
        }
    
    }
    
    else {
        for (z in req.session.userCart) {
            full_subtotal_price = (parseFloat(full_subtotal_price) + parseFloat(req.session.userCart[z].SubtotalPrice)).toFixed(2)
            console.log(full_subtotal_price)
        }
        full_total_price = (parseFloat(full_subtotal_price) + parseFloat(shipping_fee)).toFixed(2)
    }
    
    res.render('checkout/cart', {
        discount,
        discounted_price,
        full_subtotal_price,
        full_total_price,
        shipping_fee,
        total_weight,
        total_weight_oz
        })
    });


// Cart Coupon
router.post('/applyCoupon', (req,res) => {
    Coupon.findOne({
        where: {code: req.body.coupon}
    })

    .then((coupon) => {
        console.log(coupon.code)
        coupon_type = coupon.type
        alertMessage(res, 'success', 'code ' + req.body.coupon + ' applied', 'fas fa-exclamation-circle', true)
        if (coupon_type == "OVERALL") {
            discount = coupon.discount;
            discount_limit = coupon.limit;
            alertMessage(res, 'success', `${(coupon.discount * 100)}% off your total order (save up to $${coupon.limit})`, 'fas fa-exclamation-circle', true)
        }
        else if (coupon_type == "SHIP" ) {
            shipping_discount = coupon.discount
            shipping_discount_limit = coupon.limit
            alertMessage(res, 'success', `${(coupon.discount * 100)}% off your total shipping fee (save up to $${coupon.limit})`, 'fas fa-exclamation-circle', true)
        }

        else if (coupon_type == "SUB") {
            sub_discount = coupon.discount
            sub_discount_limit = coupon.limit
            alertMessage(res, 'success', `${(coupon.discount * 100)}% off your subtotal (excluding shipping) (save up to $${coupon.limit})`, 'fas fa-exclamation-circle', true)
        }
        // discount = coupon.discount;
        // discount_limit = coupon.limit;
        res.redirect("cart")
    })

    .catch(()=> {
        alertMessage(res, 'danger', 'code ' + req.body.coupon + ' is invalid', 'fas fa-exclamation-circle', true)
        res.redirect("cart")
    })
})

//

// Update Cart / Proceed to Checkout
router.post('/cart', (req, res) => {
    if (req.body.checkoutButton == "Update") { 
        for (ID in req.session.userCart) {
            let query = req.body["Q"+ID]
            console.log("Queried Quantity is " + query)
            req.session.userCart[ID].Quantity = query
            // newSubTotal = query * req.session.userCart[ID].SubtotalPrice
            // console.log("Q is" + req.body["Q" + ID])

        }
        console.log(req.session.userCart)
        res.redirect('cart');
    }

    else {
        res.redirect('checkout')
    }
})

// Delete Item in Cart

router.get('/deleteCartItem/:id', (req, res) => {
    console.log(req.session.userCart[req.params.id])
    console.log(req.params.id)
    console.log('Before Delete' + req.session.userCart)
    delete req.session.userCart[req.params.id];
    console.log('After Delete' + req.session.userCart)
    alertMessage(res, 'success', req.params.id + ' is successfully deleted', 'fas fa-sign-in-alt', true)
    res.redirect('/product/cart');
});

router.get('/checkout', (req, res) => {
    console.log("Full total price is " + full_total_price);
    const paymentIntent = stripe.paymentIntents.create({
        amount: Math.ceil((full_total_price * 100)),
        currency: 'sgd',
        payment_method_types: ['card'],
        receipt_email:'whjw1536@gmail.com',
    })

    .then((paymentIntent) => {
        console.log(paymentIntent)
        console.log("Client secret is " + paymentIntent.client_secret)
        res.render('checkout/checkout', { client_secret: paymentIntent.client_secret });
    })
});

router.post('/checkout', (req, res) => {
    let fullName = req.body.fullName
    let phoneNumber = req.body.phoneNumber
    let address = req.body.address
    let address1 = req.body.address1
    let city = req.body.city
    let country = req.body.country
    let postalCode = req.body.postalCode
    // create order
    order.create({
        fullName, phoneNumber, address, address1, city, country, postalCode
    })
    alertMessage(res, 'success', 'Order placed', 'fas fa-exclamation-circle', true)
    res.redirect('/')
});




router.get('/paynow', (req,res) => {
    // let payNowString = paynow('proxyType','proxyValue','edit',price,'merchantName','additionalComments')
    let payNowString = paynow('mobile','87558054','no',0.10,'Test Merchant Name','Testing paynow, hope it works')
    let qr = QRCode.toDataURL(payNowString)
    .then(url => {
    //   console.log(url)
      res.render('checkout/paynow', {
        payNowString,
        qr,
        url
    })

    })
    .catch(err => {
      console.error(err)
    });
});

// 
// router.post('/checkout', (req, res) => {
//     let fullName = req.body.fullName
//     let phoneNumber = req.body.phoneNumber
//     let address = req.body.address
//     let address1 = req.body.address1
//     let city = req.body.city
//     let country = req.body.country
//     req.session.country = req.body.country
//     let country = req.session.country
//     let postalCode = req.body.postalCode
//     console.log("country is " +  country)
//     // create order
//     order.create({
//         fullName, phoneNumber, address, address1, city, country, postalCode
//     })
//     alertMessage(res, 'success', 'Order placed', 'fas fa-exclamation-circle', true)
//     res.redirect('/')
//     // order.create({
//     //     fullName, phoneNumber, address, address1, city, country, postalCode
//     // })
//     // alertMessage(res, 'success', 'Order placed', 'fas fa-exclamation-circle', true)
//     res.redirect('selectPayment')
// });

// router.get('/selectPayment', (req, res) => {
//     // using helper 'isSg' to determine if paynow option should be displayed when country session variable is 'Singapore'
//     country = req.session.country
//     res.render('checkout/selectPayment',{
//         country
//     })
// })


// router.post('/selectPayment', (req, res) => {
//     res.redirect('paynow')
// })

// router.get('/paynow', (req,res) => {
//     // let payNowString = paynow('proxyType','proxyValue','edit',price,'merchantName','additionalComments')
//     let payNowString = paynow('mobile','testnum','no',0.10,'Test Merchant Name','Testing paynow, hope it works')
//     let payNowString = paynow('mobile','87558054','no',0.10,'Test Merchant Name','Testing paynow, hope it works')
//     // let testvar = req.session.testvar
//     let qr = QRCode.toDataURL(payNowString)
//     .then(url => {
//     //   console.log(url)
// router.get('/paynow', (req,res) => {
//     });
// });




module.exports = router;

