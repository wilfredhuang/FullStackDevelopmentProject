const express = require('express');
const router = express.Router();
const moment = require('moment');
const product = require('../models/Product');
const productadmin = require('../models/ProductAdmin');
const cartItem = require('../models/CartItem');
const order = require('../models/Order');
const User = require('../models/User');

const alertMessage = require('../helpers/messenger');
const Coupon = require('../models/coupon');
const Discount = require('../models/Discount');


// Stripe Payment - secret key
const stripe = require('stripe')('sk_test_ns9DyHTray5Wihniw93C2ANH00IMJTVjKw', {
    apiVersion: '2020-03-02',
});

const paynow = require('paynow-generator').paynowGenerator
const QRCode = require('qrcode');
const { CheckboxRadioContainer } = require('admin-bro');
const ProductAdmin = require('../models/ProductAdmin');

// variables below for coupon feature, dont change - wilfred
// switched req.session.userCart to global variable @app.js
// const req.session.userCart = {}

router.get('/listProduct', (req, res) => {
    const navStatusProduct = "active";
    productadmin.findAll({
        order: [
            ['product_name', 'ASC']
        ]
    })
        .then((productadmin) => {
            res.render('products/listProduct', {
                productadmin: productadmin,
                navStatusProduct
            });
        })
});

