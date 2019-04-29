const express = require('express');
const path = require('path');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const errorHandlers = require('./handlers/errorHandlers');

const app = express();
// CORS
app.use(cors());
// enable pre-flight request
app.options('*', cors());

app.set('views', path.join(__dirname, 'views')); // this is the folder where we keep our pug files
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

// Takes the raw requests and turns them into usable properties on req.body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Exposes a bunch of methods for validating data. Used heavily on userController.validateRegister
app.use(expressValidator());

// Import the routes
const routes = require('./routes/index');
// and use them!
// all the routes with in v1 need to go through the authentication process by sending token
app.use('/', routes);
// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// Otherwise this was a really bad error we didn't expect!
if (app.get('env') === 'development') {
  /* Development Error Handler - Prints stack trace */
  app.use(errorHandlers.developmentErrors);
}

// production error handler
app.use(errorHandlers.productionErrors);

module.exports = app;
