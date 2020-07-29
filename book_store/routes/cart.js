const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const alertMessage = require("../helpers/messenger");
const cartItem = require("../models/CartItem");
const EasyPost = require("@easypost/api");

//Request Function
const request = require('request');

//EasyPost API
const apiKey = "EZTK29b55ab4ee7a437890e19551520f5dd0uaJjPiW9XsVqXYFNVI0kog";
const api = new EasyPost(apiKey);

//Twilio API
const accountSid = "AC7994551ea296710e5de3b74d7a93056c";
const authToken = "f5ac6a9439b75395ce54e9783d0f8877";
const client = require("twilio")(accountSid, authToken);

//Google Recaptcha Secret Key
const secretKey = "6Le367IZAAAAAJ042sFATGXzwqHsO6N3f38W4G81";

//QR Code
var QRCode = require('qrcode')

//NodeMailer
const nodemailer = require('nodemailer');


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

//Post user's address info to EasyPost API
router.post("/processCheckout", (req, res) => {
  let fullName = req.body.fullName.toString();
  let email = req.body.email.toString();
  let phoneNumber = "+" + req.body.phoneNumber.toString();
  let address = req.body.address;
  let address1 = req.body.address1;
  let city = req.body.city.toString();
  let country = req.body.country.toString();
  let postalCode = req.body.postalCode.toString();
  let deliverFee = 0; //req.body.deliveryFee;
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
    //zip: "10451", //Actual zipcode
    zip: "12412352551",
  });
  toAddress
    .save()
    .then((addr) => {
      //console.log(addr);
      //console.log(addr.verifications)
      let checkAddress = addr.verifications.delivery.success;
      //console.log(addr.verifications.delivery.errors[0])
      if (checkAddress == true) {
        const shipment = new api.Shipment({
          to_address: toAddress,
          from_address: fromAddress,
          parcel: parcel,
        });
        //shipment.save()//.then(console.log);
        shipment.save().then((s) => {
          s.buy(shipment.lowestRate(["USPS"], ["First"])).then((t) => {
            console.log("=============");
            console.log(t.id);
            let shippingId = t.id;
            let addressId = t.to_address.id;
            let trackingId = t.tracker.id;
            let trackingCode = t.tracker.tracking_code;
            let dateStart = t.created_at;
            let dateEnd = t.tracker.est_delivery_date;
            let deliveryStatus = t.tracker.status;
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
              deliveryStatus,
            }).then((Order) => {
              console.log(Order);
              res.redirect("/delivery/checkout2");
              let trackingCode = Order.dataValues.trackingCode;
              api.Tracker.retrieve(trackingCode).then((t) => {
                console.log(t.public_url);
                let trackingURL = t.public_url;
                client.messages
                  .create({
                    body:
                      "Thank you for your purchase from the Book Store. Your tracking code is " +
                      trackingCode +
                      " and check your delivery here!\n" +
                      trackingURL,
                    from: "+12059461964",
                    to: "+6590251744",
                  })
                  .then((message) => console.log(message.sid));
              });
            });
          });
        });
        console.log("its true");
        //res.redirect("/delivery/checkout2");
      } else {
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

//SMS Notification - in progress
router.post("/deliveryUpdates", (req, res) => {});

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
    console.log("===========");
    const shippingId = order.shippingId;
    console.log(shippingId);
    api.Shipment.retrieve(shippingId).then((s) => {
      console.log(s.tracker.created_at);
      console.log(s.tracker.updated_at);
      const deliveryStatus = s.tracker.status;
      const trackingURL = s.tracker.public_url;
      if (deliveryStatus == "pre_transit"){
        let progressPercentage =25;
        let progressColour = "bg-info";
        let progressColourText = "text-info";
        res.render("products/viewMoreOrder", {
          order: order,
          title,
          deliveryStatus,
          trackingURL,
          progressPercentage,
          progressColour,
          progressColourText
        });
      }
      else if (deliveryStatus == "in_transit"){
        let progressPercentage = 50;
        let progressColour = "bg-info";
        let progressColourText = "text-info";
        res.render("products/viewMoreOrder", {
          order: order,
          title,
          deliveryStatus,
          trackingURL,
          progressPercentage,
          progressColour,
          progressColourText
        });
      }
      else if (deliveryStatus == "out_for_delivery"){
        let progressPercentage = 75;
        let progressColour = "bg-info";
        let progressColourText = "text-info";
        res.render("products/viewMoreOrder", {
          order: order,
          title,
          deliveryStatus,
          trackingURL,
          progressPercentage,
          progressColour,
          progressColourText
        });
      }
      else if (deliveryStatus == "delivered"){
        let progressPercentage = 100;
        let progressColour = "bg-success";
        let progressColourText = "text-success";
        res.render("products/viewMoreOrder", {
          order: order,
          title,
          deliveryStatus,
          trackingURL,
          progressPercentage,
          progressColour,
          progressColourText
        });
      }
      else if (deliveryStatus == "return_to_sender"){
        let progressPercentage = 0;
        let progressColour = "bg-info";
        let progressColourText = "text-info";
        res.render("products/viewMoreOrder", {
          order: order,
          title,
          deliveryStatus,
          trackingURL,
          progressPercentage,
          progressColour,
          progressColourText
        });
      }
      else if (deliveryStatus == "failure"){
        let progressPercentage = 100;
        let progressColour = "bg-danger";
        let progressColourText = "text-danger";
        res.render("products/viewMoreOrder", {
          order: order,
          title,
          deliveryStatus,
          trackingURL,
          progressPercentage,
          progressColour,
          progressColourText
        });
      }
      else{
        let progressPercentage = 0;
        let progressColour = "bg-dark";
        let progressColourText = "text-dark";
        res.render("products/viewMoreOrder", {
          order: order,
          title,
          deliveryStatus,
          trackingURL,
          progressPercentage,
          progressColour,
          progressColourText
        });
      }
    });
  });
});

