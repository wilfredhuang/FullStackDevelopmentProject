const express = require('express')
const router = express.Router()
const alertMessage = require('../helpers/messenger')

// Models
const Order = require('../models/Order')
const orderItem = require('../models/OrderItem')

// Authentication
const ensureAuthenticated = require('../helpers/auth')
const ensureAdminAuthenticated = require('../helpers/adminauth')

// Request Function
const request = require('request')

// EasyPost API
const EasyPost = require('@easypost/api')
const apiKey = 'EZTK29b55ab4ee7a437890e19551520f5dd0uaJjPiW9XsVqXYFNVI0kog'
const api = new EasyPost(apiKey)

// Twilio API
const accountSid = 'AC7994551ea296710e5de3b74d7a93056c'
const authToken = 'f5ac6a9439b75395ce54e9783d0f8877'
const client = require('twilio')(accountSid, authToken)

// Google Recaptcha Secret Key
const secretKey = '6Le367IZAAAAAJ042sFATGXzwqHsO6N3f38W4G81'

// QR Code
const QRCode = require('qrcode')

// NodeMailer
const nodemailer = require('nodemailer')

// Email Template
// const Email = require('email-templates');

// Post user's address info to EasyPost API
// router.post("/processCheckout", (req, res) => {
//   let fullName = req.body.fullName.toString();
//   let email = req.body.email.toString();
//   let phoneNumber = "+" + req.body.phoneNumber.toString();
//   let address = req.body.address;
//   let address1 = req.body.address1;
//   let city = req.body.city.toString();
//   let country = req.body.country.toString();
//   let postalCode = req.body.postalCode.toString();
//   let deliverFee = 0; //req.body.deliveryFee;
//   let totalPrice = 10; //req.body.totalPrice;
//   //console.log(fullName);

//   const parcel = new api.Parcel({
//     predefined_package: "Parcel",
//     weight: 10, //change number according to weight of total books
//   });

//   parcel.save();

//   const fromAddress = new api.Address({
//     //default address of company
//     name: "Bookstore",
//     street1: "118 2nd Street",
//     street2: "4th Floor",
//     city: "San Francisco",
//     state: "CA",
//     country: "US",
//     zip: "94105",
//     phone: "415-123-4567",
//     email: "example@example.com",
//   });
//   //fromAddress.save().then(console.log);

//   const toAddress = new api.Address({
//     verify: ["delivery"],
//     /*name: fullName,
//     company: "-",
//     street1: address,
//     city: city,
//     state: "-",
//     phone: phoneNumber,
//     country: country,
//     zip: postalCode,*/
//     //example code cos too lazy to type down
//     name: "George Costanza",
//     company: "Vandelay Industries",
//     street1: "1 E 161st St.",
//     phone: "+6590257144",
//     city: "Bronx",
//     state: "NY",
//     //zip: "10451", //Actual zipcode
//     zip: "12412352551",
//   });
//   toAddress
//     .save()
//     .then((addr) => {
//       //console.log(addr);
//       //console.log(addr.verifications)
//       let checkAddress = addr.verifications.delivery.success;
//       //console.log(addr.verifications.delivery.errors[0])
//       if (checkAddress == true) {
//         const shipment = new api.Shipment({
//           to_address: toAddress,
//           from_address: fromAddress,
//           parcel: parcel,
//         });
//         //shipment.save()//.then(console.log);
//         shipment.save().then((s) => {
//           s.buy(shipment.lowestRate(["USPS"], ["First"])).then((t) => {
//             console.log("=============");
//             console.log(t.id);
//             let shippingId = t.id;
//             let addressId = t.to_address.id;
//             let trackingId = t.tracker.id;
//             let trackingCode = t.tracker.tracking_code;
//             let dateStart = t.created_at;
//             let dateEnd = t.tracker.est_delivery_date;
//             let deliveryStatus = t.tracker.status;
//             let userId = req.user.id;
//             Order.create({
//               fullName,
//               phoneNumber,
//               address,
//               address1,
//               city,
//               country,
//               postalCode,
//               deliverFee,
//               totalPrice,
//               shippingId,
//               addressId,
//               trackingId,
//               trackingCode,
//               dateStart,
//               dateEnd,
//               deliveryStatus,
//               userId,
//             }).then((Order) => {
//               console.log(Order);
//               res.redirect("/delivery/checkout2");
//               let trackingCode = Order.dataValues.trackingCode;
//               api.Tracker.retrieve(trackingCode).then((t) => {
//                 console.log(t.public_url);
//                 let trackingURL = t.public_url;
//                 // client.messages
//                 //   .create({
//                 //     body:
//                 //       "Thank you for your purchase from the Book Store. Your tracking code is " +
//                 //       trackingCode +
//                 //       " and check your delivery here!\n" +
//                 //       trackingURL,
//                 //     from: "+12059461964",
//                 //     to: "+6590251744",
//                 //   })
//                 //   .then((message) => console.log(message.sid));
//               });
//             });
//           });
//         });
//         console.log("its true");
//         //res.redirect("/delivery/checkout2");
//       } else {
//         console.log("its false");
//         alertMessage(
//           res,
//           "danger",
//           "Please enter a valid address",
//           "fas faexclamation-circle",
//           true
//         );
//         res.redirect("/delivery/checkout");
//       }
//       //console.log(addr.verifications.errors);
//     })
//     .catch((e) => {
//       console.log(e); //check errors
//     });
// });

