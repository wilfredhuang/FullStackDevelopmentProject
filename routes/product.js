const express = require('express')
const router = express.Router()
const moment = require('moment')

// Models
const product = require('../models/Product')
const productadmin = require('../models/ProductAdmin')
const order = require('../models/Order')
const order_item = require('../models/OrderItem')
const User = require('../models/User')
const Pending_Order = require('../models/Pending_Orders')
const Pending_OrderItem = require('../models/Pending_OrderItem')

const alertMessage = require('../helpers/messenger')
const Coupon = require('../models/coupon')
const Discount = require('../models/Discount')

// EasyPost API
const EasyPost = require('@easypost/api')
const apiKey = 'EZTK29b55ab4ee7a437890e19551520f5dd0uaJjPiW9XsVqXYFNVI0kog'
const api = new EasyPost(apiKey)

// Stripe Payment - secret key
const stripe = require('stripe')('sk_test_ns9DyHTray5Wihniw93C2ANH00IMJTVjKw', {
  apiVersion: '2020-03-02'
})

const paynow = require('paynow-generator').paynowGenerator
const QRCode = require('qrcode')
const { CheckboxRadioContainer } = require('admin-bro')
const ProductAdmin = require('../models/ProductAdmin')

// twilo API - Send SMS
const accountSid = 'AC583c7d4bc97864b67d16d8430ad9da88'
const authToken = 'e46e5a7f50ee56da9999d8feefe82ee9'
const client = require('twilio')(accountSid, authToken)

// Authentications
const ensureAuthenticated = require('../helpers/auth')
const ensureAdminAuthenticated = require('../helpers/adminauth')
const checkCart = require('../helpers/cart')

// variables below for coupon feature, dont change - wilfred
// switched req.session.userCart to global variable @app.js
// const req.session.userCart = {}

router.get('/listProduct', (req, res) => {
  const title = 'Product Listing'
  const navStatusProduct = 'active'
  productadmin.findAll({
    order: [
      ['product_name', 'ASC']
    ]
  })
    .then((productadmin) => {
      res.render('products/listProduct', {
        productadmin: productadmin,
        navStatusProduct,
        title
      })
    })
})

router.get('/individualProduct/:id', async (req, res) => {
  const title = 'Product Information'
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
  const disc = await Discount.findOne({
    where: { target_id: req.params.id }
  })

  productadmin.findOne({
    where: {
      id: req.params.id
    }
  })
    .then((product) => {
      res.render('products/individualProduct', {
        product,
        title,
        disc
      })
    })
})

router.get('/individualProduct2', (req, res) => {
  const title = 'Products'
  res.render('products/individualProduct2', {
    title
  })
})

router.get('/individualProduct3', (req, res) => {
  const title = 'Products'
  res.render('products/individualProduct3', {
    title
  })
})

router.get('/individualProduct4', (req, res) => {
  const title = 'Products'
  res.render('products/individualProduct4', {
    title
  })
})

router.post('/addProduct1', (req, res) => {
  const title = '7 DAY SELF PUBLISH HOW TO WRITE A BOOK'
  const price = 3.37
  const amount = 1
  product.create({
    title, price, amount
  }).then((product) => {
    res.redirect('/product/listproduct')
  })
    .catch(err => console.log(err))
})

router.get('/createProduct', (req, res) => {
  const title = 'Create Product'
  res.render('products/createProduct', {
    title
  })
})

router.post('/addProductAdmin', (req, res) => {
  const product_name = req.body.product_name
  console.log(product_name)
  const author = req.body.author
  const publisher = req.body.publisher
  const genre = req.body.genre
  const price = req.body.price
  const stock = req.body.stock
  const details = req.body.details
  const rating = req.body.rating
  const weight = req.body.weight
  const product_image = req.body.product_image
  productadmin.create({
    product_name, author, publisher, genre, price, stock, details, weight, product_image, rating
  }).then((product) => {
    alertMessage(res, 'success', ` ${product_name} was added into the shop.`, 'fas fa-sign-in-alt', true)
    res.redirect('/product/listProductAdmin')
  })
    .catch(err => console.log(err))
})

router.get('/listProductAdmin', (req, res) => {
  const title = 'Product Admin List'
  productadmin.findAll({
    order: [
      ['id', 'ASC']
    ],
    raw: true
  })
    .then((productadmin) => {
      res.render('products/listProductAdmin', {
        productadmin: productadmin,
        title
      })
    })
})

router.get('/delete/:id', (req, res) => {
  productadmin.findOne({
    where: {
      id: req.params.id
    }
  }).then((productadmin) => {
    productadmin.destroy({
      where: {
        id: req.params.id
      }
    }).then((productadmin) => {
      res.redirect('/product/listProductAdmin')
    })
  })
})

router.get('/updateProductAdmin/:id', (req, res) => {
  const title = 'Update Product'
  productadmin.findOne({
    where: {
      id: req.params.id
    }
  })
    .then((product) => {
      res.render('products/updateProduct', {
        product,
        title
      })
    })
})

router.get('/detailsProductAdmin/:id', (req, res) => {
  const title = 'Product Details'
  productadmin.findOne({
    where: {
      id: req.params.id
    }
  })
    .then((product) => {
      res.render('products/detailsProduct', {
        product,
        title
      })
    })
})

router.put('/updateProductAdmin/:id', (req, res) => {
  const product_name = req.body.product_name
  const author = req.body.author
  const publisher = req.body.publisher
  const genre = req.body.genre
  const price = req.body.price
  const stock = req.body.stock
  const details = req.body.details
  const weight = req.body.weight
  const rating = req.body.rating
  const product_image = req.body.product_image
  productadmin.update({
    product_name, author, publisher, genre, price, stock, details, weight, product_image, rating
  }, {
    where: {
      id: req.params.id
    }
  })
    .then(() => {
      alertMessage(res, 'success', ` ${product_name} was updated.`, 'fas fa-sign-in-alt', true)
      res.redirect('/product/listProductAdmin')
    })
    .catch(err => console.log(err))
})

// Here is the start of Cart and Payment Features - Wilfred

