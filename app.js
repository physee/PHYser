const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const flash = require('connect-flash');
const expressValidator = require('express-validator');
const promisify = require('es6-promisify');
const routes = require('./routes/index');
const errorHandlers = require('./handlers/errorHandlers');
const helper = require('./helper');
const sessionMiddleware = require('./handlers/sessionMiddleware');

require('./handlers/passport');

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

app.use(expressValidator());

app.use(cookieParser());

app.use(sessionMiddleware);
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());


app.use((req, res, next) => {
  res.locals.h = helper;
  res.locals.flashes = req.flash();
  res.locals.user = req.user || null;
  next();
});

// app.use((req, res, next) => {
//   req.login = promisify(req.login, req);
//   next();
// });

app.use('/', routes);
// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);
app.use(errorHandlers.flashValidationErrors);
// Otherwise this was a really bad error we didn't expect!
if (app.get('env') === 'development') {
  /* Development Error Handler - Prints stack trace */
  app.use(errorHandlers.developmentErrors);
}

// production error handler
app.use(errorHandlers.productionErrors);

module.exports = app;