// view More Details of Order
router.get('/viewMoreOrder/:id', ensureAuthenticated, (req, res) => {
  const title = 'Order Details'
  console.log('helllo')
  console.log(req.params.id)
  Order.findOne({
    where: {
      userId: req.user.id,
      id: req.params.id
    },
    include: [{ model: orderItem }]
  }).then((order) => {
    console.log('===========')
    const shippingId = order.shippingId
    console.log(shippingId)
    api.Shipment.retrieve(shippingId).then((s) => {
      console.log(s.tracker.created_at)
      console.log(s.tracker.updated_at)
      const deliveryStatus = s.tracker.status
      const trackingURL = s.tracker.public_url
      if (deliveryStatus == 'pre_transit') {
        const progressPercentage = 25
        const progressColour = 'bg-info'
        const progressColourText = 'text-info'
        const deliveryStatusResult = 'Pre-transit'
        res.render('user/viewMoreOrder', {
          order: order,
          orderitems: order.orderitems,
          title,
          deliveryStatusResult,
          trackingURL,
          progressPercentage,
          progressColour,
          progressColourText
        })
      } else if (deliveryStatus == 'in_transit') {
        const progressPercentage = 50
        const progressColour = 'bg-info'
        const progressColourText = 'text-info'
        const deliveryStatusResult = 'In-transit'
        res.render('user/viewMoreOrder', {
          order: order,
          orderitems: order.orderitems,
          title,
          deliveryStatusResult,
          trackingURL,
          progressPercentage,
          progressColour,
          progressColourText
        })
      } else if (deliveryStatus == 'out_for_delivery') {
        const progressPercentage = 75
        const progressColour = 'bg-info'
        const progressColourText = 'text-info'
        const deliveryStatusResult = 'Out for delivery'
        res.render('user/viewMoreOrder', {
          order: order,
          orderitems: order.orderitems,
          title,
          deliveryStatusResult,
          trackingURL,
          progressPercentage,
          progressColour,
          progressColourText
        })
      } else if (deliveryStatus == 'delivered') {
        const progressPercentage = 100
        const progressColour = 'bg-success'
        const progressColourText = 'text-success'
        const deliveryStatusResult = 'Delivered'
        res.render('user/viewMoreOrder', {
          order: order,
          orderitems: order.orderitems,
          title,
          deliveryStatusResult,
          trackingURL,
          progressPercentage,
          progressColour,
          progressColourText
        })
      } else if (deliveryStatus == 'return_to_sender') {
        const progressPercentage = 0
        const progressColour = 'bg-info'
        const progressColourText = 'text-info'
        const deliveryStatusResult = 'Return to sender'
        res.render('user/viewMoreOrder', {
          order: order,
          orderitems: order.orderitems,
          title,
          deliveryStatusResult,
          trackingURL,
          progressPercentage,
          progressColour,
          progressColourText
        })
      } else if (deliveryStatus == 'failure') {
        const progressPercentage = 100
        const progressColour = 'bg-danger'
        const progressColourText = 'text-danger'
        const deliveryStatusResult = 'Failure'
        res.render('user/viewMoreOrder', {
          order: order,
          orderitems: order.orderitems,
          title,
          deliveryStatusResult,
          trackingURL,
          progressPercentage,
          progressColour,
          progressColourText
        })
      } else {
        const progressPercentage = 0
        const progressColour = 'bg-dark'
        const progressColourText = 'text-dark'
        const deliveryStatusResult = 'Unknown'
        res.render('user/viewMoreOrder', {
          order: order,
          orderitems: order.orderitems,
          title,
          deliveryStatusResult,
          trackingURL,
          progressPercentage,
          progressColour,
          progressColourText
        })
      }
    })
  })
})