router.get('/individualProduct/:id', (req, res) => {
    // Discount.findOne({
    //     where: {
    //         uid: req.params.id
    //     }
    // }).then((discount) => {
    //     let disc = discount;
    //     productadmin.findOne({
    //         where: {
    //             id: req.params.id
    //         }
    //     })
    //         .then((product) => {
    //             res.render('products/individualProduct', {
    //                 product,
    //                 disc
    //             });
    //         })
    // })
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
        product_name, author, publisher, genre, price, stock, details, weight, product_image,
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
        product_name, author, publisher, genre, price, stock, details, weight, product_image,
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

// Add to Cart from 'List of Products Page'
router.get('/listproduct/:id', async (req, res, next) => {
    // 'Add to Cart' button passes value of product id to server
    // queries product id with database
    // stores each cartitesm with id, name and quantity

    // Check for the expiry of the discount if discount exists
    var disc_object = await Discount.findOne({ where: { target_id: req.params.id } })
    if (disc_object != null) {
        let expiry_time = moment(disc_object.expiry)
        let current_time = moment()
        if (current_time.isAfter(expiry_time)) {
            await disc_object.destroy();
            disc_object = null;
            console.log(disc_object)
        }
    }
    var product = await productadmin.findOne({ where: { id: req.params.id } })
    var id = product.id;
    let name = product.product_name;
    let author = product.author;
    let publisher = product.publisher;
    let genre = product.genre;
    let price = product.price;
    let stock = product.stock;
    let details = product.details;
    let weight = product.weight;
    let image = product.product_image;


    var check = false;

    for (z in req.session.userCart) {
        if (disc_object != null && z == id) {
            console.log("FOUND EXISTING PRODUCT IN CART")
            console.log("Quantity is " + req.session.userCart[z].Quantity)
            console.log("Discount Criteria FOUND for " + req.session.userCart[z].Name)
            req.session.userCart[z].Quantity += 1
            // special is the number of times the special offer can be applied, i.e 
            // if discount is for every 3 items and i have 10 items, special will be 10 / 3 rounded down to 3
            let special = Math.floor(req.session.userCart[z].Quantity / disc_object.min_qty)
            if (special != 0) {
                console.log(`Special Value : ${special}`)
                alertMessage(res, 'success', `Special Offer for this product applied ${special} times`, 'fas fa-exclamation-circle', false)
            }
            let first_half = (((special * disc_object.min_qty * req.session.userCart[z].Price) * (1 - disc_object.discount_rate)))
            let second_half = ((req.session.userCart[z].Quantity - (special * disc_object.min_qty)) * req.session.userCart[z].Price)
            req.session.userCart[z].SubtotalPrice = (first_half + second_half).toFixed(2)
            discounted_value = ((req.session.userCart[z].Quantity * req.session.userCart[z].Price) - (first_half + second_half)).toFixed(2)
            console.log("DEDUCTED VALUE IS " + discounted_value)
            console.log("AFTER SPECIAL DISCOUNT " + ` Subtotal is ${req.session.userCart[z].SubtotalPrice}`)

            req.session.userCart[z].SubtotalWeight = (parseFloat(req.session.userCart[z].SubtotalWeight) + parseFloat(product.weight)).toFixed(2)
            check = true;
            // console.log(req.session.userCart)
        }

        else if (disc_object == null && z == id) {
            console.log("FOUND EXISTING PRODUCT IN CART")
            console.log("Quantity is " + req.session.userCart[z].Quantity)
            req.session.userCart[z].Quantity += 1
            req.session.userCart[z].SubtotalPrice = (parseFloat(req.session.userCart[z].SubtotalPrice) + parseFloat(product.price)).toFixed(2)
            req.session.userCart[z].SubtotalWeight = (parseFloat(req.session.userCart[z].SubtotalWeight) + parseFloat(product.weight)).toFixed(2)
            check = true;
            // console.log(req.session.userCart)
        }
    }
    if (check == false) {
        console.log("Adding New Cart Item")
        let qty = 1
        req.session.userCart[[id]] = {
            "ID": id, "Name": name, "Author": author, "Publisher": publisher, "Genre": genre, "Price": price, "Stock": stock,
            "Weight": weight, "Image": image, "Quantity": qty, "SubtotalPrice": price, "SubtotalWeight": weight
        }
        // console.log(req.session.userCart)
    }

    res.redirect('/product/listproduct')
    console.log("Added to cart");
    console.log(req.session.userCart);
})


// Add to Cart - individual page

router.post('/individualProduct/:id', async (req, res, next) => {
    // 'Add to Cart' button passes value of product id to server
    // queries product id with database
    // stores each cartitesm with id, name and quantity

    // Check for the expiry of the discount if discount exists
    var disc_object = await Discount.findOne({ where: { target_id: req.params.id } })
    if (disc_object != null) {
        let expiry_time = moment(disc_object.expiry)
        let current_time = moment()
        if (current_time.isAfter(expiry_time)) {
            await disc_object.destroy();
            disc_object = null;
            console.log(disc_object)
        }
    }
    var product = await productadmin.findOne({ where: { id: req.params.id } })
    var id = product.id;
    let name = product.product_name;
    let author = product.author;
    let publisher = product.publisher;
    let genre = product.genre;
    let price = product.price;
    let stock = product.stock;
    let details = product.details;
    let weight = product.weight;
    let image = product.product_image;


    var check = false;

    for (z in req.session.userCart) {
        if (disc_object != null && z == id) {
            console.log("FOUND EXISTING PRODUCT IN CART")
            console.log("Quantity is " + req.session.userCart[z].Quantity)
            console.log("Discount Criteria FOUND for " + req.session.userCart[z].Name)
            req.session.userCart[z].Quantity += 1
            // special is the number of times the special offer can be applied, i.e 
            // if discount is for every 3 items and i have 10 items, special will be 10 / 3 rounded down to 3
            let special = Math.floor(req.session.userCart[z].Quantity / disc_object.min_qty)
            if (special != 0) {
                console.log(`Special Value : ${special}`)
                alertMessage(res, 'success', `Special Offer for this product applied ${special} times`, 'fas fa-exclamation-circle', false)
            }
            let first_half = (((special * disc_object.min_qty * req.session.userCart[z].Price) * (1 - disc_object.discount_rate)))
            let second_half = ((req.session.userCart[z].Quantity - (special * disc_object.min_qty)) * req.session.userCart[z].Price)
            req.session.userCart[z].SubtotalPrice = (first_half + second_half).toFixed(2)
            discounted_value = ((req.session.userCart[z].Quantity * req.session.userCart[z].Price) - (first_half + second_half)).toFixed(2)
            console.log("DEDUCTED VALUE IS " + discounted_value)
            console.log("AFTER SPECIAL DISCOUNT " + ` Subtotal is ${req.session.userCart[z].SubtotalPrice}`)

            req.session.userCart[z].SubtotalWeight = (parseFloat(req.session.userCart[z].SubtotalWeight) + parseFloat(product.weight)).toFixed(2)
            check = true;
            // console.log(req.session.userCart)
        }

        else if (disc_object == null && z == id) {
            console.log("FOUND EXISTING PRODUCT IN CART")
            console.log("Quantity is " + req.session.userCart[z].Quantity)
            req.session.userCart[z].Quantity += 1
            req.session.userCart[z].SubtotalPrice = (parseFloat(req.session.userCart[z].SubtotalPrice) + parseFloat(product.price)).toFixed(2)
            req.session.userCart[z].SubtotalWeight = (parseFloat(req.session.userCart[z].SubtotalWeight) + parseFloat(product.weight)).toFixed(2)
            check = true;
            // console.log(req.session.userCart)
        }
    }
    if (check == false) {
        console.log("Adding New Cart Item")
        let qty = 1
        req.session.userCart[[id]] = {
            "ID": id, "Name": name, "Author": author, "Publisher": publisher, "Genre": genre, "Price": price, "Stock": stock,
            "Weight": weight, "Image": image, "Quantity": qty, "SubtotalPrice": price, "SubtotalWeight": weight
        }
        // console.log(req.session.userCart)
    }

    // res.send('POST recieved', 200);
    // res.end();
    // return next();
    // return res.json({
    //     success: true,
    //     message: "Some success message"
    // });
    res.redirect(`/product/individualProduct/${req.params.id}`)
    console.log("Added to cart");
    console.log(req.session.userCart);
});

// POST request before redirecting to Cart
// Why? Because when a session update the cart, session variable is updated, but the
// contents displayed on the page won't show unless we refresh once more (Reason: Unknown)
// Using this POST request to handle and update the information instead of router.get will solve that problem
router.post('/goToCart', (req, res) => {
    req.session.full_subtotal_price = 0;
    req.session.shipping_fee = (0).toFixed(2);
    let total_weight = 0;
    let total_weight_oz = 0;
    req.session.full_total_price = 0;
    if (req.session.coupon_type == "OVERALL") {
        console.log("Coupon TYPE IS OVERALL")
        for (z in req.session.userCart) {
            req.session.full_subtotal_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.userCart[z].SubtotalPrice)).toFixed(2)
            console.log(req.session.full_subtotal_price)
        }
        req.session.discounted_price = ((parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)) * (parseFloat(req.session.discount))).toFixed(2)
        if (parseFloat(req.session.discounted_price) > parseFloat(req.session.discount_limit)) {
            req.session.discounted_price = req.session.discount_limit
            req.session.full_total_price = ((parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)) - parseFloat(req.session.discount_limit)).toFixed(2)
        }
        else {
            // req.session. = (parseFloat(full_subtotal_price) + parseFloat(req.session.shipping_fee)).toFixed(2) * (1- parseFloat(discount)).toFixed(2)
            req.session.full_total_price = ((parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)) * (1.00 - parseFloat(req.session.discount))).toFixed(2)
        }
    }

    else if (req.session.coupon_type == "SHIP") {
        console.log("Coupon TYPE IS SHIP")
        for (z in req.session.userCart) {
            req.session.full_subtotal_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.userCart[z].SubtotalPrice)).toFixed(2)
            console.log(req.session.full_subtotal_price)
        }
        req.session.req.shipping_discounted_price = parseFloat(req.session.shipping_fee) * (req.shipping_discount)
        if (parseFloat(req.session.req.shipping_discounted_price) > parseFloat(req.session.req.shipping_discount_limit)) {
            req.session.discounted_price = req.session.req.shipping_discount_limit
            req.session.shipping_fee = (parseFloat(req.session.shipping_fee) - parseFloat(req.session.discount_limit)).toFixed(2)
            req.session.full_total_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)).toFixed(2)
        }

        else {
            req.session.discounted_price = ((parseFloat(req.session.shipping_fee)) * (parseFloat(req.shipping_discount))).toFixed(2)
            req.session.shipping_fee = ((parseFloat(req.session.shipping_fee)) * (1 - parseFloat(req.shipping_discount))).toFixed(2)
            req.session.full_total_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)).toFixed(2)
        }
    }

    else if (req.session.coupon_type == "SUB") {
        console.log("Coupon TYPE IS SUB")
        for (z in req.session.userCart) {
            req.session.full_subtotal_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.userCart[z].SubtotalPrice)).toFixed(2)
            console.log(req.session.full_subtotal_price)
        }
        req.session.discounted_price = parseFloat(req.session.full_subtotal_price) * (req.session.sub_discount)
        if (parseFloat(req.session.discounted_price) > parseFloat(req.session.discount_limit)) {
            req.session.discounted_price = req.session.discount_limit
            console.log(req.session.full_subtotal_price)
            req.session.full_subtotal_price = (parseFloat(req.session.full_subtotal_price) - parseFloat(req.session.discount_limit)).toFixed(2)
            console.log(req.session.full_subtotal_price)
            req.session.full_total_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)).toFixed(2)
        }

        else {
            req.session.discounted_price = (parseFloat(req.session.full_subtotal_price) * parseFloat(req.session.sub_discount)).toFixed(2)
            req.session.full_subtotal_price = (parseFloat(req.session.full_subtotal_price) * parseFloat(1 - req.session.sub_discount)).toFixed(2)
            req.session.full_total_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)).toFixed(2)
        }

    }

    else {
        req.session.discounted_price = (0).toFixed(2);
        for (z in req.session.userCart) {
            req.session.full_subtotal_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.userCart[z].SubtotalPrice)).toFixed(2)
            console.log(req.session.full_subtotal_price)
        }
        req.session.full_total_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)).toFixed(2)
    }

    res.redirect('cart')
})

