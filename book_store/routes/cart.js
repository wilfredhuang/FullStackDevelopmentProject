const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const cartItem = require("../models/CartItem");
const EasyPost = require("@easypost/api");
const apiKey = "EZTK29b55ab4ee7a437890e19551520f5dd0oJNz9EtGGQwxZFavjxPxCg";
const api = new EasyPost(apiKey);

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
  let address1 = req.body.address1;
  let city = req.body.city.toString();
  let country = req.body.country.toString();
  let postalCode = req.body.postalCode.toString();
  let deliverFee = 10; //req.body.deliveryFee;
  let totalPrice = 10; //req.body.totalPrice;
  console.log(fullName);
  /*
  const fromAddress = new api.Address({
    //default address of company
    name: "Bookstore",
    street1: "118 2nd Street",
    street2: "4th Floor",
    city: "San Francisco",
    state: "CA",
    country: "US",
    zip: "94105",
    phone: "415-123-4567",
    email: "example@example.com",
  });
  fromAddress.save().then(console.log);

  const toAddress = new api.Address({
    name: fullName,
    company: "-",
    street1: address,
    city: city,
    state: "-",
    phone: phoneNumber,
    zip: postalCode,
  });

  toAddress.save().then(console.log);
  const parcel = new api.Parcel({
    length: 9,
    width: 6,
    height: 2,
    weight: 10,
  });

  parcel.save().then(console.log);
  const shipment = new api.Shipment({
    to_address: toAddress,
    from_address: fromAddress,
    parcel: parcel,
  });

  shipment.save().then(console.log);

  shipment.buy(shipment.lowestRate(["USPS"], ["First"])).then(console.log);
  console.log(shipment.tracking_code);

  //let userId = "hello"; //req.user.id
  Order.create({
    fullName,
    phoneNumber,
    address,
    address1,
    city,
    country,
    postalCode,
    deliverFee,
    totalPrice,
  }).then((Order) => {
    res.redirect("/delivery/checkout2");
  });*/
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
router.get("/viewMoreOrder/:id", (req, res) => {
  const title = "Order Details";
  Order.findOne({
    where: {
      id: req.params.id,
    },
  }).then((order) => {
    res.render("products/viewMoreOrder", {
      order: order,
      title,
    });
  });
});

module.exports = router;