router.get(
  '/viewMoreOrderAdmin/:id',
  ensureAuthenticated,
  ensureAdminAuthenticated,
  (req, res) => {
    const title = 'Order Details - Admin'
    Order.findOne({
      where: {
        userId: req.user.id,
        id: req.params.id
      },
      include: [{ model: orderItem }]
    }).then((order) => {
      console.log('===========')
      const shippingId = order.shippingId
      console.log(shippingId)
      api.Shipment.retrieve(shippingId).then((s) => {
        console.log(s.tracker.created_at)
        console.log(s.tracker.updated_at)
        const deliveryStatus = s.tracker.status
        const trackingURL = s.tracker.public_url
        if (deliveryStatus == 'pre_transit') {
          const progressPercentage = 25
          const progressColour = 'bg-info'
          const progressColourText = 'text-info'
          const deliveryStatusResult = 'Pre-transit'
          res.render('user/viewMoreOrderAdmin', {
            order: order,
            orderitems: order.orderitems,
            title,
            deliveryStatusResult,
            trackingURL,
            progressPercentage,
            progressColour,
            progressColourText
          })
        } else if (deliveryStatus == 'in_transit') {
          const progressPercentage = 50
          const progressColour = 'bg-info'
          const progressColourText = 'text-info'
          const deliveryStatusResult = 'In-transit'
          res.render('user/viewMoreOrderAdmin', {
            order: order,
            orderitems: order.orderitems,
            title,
            deliveryStatusResult,
            trackingURL,
            progressPercentage,
            progressColour,
            progressColourText
          })
        } else if (deliveryStatus == 'out_for_delivery') {
          const progressPercentage = 75
          const progressColour = 'bg-info'
          const progressColourText = 'text-info'
          const deliveryStatusResult = 'Out for delivery'
          res.render('user/viewMoreOrderAdmin', {
            order: order,
            orderitems: order.orderitems,
            title,
            deliveryStatusResult,
            trackingURL,
            progressPercentage,
            progressColour,
            progressColourText
          })
        } else if (deliveryStatus == 'delivered') {
          const progressPercentage = 100
          const progressColour = 'bg-success'
          const progressColourText = 'text-success'
          const deliveryStatusResult = 'Delivered'
          res.render('user/viewMoreOrderAdmin', {
            order: order,
            orderitems: order.orderitems,
            title,
            deliveryStatusResult,
            trackingURL,
            progressPercentage,
            progressColour,
            progressColourText
          })
        } else if (deliveryStatus == 'return_to_sender') {
          const progressPercentage = 0
          const progressColour = 'bg-info'
          const progressColourText = 'text-info'
          const deliveryStatusResult = 'Return to sender'
          res.render('user/viewMoreOrderAdmin', {
            order: order,
            orderitems: order.orderitems,
            title,
            deliveryStatusResult,
            trackingURL,
            progressPercentage,
            progressColour,
            progressColourText
          })
        } else if (deliveryStatus == 'failure') {
          const progressPercentage = 100
          const progressColour = 'bg-danger'
          const progressColourText = 'text-danger'
          const deliveryStatusResult = 'Failure'
          res.render('user/viewMoreOrderAdmin', {
            order: order,
            orderitems: order.orderitems,
            title,
            deliveryStatusResult,
            trackingURL,
            progressPercentage,
            progressColour,
            progressColourText
          })
        } else {
          const progressPercentage = 0
          const progressColour = 'bg-dark'
          const progressColourText = 'text-dark'
          const deliveryStatusResult = 'Unknown'
          res.render('user/viewMoreOrderAdmin', {
            order: order,
            orderitems: order.orderitems,
            title,
            deliveryStatusResult,
            trackingURL,
            progressPercentage,
            progressColour,
            progressColourText
          })
        }
      })
    })
  }
)

