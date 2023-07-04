var express = require('express');
var path = require('path');
var config = require('./config/database'); 
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var index = require('./routes/index');
var users = require('./routes/users');
var mongoose = require('mongoose');

var socketo = require('./socket').io;
//Passport
var session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
//Passport-End!
var app = express();

mongoose.connect(config.database);

mongoose.connection.on('connected',()=>{
  console.log('connected to database');

});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
var sessionMiddleware = session({
  secret: 'uygugujbjbiubub',
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  resave: false,
  saveUninitialized: false,
  //cookie: { secure: true }
});
app.use(sessionMiddleware);
/*Sharing session with socket.io*/
socketo.use(function(socket, next){
  sessionMiddleware(socket.request, socket.request.res, next);
});
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next){
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});
passport.use(new LocalStrategy({passReqToCallback: true},
  function(req, username, password, done) {
    var identity = req.body.identity;
    req.session.identity = identity;
    console.log(identity)
    if(identity==1){
      identity=require('./models/client');
    }
    else if(identity==2){
      identity=require('./models/developer');
    }
    else if(identity==3){
      identity=require('./models/hacker');
    }
    else if(identity==4){
      identity=require('./models/admin');
    }
    else{
      return done(null, false);
    }
    console.log(username)
    console.log(password)

    identity.findOne({email: username} //db column name is username
      ,function(error, user){
        if(error){
          return done(error);
        }
        if(!user){
          return done(null, false);
        }
        var hash = user.password.toString();//db column name is password
        bcrypt.compare(password, hash, function(error, response){
          if(response){
            console.log("AUTH")
            return done(null, {user_id: user.id});
          }
          else{
            console.log("NOT AUTH")
            return done(null, false);
          }
        });
      }
    );
  }
));
app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
var hbs = require('hbs');
const partialsDir = __dirname + '/views/partials';
const filenames = fs.readdirSync(partialsDir);
filenames.forEach(function (filename) {
  const matches = /^([^.]+).hbs$/.exec(filename);
  if (!matches) {
    return;
  }
  const name = matches[1];
  const template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');
  hbs.registerPartial(name, template);
});
hbs.registerHelper('equal', function(a, b, options){
  if(a === b){
    return options.fn(this);
  }
  else{
    return options.inverse(this);
  }
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