// Add to Cart from 'List of Products Page'
router.get('/listproduct/:id', async (req, res, next) => {
  // 'Add to Cart' button passes value of product id to server
  // queries product id with database
  // stores each cartitesm with id, name and quantity

  // Check for the expiry of the discount if discount exists
  let disc_object = await Discount.findOne({ where: { target_id: req.params.id } })
  if (disc_object != null) {
    const expiry_time = moment(disc_object.expiry)
    const current_time = moment()
    if (current_time.isAfter(expiry_time)) {
      await disc_object.destroy()
      disc_object = null
      console.log(disc_object)
    }
  }
  const product = await productadmin.findOne({ where: { id: req.params.id } })
  const id = product.id
  const name = product.product_name
  const author = product.author
  const publisher = product.publisher
  const genre = product.genre
  const price = product.price
  const stock = product.stock
  const details = product.details
  const weight = product.weight
  const image = product.product_image

  let check = false

  for (z in req.session.userCart) {
    if (disc_object != null && z == id) {
      console.log('FOUND EXISTING PRODUCT IN CART')
      console.log('Quantity is ' + req.session.userCart[z].Quantity)
      console.log('Discount Criteria FOUND for ' + req.session.userCart[z].Name)
      req.session.userCart[z].Quantity += 1
      // special is the number of times the special offer can be applied, i.e
      // if discount is for every 3 items and i have 10 items, special will be 10 / 3 rounded down to 3
      const special = Math.floor(req.session.userCart[z].Quantity / disc_object.min_qty)
      if (special != 0) {
        console.log(`Special Value : ${special}`)
        alertMessage(res, 'success', `Special Offer for this product applied ${special} times`, 'fas fa-exclamation-circle', false)
      }
      const first_half = (((special * disc_object.min_qty * req.session.userCart[z].Price) * (1 - disc_object.discount_rate)))
      const second_half = ((req.session.userCart[z].Quantity - (special * disc_object.min_qty)) * req.session.userCart[z].Price)
      req.session.userCart[z].SubtotalPrice = (first_half + second_half).toFixed(2)
      discounted_value = ((req.session.userCart[z].Quantity * req.session.userCart[z].Price) - (first_half + second_half)).toFixed(2)
      console.log('DEDUCTED VALUE IS ' + discounted_value)
      console.log('AFTER SPECIAL DISCOUNT ' + ` Subtotal is ${req.session.userCart[z].SubtotalPrice}`)

      req.session.userCart[z].SubtotalWeight = (parseFloat(req.session.userCart[z].SubtotalWeight) + parseFloat(product.weight)).toFixed(2)
      check = true
      // console.log(req.session.userCart)
    } else if (disc_object == null && z == id) {
      console.log('FOUND EXISTING PRODUCT IN CART')
      console.log('Quantity is ' + req.session.userCart[z].Quantity)
      req.session.userCart[z].Quantity += 1
      req.session.userCart[z].SubtotalPrice = (parseFloat(req.session.userCart[z].SubtotalPrice) + parseFloat(product.price)).toFixed(2)
      req.session.userCart[z].SubtotalWeight = (parseFloat(req.session.userCart[z].SubtotalWeight) + parseFloat(product.weight)).toFixed(2)
      check = true
      // console.log(req.session.userCart)
    }
  }
  if (check == false) {
    console.log('Adding New Cart Item')
    const qty = 1
    // Updated on 16 Aug, Bug fix for when a item min qty for discount is 1
    // and it is the first item to be added to cart, but the special price not applied
    if (disc_object != null && qty == disc_object.min_qty) {
      console.log('Discount Criteria FOUND for ' + product.name)
      alertMessage(res, 'success', 'Special Offer for this product applied', 'fas fa-exclamation-circle', false)
      req.session.userCart[[id]] = {
        ID: id,
        Name: name,
        Author: author,
        Publisher: publisher,
        Genre: genre,
        Price: price,
        Stock: stock,
        Weight: weight,
        Image: image,
        Quantity: qty,
        SubtotalPrice: (price * (1 - disc_object.discount_rate)).toFixed(2),
        SubtotalWeight: weight
      }
    }
    //

    else {
      req.session.userCart[[id]] = {
        ID: id,
        Name: name,
        Author: author,
        Publisher: publisher,
        Genre: genre,
        Price: price,
        Stock: stock,
        Weight: weight,
        Image: image,
        Quantity: qty,
        SubtotalPrice: price,
        SubtotalWeight: weight
      }
    }
    // console.log(req.session.userCart)
  }

  res.redirect('/product/listproduct')
  console.log('Added to cart')
  console.log(req.session.userCart)
})

// Add to Cart - individual page
router.post('/individualProduct/:id', async (req, res, next) => {
  // 'Add to Cart' button passes value of product id to server
  // queries product id with database
  // stores each cartitesm with id, name and quantity

  // Check for the expiry of the discount if discount exists
  let disc_object = await Discount.findOne({ where: { target_id: req.params.id } })
  if (disc_object != null) {
    const expiry_time = moment(disc_object.expiry)
    const current_time = moment()
    if (current_time.isAfter(expiry_time)) {
      await disc_object.destroy()
      disc_object = null
      console.log(disc_object)
    }
  }
  const product = await productadmin.findOne({ where: { id: req.params.id } })
  const id = product.id
  const name = product.product_name
  const author = product.author
  const publisher = product.publisher
  const genre = product.genre
  const price = product.price
  const stock = product.stock
  const details = product.details
  const weight = product.weight
  const image = product.product_image

  let check = false

  for (z in req.session.userCart) {
    if (disc_object != null && z == id) {
      console.log('FOUND EXISTING PRODUCT IN CART')
      console.log('Quantity is ' + req.session.userCart[z].Quantity)
      console.log('Discount Criteria FOUND for ' + req.session.userCart[z].Name)
      req.session.userCart[z].Quantity += 1
      // special is the number of times the special offer can be applied, i.e
      // if discount is for every 3 items and i have 10 items, special will be 10 / 3 rounded down to 3
      const special = Math.floor(req.session.userCart[z].Quantity / disc_object.min_qty)
      if (special != 0) {
        console.log(`Special Value : ${special}`)
        alertMessage(res, 'success', `Special Offer for this product applied ${special} times`, 'fas fa-exclamation-circle', false)
      }
      const first_half = (((special * disc_object.min_qty * req.session.userCart[z].Price) * (1 - disc_object.discount_rate)))
      const second_half = ((req.session.userCart[z].Quantity - (special * disc_object.min_qty)) * req.session.userCart[z].Price)
      req.session.userCart[z].SubtotalPrice = (first_half + second_half).toFixed(2)
      discounted_value = ((req.session.userCart[z].Quantity * req.session.userCart[z].Price) - (first_half + second_half)).toFixed(2)
      console.log('DEDUCTED VALUE IS ' + discounted_value)
      console.log('AFTER SPECIAL DISCOUNT ' + ` Subtotal is ${req.session.userCart[z].SubtotalPrice}`)

      req.session.userCart[z].SubtotalWeight = (parseFloat(req.session.userCart[z].SubtotalWeight) + parseFloat(product.weight)).toFixed(2)
      check = true
      // console.log(req.session.userCart)
    } else if (disc_object == null && z == id) {
      console.log('FOUND EXISTING PRODUCT IN CART')
      console.log('Quantity is ' + req.session.userCart[z].Quantity)
      req.session.userCart[z].Quantity += 1
      req.session.userCart[z].SubtotalPrice = (parseFloat(req.session.userCart[z].SubtotalPrice) + parseFloat(product.price)).toFixed(2)
      req.session.userCart[z].SubtotalWeight = (parseFloat(req.session.userCart[z].SubtotalWeight) + parseFloat(product.weight)).toFixed(2)
      check = true
      // console.log(req.session.userCart)
    }
  }
  if (check == false) {
    console.log('Adding New Cart Item')
    const qty = 1
    // Updated on 16 Aug, Bug fix for when a item min qty for discount is 1
    // and it is the first item to be added to cart, but the special price not applied
    if (disc_object != null && qty == disc_object.min_qty) {
      console.log('Discount Criteria FOUND for ' + product.name)
      alertMessage(res, 'success', 'Special Offer for this product applied', 'fas fa-exclamation-circle', false)
      req.session.userCart[[id]] = {
        ID: id,
        Name: name,
        Author: author,
        Publisher: publisher,
        Genre: genre,
        Price: price,
        Stock: stock,
        Weight: weight,
        Image: image,
        Quantity: qty,
        SubtotalPrice: (price * (1 - disc_object.discount_rate)).toFixed(2),
        SubtotalWeight: weight
      }
    }
    //

    else {
      req.session.userCart[[id]] = {
        ID: id,
        Name: name,
        Author: author,
        Publisher: publisher,
        Genre: genre,
        Price: price,
        Stock: stock,
        Weight: weight,
        Image: image,
        Quantity: qty,
        SubtotalPrice: price,
        SubtotalWeight: weight
      }
    }
    // console.log(req.session.userCart)
  }

  res.redirect(`/product/individualProduct/${req.params.id}`)
  console.log('Added to cart')
  console.log(req.session.userCart)
})

