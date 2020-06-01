const express = require("express");
const router = express.Router();
const Order = require("../models/Cart");
const cartItem = require("../models/CartItem");

router.get("/checkout", (req, res) => {
  const title = "Check Out";
  cartItem.findAll({}).then((cartItem) => {
    res.render("delivery/checkOut", {
      title,
      cartItem: cartItem,
    });
  });
});

router.post("/addToCart", (req, res) => {
  let title = "7 DAY SELF PUBLISH HOW TO WRITE A BOOK";
  let price = 3.37;
  let amount = 1;
  cartItem
    .create({
      title,
      price,
      amount,
    })
    .then((cartItem) => {
      res.redirect("/product/listproduct");
    })
    .catch((err) => console.log(err));
});

router.get("/removeItem/:id", (req, res) => {
  cartItem
    .findOne({
      where: {
        id: req.params.id,
      },
    })
    .then((cartItem) => {
      cartItem
        .destroy({
          where: {
            id: req.params.id,
          },
        })
        .then((cartItem) => {
          res.redirect("/user/userCart");
        });
    })
    .catch((err) => console.log(err)); // To catch no cartItem ID
});

router.post("/processCheckout", (req, res) => {
  let fullName = req.body.fullName.toString();
  let phoneNumber = req.body.phoneNumber.toString();
  let address = req.body.address;
  let address1 = req.body.address1.toString();
  let city = req.body.city.toString();
  let country = req.body.country.toString();
  let postalCode = req.body.postalCode.toString();
  let deliveryFee = 10; //req.body.deliveryFee;
  let totalPrice = 10; //req.body.totalPrice;
  console.log(fullName);
  //let userId = "hello"; //req.user.id
  Order.create({
    fullName,
    phoneNumber,
    address,
    address1,
    city,
    country,
    postalCode,
    deliveryFee,
    totalPrice,
  }).then((Order) => {
    res.redirect("/delivery/checkout2");
  });
});

//after checkout page
router.get("/checkout2", (req, res) => {
  const title = "Thank You";
  res.render("delivery/thankYou"),
    {
      title,
    };
});

//view More Details of Order //still uses cart.js for example, will change later on
router.get("/viewMoreOrder", (req, res) => {
  const title = "Order Details";
  cartItem.findAll({}).then((cartItem) => {
    res.render("products/viewMoreOrder", {
      cartItem:cartItem,
      title,
    });
  });
});

module.exports = router;
