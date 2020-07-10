// Dont touch this file for now.. - W


const express = require('express');
const Product = require('../models/product'); // Bring in Sequelize object 'Product'
// const CartItems = require('../models/cart_items');
const router = express.Router();
const alertMessage=require('../helpers/messenger');
// const Order = require('../models/order');
// const OrderItem = require('../models/order');
const userCart = {1:{"ID":1, "Name":"FooBar", "Image":"r1", "Quantity":5, "SubtotalPrice":10.00}}

const stripe = require('stripe')('sk_test_ns9DyHTray5Wihniw93C2ANH00IMJTVjKw', {
    apiVersion: '2020-03-02',
  });

router.get('/checkout123', (req, res) => {
    res.render('checkout/checkout', {
        title:"Testing"
    })

// Add Cart
// To-do
// 1) Wait for owen to figure out how the image storage would be like
// 2) Remember to change the product page name to the correct one later.

router.post('/productsList', (req, res, next) => {
    // 'Add to Cart' button passes value of product id to server
    // queries product id with database
    // stores each cartitem with id, name and quantity
    console.log("ADDDDDING")
    Product.findOne({
        where: {
            id: pass // Button with name: id
        }
    })

    .then((product) => {
        var id = product.id;
        console.log('ID IS ' + id)
        let name = product.product_name;
        if (userCart.length < 1) {
            let qty = 1 
            // Image field not decided yet, the rest is done.
            userCart[[id]] = {"ID":id, "Name":name, "Image":image, "Quantity":qty, "SubtotalPrice":product.price}
            console.log(userCart)
        }
    
        else {
            var check = false;
            for (z in userCart) {
                if (z == id) {
                    console.log("FOUND EXISTING PRODUCT IN CART")
                    userCart[z].Quantity += 1
                    userCart[z].SubtotalPrice = (parseFloat(userCart[z].SubtotalPrice) + parseFloat(product.price)).toFixed(2)
                    check = true;
                    console.log(userCart)
                }
            }
            if (check == false) {
                let qty = 1 
                // Again, the Image field not decided yet, the rest is done.
                userCart[[id]] = {"ID":id, "Name":name, "Image":image, "Quantity":qty, "SubtotalPrice":product.price}
                console.log(userCart)
            }
        }})

    res.redirect('/products/productsList')
    console.log("Added to cart");
});

// Retrieve Cart
// Done
router.get('/cart', (req, res) => { 
let full_total_price = 0;
for (z in userCart) {
    full_total_price = (parseFloat(full_total_price) + parseFloat(userCart[z].SubtotalPrice)).toFixed(2)
    console.log(full_total_price)
}
res.render('checkout/cart', {
    userCart,
    full_total_price
    })
});

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

//  Get checkout page
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

// Checkout POST

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
        console.log(order.get())
    })
});






});

module.exports = router;