// POST request before redirecting to Cart
// Why? Because when a session update the cart, session variable is updated, but the
// contents displayed on the page won't show unless we refresh once more (Reason: Unknown)
// Using this POST request to handle and update the information instead of router.get will solve that problem
router.post('/goToCart', (req, res) => {
  req.session.full_subtotal_price = 0
  req.session.shipping_fee = (0).toFixed(2)
  const total_weight = 0
  const total_weight_oz = 0
  req.session.full_total_price = 0
  if (req.session.coupon_type == 'OVERALL') {
    console.log('Coupon TYPE IS OVERALL')
    // Updated by wilfred on 14/08/20 for display purposes
    req.session.deducted = (0).toFixed(2)
    for (z in req.session.userCart) {
      // console.log("LE CART IS")
      console.log(req.session.userCart)
      // check for any special discount applied, for display only
      original_price = req.session.userCart[z].Quantity * req.session.userCart[z].Price
      // Subtotal price is already modified when discount is applied so
      // we check by comparing original and special price
      special_price = req.session.userCart[z].SubtotalPrice
      if (special_price != original_price) {
        product_discounted_value = (parseFloat(original_price) - parseFloat(special_price)).toFixed(2)
        req.session.deducted = (parseFloat(req.session.deducted) + parseFloat(product_discounted_value)).toFixed(2)
        // console.log("PDV is")
        console.log(product_discounted_value)
      }
      // end
      req.session.full_subtotal_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.userCart[z].SubtotalPrice)).toFixed(2)
      console.log(req.session.full_subtotal_price)
    }
    req.session.discounted_price = ((parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)) * (parseFloat(req.session.discount))).toFixed(2)
    if (parseFloat(req.session.discounted_price) > parseFloat(req.session.discount_limit)) {
      req.session.discounted_price = req.session.discount_limit
      req.session.full_total_price = ((parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)) - parseFloat(req.session.discount_limit)).toFixed(2)
    } else {
      // req.session. = (parseFloat(full_subtotal_price) + parseFloat(req.session.shipping_fee)).toFixed(2) * (1- parseFloat(discount)).toFixed(2)
      req.session.full_total_price = ((parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)) * (1.00 - parseFloat(req.session.discount))).toFixed(2)
    }
  } else if (req.session.coupon_type == 'SHIP') {
    console.log('Coupon TYPE IS SHIP')
    // Updated by wilfred on 14/08/20 for display purposes
    req.session.deducted = (0).toFixed(2)
    for (z in req.session.userCart) {
      // console.log("LE CART IS")
      console.log(req.session.userCart)
      // check for any special discount applied, for display only
      original_price = req.session.userCart[z].Quantity * req.session.userCart[z].Price
      // Subtotal price is already modified when discount is applied so
      // we check by comparing original and special price
      special_price = req.session.userCart[z].SubtotalPrice
      if (special_price != original_price) {
        product_discounted_value = (parseFloat(original_price) - parseFloat(special_price)).toFixed(2)
        req.session.deducted = (parseFloat(req.session.deducted) + parseFloat(product_discounted_value)).toFixed(2)
        // console.log("PDV is")
        console.log(product_discounted_value)
      }
      // end
      req.session.full_subtotal_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.userCart[z].SubtotalPrice)).toFixed(2)
      console.log(req.session.full_subtotal_price)
    }
    req.session.req.shipping_discounted_price = parseFloat(req.session.shipping_fee) * (req.shipping_discount)
    if (parseFloat(req.session.req.shipping_discounted_price) > parseFloat(req.session.req.shipping_discount_limit)) {
      req.session.discounted_price = req.session.req.shipping_discount_limit
      req.session.shipping_fee = (parseFloat(req.session.shipping_fee) - parseFloat(req.session.discount_limit)).toFixed(2)
      req.session.full_total_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)).toFixed(2)
    } else {
      req.session.discounted_price = ((parseFloat(req.session.shipping_fee)) * (parseFloat(req.shipping_discount))).toFixed(2)
      req.session.shipping_fee = ((parseFloat(req.session.shipping_fee)) * (1 - parseFloat(req.shipping_discount))).toFixed(2)
      req.session.full_total_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)).toFixed(2)
    }
  } else if (req.session.coupon_type == 'SUB') {
    console.log('Coupon TYPE IS SUB')
    // Updated by wilfred on 14/08/20 for display purposes
    req.session.deducted = (0).toFixed(2)
    for (z in req.session.userCart) {
      // console.log("LE CART IS")
      console.log(req.session.userCart)
      // check for any special discount applied, for display only
      original_price = req.session.userCart[z].Quantity * req.session.userCart[z].Price
      // Subtotal price is already modified when discount is applied so
      // we check by comparing original and special price
      special_price = req.session.userCart[z].SubtotalPrice
      if (special_price != original_price) {
        product_discounted_value = (parseFloat(original_price) - parseFloat(special_price)).toFixed(2)
        req.session.deducted = (parseFloat(req.session.deducted) + parseFloat(product_discounted_value)).toFixed(2)
        // console.log("PDV is")
        console.log(product_discounted_value)
      }
      // end
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
    } else {
      req.session.discounted_price = (parseFloat(req.session.full_subtotal_price) * parseFloat(req.session.sub_discount)).toFixed(2)
      req.session.full_subtotal_price = (parseFloat(req.session.full_subtotal_price) * parseFloat(1 - req.session.sub_discount)).toFixed(2)
      req.session.full_total_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)).toFixed(2)
    }
  } else {
    req.session.discounted_price = (0).toFixed(2)
    // Updated by wilfred on 14/08/20 for display purposes
    req.session.deducted = (0).toFixed(2)
    for (z in req.session.userCart) {
      // console.log("LE CART IS")
      console.log(req.session.userCart)
      // check for any special discount applied, for display only
      original_price = req.session.userCart[z].Quantity * req.session.userCart[z].Price
      // Subtotal price is already modified when discount is applied so
      // we check by comparing original and special price
      special_price = req.session.userCart[z].SubtotalPrice
      if (special_price != original_price) {
        product_discounted_value = (parseFloat(original_price) - parseFloat(special_price)).toFixed(2)
        req.session.deducted = (parseFloat(req.session.deducted) + parseFloat(product_discounted_value)).toFixed(2)
        // console.log("PDV is")
        console.log(product_discounted_value)
      }
      // end
      req.session.full_subtotal_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.userCart[z].SubtotalPrice)).toFixed(2)
      console.log(req.session.full_subtotal_price)
    }
    req.session.full_total_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)).toFixed(2)
  }

  res.redirect('cart')
})

// Update Cart
// When a user want to change the product qty in cart page