// Retrieve Cart
// Make sure to use POST request to handle updated cart info or you need to double refresh

router.get('/cart', (req, res) => {
    let title = "Shopping Cart"
    // let time = moment("2020-05-10", "YYYY/MM/DD");
    // let time2 = time.toString();
    // console.log(time2)
    // Get Subtotal Price of each item


    // for (z in req.session.userCart) {
    //     req.session.userCart[z].SubtotalPrice = (req.session.userCart[z].Quantity * req.session.userCart[z].Price).toFixed(2);
    // }

    for (z in req.session.userCart) {
        req.session.userCart[z].SubtotalWeight = (req.session.userCart[z].Quantity * req.session.userCart[z].Weight)
    }

    // Get the full subtotal price of all items
    // req.session.full_subtotal_price = 0;

    // Get full total price (Subtotal of all items + shipping after discounts(if any))
    // let req.session. = 0;
    req.session.shipping_fee = (0).toFixed(2);
    let total_weight = 0;
    let total_weight_oz = 0;

    for (z in req.session.userCart) {
        total_weight = total_weight + req.session.userCart[z].SubtotalWeight
    }

    var discounts = Discount.findAll({})



    // Round up to next number regardless of decimal value with ceil function
    total_weight_oz = Math.ceil((total_weight * 0.035274))

    res.render('checkout/cart', {
        total_weight,
        total_weight_oz,
        discounts,
        title
    })
});


