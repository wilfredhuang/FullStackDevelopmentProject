const express = require('express');
const router = express.Router();
const moment = require('moment');
const product = require('../models/Product');
const productadmin = require('../models/ProductAdmin');
const cartItem = require('../models/CartItem');
const stripe = require('stripe')('sk_test_ns9DyHTray5Wihniw93C2ANH00IMJTVjKw', {
    apiVersion: '2020-03-02',
  });

// Beginning of Wilfred's checkout code, DO NOT MODIFY WITHOUT PERMISSION.
const userCart = {}

router.get('/checkout', (req, res) => {
    const paymentIntent = stripe.paymentIntents.create({
        amount: '1000',
        currency: 'sgd',
        payment_method_types: ['card']
    })

    .then((paymentIntent) => {
        console.log(paymentIntent)
        console.log(paymentIntent.client_secret)
        res.render('products/checkout', { client_secret: paymentIntent.client_secret });
    })
})

router.post('/checkout', (req, res) => {
    let id_collection = ""
    let name_collection = ""
    let image_collection = ""
    let qty_collection = ""
    let subtotal_collection = ""
    for (i in userCart) {
        id_collection = id_collection + i + ";"
        name_collection = name_collection + userCart[i].Name + ";"
        image_collection = image_collection + userCart[i].Image + ";"
        qty_collection = qty_collection + (userCart[i].Quantity).toString() + ";"
        subtotal_collection = subtotal_collection + (userCart[i].SubtotalPrice).toString() + ";"
    }

    Order.create(
        {uid: req.user.id,
        products_id_collection: id_collection,
        products_name_collection: name_collection,
        products_image_collection: image_collection,
        products_quantity_collection: qty_collection,
        products_subtotal_price_collection: subtotal_collection
    })

    .then((order)=> {
        // console.log(order.products_id_collection.get())
        console.log(order.get())
    })

});


router.get('/cart', (req, res) => { 
    let full_total_price = 0;
    for (z in userCart) {
        full_total_price = (parseFloat(full_total_price) + parseFloat(userCart[z].SubtotalPrice)).toFixed(2)
        console.log(full_total_price)
    }
    res.render('products/cart', {
        userCart,
        full_total_price
    })
});


router.post('/productsList', (req, res, next) => {
    // 'Add to Cart' button passes value of product id to server
    // queries product id with database
    // stores each cartitem with id, name and quantity
    console.log("ADDDDDING")
    console.log(req.body.testFunc)
    Product.findOne({
        where: {
            id: req.body.testFunc
        }
    })

    .then((product) => {
        var id = product.id;
        console.log('ID IS ' + id)
        let name = product.productName;
        if (userCart.length < 1) {
            let qty = 1 
            userCart[[id]] = {"ID":id, "Name":name, "Image":product.productImage, "Quantity":qty, "SubtotalPrice":product.productPrice}
            console.log(userCart)
        }
    
        else {
            var check = false;
            // for (z = 0; z<userCart.length; z++) 
            for (z in userCart) {
                if (z == id) {
                    console.log("FOUND EXISTING PRODUCT IN CART")
                    userCart[z].Quantity += 1
                    // parseFloat(userCart[z].SubtotalPrice).toFixed(2) += parseFloat(product.productPrice).toFixed(2)
                    userCart[z].SubtotalPrice = (parseFloat(userCart[z].SubtotalPrice) + parseFloat(product.productPrice)).toFixed(2)
                    check = true;
                    console.log(userCart)
                }
            }
            if (check == false) {
                let qty = 1 
                userCart[[id]] = {"ID":id, "Name":name, "Image":product.productImage, "Quantity":qty, "SubtotalPrice":product.productPrice}
                console.log(userCart)
            }
        }})
    res.redirect('/products/productsList')
    console.log("Added to cart");
});


router.get('/delete/:id', (req, res) => {
    console.log(userCart[req.params.id])
    console.log(req.params.id)
    console.log('Before Delete' + userCart)
    delete userCart[req.params.id];
    console.log('After Delete' + userCart)
    alertMessage(res, 'success', req.params.id + ' is successfully deleted', 'fas fa-sign-in-alt', true)
    res.redirect('/products/cart');
});
// End of wilfred's checkout code

router.get('/listProduct', (req, res) => {
    const title = 'Products';
    res.render('products/listProduct', {
        title
    })
});

router.get('/individualProduct1', (req, res) => {
    const title = 'Products';
    res.render('products/individualProduct1', {
        title
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
    productadmin.create({
        product_name, author, publisher, genre, price, stock, details,
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
})

module.exports = router;