router.post('/cart', async (req, res) => {
  if (req.body.checkoutButton == 'Update') {
    for (ID in req.session.userCart) {
      // Make sure to parseInt the updated qty or it will become a string!!
      const query = parseInt(req.body['Q' + ID])
      console.log('Queried Quantity is ' + query)
      req.session.userCart[ID].Quantity = query
      // newSubTotal = query * req.session.userCart[ID].SubtotalPrice
      // console.log("Q is" + req.body["Q" + ID])
    }

    req.session.deducted = (0).toFixed(2)
    for (z in req.session.userCart) {
      const product = await productadmin.findOne({ where: { id: req.session.userCart[z].ID } })
      const disc_object = await Discount.findOne({ where: { target_id: req.session.userCart[z].ID } })
      if (disc_object != null && disc_object.target_id == req.session.userCart[z].ID) {
        // special is the number of times the special offer can be applied, i.e
        // if discount is for every 3 items and i have 10 items, special will be 10 / 3 rounded down to 3
        const special = Math.floor(req.session.userCart[z].Quantity / disc_object.min_qty)
        if (special != 0) {
          console.log(`Special Value : ${special}`)
          alertMessage(res, 'success', `Special Offer: Buy ${disc_object.min_qty} for ${(disc_object.discount_rate * 100)}% off for '${product.product_name}' applied ${special} times`, 'fas fa-exclamation-circle', true)
        }
        const first_half = (((special * disc_object.min_qty * req.session.userCart[z].Price) * (1 - disc_object.discount_rate)))
        const second_half = ((req.session.userCart[z].Quantity - (special * disc_object.min_qty)) * req.session.userCart[z].Price)
        req.session.userCart[z].SubtotalPrice = (first_half + second_half).toFixed(2)
        discounted_value = ((req.session.userCart[z].Quantity * req.session.userCart[z].Price) - (first_half + second_half)).toFixed(2)
        req.session.deducted = (parseFloat(req.session.deducted) + parseFloat(discounted_value)).toFixed(2)
        console.log('DEDUCTED VALUE IS ' + discounted_value)
        console.log('DEDUCTED TOTAL IS ' + req.session.deducted)
        console.log('AFTER SPECIAL DISCOUNT ' + ` Subtotal is ${req.session.userCart[z].SubtotalPrice}`)

        req.session.userCart[z].SubtotalWeight = (parseFloat(req.session.userCart[z].SubtotalWeight) + parseFloat(product.weight)).toFixed(2)
      } else if (disc_object == null) {
        req.session.userCart[z].SubtotalPrice = (parseFloat(req.session.userCart[z].Quantity) * parseFloat(product.price)).toFixed(2)
      }
    }

    for (z in req.session.userCart) {
      req.session.userCart[z].SubtotalWeight = (req.session.userCart[z].Quantity * req.session.userCart[z].Weight)
    }

    // console.log(req.session.userCart)
    // console.log(req.session.full_subtotal_price)
    res.redirect(307, 'goToCart')
  } else {
    res.redirect('checkout')
    alertMessage(res, 'danger', 'You are not logged in', 'fas fa-exclamation-circle', true)
  }
})

// Delete Item in Cart
// Recalculate req.session.full_subtotal_price when item is deleted
// must set req.session.full_subtotal_price = 0 otherwise it will be incremented value

router.get('/deleteCartItem/:id', async (req, res) => {
  console.log(req.session.userCart[req.params.id])
  console.log(req.params.id)
  console.log('Before Delete' + req.session.userCart)
  delete req.session.userCart[req.params.id]
  console.log('After Delete' + req.session.userCart)

  req.session.deducted = (0).toFixed(2)
  for (z in req.session.userCart) {
    const product = await productadmin.findOne({ where: { id: req.session.userCart[z].ID } })
    const disc_object = await Discount.findOne({ where: { target_id: req.session.userCart[z].ID } })
    if (disc_object != null && disc_object.target_id == req.session.userCart[z].ID) {
      // special is the number of times the special offer can be applied, i.e
      // if discount is for every 3 items and i have 10 items, special will be 10 / 3 rounded down to 3
      const special = Math.floor(req.session.userCart[z].Quantity / disc_object.min_qty)
      if (special != 0) {
        console.log(`Special Value : ${special}`)
        alertMessage(res, 'success', `Special Offer: Buy ${disc_object.min_qty} for ${(disc_object.discount_rate * 100)}% off for '${product.product_name}' applied ${special} times`, 'fas fa-exclamation-circle', true)
      }
      const first_half = (((special * disc_object.min_qty * req.session.userCart[z].Price) * (1 - disc_object.discount_rate)))
      const second_half = ((req.session.userCart[z].Quantity - (special * disc_object.min_qty)) * req.session.userCart[z].Price)
      req.session.userCart[z].SubtotalPrice = (first_half + second_half).toFixed(2)
      discounted_value = ((req.session.userCart[z].Quantity * req.session.userCart[z].Price) - (first_half + second_half)).toFixed(2)
      req.session.deducted = (parseFloat(req.session.deducted) + parseFloat(discounted_value)).toFixed(2)
      console.log('DEDUCTED VALUE IS ' + discounted_value)
      console.log('DEDUCTED TOTAL IS ' + req.session.deducted)
      console.log('AFTER SPECIAL DISCOUNT ' + ` Subtotal is ${req.session.userCart[z].SubtotalPrice}`)

      req.session.userCart[z].SubtotalWeight = (parseFloat(req.session.userCart[z].SubtotalWeight) + parseFloat(product.weight)).toFixed(2)
    } else if (disc_object == null) {
      req.session.userCart[z].SubtotalPrice = (parseFloat(req.session.userCart[z].Quantity) * parseFloat(product.price)).toFixed(2)
    }
  }

  for (z in req.session.userCart) {
    req.session.userCart[z].SubtotalWeight = (req.session.userCart[z].Quantity * req.session.userCart[z].Weight)
  }
  // let disc_object = await Discount.findOne({ where: { target_id: req.params.id } })
  // if (disc_object != null) {
  //     let special = Math.floor(req.session.userCart[req.params.id].Quantity / disc_object.min_qty)
  //     // if (special != 0) {
  //     //     console.log(`Special Value : ${special}`)
  //     //     alertMessage(res, 'success', `Special Offer: Buy ${disc_object.min_qty} for ${(disc_object.discount_rate * 100)}% off for '${product.product_name}' applied ${special} times`, 'fas fa-exclamation-circle', true)
  //     // }
  //     let first_half = (((special * disc_object.min_qty * req.session.userCart[req.params.id].Price) * (1 - disc_object.discount_rate)))
  //     let second_half = ((req.session.userCart[req.params.id].Quantity - (special * disc_object.min_qty)) * req.session.userCart[req.params.id].Price)
  //     req.session.userCart[z].SubtotalPrice = (first_half + second_half).toFixed(2)
  //     discounted_value = ((req.session.userCart[req.params.id].Quantity * req.session.userCart[req.params.id].Price) - (first_half + second_half)).toFixed(2)
  //     console.log("DEEDUCTED VAUE IS " + req.session.deducted)
  //     console.log("DEEDUCTED VAUE IS " + discounted_value)
  //     req.session.deducted = (parseFloat(req.session.deducted) - parseFloat(discounted_value)).toFixed(2);
  //     delete req.session.userCart[req.params.id];
  //     console.log('After Delete' + req.session.userCart)
  //     console.log(req.session.deducted)

  // }

  // else if (disc_object == null) {
  //     delete req.session.userCart[req.params.id];
  //     console.log('After Delete' + req.session.userCart)
  // }

  req.session.full_subtotal_price = 0
  if (req.session.coupon_type == 'OVERALL') {
    console.log('Coupon TYPE IS OVERALL')
    for (z in req.session.userCart) {
      req.session.full_subtotal_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.userCart[z].SubtotalPrice)).toFixed(2)
      console.log(req.session.full_subtotal_price)
    }
    req.session.discounted_price = ((parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)) * (parseFloat(req.session.discount))).toFixed(2)
    if (parseFloat(req.session.discounted_price) > parseFloat(req.session.discount_limit)) {
      req.session.discounted_price = req.session.discount_limit
      req.session.full_total_price = ((parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)) - parseFloat(req.session.discount_limit)).toFixed(2)
    } else {
      // req.session. = (parseFloat(full_subtotal_price) + parseFloat(req.session.shipping_fee)).toFixed(2) * (1- parseFloat(discount)).toFixed(2)
      req.session.full_total_price = ((parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)) * (1.00 - parseFloat(req.session.discount))).toFixed(2)
    }
  } else if (req.session.coupon_type == 'SHIP') {
    console.log('Coupon TYPE IS SHIP')
    for (z in req.session.userCart) {
      req.session.full_subtotal_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.userCart[z].SubtotalPrice)).toFixed(2)
      console.log(req.session.full_subtotal_price)
    }
    req.session.shipping_discounted_price = parseFloat(req.session.shipping_fee) * (req.shipping_discount)
    if (parseFloat(req.session.shipping_discounted_price) > parseFloat(req.session.shipping_discount_limit)) {
      req.session.discounted_price = req.session.shipping_discount_limit
      req.session.shipping_fee = (parseFloat(req.session.shipping_fee) - parseFloat(req.session.discount_limit)).toFixed(2)
      req.session.full_total_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)).toFixed(2)
    } else {
      req.session.discounted_price = ((parseFloat(req.session.shipping_fee)) * (parseFloat(req.shipping_discount))).toFixed(2)
      req.session.shipping_fee = ((parseFloat(req.session.shipping_fee)) * (1 - parseFloat(req.shipping_discount))).toFixed(2)
      req.session.full_total_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)).toFixed(2)
    }
  } else if (req.session.coupon_type == 'SUB') {
    console.log('Coupon TYPE IS SUB')
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
    } else {
      req.session.discounted_price = (parseFloat(req.session.full_subtotal_price) * parseFloat(req.session.sub_discount)).toFixed(2)
      req.session.full_subtotal_price = (parseFloat(req.session.full_subtotal_price) * parseFloat(1 - req.session.sub_discount)).toFixed(2)
      req.session.full_total_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)).toFixed(2)
    }
  } else {
    req.session.discounted_price = 0.00
    for (z in req.session.userCart) {
      req.session.full_subtotal_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.userCart[z].SubtotalPrice)).toFixed(2)
      console.log(req.session.full_subtotal_price)
    }
    req.session.full_total_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.shipping_fee)).toFixed(2)
  }
  console.log(req.session.userCart)
  console.log(req.session.full_subtotal_price)
  alertMessage(res, 'success', 'An item has been removed from the cart', 'fas fa-sign-in-alt', true)
  res.redirect(307, '/product/cart')
})