// Cart Coupon
router.post('/applyCoupon', (req, res) => {
    // Check if coupon expired already or not
    if (req.session.public_coupon != null) {
        Coupon.findAll({
            // order: [['id', 'ASC']],
        })
            .then((coupons) => {
                for (c in coupons) {
                    // Mistake: used 'c.destroy()' instead of 'coupons[c].destroy()'
                    // let current_time = moment('DD/MM/YYYY, hh:mm:ss a')
                    let expiry_time = moment(coupons[c].expiry)
                    let current_time = moment()
                    // If Coupon expired is public
                    // if (current_time.isAfter(expiry_time) && req.session.public_coupon.code == coupons[c].expiry.code) {
                    //     coupons[c].destroy();
                    //     console.log("Session public coupon is " + req.session.public_coupon)
                    //     console.log("Destroying session variable")
                    //     req.session.public_coupon = null;
                    //     console.log("Now Session public coupon is " + req.session.public_coupon)
                    //     res.locals.public_coupon = null;
                    //     req.session.save();
                    // }

                    if (current_time.isAfter(expiry_time)) {
                        // Check if there is an existing public coupon
                        if (req.session.public_coupon != null) {
                            if (coupons[c].code == req.session.public_coupon.code) {
                                console.log("Setting session var to NULL")
                                req.session.public_coupon = null;
                            }
                        }
                        console.log("Destroying Coupon Code " + coupons[c].code)
                        coupons[c].destroy();
                        req.session.save();
                        console.log("Public Coupon is now " + req.session.public_coupon + " should be NULL")
                    }
                    else {
                        console.log(current_time.format('DD/MM/YYYY, hh:mm:ss a'))
                        console.log(expiry_time.format('DD/MM/YYYY, hh:mm:ss a'))
                        console.log("Current Time is " + current_time)
                        console.log("Expiry Time is " + coupons[c].expiry)
                        console.log("Expiry Time is  " + expiry_time)
                    }
                }

            })

            .then(() => {
                Coupon.findOne({
                    where: { code: req.body.coupon }
                })

                    .then((coupon) => {
                        console.log(coupon.code)
                        req.session.coupon_type = coupon.type
                        alertMessage(res, 'success', 'code ' + req.body.coupon + ' applied', 'fas fa-exclamation-circle', true)
                        if (req.session.coupon_type == "OVERALL") {
                            req.session.discount = coupon.discount;
                            req.session.discount_limit = coupon.limit;
                            alertMessage(res, 'success', `${(coupon.discount * 100)}% off your total order (save up to $${coupon.limit})`, 'fas fa-exclamation-circle', true)
                        }
                        else if (req.session.coupon_type == "SHIP") {
                            req.shipping_discount = coupon.discount
                            req.session.req.shipping_discount_limit = coupon.limit
                            alertMessage(res, 'success', `${(coupon.discount * 100)}% off your total shipping fee (save up to $${coupon.limit})`, 'fas fa-exclamation-circle', true)
                        }

                        else if (req.session.coupon_type == "SUB") {
                            req.session.sub_discount = coupon.discount
                            req.session.discount_limit = coupon.limit
                            alertMessage(res, 'success', `${(coupon.discount * 100)}% off your subtotal (excluding shipping) (save up to $${coupon.limit})`, 'fas fa-exclamation-circle', true)
                        }

                        // discount = coupon.discount;
                        // discount_limit = coupon.limit;
                        // line below allows us to redirect to another POST request to handle cart update
                        res.redirect(307, 'goToCart')
                        // res.redirect("cart")
                    })

                    .catch(() => {
                        alertMessage(res, 'danger', 'code ' + req.body.coupon + ' is invalid', 'fas fa-exclamation-circle', true)
                        res.redirect("cart")
                    })

            })


            .catch(() => {
                alertMessage(res, 'danger', 'No coupons are available at the moment', 'fas fa-exclamation-circle', true)
                res.redirect("cart")
            })

    }
});


