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

//admin auth 
const ensureAdmin = (req, res, next) => {
  if(req.isAuthenticated() ) { // If user is authenticated
      console.log(req.user.confirmed);
      if (req.user.isadmin == true){
              return next(); // Calling next() to proceed to the next statement
          }
  }
      // If not authenticated, show alert message and redirect to ‘/’
  alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
  res.redirect('/');
};
//NodeMailer
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const SECRET = "fX7UvuRP55";
const SECRET_2 = "NZqudk2svw";

//Email Template
//const Email = require('email-templates');

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


router.post("/changepassword/:token", async (req, res) => {
  let passsword = req.body.password; 
  const token = jwt.verify(req.params.token, SECRET_2);
  User.findOne({ where: { id: token.user } }).then((user) => {
    bcrypt.hash(password, salt, function (err, hash) {
      if (err) return next(err);
      password = hash;
      User.update({password :password})
    });
  });
});

router.get("/changepassword/:token", async (req, res) => {
  res.render("user/changepassword");
});

router.post("/forgetpassword",(req,res)=>{
  let email = req.body.email
  console.log(email)
  User.findOne({email: email})
  .then((user) =>{
    if(!user){
      res.redirect('/user/login');
    }else{
      theid = user.id;
      jwt.sign(
        {
          user: theid,
        },
        SECRET_2,
        {
          expiresIn: "1d",
        },
        (err, passwordToken) => {
          const url = `https://localhost:5000/user/changepassword/${passwordToken}`;
          console.log(url);
          transporter.sendMail({
            to: req.body.email,
            subject: "Password Reset ",
            html: `Please click this link to change you password: <a href="${url}">${url}</a>`,
          });
        }
      );
      alertMessage(res,"success","please check your email","fas fa-sign-in-alt",true);
      res.redirect("/user/login");
    }
  })
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

router.get("/userPage",ensureAuthenticated, (req, res) => {
  const title = "User Information";
  if(req.user.facebookId != null){
    res.render('user/facebookuserpage', {
      title,
    });
  }else{
  res.render("user/userpage", {
    title,
  });
}
});

router.get("/userRecentOrder", ensureAuthenticated,(req, res) => {
  const title = "Order History";
  cartItem.findAll({
    //
  })
  // Need to intergrate this later on
  console.log(cartItem)

  order
    .findAll({
      where:{
        userId: req.user.id,
      }
    })
    .then((order) => {
      console.log(order)
      console.log("======================")
      res.render("user/userRecentOrder1", {
        order: order,
        title,
        cartItem:cartItem
        //order:cartItem
      });
    })
    .catch((err) => console.log(err));
});

//Need to integrate this later
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
/*
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/user/login",
    failureFlash: true,
  })
  (req, res, next);
});*/
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, function(err) {
      if (err) { return next(err);}
      else if (user.isadmin == true){
        return res.redirect('/user/admin');
      }
      return res.redirect('/');
    });
  })(req, res, next);
});
router.get("/admin",ensureAdmin, (req, res) => {
  res.render("user/adminmenu");
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

router.post("/userPage/changeinfo",ensureAuthenticated, (req, res) => {
  errors = [];
  let { email, name, password, password2 } = req.body;
  console.log(req.body);
  User.findOne({id: req.user.id})
  .then((user) =>{
    console.log(user);
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(password, salt, function (err, hash) {
      if (err) return next(err);
      password = hash;
      if (password != user.password) {
        error.push({ text: "Wrong password" });
      } else {
        if (name != null) {
          User.update({ name: name }, { where: {id: req.user.id} });;
        }
        if (email != null) {
          User.update({ email: email }, { where: {id: req.user.id} });
        }
        if (password2 != null) {
          bcrypt.hash(password2, salt, function (err, hash) {
            if (err) return next(err);
            password2 = hash;
            User.update({ password: password2 }, { where: {id: req.user.id} });
          });
        }
      }
    });
  });
  alertMessage(res,"success","information has been updated","fas fa-sign-in-alt",true);
  res.redirect('/user/userpage')
})
});

router.get("/userPage/changeinfo",ensureAuthenticated, function (req, res) {
  res.render("user/changeinfo");
});

router.get("/userPage/changeaddress",ensureAuthenticated, function (req, res) {
  res.render("user/changeaddress");
});
router.post("/userPage/changeaddress",ensureAuthenticated, (req, res) => {
  errors = [];
  let { PhoneNo, address, address1, city, country, postalCode } = req.body;
  console.log(req.body);
  User.findOne({id: req.user.id})
  .then((user) =>{
    if (PhoneNo != null) {
      User.update({PhoneNo: PhoneNo}, { where: {id: req.user.id} });

    }
    if (address!= null) {
      User.update({ address: address }, { where: {id: req.user.id} });
    }
    if (address1 != null) {
      User.update({ address1: address1 }, { where: {id: req.user.id} });
    }
    if (city != null) {
      User.update({ city: city}, { where: {id: req.user.id} });
    }
    if (country != null) {
      User.update({ country: country}, { where: {id: req.user.id} });
    }
    if (postalCode != null) {
      User.update({ postalCode: postalCode}, { where: {id: req.user.id} });
    }
    alertMessage(res,"success","information has been updated","fas fa-sign-in-alt",true);
    res.redirect('/user/userpage')
  })
});

router.get("/forgetPassword",(req,res) => {
  res.render("user/forgetPassword")
})

module.exports = router;