// Retrieve Cart
// Make sure to use POST request to handle updated cart info or you need to double refresh

router.get('/cart', (req, res) => {
  const title = 'Shopping Cart'
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
  req.session.shipping_fee = (0).toFixed(2)
  let total_weight = 0
  let total_weight_oz = 0

  for (z in req.session.userCart) {
    total_weight = total_weight + req.session.userCart[z].SubtotalWeight
  }

  const discounts = Discount.findAll({})

  // Round up to next number regardless of decimal value with ceil function
  total_weight_oz = Math.ceil((total_weight * 0.035274))

  res.render('checkout/cart', {
    total_weight,
    total_weight_oz,
    discounts,
    title
  })
})

// Cart Coupon
router.post('/applyCoupon', (req, res) => {
  // Check if coupon expired already or not
  Coupon.findAll({
    // order: [['id', 'ASC']],
  })
    .then((coupons) => {
      for (c in coupons) {
        // Mistake: used 'c.destroy()' instead of 'coupons[c].destroy()'
        // let current_time = moment('DD/MM/YYYY, hh:mm:ss a')
        const expiry_time = moment(coupons[c].expiry)
        const current_time = moment()
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
              console.log('Setting session var to NULL')
              req.session.public_coupon = null
            }
          }
          console.log('Destroying Coupon Code ' + coupons[c].code)
          coupons[c].destroy()
          req.session.save()
          console.log('Public Coupon is now ' + req.session.public_coupon + ' should be NULL')
        } else {
          console.log(current_time.format('DD/MM/YYYY, hh:mm:ss a'))
          console.log(expiry_time.format('DD/MM/YYYY, hh:mm:ss a'))
          console.log('Current Time is ' + current_time)
          console.log('Expiry Time is ' + coupons[c].expiry)
          console.log('Expiry Time is  ' + expiry_time)
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
          if (req.session.coupon_type == 'OVERALL') {
            req.session.discount = coupon.discount
            req.session.discount_limit = coupon.limit
            alertMessage(res, 'success', `${(coupon.discount * 100)}% off your total order (save up to $${coupon.limit})`, 'fas fa-exclamation-circle', true)
          } else if (req.session.coupon_type == 'SHIP') {
            req.shipping_discount = coupon.discount
            req.session.req.shipping_discount_limit = coupon.limit
            alertMessage(res, 'success', `${(coupon.discount * 100)}% off your total shipping fee (save up to $${coupon.limit})`, 'fas fa-exclamation-circle', true)
          } else if (req.session.coupon_type == 'SUB') {
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
          res.redirect('cart')
        })
    })

    .catch(() => {
      alertMessage(res, 'danger', 'No coupons are available at the moment', 'fas fa-exclamation-circle', true)
      res.redirect('cart')
    })
})

// Checkout Form
router.get('/checkout', checkCart, (req, res) => {
  title = 'Checkout'
  if (req.user) {
    const user_name = req.user.name
    const user_phone = req.user.PhoneNo
    const user_address = req.user.address
    const user_address1 = req.user.address1
    const user_city = req.user.city
    const user_country = req.user.country
    const user_postalCode = req.user.postalCode

    res.render('checkout/checkout', {
      user_name,
      user_phone,
      user_address,
      user_address1,
      user_city,
      user_country,
      user_postalCode,
      title
    })
  } else {
    res.redirect('/')
  }
})

router.post('/checkout', checkCart, (req, res) => {
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
})

// After checkout form filled, select payment page
router.get('/selectPayment', checkCart, (req, res) => {
  const title = 'Select Payment'
  res.render('checkout/selectPayment', {
    title
  })
})

router.post('/goToStripe', checkCart, (req, res) => {
  res.redirect('stripepayment')
})

router.post('/goToPayNow', checkCart, (req, res) => {
  res.redirect('paynow')
})

router.get('/stripepayment', checkCart, async (req, res) => {
  // Function below will take in customer's stripeID (if it exists)

  console.log('USER STRIPE ID IS ' + req.user.stripeID)
  console.log('USER ISADMIN IS ' + req.user.isadmin)
  if (req.user.stripeID != null) {
    stripe.customers.retrieve(
      req.user.stripeID,
      function (err, customer) {
        // asynchronously called
        console.log(err)
        console.log('CUSTOMER IS ' + customer)
      }
    )
  } else {
    // Create a stripe customer
    const customer = await stripe.customers.create({
      name: req.user.name,
      email: req.user.email,
      phone: req.user.PhoneNo,
      shipping: {
        address: {
          line1: req.user.address,
          line2: req.user.address1,
          city: req.user.city,
          country: req.user.country,
          postal_code: req.user.postalCode
        },
        name: req.user.name,
        phone: req.user.PhoneNo
      }
    })
    console.log('CUST ID IS + ' + customer.id)
    console.log(req.user.stripeID)
    console.log(req.user.random)
    const current_user = await User.findOne({ where: { id: req.user.id } })
    console.log(current_user)
    current_user.stripeID = customer.id
    current_user.save()
  }

  title = 'Stripe Payment'
  console.log('Full total price is ' + req.session.full_total_price)
  const paymentIntent = stripe.paymentIntents.create({
    amount: Math.ceil((req.session.full_total_price * 100)),
    currency: 'sgd',
    payment_method_types: ['card'],
    receipt_email: 'whjw1536@gmail.com',
    setup_future_usage: 'on_session',
    description: `Order worth $${req.session.full_total_price} by ${req.user.name}`
  })
    .then((paymentIntent) => {
      console.log(paymentIntent)
      console.log('Client secret is ' + paymentIntent.client_secret)
      res.render('checkout/stripe', { client_secret: paymentIntent.client_secret, title })
    })
})