// Update Cart
// When a user want to change the product qty in cart page

router.post('/cart', async (req, res) => {
    if (req.body.checkoutButton == "Update") {
        for (ID in req.session.userCart) {
            // Make sure to parseInt the updated qty or it will become a string!!
            let query = parseInt(req.body["Q" + ID])
            console.log("Queried Quantity is " + query)
            req.session.userCart[ID].Quantity = query
            // newSubTotal = query * req.session.userCart[ID].SubtotalPrice
            // console.log("Q is" + req.body["Q" + ID])
        }

        req.session.deducted = 0;
        for (z in req.session.userCart) {
            var product = await productadmin.findOne({ where: { id: req.session.userCart[z].ID } })
            var disc_object = await Discount.findOne({ where: { target_id: req.session.userCart[z].ID } })
            if (disc_object != null && disc_object.target_id == req.session.userCart[z].ID) {
                // special is the number of times the special offer can be applied, i.e 
                // if discount is for every 3 items and i have 10 items, special will be 10 / 3 rounded down to 3
                let special = Math.floor(req.session.userCart[z].Quantity / disc_object.min_qty)
                if (special != 0) {
                    console.log(`Special Value : ${special}`)
                    alertMessage(res, 'success', `Special Offer: Buy ${disc_object.min_qty} for ${(disc_object.discount_rate * 100)}% off for '${product.product_name}' applied ${special} times`, 'fas fa-exclamation-circle', true)
                }
                let first_half = (((special * disc_object.min_qty * req.session.userCart[z].Price) * (1 - disc_object.discount_rate)))
                let second_half = ((req.session.userCart[z].Quantity - (special * disc_object.min_qty)) * req.session.userCart[z].Price)
                req.session.userCart[z].SubtotalPrice = (first_half + second_half).toFixed(2)
                discounted_value = ((req.session.userCart[z].Quantity * req.session.userCart[z].Price) - (first_half + second_half)).toFixed(2)
                req.session.deducted = (parseFloat(req.session.deducted) + parseFloat(discounted_value)).toFixed(2);
                console.log("DEDUCTED VALUE IS " + discounted_value)
                console.log("DEDUCTED TOTAL IS " + req.session.deducted)
                console.log("AFTER SPECIAL DISCOUNT " + ` Subtotal is ${req.session.userCart[z].SubtotalPrice}`)

                req.session.userCart[z].SubtotalWeight = (parseFloat(req.session.userCart[z].SubtotalWeight) + parseFloat(product.weight)).toFixed(2)
            }

            else if (disc_object == null) {
                req.session.userCart[z].SubtotalPrice = (parseFloat(req.session.userCart[z].SubtotalPrice) + parseFloat(product.price)).toFixed(2)
            }
        }

        for (z in req.session.userCart) {
            req.session.userCart[z].SubtotalWeight = (req.session.userCart[z].Quantity * req.session.userCart[z].Weight)
        }
        
        // console.log(req.session.userCart)
        // console.log(req.session.full_subtotal_price)
        res.redirect(307, 'goToCart')
    }

    else {
        res.redirect('checkout')
        alertMessage(res, 'danger', 'You are not logged in', 'fas fa-exclamation-circle', true)
    }
})

// Delete Item in Cart
// Recalculate req.session.full_subtotal_price when item is deleted
// must set req.session.full_subtotal_price = 0 otherwise it will be incremented value