router.get('/displayLabelUrl/:id', ensureAuthenticated, ensureAdminAuthenticated, (req, res) => {
  console.log(req.params.id)
  const shippingId = req.params.id
  api.Shipment.retrieve(shippingId).then((s) => {
    s.convertLabelFormat('PDF').then((sr) => {
      const postageLabelUrlPNG = sr.postage_label.label_url
      const postageLabelUrlPDF = sr.postage_label.label_pdf_url
      console.log(postageLabelUrlPNG)
      console.log(postageLabelUrlPDF)
      res.redirect(postageLabelUrlPDF)
    })
  })
})

router.get('/printLabelPDF/:id', ensureAuthenticated, ensureAdminAuthenticated, (req, res) => {
  console.log(req.params.id)
  const shippingId = req.params.id
  api.Shipment.retrieve(shippingId).then((s) => {
    s.convertLabelFormat('PDF').then((sr) => {
      const postageLabelUrlPDF = sr.postage_label.label_pdf_url
      const options = {
        url: 'https://api.printnode.com/printjobs',
        json: true,
        headers: {
          Authorization:
            'Basic REdqckZpUFVnUndGckdxbFNFSmpHbnRpUmotREhqb3FPeFhlUlg3UlYtbw=='
        },
        method: 'POST',
        body: {
          printerId: '69642287',
          title: 'Order Label',
          contentType: 'pdf_uri',
          content: postageLabelUrlPDF,
          source: 'Comes from EasyPost API'
        }
      }
      request(options, (err, response, body) => {
        console.error('error:', err) // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode) // Print the response status code if a response was received
        console.log('body:', body)
        alertMessage(
          res,
          'success',
          'PrintNode ID: ' + body,
          'fas faexclamation-circle',
          true
        )
        res.redirect('/user/orderHistoryAdmin')
      })
    })
  })
})

router.get('/checkDelivery', (req, res) => {
  const title = 'Shipping Tracking'
  res.render('delivery/checkDelivery', {
    title
  })
})