router.post('/stripepayment', async (req, res) => {
  let total_weight_oz = (0).toFixed(2)

  // Here's the start of the delivery API
  const parcel = new api.Parcel({
    predefined_package: 'Parcel',
    weight: 10 // change number according to weight of total books
  })

  parcel.save()

  const fromAddress = new api.Address({
    // default address of company
    name: 'Bookstore',
    street1: '118 2nd Street',
    street2: '4th Floor',
    city: 'San Francisco',
    state: 'CA',
    country: 'US',
    zip: '94105',
    phone: '415-123-4567',
    email: 'example@example.com'
  })
  // fromAddress.save().then(console.log);

  const toAddress = new api.Address({
    verify: ['delivery'],
    /* name: fullName,
        company: "-",
        street1: address,
        city: city,
        state: "-",
        phone: phoneNumber,
        country: country,
        zip: postalCode, */
    // example code cos too lazy to type down
    name: 'George Costanza',
    company: 'Vandelay Industries',
    street1: '1 E 161st St.',
    phone: '+6590257144',
    city: 'Bronx',
    state: 'NY',
    // zip: "10451", //Actual zipcode
    zip: '12412352551'
  })
  toAddress
    .save()
    .then((addr) => {
      // console.log(addr);
      // console.log(addr.verifications)
      const checkAddress = addr.verifications.delivery.success
      // console.log(addr.verifications.delivery.errors[0])
      if (checkAddress == true) {
        const shipment = new api.Shipment({
          to_address: toAddress,
          from_address: fromAddress,
          parcel: parcel
        })
        // shipment.save()//.then(console.log);
        shipment.save().then((s) => {
          s.buy(shipment.lowestRate(['USPS'], ['First'])).then((t) => {
            console.log('=============')
            console.log(t.id)
            const fullName = req.session.recipientName
            const phoneNumber = req.session.recipientPhoneNo
            const address = req.session.address
            const address1 = req.session.address1
            const city = req.session.city
            const country = req.session.countryShipment
            const postalCode = req.session.postalCode
            const deliverFee = 0
            const subtotalPrice = req.session.full_subtotal_price
            const totalPrice = req.session.full_total_price
            const shippingId = t.id
            const addressId = t.to_address.id
            const trackingId = t.tracker.id
            const trackingCode = t.tracker.tracking_code
            const dateStart = t.created_at
            const dateEnd = t.tracker.est_delivery_date
            const deliveryStatus = t.tracker.status
            const userId = req.user.id
            order.create({
              fullName,
              phoneNumber,
              address,
              address1,
              city,
              country,
              postalCode,
              deliverFee,
              subtotalPrice,
              totalPrice,
              shippingId,
              addressId,
              trackingId,
              trackingCode,
              dateStart,
              dateEnd,
              deliveryStatus,
              userId
            })

              .then((order) => {
                for (oi in req.session.userCart) {
                  //   let id = req.session.userCart[oi].ID;
                  const product_name = req.session.userCart[oi].Name
                  const author = req.session.userCart[oi].Author
                  const publisher = req.session.userCart[oi].Publisher
                  const genre = req.session.userCart[oi].Genre
                  const price = req.session.userCart[oi].SubtotalPrice
                  const stock = req.session.userCart[oi].Quantity
                  const details = ''
                  const weight = req.session.userCart[oi].SubtotalWeight
                  const product_image = req.session.userCart[oi].Image
                  const orderId = order.id
                  total_weight_oz = (parseFloat(total_weight_oz) + parseFloat(weight)).toFixed(2)
                  const new_order_item = order_item.create({
                    product_name, author, publisher, genre, price, stock, details, weight, product_image, orderId
                  })
                }
                console.log(order)
                res.redirect('/product/stripetxn_end')
                const trackingCode = order.dataValues.trackingCode
                api.Tracker.retrieve(trackingCode).then((t) => {
                  console.log(t.public_url)
                  const trackingURL = t.public_url
                  // client.messages
                  //   .create({
                  //     body:
                  //       "Thank you for your purchase from the Book Store. Your tracking code is " +
                  //       trackingCode +
                  //       " and check your delivery here!\n" +
                  //       trackingURL,
                  //     from: "+12059461964",
                  //     to: "+6590251744",
                  //   })
                  //   .then((message) => console.log(message.sid));

                  console.log('hello')
                  // Empty the cart
                  req.session.userCart = {}
                  req.session.coupon_type = null
                  req.session.discount = 0
                  req.session.discount_limit = 0
                  req.session.discounted_price = (0).toFixed(2)
                  req.session.shipping_discount = 0
                  req.session.shipping_discount_limit = 0
                  req.session.shipping_discounted_price = 0
                  req.session.sub_discount = 0
                  req.session.sub_discount_limit = 0
                  req.session.sub_discounted_price = 0
                  req.session.full_subtotal_price = 0
                  req.session.full_total_price = 0
                  req.session.deducted = 0
                  req.session.coupon_type = null
                  req.session.save()
                })
              })
          })
        })

        console.log('its true')
        // res.redirect("/delivery/checkout2");
      } else {
        console.log('its false')
        alertMessage(
          res,
          'danger',
          'Please enter a valid address',
          'fas faexclamation-circle',
          true
        )
        res.redirect('/delivery/checkout')
      }
      // console.log(addr.verifications.errors);
    })
    .catch((e) => {
      console.log(e) // check errors
    })

  // End of delivery api

  alertMessage(res, 'success', 'Order placed', 'fas fa-exclamation-circle', true)
  // res.redirect("/delivery/checkout2");
})

router.get('/paynow', checkCart, (req, res) => {
  title = 'PayNow Payment'
  // let payNowString = paynow('proxyType','proxyValue','edit',price,'merchantName','additionalComments')
  const payNowString = paynow('mobile', '87558054', 'no', req.session.full_total_price, 'Test Merchant Name', 'Testing paynow')
  const qr = QRCode.toDataURL(payNowString)
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
    })
})

router.post('/paynow', async (req, res) => {
  const the_date = moment().format('D MMM YYYY')
  const dateStart = the_date.toString()
  console.log('dateStart is ' + dateStart)

  // Create a unconfirmed order
  const new_pending_order = await Pending_Order.create({
    fullName: req.session.recipientName,
    phoneNumber: req.session.recipientPhoneNo,
    address: req.session.address,
    address1: req.session.address1,
    city: req.session.city,
    country: req.session.countryShipment,
    postalCode: req.session.postalCode,
    deliverFee: 0,
    subtotalPrice: parseFloat(req.session.full_subtotal_price).toFixed(2),
    totalPrice: parseFloat(req.session.full_total_price).toFixed(2),
    dateStart: dateStart,
    userId: req.user.id
  }).catch((err) => {
    console.log('Cannot create pending order')
    console.log(err)
  })

  // Store unconfirmed order's order items
  for (oi in req.session.userCart) {
    const product_name = req.session.userCart[oi].Name
    const author = req.session.userCart[oi].Author
    const publisher = req.session.userCart[oi].Publisher
    const genre = req.session.userCart[oi].Genre
    const price = req.session.userCart[oi].SubtotalPrice
    const stock = req.session.userCart[oi].Quantity
    const details = ''
    const weight = req.session.userCart[oi].SubtotalWeight
    const product_image = req.session.userCart[oi].Image
    const PorderId = new_pending_order.id
    const new_poi = await Pending_OrderItem.create({
      product_name, author, publisher, genre, price, stock, details, weight, product_image, pendingOrderId: PorderId
    })

      .catch((err) => {
        console.log('Cannot create pending order item')
        console.log(err)
      })
  }

  // This block of code below will send a message
  client.messages
    .create({
      body: 'You made an order with BookStore via payNow/payLah!, you will be notified again when your order is confirmed',
      from: '+14242066417',
      to: '+6587558054'
    })
    .then(message => console.log(message.sid))

  // req.session.recipientName = req.body.fullName
  // req.session.recipientPhoneNo = req.body.phoneNumber
  // req.session.address = req.body.address
  // req.session.address1 = req.body.address1
  // req.session.city = req.body.city
  // req.session.countryShipment = req.body.country
  // req.session.postalCode = req.body.postalCode

  // Empty the cart
  req.session.userCart = {}
  req.session.coupon_type = null
  req.session.discount = 0
  req.session.discount_limit = 0
  req.session.discounted_price = (0).toFixed(2)
  req.session.shipping_discount = 0
  req.session.shipping_discount_limit = 0
  req.session.shipping_discounted_price = 0
  req.session.sub_discount = 0
  req.session.sub_discount_limit = 0
  req.session.sub_discounted_price = 0
  req.session.full_subtotal_price = 0
  req.session.full_total_price = 0
  req.session.deducted = 0
  req.session.coupon_type = null
  alertMessage(res, 'success', 'Order placed, the administrator will shortly confirm your payment', 'fas fa-exclamation-circle', true)
  res.redirect('paynowtxn_end')
})