router.get('/deleteCartItem/:id', (req, res) => {
    console.log(req.session.userCart[req.params.id])
    console.log(req.params.id)
    console.log('Before Delete' + req.session.userCart)
    delete req.session.userCart[req.params.id];
    console.log('After Delete' + req.session.userCart)

    req.session.full_subtotal_price = 0
    if (req.session.coupon_type == "OVERALL") {
        console.log("Coupon TYPE IS OVERALL")
        for (z in req.session.userCart) {
            req.session.full_subtotal_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.userCart[z].SubtotalPrice)).toFixed(2)
            console.log(req.session.full_subtotal_price)
        }
        req.session.discounted_price = ((parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)) * (parseFloat(req.session.discount))).toFixed(2)
        if (parseFloat(req.session.discounted_price) > parseFloat(req.session.discount_limit)) {
            req.session.discounted_price = req.session.discount_limit
            req.session.full_total_price = ((parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)) - parseFloat(req.session.discount_limit)).toFixed(2)
        }
        else {
            // req.session. = (parseFloat(full_subtotal_price) + parseFloat(req.session.shipping_fee)).toFixed(2) * (1- parseFloat(discount)).toFixed(2)
            req.session.full_total_price = ((parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)) * (1.00 - parseFloat(req.session.discount))).toFixed(2)
        }
    }

    else if (req.session.coupon_type == "SHIP") {
        console.log("Coupon TYPE IS SHIP")
        for (z in req.session.userCart) {
            req.session.full_subtotal_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.userCart[z].SubtotalPrice)).toFixed(2)
            console.log(req.session.full_subtotal_price)
        }
        req.session.req.shipping_discounted_price = parseFloat(req.session.shipping_fee) * (req.shipping_discount)
        if (parseFloat(req.session.req.shipping_discounted_price) > parseFloat(req.session.req.shipping_discount_limit)) {
            req.session.discounted_price = req.session.req.shipping_discount_limit
            req.session.shipping_fee = (parseFloat(req.session.shipping_fee) - parseFloat(req.session.discount_limit)).toFixed(2)
            req.session.full_total_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)).toFixed(2)
        }

        else {
            req.session.discounted_price = ((parseFloat(req.session.shipping_fee)) * (parseFloat(req.shipping_discount))).toFixed(2)
            req.session.shipping_fee = ((parseFloat(req.session.shipping_fee)) * (1 - parseFloat(req.shipping_discount))).toFixed(2)
            req.session.full_total_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)).toFixed(2)
        }
    }

    else if (req.session.coupon_type == "SUB") {
        console.log("Coupon TYPE IS SUB")
        for (z in req.session.userCart) {
            req.session.full_subtotal_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.userCart[z].SubtotalPrice)).toFixed(2)
            console.log(req.session.full_subtotal_price)
        }
        req.session.discounted_price = parseFloat(req.session.full_subtotal_price) * (req.session.sub_discount)
        if (parseFloat(req.session.discounted_price) > parseFloat(req.session.discount_limit)) {
            req.session.discounted_price = req.session.discount_limit
            console.log(req.session.full_subtotal_price)
            req.session.full_subtotal_price = (parseFloat(req.session.full_subtotal_price) - parseFloat(req.session.discount_limit)).toFixed(2)
            console.log(req.session.full_subtotal_price)
            req.session.full_total_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)).toFixed(2)
        }

        else {
            req.session.discounted_price = (parseFloat(req.session.full_subtotal_price) * parseFloat(req.session.sub_discount)).toFixed(2)
            req.session.full_subtotal_price = (parseFloat(req.session.full_subtotal_price) * parseFloat(1 - req.session.sub_discount)).toFixed(2)
            req.session.full_total_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)).toFixed(2)
        }

    }

    else {
        req.session.discounted_price = 0.00
        for (z in req.session.userCart) {
            req.session.full_subtotal_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.userCart[z].SubtotalPrice)).toFixed(2)
            console.log(req.session.full_subtotal_price)
        }
        req.session.full_total_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)).toFixed(2)
    }
    console.log(req.session.userCart)
    console.log(req.session.full_subtotal_price)
    alertMessage(res, 'success', req.params.id + ' is successfully deleted', 'fas fa-sign-in-alt', true)
    res.redirect('/product/cart');
});


// Checkout Form
router.get('/checkout', (req, res) => {
    title = "Checkout"
    if (req.user) {
        let user_name = req.user.name;
        let user_phone = req.user.PhoneNo;
        let user_address = req.user.address;
        let user_address1 = req.user.address1;
        let user_city = req.user.city;
        let user_country = req.user.country;
        let user_postalCode = req.user.postalCode;

        res.render('checkout/checkout', {
            user_name,
            user_phone,
            user_address,
            user_address1,
            user_city,
            user_country,
            user_postalCode,
            title
        });
    }

    else {

        res.redirect("/")
    }
});


router.post('/checkout', (req, res) => {
    // Old variables
    // let fullName = req.body.fullName
    // let phoneNumber = req.body.phoneNumber
    // let address = req.body.address
    // let address1 = req.body.address1
    // let city = req.body.city
    // let country = req.body.country
    // let postalCode = req.body.postalCode
    // New session variables (To store the data temporarily as there will be another page before payment)
    req.session.recipientName = req.body.fullName
    req.session.recipientPhoneNo = req.body.phoneNumber
    req.session.address = req.body.address
    req.session.address1 = req.body.address1
    req.session.city = req.body.city
    req.session.countryShipment = req.body.country
    req.session.postalCode = req.body.postalCode
    res.redirect('selectPayment')
});