router.post('/checkingDelivery', (req, res) => {
  const title = 'Shipping Tracking'
  const trackingId = req.body.trackingIdInput
  // trk_f10a3961f7c4419184aca1dabc09e4f8
  const siteUrl =
    'https://www.google.com/recaptcha/api/siteverify?secret=your_secret&response=response_string&remoteip=user_ip_address'
  const captcha = req.body['g-recaptcha-response'] // get user token value

  // checks if captcha response is valid
  if (captcha === undefined || captcha === '' || captcha === null) {
    return res.json({ success: false, msg: 'Please select captcha' })
  }

  const verifyURL =
    'https://www.google.com/recaptcha/api/siteverify?secret=' +
    secretKey +
    '&response=' +
    captcha
  console.log(verifyURL) // this is a url that needs to be verified

  request(verifyURL, (err, response, body) => {
    body = JSON.parse(body)
    console.log(body) // retrieves response from google and return its json info

    if (body.success !== undefined && !body.success) {
      alertMessage(
        res,
        'danger',
        'Please re-enter the recaptcha',
        'fas faexclamation-circle',
        true
      )
      res.redirect('/delivery/checkDelivery')
    } else {
      api.Tracker.retrieve(trackingId)
        .then((s) => {
          console.log(s)
          const deliveryStatus = s.status
          const URL = s.public_url
          const statusDetail = s.status_detail
          const carrierType = s.carrier
          const createdAt = s.created_at
          const updatedAt = s.updated_at
          const carrierService = s.carrier_detail.service
          if (deliveryStatus == 'pre_transit') {
            const progressPercentage = 25
            const progressColour = 'bg-info'
            const progressColourText = 'text-info'
            const deliveryStatusResult = 'Pre-transit'
            QRCode.toDataURL(URL, function (err, url) {
              const showQRCODE = url
              res.render('delivery/deliveryStatusPage', {
                title,
                deliveryStatusResult,
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
              })
            })
          } else if (deliveryStatus == 'in_transit') {
            const progressPercentage = 50
            const progressColour = 'bg-info'
            const progressColourText = 'text-info'
            const deliveryStatusResult = 'In-transit'
            QRCode.toDataURL(URL, function (err, url) {
              const showQRCODE = url
              res.render('delivery/deliveryStatusPage', {
                title,
                deliveryStatusResult,
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
              })
            })
          } else if (deliveryStatus == 'out_for_delivery') {
            const progressPercentage = 75
            const progressColour = 'bg-info'
            const progressColourText = 'text-info'
            const deliveryStatusResult = 'Out for delivery'
            QRCode.toDataURL(URL, function (err, url) {
              const showQRCODE = url
              res.render('delivery/deliveryStatusPage', {
                title,
                deliveryStatusResult,
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
              })
            })
          } else if (deliveryStatus == 'delivered') {
            const progressPercentage = 100
            const progressColour = 'bg-success'
            const progressColourText = 'text-success'
            const deliveryStatusResult = 'Delivered'
            QRCode.toDataURL(URL, function (err, url) {
              const showQRCODE = url
              res.render('delivery/deliveryStatusPage', {
                title,
                deliveryStatusResult,
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
              })
            })
          } else if (deliveryStatus == 'return_to_sender') {
            const progressPercentage = 0
            const progressColour = 'bg-info'
            const progressColourText = 'text-info'
            const deliveryStatusResult = 'Return to sender'
            QRCode.toDataURL(URL, function (err, url) {
              const showQRCODE = url
              res.render('delivery/deliveryStatusPage', {
                title,
                deliveryStatusResult,
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
              })
            })
          } else if (deliveryStatus == 'failure') {
            const progressPercentage = 100
            const progressColour = 'bg-danger'
            const progressColourText = 'text-danger'
            const deliveryStatusResult = 'Failure'
            QRCode.toDataURL(URL, function (err, url) {
              const showQRCODE = url
              res.render('delivery/deliveryStatusPage', {
                title,
                deliveryStatusResult,
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
              })
            })
          } else {
            const progressPercentage = 0
            const progressColour = 'bg-dark'
            const progressColourText = 'text-dark'
            const deliveryStatusResult = 'Unknown'
            QRCode.toDataURL(URL, function (err, url) {
              const showQRCODE = url
              res.render('delivery/deliveryStatusPage', {
                title,
                deliveryStatusResult,
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
              })
            })
          }
          console.log('correct btw')
        })
        // catch any errors
        .catch((e) => {
          console.log(e)
          const errorCode = e.error.error.code
          if (errorCode == 'TRACKER.NOT_FOUND') {
            // check if tracking code not found
            alertMessage(
              res,
              'danger',
              'Please enter a valid tracking number',
              'fas faexclamation-circle',
              true
            )
            res.redirect('checkDelivery')
          }
        })
    }
  })
})

module.exports = router