router.get('/stripetxn_end', (req, res) => {
  title = 'Thank you!'
  res.render('checkout/thankYouStripe', {
    title
  })
})

router.get('/paynowtxn_end', (req, res) => {
  title = 'Thank you!'
  res.render('checkout/thankYouPayNow', {
    title
  })
})

// Admin Side

router.get('/discountmenu', ensureAdminAuthenticated, (req, res) => {
  title = 'Discount & Coupon Menu'
  res.render('checkout/discountmenu', {
    title
  })
})

router.get('/viewPendingOrders', ensureAdminAuthenticated, async (req, res) => {
  // let PendingOrders = await Pending_Order.findAll({include: Pending_OrderItem});
  // let PendingOrderItems = await Pending_OrderItem.findAll({})
  // let PendingOrderItems = PendingOrders.PendingOrderItems

  const title = 'View Pending Orders'

  Pending_Order
    .findAll({
      where: {
      },
      include: [{ model: Pending_OrderItem }]
    }).then((pending_order) => {
      // console.log("TESTING")
      // console.log(pending_order[6]);
      // console.log("TESTING AGAIN")
      // console.log(pending_order[6].pending_orderitems)
      // console.log(pending_order[0].Pending_OrderItem);
      // console.log(pending_order[0].PendingOrderItems);
      res.render('checkout/viewPendingOrders', {
        PendingOrders: pending_order,
        title
        // Don't need this below, wont work when rendering
        // PendingOrderItems: pending_order.pending_orderitems
      })
    })

  // console.log("PENDING ORDER ITEMS ARE " + PendingOrders.Pending_OrderItem)
}),

router.get('/ConfirmPOrder/:id', ensureAdminAuthenticated, async (req, res) => {
  const PO = await Pending_Order.findOne({ where: { id: req.params.id } })
  const POI = await Pending_OrderItem.findAll({ where: { pendingOrderId: PO.id } })

  const parcel = new api.Parcel({
    predefined_package: 'Parcel',
    weight: 10 // change number according to weight of total books
  })

  parcel.save()

  const fromAddress = new api.Address({
    // default address of company
    name: 'Bookstore',
    street1: '118 2nd Street',
    street2: '4th Floor',
    city: 'San Francisco',
    state: 'CA',
    country: 'US',
    zip: '94105',
    phone: '415-123-4567',
    email: 'example@example.com'
  })
  // fromAddress.save().then(console.log);

  const toAddress = new api.Address({
    verify: ['delivery'],
    /* name: fullName,
        company: "-",
        street1: address,
        city: city,
        state: "-",
        phone: phoneNumber,
        country: country,
        zip: postalCode, */
    // example code cos too lazy to type down
    name: 'George Costanza',
    company: 'Vandelay Industries',
    street1: '1 E 161st St.',
    phone: '+6587558054',
    city: 'Bronx',
    state: 'NY',
    // zip: "10451", //Actual zipcode
    zip: '12412352551'
  })
  toAddress
    .save()
    .then((addr) => {
      // console.log(addr);
      // console.log(addr.verifications)
      const checkAddress = addr.verifications.delivery.success
      // console.log(addr.verifications.delivery.errors[0])
      if (checkAddress == true) {
        const shipment = new api.Shipment({
          to_address: toAddress,
          from_address: fromAddress,
          parcel: parcel
        })
        // shipment.save()//.then(console.log);
        shipment.save().then((s) => {
          s.buy(shipment.lowestRate(['USPS'], ['First'])).then((t) => {
            console.log('=============')
            console.log(t.id)
            const fullName = PO.id
            const phoneNumber = PO.phoneNumber
            const address = PO.address
            const address1 = PO.address1
            const city = PO.city
            const country = PO.country
            const postalCode = PO.postalCode
            const deliverFee = PO.deliverFee
            const subtotalPrice = PO.subtotalPrice
            const totalPrice = PO.totalPrice
            const shippingId = t.id
            const addressId = t.to_address.id
            const trackingId = t.tracker.id
            const trackingCode = t.tracker.tracking_code
            const dateStart = t.created_at
            const dateEnd = t.tracker.est_delivery_date
            const deliveryStatus = t.tracker.status
            const userId = PO.userId
            order.create({
              fullName,
              phoneNumber,
              address,
              address1,
              city,
              country,
              postalCode,
              deliverFee,
              subtotalPrice,
              totalPrice,
              shippingId,
              addressId,
              trackingId,
              trackingCode,
              dateStart,
              dateEnd,
              deliveryStatus,
              userId
            })

              .then((order) => {
                for (oi in POI) {
                  //   let id = req.session.userCart[oi].ID;
                  const product_name = POI[oi].product_name
                  const author = POI[oi].author
                  const publisher = POI[oi].publisher
                  const genre = POI[oi].genre
                  const price = POI[oi].price
                  const stock = POI[oi].stock
                  const details = ''
                  const weight = POI[oi].weight
                  const product_image = POI[oi].product_image
                  const orderId = order.id
                  order_item.create({
                    product_name, author, publisher, genre, price, stock, details, weight, product_image, orderId
                  })
                }
                console.log(order)
                // Delete pending orders and pois since order confirmed already
                PO.destroy()
                for (i in POI) {
                  console.log(`Deleting Product ${i}`)
                  POI[i].destroy()
                }
                alertMessage(res, 'success', `Confirmed Order ${order.id} which belongs to user of id ${order.userId}`, 'fas fa-exclamation-circle', true)
                res.redirect('/product/viewPendingOrders')
                const trackingCode = order.dataValues.trackingCode
                api.Tracker.retrieve(trackingCode).then((t) => {
                  console.log(t.public_url)
                  const trackingURL = t.public_url
                  client.messages
                    .create({
                      body:
                            'Your order has been confirmed!' +
                            'Thank you for your purchase from the Book Store. Your tracking code is ' +
                            trackingCode +
                            ' and check your delivery here!\n' +
                            trackingURL,
                      from: '+14242066417',
                      to: order.phoneNumber
                    })
                    .then((message) => console.log(message.sid))
                })
              })
          })
        })

        console.log('its true')
        // res.redirect("/delivery/checkout2");
      } else {
        console.log('its false')
        alertMessage(
          res,
          'danger',
          'Please enter a valid address',
          'fas faexclamation-circle',
          true
        )
        res.redirect('/product/viewPendingOrders')
      }
      // console.log(addr.verifications.errors);
    })
    .catch((e) => {
      console.log(e) // check errors
    })
})

