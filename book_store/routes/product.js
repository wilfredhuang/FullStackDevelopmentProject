const express = require('express');
const router = express.Router();
const moment = require('moment');
const product = require('../models/Product');
const productadmin = require('../models/ProductAdmin');
const cartItem = require('../models/CartItem');

const alertMessage=require('../helpers/messenger');
const Coupon = require('../models/coupon');

// variables below for coupon feature, dont change - wilfred
// switched userCart to global variable @app.js
// const userCart = {}
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

// List videos belonging to current logged in user 



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
        if (userCart.length < 1) {
            let qty = 1 
            // Image field not decided yet, the rest is done.
            userCart[[id]] = {"ID":id, "Name":name, "Author":author, "Publisher":publisher, "Genre":genre, "Price":price, "Stock":stock,
            "Weight":weight, "Image":image, "Quantity":qty, "SubtotalPrice":price, "SubtotalWeight":weight}
            console.log(userCart)
        }
    
        else {
            var check = false;
            for (z in userCart) {
                if (z == id) {
                    console.log("FOUND EXISTING PRODUCT IN CART")
                    userCart[z].Quantity += 1
                    userCart[z].SubtotalPrice = (parseFloat(userCart[z].SubtotalPrice) + parseFloat(product.price)).toFixed(2)
                    userCart[z].SubtotalWeight = (parseFloat(userCart[z].SubtotalWeight) + parseFloat(product.weight)).toFixed(2)
                    check = true;
                    console.log(userCart)
                }
            }
            if (check == false) {
                let qty = 1 
                // Again, the Image field not decided yet, the rest is done.
                // userCart[[id]] = {"ID":id, "Name":name, "Image":image, "Quantity":qty, "SubtotalPrice":product.price}
                userCart[[id]] = {"ID":id, "Name":name, "Author":author, "Publisher":publisher, "Genre":genre, "Price":price, "Stock":stock,
                "Weight":weight, "Image":image, "Quantity":qty, "SubtotalPrice":price, "SubtotalWeight":weight}
                console.log(userCart)
            }
        }})

    res.redirect('/product/listproduct')
    console.log("Added to cart");
    console.log(userCart);
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
        if (userCart.length < 1) {
            let qty = 1 
            // Image field not decided yet, the rest is done.
            userCart[[id]] = {"ID":id, "Name":name, "Author":author, "Publisher":publisher, "Genre":genre, "Price":price, "Stock":stock,
            "Weight":weight, "Image":image, "Quantity":qty, "SubtotalPrice":price, "SubtotalWeight":weight}
            console.log(userCart)
        }
    
        else {
            var check = false;
            for (z in userCart) {
                if (z == id) {
                    console.log("FOUND EXISTING PRODUCT IN CART")
                    userCart[z].Quantity += 1
                    userCart[z].SubtotalPrice = (parseFloat(userCart[z].SubtotalPrice) + parseFloat(product.price)).toFixed(2)
                    userCart[z].SubtotalWeight = (parseFloat(userCart[z].SubtotalWeight) + parseFloat(product.weight)).toFixed(2)
                    check = true;
                    console.log(userCart)
                }
            }
            if (check == false) {
                let qty = 1 
                // Again, the Image field not decided yet, the rest is done.
                // userCart[[id]] = {"ID":id, "Name":name, "Image":image, "Quantity":qty, "SubtotalPrice":product.price}
                userCart[[id]] = {"ID":id, "Name":name, "Author":author, "Publisher":publisher, "Genre":genre, "Price":price, "Stock":stock,
                "Weight":weight, "Image":image, "Quantity":qty, "SubtotalPrice":price, "SubtotalWeight":weight}
                console.log(userCart)
            }
        }})

    res.redirect(`/product/individualProduct/${req.params.id}`)
    console.log("Added to cart");
    console.log(userCart);
});

// Retrieve Cart
// Done
router.get('/cart', (req, res) => { 
    // let time = moment("2020-05-10", "YYYY/MM/DD");
    // let time2 = time.toString();
    // console.log(time2)
    
    // Get Subtotal Price of each item
    for (z in userCart) {
        userCart[z].SubtotalPrice = (userCart[z].Quantity * userCart[z].Price).toFixed(2);
    }
    
    for (z in userCart) {
        userCart[z].SubtotalWeight = (userCart[z].Quantity * userCart[z].Weight)
        // console.log(`Subtotal Weight is ${userCart[z].SubtotalWeight}`)
    }
    
    // Get the full subtotal price of all items
    let full_subtotal_price = 0;
    
    // Get full total price (Subtotal of all items + shipping after discounts(if any))
    // let full_total_price = 0;
    let shipping_fee = (10).toFixed(2);
    let total_weight = 0;
    let total_weight_oz = 0;
    
    for (z in userCart) {
        total_weight = total_weight + userCart[z].SubtotalWeight
    }
    
    // Round up to next number regardless of decimal value with ceil function
    total_weight_oz = Math.ceil((total_weight * 0.035274))
    
    if (coupon_type == "OVERALL") {
        console.log("Coupon TYPE IS OVERALL")
        for (z in userCart) {
            full_subtotal_price = (parseFloat(full_subtotal_price) + parseFloat(userCart[z].SubtotalPrice)).toFixed(2)
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
        for (z in userCart) {
            full_subtotal_price = (parseFloat(full_subtotal_price) + parseFloat(userCart[z].SubtotalPrice)).toFixed(2)
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
        for (z in userCart) {
            full_subtotal_price = (parseFloat(full_subtotal_price) + parseFloat(userCart[z].SubtotalPrice)).toFixed(2)
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
        for (z in userCart) {
            full_subtotal_price = (parseFloat(full_subtotal_price) + parseFloat(userCart[z].SubtotalPrice)).toFixed(2)
            console.log(full_subtotal_price)
        }
        full_total_price = (parseFloat(full_subtotal_price) + parseFloat(shipping_fee)).toFixed(2)
    }
    
    res.render('checkout/cart', {
        discount,
        discounted_price,
        full_subtotal_price,
        userCart,
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
        for (ID in userCart) {
            let query = req.body["Q"+ID]
            console.log("Queried Quantity is " + query)
            userCart[ID].Quantity = query
            // newSubTotal = query * userCart[ID].SubtotalPrice
            // console.log("Q is" + req.body["Q" + ID])

        }
        console.log(userCart)
        res.redirect('cart');
    }

    else {
        res.redirect('checkout')
    }
})

// Delete Item in Cart

router.get('/delete/:id', (req, res) => {
    console.log(userCart[req.params.id])
    console.log(req.params.id)
    console.log('Before Delete' + userCart)
    delete userCart[req.params.id];
    console.log('After Delete' + userCart)
    alertMessage(res, 'success', req.params.id + ' is successfully deleted', 'fas fa-sign-in-alt', true)
    res.redirect('/checkout/cart');
});




module.exports = router;

