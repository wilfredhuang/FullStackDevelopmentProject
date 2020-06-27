const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const alertMessage = require("../helpers/messenger");
const cartItem = require("../models/CartItem");
const EasyPost = require("@easypost/api");
//const e = require("express");
const apiKey = "EZTK29b55ab4ee7a437890e19551520f5dd0uaJjPiW9XsVqXYFNVI0kog";
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
  let email = req.body.email.toString();
  let phoneNumber = req.body.phoneNumber.toString();
  let address = req.body.address;
  let address1 = req.body.address1;
  let city = req.body.city.toString();
  let country = req.body.country.toString();
  let postalCode = req.body.postalCode.toString();
  let deliverFee = 10; //req.body.deliveryFee;
  let totalPrice = 10; //req.body.totalPrice;
  //console.log(fullName);

  const parcel = new api.Parcel({
    predefined_package: "Parcel",
    weight: 10, //change number according to weight of total books
  });

  parcel.save(); //.then(console.log);

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
  //fromAddress.save().then(console.log);

  const toAddress = new api.Address({
    verify: ["delivery"],

    /*name: fullName,
    company: "-",
    street1: address,
    city: city,
    state: "-",
    phone: phoneNumber,
    country: country,
    zip: postalCode,*/
    //example code cos too lazy to type down
    name: "George Costanza",
    company: "Vandelay Industries",
    street1: "1 E 161st St.",
    city: "Bronx",
    state: "NY",
    zip: "10451",
  });
  toAddress
    .save()
    .then((addr) => {
      //console.log(addr);
      //console.log(addr.street1);
      //console.log(addr.verifications)
      //console.log(addr.id)
      let checkAddress = addr.verifications.delivery.success;
      //console.log(addr.verifications.delivery.errors[0])
      if (checkAddress == true) {
        const shipment = new api.Shipment({
          to_address: toAddress,
          from_address: fromAddress,
          parcel: parcel,
        });
      
        //shipment.save()//.then(console.log);
      
        shipment
          .save()
          .then((s) => {
            s.buy(shipment.lowestRate(["USPS"], ["First"]))
            .then((t) => {
              console.log("=============")
              console.log(t.id)
              let shippingId = t.id
              let addressId = t.to_address.id
              let trackingId = t.tracker.id
              let trackingCode = t.tracker.tracking_code
              let dateStart = t.created_at
              let dateEnd = t.tracker.est_delivery_date
              let deliveryStatus = t.tracker.status
              //console.log(shippingId)
              //console.log(addressId)
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
                shippingId,
                addressId,
                trackingId,
                trackingCode,
                dateStart,
                dateEnd,
                deliveryStatus
              }).then((Order) => {
                res.redirect("/delivery/checkout2");
              })
            })
          }
          );
        console.log(checkAddress);
        console.log("its true");
         
        //res.redirect("/delivery/checkout2");
      } else {
        console.log(checkAddress);
        console.log("its false");
        alertMessage(
          res,
          "danger",
          "Please enter a valid address",
          "fas faexclamation-circle",
          true
        );
        res.redirect("/delivery/checkout");
      }

      //console.log(addr.verifications.errors);
    })
    .catch((e) => {
      console.log(e); //check errors
    });
});

// Dont touch, stripe code -W
// router.get('/checkout', async (req, res) => {
//   const intent = // ... Fetch or create the PaymentIntent
//   res.render('checkout', { client_secret: intent.client_secret });
// });

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
    console.log("===========")
    const shippingId = order.shippingId
    console.log(shippingId)
    api.Shipment.retrieve(shippingId).then((s) => {
      console.log(s.tracker.created_at)
      console.log(s.tracker.updated_at)
      const deliveryStatus = s.tracker.status
      const trackingURL = s.tracker.public_url
      
      res.render("products/viewMoreOrder", {
        order: order,
        title,
        deliveryStatus,
        trackingURL
      });
    });
  });
});

module.exports = router;
