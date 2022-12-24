var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');
const requestIp = require('request-ip');
// var session = require('express-session'); 
const expressEjsLayouts = require('express-ejs-layouts');
const helmet = require('helmet');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admins');

var app = express();

//use helmet library both at production and development stages
// app.use(helmet());

//parsing the urls
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// app.use(express.static('./public/images')); 
//IP middle ware
app.use(requestIp.mw());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//layout of ejs
app.use(expressEjsLayouts);
app.set('layout', './layouts/index_layout');

app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//sessioning
// var sess = {
//   // genid: (req) => {
//   //   return genuuid() // use UUIDs for session IDs
//   // },
//   secret: 'user session',
//   token: 'sam',
//   resave: true,
//   saveUninitialized: true,
//   cookie: {}
// }

// if (app.get('env') === 'production') {
//   app.set('trust proxy', 1) // trust first proxy
//   sess.cookie.secure = true // serve secure cookies
// }
// app.use(session(sess));

//Configuration of our routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admins', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

