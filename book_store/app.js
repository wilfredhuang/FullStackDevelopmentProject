
const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const Handlebars = require('handlebars');
const nodemailer = require('nodemailer');

const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')

//nodemailer 
let transporter = nodemailer.createTransport({
    host: 'mail.gmx.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'legitbookstore@gmx.com', // generated ethereal user
        pass: 'legitbookPass'  // generated ethereal password
    },
  });

//https
const openssl = require('openssl-nodejs')
const https = require('https');
const fs = require('fs');
const options = {
	key: fs.readFileSync('key.pem'),
	cert: fs.readFileSync('cert.crt')
  };
//admin 
const AdminBroExpress = require('admin-bro-expressjs')

// Stripe Payment System
// Set your secret key. Remember to switch to your live secret key in production!
const stripe = require('stripe')('sk_test_ns9DyHTray5Wihniw93C2ANH00IMJTVjKw', {
	apiVersion: '2020-03-02',
  });

// Bcrypt - Encrypt password - P4A1
const bcrypt = require('bcryptjs');  // added here for debugging, but it's import only used in user.js
// Passport - Setting Authentication - P4A2
const passport = require('passport');

// Load routes
const mainRoute = require('./routes/main');
const userRoute = require('./routes/user');
const productRoute = require('./routes/product');
const deliveryRoute = require('./routes/cart');
const checkoutRoute = require('./routes/checkout');
const adminRoute = require('./routes/admin');

// Library to use MySQL to store session objects
const MySQLStore = require('express-mysql-session');
const db = require('./config/db');// db.js config file

// Messaging libraries
const flash = require('connect-flash');
const FlashMessenger = require('flash-messenger');

// Bring in database connection 
const vidjotDB = require('./config/DBConnection');
// Connects to MySQL database 
vidjotDB.setUpDB(false); // To set up database with new tables set (true)

// Passport Config - P4A2
// const authenticate = require('./config/passport'); 
// authenticate.localStrategy(passport); 

global.userCart = {};
// Bring in Handlebars Helpers here
const {convertUpper, adminCheck, emptyCart, cartQty, formatDate, capitaliseFirstLetter} = require('./helpers/hbs');

// creates an express server
const app = express();

// Handlebars Middleware
app.engine('handlebars', exphbs({
	defaultLayout: 'main',	// Specify default template views/layout/main.handlebar
	helpers: {
		convertUpper: convertUpper,
		adminCheck: adminCheck,
		emptyCart: emptyCart,
		cartQty: cartQty,
		formatDate: formatDate,
		capitaliseFirstLetter:capitaliseFirstLetter,
	},					
	handlebars: allowInsecurePrototypeAccess(Handlebars),
}));
app.set('view engine', 'handlebars');

// Body parser middleware to parse HTTP body to read post data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Creates static folder for publicly accessible HTML, CSS and Javascript files
app.use(express.static(path.join(__dirname, 'public')));

// Method override middleware to use other HTTP methods such as PUT and DELETE
app.use(methodOverride('_method'));

// Enables session to be stored using browser's Cookie
app.use(cookieParser());

// Express session middleware - uses MySQL to store session
app.use(session({
 	key: 'vidjot_session',
 	secret: 'tojiv',
// 	store: new MySQLStore({
// 		host: db.host,
// 		port: 3306,
// 		user: db.username,
// 		password: db.password,
// 		database: db.database,
// 		clearExpired: true,
// 		// How frequently expired sessions will be cleared; milliseconds:
// 		checkExpirationInterval: 900000,
// 		// The maximum age of a valid session; milliseconds: 
// 		expiration: 900000,
// 	}),
 	resave: false,
 	saveUninitialized: false,
}));

// Initilize Passport middleware - P4A2
// app.use(passport.initialize());
// app.use(passport.session());

// Two flash messenging libraries - Flash (connect-flash) and Flash Messenger
app.use(flash());
app.use(FlashMessenger.middleware);

// Global variables
app.use(function (req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
});

// Use Routes
app.use('/', mainRoute);	// uses main.js routing under ./routes
app.use('/user', userRoute);
app.use('/product', productRoute);
app.use('/delivery', deliveryRoute);
app.use('/checkout', checkoutRoute);
app.use('/admin',adminRoute);

app.use(function(req, res, next) {
	res.status(404).render('404');

});

const port = 5000;


/* changed to https so this is not needed
app.listen(port, () => {
	console.log(`Server started on port ${port}`);
});
*/
//remember to use https://localhost:5000/
https.createServer(options,app).listen(port);