// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app      = express();
var port     = process.env.PORT || 8080;

var passport = require('passport');
var flash    = require('connect-flash');
var topicRouter= require('./app/routes/topic/topicRouter');

// configuration ===============================================================
// connect to our database

require('./config/passport')(passport); // pass passport for configuration



// set up our express application

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));


app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
	secret: 'sessionsecret',
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(express.static('public'));

// routes ======================================================================
require('./app/routes.js')(app, passport);
app.use('/topic',topicRouter);

app.get('/error', function(req, res, next){
	next(new Error('A contrived error'));
});
// launch ======================================================================

app.listen(port);
console.log('localhost:' + port);