// After checkout form filled, select payment page
router.get('/selectPayment', (req, res) => {
    const title = "Select Payment"
    res.render('checkout/selectPayment', {
        title
    })
})

router.post('/goToStripe', (req, res) => {
    res.redirect('stripepayment')
})

router.post('/goToPayNow', (req, res) => {
    res.redirect('paynow')
})

router.get('/stripepayment', (req, res) => {
    title = "Stripe Payment"
    console.log("Full total price is " + req.session.full_total_price);
    const paymentIntent = stripe.paymentIntents.create({
        amount: Math.ceil((req.session.full_total_price * 100)),
        currency: 'sgd',
        payment_method_types: ['card'],
        receipt_email: 'whjw1536@gmail.com',
    })

        .then((paymentIntent) => {
            console.log(paymentIntent)
            console.log("Client secret is " + paymentIntent.client_secret)
            res.render('checkout/stripe', { client_secret: paymentIntent.client_secret, title });
        })
})

router.post('/stripepayment', (req, res) => {
    // create order
    // order.create({
    //     fullName, phoneNumber, address, address1, city, country, postalCode
    // })
    alertMessage(res, 'success', 'Order placed', 'fas fa-exclamation-circle', true)
    res.redirect('/')
})

router.get('/paynow', (req, res) => {
    title = "PayNow Payment"
    // let payNowString = paynow('proxyType','proxyValue','edit',price,'merchantName','additionalComments')
    let payNowString = paynow('mobile', '87558054', 'no', req.session.full_total_price, 'Test Merchant Name', 'Testing paynow')
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

router.post('/paynow', (req, res) => {
    alertMessage(res, 'success', 'Order placed, the administrator will shortly confirm your payment', 'fas fa-exclamation-circle', true)
    res.redirect('/')
})

// Admin Side

router.get('/createCoupon', (req, res) => {
    // if (!req.session.public_coupon) {
    //     req.session.public_coupon = "NULL";
    // }
    let currentDate = moment(req.body.currentDate, "DD/MM/YYYY");
    // Get current time of server
    // hh or HH = 24 hr format, h / H = 12 hr format, a = PM/AM
    let currentTime = moment().format("HH:mm");

    let errors;

    res.render('checkout/createCoupon', {
        currentTime,
        errors
    })
})

router.post('/createCoupon', (req, res) => {
    // Retrieve the inputs from the create coupon form
    let coupon_code = req.body.coupon_code;
    let coupon_type = req.body.coupon_type;
    let coupon_discount = req.body.coupon_discount;
    let coupon_limit = req.body.coupon_limit;
    let coupon_public = req.body.coupon_public;
    let coupon_msg = req.body.coupon_msg;
    // let coupon_expire_date = req.body.coupon_expire_date;
    // let coupon_expire_time = req.body.coupon_expire_time;
    let full_time = req.body.coupon_expire_date + " " + req.body.coupon_expire_time;


    // Note that the date/time stored in mySQL will be GMT althought date/time is based on our server(SGT)
    // E.g Coupon expiry date and time is SGT (GMT+8) 09/08/2020, 06:00 -> GMT 08/08/2020, 22:00
    let expiry_date_time = moment(full_time, 'DD/MM/YYYY, hh:mm:ss a');

    let current_time = moment();
    let et = moment(expiry_date_time); // format into the same way as current_time (in ms) 

    // Set BOOLEAN value of 'public' column
    if (coupon_public == "YES") {
        coupon_public = 1
    }

    else {
        coupon_public = 0
    }

    Coupon.findOne({
        where: { code: coupon_code }
    })
        .then((c) => {
            // Duplicate case
            if (c) {
                console.log("Coupon of the same code already exist")
                alertMessage(res, 'danger', `Code ${c.code} already exists!`, 'fas fa-exclamation-circle', true)
                res.redirect('createCoupon')
            }

            // Invalid/Expired time case
            if (et.isBefore(current_time)) {    // prevent user from inputting a date/time that has already passed
                alertMessage(res, 'danger', `Date or Time entered invalid!`, 'fas fa-exclamation-circle', true)
                res.redirect('createCoupon')
            }

            // No problem, create
            else {
                Coupon.create({
                    code: coupon_code,
                    type: coupon_type,
                    discount: coupon_discount,
                    limit: coupon_limit,
                    public: coupon_public,
                    message: coupon_msg,
                    expiry: expiry_date_time
                })
                    .then((coupon_object) => {
                        // If new coupon is public and there are existing public coupon, override it
                        if (coupon_object.public == 1 && req.session.public_coupon != null) {
                            let oc = req.session.public_coupon;
                            console.log(oc.code);
                            req.session.public_coupon = coupon_object;
                            Coupon.destroy({
                                where: { id: oc.id }
                            })
                            // oc.destroy(); -> doesnt work 'oc doesnt have function 'destroy'
                        }

                        req.session.save();
                        alertMessage(res, 'success', `Coupon Code ${coupon_object.code} Created, it expires on ${coupon_object.expiry}`, 'fas fa-exclamation-circle', true)
                        res.redirect('/product/createCoupon')
                    })
                    .catch(() => {
                        console.log("Something went wrong with creating the coupon")
                    })
            }


        })

})

// Create Discount Page
router.get('/createDiscount', async (req, res)=> {
    title = "Create Discount"
    let currentDate = moment(req.body.currentDate, "DD/MM/YYYY");
    let currentTime = moment().format("HH:mm");
    let errors;
    

    let products = await ProductAdmin.findAll({})
    res.render('checkout/createDiscount', {
        title,
        currentTime,
        errors,
        products
    })
})

router.post('/createDiscount', async(req, res)=> {
    // Retrieve the inputs from the create discount form
    let target_id = req.body.target_id;
    let product_discount = req.body.product_discount;
    let min_qty = req.body.min_qty;
    let discount_msg = req.body.discount_msg;
    let discount_expire_date = req.body.discount_expire_date
    let discount_expire_time = req.body.discount_expire_time
    let stackable = 0;
    // let coupon_expire_date = req.body.coupon_expire_date;
    // let coupon_expire_time = req.body.coupon_expire_time;
    let full_time = req.body.discount_expire_date + " " + req.body.discount_expire_time;

    // Note that the date/time stored in mySQL will be GMT althought date/time is based on our server(SGT)
    // E.g Coupon expiry date and time is SGT (GMT+8) 09/08/2020, 06:00 -> GMT 08/08/2020, 22:00
    let expiry_date_time = moment(full_time, 'DD/MM/YYYY, hh:mm:ss a');

    let current_time = moment();
    let et = moment(expiry_date_time); // format into the same way as current_time (in ms) 

    let d = await Discount.findOne({where: { target_id: target_id }})

    // Duplicate case
    if (d != null) {
        console.log("Discount of the same code already exist")
        alertMessage(res, 'danger', `Discount for ID: ${d.target_id} already exists!`, 'fas fa-exclamation-circle', true)
        // res.redirect('createDiscount')
    }

    // Invalid/Expired time case
    else if (et.isBefore(current_time)) {    // prevent user from inputting a date/time that has already passed
        alertMessage(res, 'danger', `Date or Time entered invalid!`, 'fas fa-exclamation-circle', true)
        // res.redirect('createDiscount')
    }

    // No problem, create
    else if (d == null) {

        let new_d = await Discount.create({
            discount_rate: product_discount,
            min_qty: min_qty,
            expiry: expiry_date_time,
            stackable: stackable,
            message: discount_msg,
            target_id: target_id,
        })

        alertMessage(res, 'success', `Discount for Product ID: ${new_d.target_id} Created, it expires on ${new_d.expiry}`, 'fas fa-exclamation-circle', true)

    }

    res.redirect('/product/createDiscount')

})

// Admin - View Discounts and Coupons and Delete together

router.get('/viewDiscount', async (req, res)=> {
    let title = "View Discount"
    let discounts = await Discount.findAll({})
    let coupons = await Coupon.findAll({})
    res.render('checkout/viewDiscount', {
        title,
        discounts,
        coupons
    })
})

router.get('/deleteDiscount/:id', async(req, res)=> {
    let target_id = req.params.id;
    let url = "/product/viewDiscount"
    Discount.findOne({
        where: {target_id: target_id}
    }).then((disc_object)=> {
        if (disc_object != null) {
            disc_object.destroy();
            alertMessage(res, 'success','Discount for Product ' + target_id  + ' is successfully deleted', 'fas fa-sign-in-alt', true)
        }

        else {
            url = "/"
            console.log("Invalid ID provided, not deleting anything")

        }

    }).catch((err)=> {
        console.log(err)
    })

    res.redirect(url)
})

router.get('/deleteCoupon/:id', async(req, res)=> {
    let id = req.params.id;
    let url = "/product/viewDiscount"
    Coupon.findOne({
        where: {id: id}
    }).then((c)=> {
        if (c != null) {
            c.destroy();
            alertMessage(res, 'success','Coupon ' + id  + ' is successfully deleted', 'fas fa-sign-in-alt', true)
        }

        else {
            url = "/"
            console.log("Invalid ID provided, not deleting anything")

        }

    }).catch((err)=> {
        console.log(err)
    })

    res.redirect(url)
})




module.exports = router;

