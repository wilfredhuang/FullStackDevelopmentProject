const express = require("express");
const router = express.Router();
// User register URL using HTTP post => /user/register
const User = require("../models/User");
const alertMessage = require("../helpers/messenger");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const cartItem = require("../models/CartItem");
const order = require("../models/Order");
const ensureAuthenticated = require("../helpers/auth");
const { v1: uuidv1 } = require("uuid");

//NodeMailer
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const SECRET = "fX7UvuRP55";

//Contact Us Form at Footer by Hasan
//BTW this is a testing ground for email notifications
router.post("/contactUs", (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let message = req.body.message;
  let emailMessage = `<p>Hello World!</p>`;
  console.log(name);
  let info = transporter.sendMail({
    from: '"Book Store Support"superlegitemail100percent@gmail.com', // sender address
    to: email, // list of receivers
    subject: "Contact Us", // Subject line
    //text: "Hello world?", // plain text body
    html: emailMessage, // html body
  });
  console.log(info);
  alertMessage(
    res,
    "success",
    "Thank You for contacting us!",
    "fas faexclamation-circle",
    true
  );
  res.redirect("/");
  //.catch(err => console.log(err));
});

//nodemailer
let transporter = nodemailer.createTransport({
  host: "smtp.googlemail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "superlegitemail100percent@gmail.com", // generated ethereal user
    pass: "Passw0rdyes", // generated ethereal password
  },
  tls: {
    rejectUnauthorized: false,
  },
});

router.get("/confirmation/:token", async (req, res) => {
  const token = jwt.verify(req.params.token, SECRET);
  User.findOne({ where: { id: token.user } }).then((user) => {
    user.update({ confirmed: true });
    console.log("email verified");
  });
  res.redirect("https://localhost:5000/user/login");
});
router.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

router.get("/userPage", (req, res) => {
  const title = "User Information";
  res.render("user/userpage", {
    title,
  });
});

router.get("/userRecentOrder", (req, res) => {
  const title = "Order History";

  // Need to intergrate this later on
  order
    .findAll({
      //where:{
      //  id: req.params.id,
      //}
    })
    .then((order) => {
      res.render("user/userRecentOrder1", {
        order: order,
        title,
      });
    })
    .catch((err) => console.log(err));
});

router.get("/userCart", (req, res) => {
  const title = "Cart";
  cartItem
    .findAll({
      //where:{
      //  userId = req.user.id,
      //},
    })
    .then((cartItem) => {
      res.render("user/userCart", {
        cartItem: cartItem,
        title,
      });
    });
});

// Ignore, from practical

// router.post('/register', (req, res) => {
//     let errors = [];
//     // Retrieves fields from register page from request body
//     let { name, email, password, password2 } = req.body;
//     // Checks if both passwords entered are the same
//     if (password !== password2) {
//         errors.push({ text: 'Passwords do not match' });
//     }

//     // Checks that password length is more than 4
//     if (password.length < 4) {
//         errors.push({ text: 'Password must be at least 4 characters' })
//     }

//     if (errors.length > 0) {
//         res.render('user/register', {
//             errors,
//             name,
//             email,
//             password,
//             password2,
//         });
//     }

//     else {
//         // if all is well, checks if user is already registered
//         User.findOne({ where: { email: req.body.email } })
//             .then(user => {
//                 if (user) {
//                     // If user is found, means email has already been registered
//                     res.render('user/register', {
//                         error: user.email + 'already registered',
//                         name,
//                         email,
//                         password,
//                         password2
//                     });
//                 }
//                 else {
//                     // Create new user account
//                     bcrypt.genSalt(10, function(err, salt) {
//                         bcrypt.hash(password, salt, function(err, hash) {
//                             User.create({ name, email, password: hash })
//                                 .then(user => {
//                                     alertMessage(res, 'success', user.name + ' added. Please login',
//                                     'fas fa-sign-in-alt', true);
//                                     res.redirect('/showLogin');
//                                 })
//                                 .catch(err => console.log(err));
//                         });
//                     });
//                 }
//             });
//         }
//     });

// // Login Form POST => /user/login
// router.post('/login', (req, res, next) => {
//     passport.authenticate('local', {
//         successRedirect: '/video/listVideos', // Route to /video/listVideos URL
//         failureRedirect: '/user/login', // Route to /login URL
//         failureFlash: true
//         /* Setting the failureFlash option to true instructs Passport to flash an error message using the
//        message given by the strategy's verify callback, if any. When a failure occur passport passes the message
//        object as error */
//     })(req, res, next);
// });
router.get("/login", (req, res) => {
  res.render("user/login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/user/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/register", (req, res) => {
  res.render("user/register");
});

router.post("/register", (req, res) => {
  errors = [];
  let { email, name, password, password2 } = req.body;
  if (password !== password2) {
    errors.push({ text: "Passwords do not match" });
  }
  if (password.length < 4) {
    errors.push({ text: "Password must be at least 4 characters" });
  }
  if (errors.length > 0) {
    res.render("user/register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    User.findOne({ where: { email: req.body.email } }).then((user) => {
      if (user) {
        res.render("user/register", {
          error: user.email + " already registered",
          name,
          email,
          password,
          password2,
        });
      } else {
        bcrypt.genSalt(10, function (err, salt) {
          if (err) return next(err);
          bcrypt.hash(password, salt, function (err, hash) {
            if (err) return next(err);
            password = hash;
            theid = uuidv1();
            User.create({
              id: theid,
              name,
              email,
              password,
              isadmin: false,
              confirmed: false,
            })
              .then((user) => {
                alertMessage(
                  res,
                  "success",
                  user.name + " added.Please Verify you account",
                  "fas fa-sign-in-alt",
                  true
                );
                jwt.sign(
                  {
                    user: theid,
                  },
                  SECRET,
                  {
                    expiresIn: "1d",
                  },
                  (err, emailToken) => {
                    const url = `https://localhost:5000/user/confirmation/${emailToken}`;
                    console.log(url);
                    transporter.sendMail({
                      to: req.body.email,
                      subject: "Confirm Email",
                      html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`,
                    });
                  }
                );
                res.redirect("/user/login");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

router.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

router.get("/userPage", ensureAuthenticated, (req, res) => {
  res.render("user/userPage");
});

router.post("/userPage/changeinfo", (req, res) => {
  errors = [];
  let { email, name, password, password2 } = req.body;
  console.log(req.body);
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(password, salt, function (err, hash) {
      if (err) return next(err);
      password = hash;
      if (password != user.password) {
        error.push({ text: "Wrong password" });
      } else {
        if (name != null) {
          User.update({ name: name });
        }
        if (email != null) {
          User.update({ email: email });
        }
        if (password2 != null) {
          bcrypt.hash(password2, salt, function (err, hash) {
            if (err) return next(err);
            password2 = hash;
            User.update({ password: password2 });
          });
        }
      }
    });
  });
});

router.get("/changeinfo", function (req, res) {
  res.render("user/changeinfo");
});

module.exports = router;