router.get("/checkDelivery", (req, res) => {
  const title = "Shipping Tracking";
  res.render("delivery/checkDelivery", {
    title,
  });
});

router.post("/checkingDelivery", (req, res) => {
  const title = "Shipping Tracking";
  let trackingId = req.body.trackingIdInput;
  //trk_f10a3961f7c4419184aca1dabc09e4f8
  //console.log(trackingId);
  let siteUrl = 'https://www.google.com/recaptcha/api/siteverify?secret=your_secret&response=response_string&remoteip=user_ip_address'
  //let captcha = document.querySelector("#g-recaptcha-response").value
  let captcha = req.body['g-recaptcha-response'] //get user token value

  //checks if captcha response is valid
  if (
    captcha === undefined ||
    captcha === "" ||
    captcha === null
  ) {
    return res.json({ success: false, msg: "Please select captcha" });
  }

  const verifyURL =
    "https://www.google.com/recaptcha/api/siteverify?secret=" +
    secretKey +
    "&response=" +
    captcha;
  console.log(verifyURL); //this is a url that needs to be verified

  request(verifyURL, (err, response, body) => {
    body = JSON.parse(body);
    console.log(body)  //retrieves response from google and return its json info

    if (body.success !== undefined && !body.success) {
      return res.json({ "success": false, "msg": "Failed captcha" });
    } else {
      api.Tracker.retrieve(trackingId)
    .then((s) => {
      console.log(s);
      let deliveryStatus = s.status;
      let URL = s.public_url;
      let statusDetail = s.status_detail
      let carrierType = s.carrier;
      let createdAt = s.created_at;
      let updatedAt = s.updated_at;
      let carrierService = s.carrier_detail.service;
      if (deliveryStatus == "pre_transit"){
        let progressPercentage =25;
        let progressColour = "bg-info";
        let progressColourText = "text-info";
        QRCode.toDataURL(URL, function (err, url) {
          let showQRCODE = url;
          res.render("delivery/deliveryStatusPage", {
            title,
            deliveryStatus,
            statusDetail,
            URL,
            carrierType,
            carrierService,
            createdAt,
            updatedAt,
            trackingId,
            showQRCODE,
            progressPercentage,
            progressColour,
            progressColourText
          });})
      }
      else if (deliveryStatus == "in_transit"){
        let progressPercentage = 50;
        let progressColour = "bg-info";
        let progressColourText = "text-info";
        QRCode.toDataURL(URL, function (err, url) {
          let showQRCODE = url;
          res.render("delivery/deliveryStatusPage", {
            title,
            deliveryStatus,
            statusDetail,
            URL,
            carrierType,
            carrierService,
            createdAt,
            updatedAt,
            trackingId,
            showQRCODE,
            progressPercentage,
            progressColour,
            progressColourText
          });})
      }
      else if (deliveryStatus == "out_for_delivery"){
        let progressPercentage = 75;
        let progressColour = "bg-info";
        let progressColourText = "text-info";
        QRCode.toDataURL(URL, function (err, url) {
          let showQRCODE = url;
          res.render("delivery/deliveryStatusPage", {
            title,
            deliveryStatus,
            statusDetail,
            URL,
            carrierType,
            carrierService,
            createdAt,
            updatedAt,
            trackingId,
            showQRCODE,
            progressPercentage,
            progressColour,
            progressColourText
          });})
      }
      else if (deliveryStatus == "delivered"){
        let progressPercentage = 100;
        let progressColour = "bg-success";
        let progressColourText = "text-success";
        QRCode.toDataURL(URL, function (err, url) {
          let showQRCODE = url;
          res.render("delivery/deliveryStatusPage", {
            title,
            deliveryStatus,
            statusDetail,
            URL,
            carrierType,
            carrierService,
            createdAt,
            updatedAt,
            trackingId,
            showQRCODE,
            progressPercentage,
            progressColour,
            progressColourText
          });})
      }
      else if (deliveryStatus == "return_to_sender"){
        let progressPercentage = 0;
        let progressColour = "bg-info";
        let progressColourText = "text-info";
        QRCode.toDataURL(URL, function (err, url) {
          let showQRCODE = url;
          res.render("delivery/deliveryStatusPage", {
            title,
            deliveryStatus,
            statusDetail,
            URL,
            carrierType,
            carrierService,
            createdAt,
            updatedAt,
            trackingId,
            showQRCODE,
            progressPercentage,
            progressColour,
            progressColourText
          });})
      }
      else if (deliveryStatus == "failure"){
        let progressPercentage = 100;
        let progressColour = "bg-danger";
        let progressColourText = "text-danger";
        QRCode.toDataURL(URL, function (err, url) {
          let showQRCODE = url;
          res.render("delivery/deliveryStatusPage", {
            title,
            deliveryStatus,
            statusDetail,
            URL,
            carrierType,
            carrierService,
            createdAt,
            updatedAt,
            trackingId,
            showQRCODE,
            progressPercentage,
            progressColour,
            progressColourText
          });})
      }
      else{
        let progressPercentage = 0;
        let progressColour = "bg-dark";
        let progressColourText = "text-dark";
        QRCode.toDataURL(URL, function (err, url) {
          let showQRCODE = url;
          res.render("delivery/deliveryStatusPage", {
            title,
            deliveryStatus,
            statusDetail,
            URL,
            carrierType,
            carrierService,
            createdAt,
            updatedAt,
            trackingId,
            showQRCODE,
            progressPercentage,
            progressColour,
            progressColourText
          });})
      }
      console.log("correct btw");
      
    })
    // catch any errors
    .catch((e) => {
      //console.log(e.error.error.code)
      console.log(e);
      let errorCode = e.error.error.code;
      if (errorCode == "TRACKER.NOT_FOUND") {
        //check if tracking code not found
        //console.log("hello")
        alertMessage(
          res,
          "danger",
          "Please enter a valid tracking number",
          "fas faexclamation-circle",
          true
        );
        res.redirect("checkDelivery");
      }
    });
      //return res.json({ "success": true, "msg": "Successful captcha" });
    }
  });
});

module.exports = router;