router.get('/DeletePOrder/:id', ensureAdminAuthenticated, async (req, res) => {
  // Code commented out below does work... but doesn't remove pending order items associated with it when a PO is deleted
  // Pending_Order.findOne({where: {id: req.params.id}, include:[{model:Pending_OrderItem}]})
  // .then((po)=> {
  //     po.destroy();
  // })

  const PO = await Pending_Order.findOne({ where: { id: req.params.id } })
  const POI = await Pending_OrderItem.findAll({ where: { pendingOrderId: PO.id } })
  // console.log("POI IS")
  // console.log(POI[0].destroy())
  client.messages
    .create({
      body: 'From BookStore: We are sorry to inform you that your order has cancelled by the administrator due to lack of payment',
      from: '+14242066417',
      to: PO.phoneNumber
    })
    .then((message) => console.log(message.sid))
  alertMessage(res, 'success', `Pending Order with ID ${PO.id} Deleted`, 'fas fa-exclamation-circle', true)
  PO.destroy()
  for (i in POI) {
    console.log(`Deleting Product ${i}`)
    POI[i].destroy()
  }
  res.redirect('/product/viewPendingOrders')
})

router.get('/createCoupon', ensureAdminAuthenticated, (req, res) => {
  // if (!req.session.public_coupon) {
  //     req.session.public_coupon = "NULL";
  // }
  title = 'Create Coupon'
  const currentDate = moment(req.body.currentDate, 'DD/MM/YYYY')
  // Get current time of server
  // hh or HH = 24 hr format, h / H = 12 hr format, a = PM/AM
  const currentTime = moment().format('HH:mm')

  let errors

  res.render('checkout/createCoupon', {
    title,
    currentTime,
    errors
  })
})

router.post('/createCoupon', ensureAdminAuthenticated, (req, res) => {
  // Retrieve the inputs from the create coupon form
  const coupon_code = req.body.coupon_code
  const coupon_type = req.body.coupon_type
  const coupon_discount = req.body.coupon_discount
  const coupon_limit = req.body.coupon_limit
  let coupon_public = req.body.coupon_public
  const coupon_msg = req.body.coupon_msg
  // let coupon_expire_date = req.body.coupon_expire_date;
  // let coupon_expire_time = req.body.coupon_expire_time;
  const full_time = req.body.coupon_expire_date + ' ' + req.body.coupon_expire_time

  // Note that the date/time stored in mySQL will be GMT althought date/time is based on our server(SGT)
  // E.g Coupon expiry date and time is SGT (GMT+8) 09/08/2020, 06:00 -> GMT 08/08/2020, 22:00
  const expiry_date_time = moment(full_time, 'DD/MM/YYYY, hh:mm:ss a')

  const current_time = moment()
  const et = moment(expiry_date_time) // format into the same way as current_time (in ms)

  // Set BOOLEAN value of 'public' column
  if (coupon_public == 'YES') {
    coupon_public = 1
  } else {
    coupon_public = 0
  }

  Coupon.findOne({
    where: { code: coupon_code }
  })
    .then((c) => {
      // Duplicate case
      if (c) {
        console.log('Coupon of the same code already exist')
        alertMessage(res, 'danger', `Code ${c.code} already exists!`, 'fas fa-exclamation-circle', true)
        res.redirect('createCoupon')
      }

      // Invalid/Expired time case
      if (et.isBefore(current_time)) { // prevent user from inputting a date/time that has already passed
        alertMessage(res, 'danger', 'Date or Time entered invalid!', 'fas fa-exclamation-circle', true)
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
              const oc = req.session.public_coupon
              console.log(oc.code)
              req.session.public_coupon = coupon_object
              Coupon.destroy({
                where: { id: oc.id }
              })
              // oc.destroy(); -> doesnt work 'oc doesnt have function 'destroy'
            }

            req.session.save()
            alertMessage(res, 'success', `Coupon Code ${coupon_object.code} Created, it expires on ${coupon_object.expiry}`, 'fas fa-exclamation-circle', true)
            res.redirect('/product/createCoupon')
          })
          .catch(() => {
            console.log('Something went wrong with creating the coupon')
          })
      }
    })
})

// Create Discount Page
router.get('/createDiscount', ensureAdminAuthenticated, async (req, res) => {
  title = 'Create Discount'
  const currentDate = moment(req.body.currentDate, 'DD/MM/YYYY')
  const currentTime = moment().format('HH:mm')
  let errors

  const products = await ProductAdmin.findAll({})
  res.render('checkout/createDiscount', {
    title,
    currentTime,
    errors,
    products
  })
})

router.post('/createDiscount', ensureAdminAuthenticated, async (req, res) => {
  // Retrieve the inputs from the create discount form
  const target_id = req.body.target_id
  const product_discount = req.body.product_discount
  const min_qty = req.body.min_qty
  const discount_msg = req.body.discount_msg
  const discount_expire_date = req.body.discount_expire_date
  const discount_expire_time = req.body.discount_expire_time
  const stackable = 0
  // let coupon_expire_date = req.body.coupon_expire_date;
  // let coupon_expire_time = req.body.coupon_expire_time;
  const full_time = req.body.discount_expire_date + ' ' + req.body.discount_expire_time

  // Note that the date/time stored in mySQL will be GMT althought date/time is based on our server(SGT)
  // E.g Coupon expiry date and time is SGT (GMT+8) 09/08/2020, 06:00 -> GMT 08/08/2020, 22:00
  const expiry_date_time = moment(full_time, 'DD/MM/YYYY, hh:mm:ss a')

  const current_time = moment()
  const et = moment(expiry_date_time) // format into the same way as current_time (in ms)

  const d = await Discount.findOne({ where: { target_id: target_id } })

  // Duplicate case
  if (d != null) {
    console.log('Discount of the same code already exist')
    alertMessage(res, 'danger', `Discount for ID: ${d.target_id} already exists!`, 'fas fa-exclamation-circle', true)
    // res.redirect('createDiscount')
  }

  // Invalid/Expired time case
  else if (et.isBefore(current_time)) { // prevent user from inputting a date/time that has already passed
    alertMessage(res, 'danger', 'Date or Time entered invalid!', 'fas fa-exclamation-circle', true)
    // res.redirect('createDiscount')
  }

  // No problem, create
  else if (d == null) {
    const new_d = await Discount.create({
      discount_rate: product_discount,
      min_qty: min_qty,
      expiry: expiry_date_time,
      stackable: stackable,
      message: discount_msg,
      target_id: target_id
    })

    alertMessage(res, 'success', `Discount for Product ID: ${new_d.target_id} Created, it expires on ${new_d.expiry}`, 'fas fa-exclamation-circle', true)
  }

  res.redirect('/product/createDiscount')
})

// Admin - View Discounts and Coupons and Delete together

router.get('/viewDiscount', ensureAdminAuthenticated, async (req, res) => {
  const title = 'View Discount'
  const discounts = await Discount.findAll({})
  const coupons = await Coupon.findAll({})
  res.render('checkout/viewDiscount', {
    title,
    discounts,
    coupons
  })
})

router.get('/deleteDiscount/:id', ensureAdminAuthenticated, async (req, res) => {
  const target_id = req.params.id
  let url = '/product/viewDiscount'
  Discount.findOne({
    where: { target_id: target_id }
  }).then((disc_object) => {
    if (disc_object != null) {
      disc_object.destroy()
      alertMessage(res, 'success', 'Discount for Product ' + target_id + ' is successfully deleted', 'fas fa-sign-in-alt', true)
    } else {
      url = '/'
      console.log('Invalid ID provided, not deleting anything')
    }
  }).catch((err) => {
    console.log(err)
  })

  res.redirect(url)
})

router.get('/deleteCoupon/:id', ensureAdminAuthenticated, async (req, res) => {
  const id = req.params.id
  let url = '/product/viewDiscount'
  Coupon.findOne({
    where: { id: id }
  }).then((c) => {
    if (c != null) {
      c.destroy()
      alertMessage(res, 'success', 'Coupon ' + id + ' is successfully deleted', 'fas fa-sign-in-alt', true)
    } else {
      url = '/'
      console.log('Invalid ID provided, not deleting anything')
    }
  }).catch((err) => {
    console.log(err)
  })

  res.redirect(url)
})

module.exports = router
