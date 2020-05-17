
const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const Handlebars = require('handlebars')
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')

// Bcrypt - Encrypt password - P4A1
const bcrypt = require('bcryptjs');  // added here for debugging, but it's import only used in user.js
// Passport - Setting Authentication - P4A2
const passport = require('passport');




// Load routes
const mainRoute = require('./routes/main');
const userRoute = require('./routes/user');
const videoRoute = require('./routes/video');

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
const authenticate = require('./config/passport'); 
authenticate.localStrategy(passport); 



// creates an express server
const app = express();

// Handlebars Middleware
app.engine('handlebars', exphbs({
	defaultLayout: 'main',						// Specify default template views/layout/main.handlebar
	handlebars: allowInsecurePrototypeAccess(Handlebars)
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
	store: new MySQLStore({
		host: db.host,
		port: 3306,
		user: db.username,
		password: db.password,
		database: db.database,
		clearExpired: true,
		// How frequently expired sessions will be cleared; milliseconds:
		checkExpirationInterval: 900000,
		// The maximum age of a valid session; milliseconds: 
		expiration: 900000,
	}),
	resave: false,
	saveUninitialized: false,
}));

// Initilize Passport middleware - P4A2
app.use(passport.initialize());
app.use(passport.session());

// Two flash messenging libraries - Flash (connect-flash) and Flash Messenger
app.use(flash());
app.use(FlashMessenger.middleware);


// Global variables
app.use(function (req, res, next) {
	next();
});

// Use Routes
app.use('/', mainRoute);	// uses main.js routing under ./routes
app.use('/user', userRoute);
app.use('/video', videoRoute);

const port = 5000;

app.listen(port, () => {
	console.log(`Server started on port ${port}`);
});

