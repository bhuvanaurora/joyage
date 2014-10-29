var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');

var crypto = require('crypto');
var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var jwt = require('jwt-simple');
var moment = require('moment');

var async = require('async');
var request = require('request');
var xml2js = require('xml2js');

/*var agenda = require('agenda')({ db: { address: 'localhost:27017/test' } });*/
var agenda = require('agenda')({ db: { address: 'mongodb://bhuvan:joyage_database_password@ds035280.mongolab.com:35280/joyage_database' } });
var sugar = require('sugar');
var nodemailer = require('nodemailer');
var sendgrid = require('sendgrid')('bhuvanaurora', 'joyage_sendGrid_password');
var _ = require('lodash');

var tokenSecret = 'your unique secret';

var activitySchema = new mongoose.Schema({
  _id: String,
  title: String,
  dateOfActivity: String,
  endDateOfActivity: String,
  timeOfActivity: String,
  city: String,
  location: String,
  address: String,
  phone: String,
  sourceWebsite: String,
  sourceName: String,
  sourceDescription: String,
  locationWebsite: String,
  neighborhood: String,
  country: String,
  genre: [String],                              //categories
  description: String,
  status: String,                               //'Continuing' or 'Ended'
  poster: String,                               //Image url
  photoCredit: String,
  photoCreditLink: String,
  currency: String,
  price: String,
  timeAdded: { type: Date, default: Date.now() },
  facebookLink: String,
  twitterLink: String,
  zomatoLink: String,
  payment: String,
  bookRide: String,
  goodies: String,
  moreInfo: String,
  moreInfoLink: String,
  operatingDays: [String],
  operatingTime: [String],
  addedBy: String,
  mapLocation: String,
  corner: String,
  cornerPic: String,
  cornerText: String,
  tips: [{
    text: String,
    tipper: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  }],
  subscribers: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  }],
  subscriptions: { type: Number, default: 0 },
  doneIt: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  }],
  completions: { type: Number, default: 0 },
  media: [{
    title: String,
    text: String,
    link: String
  }]
});

var userSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  email: { type: String, unique: true, lowercase: true, trim: true },
  password: String,
  gender: String,
  age: String,
  facebook: {
    id: String,
    email: String
  },
  google: {
    id: String,
    email: String
  },
  subscribedActivities: [{
    type: String
  }],
  subscriptions: { type: Number, default: 0 },
  doneActivities: [{
    type: String
  }],
  completions: { type: Number, default: 0 }
});

userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) return next();
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

var User = mongoose.model('User', userSchema);
var Activity = mongoose.model('Activity', activitySchema);

/*mongoose.connect('localhost');*/
mongoose.connect('mongodb://bhuvan:joyage_database_password@ds035280.mongolab.com:35280/joyage_database');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {
    if ('/robots.txt' == req.url) {
        res.type('text/plain')
        res.send("User-agent: *\nDisallow: /images/");
    } else {
        next();
    }
});
app.use(function (req, res, next) {
    if ('/humans.txt' == req.url) {
        res.type('text/plain')
        res.send("<b>Developers</b>\nBhuvan Arora\nbhuvan.aurora@gmail.com");
    } else {
        next();
    }
});

function ensureAuthenticated(req, res, next) {
  if (req.headers.authorization) {
    var token = req.headers.authorization.split(' ')[1];
    try {
      var decoded = jwt.decode(token, tokenSecret);
      if (decoded.exp <= Date.now()) {
        res.status(400).send('Access token has expired');
        //res.send(400, 'Access token has expired');                                      // Deprecated
      } else {
        req.user = decoded.user;
        return next();
      }
    } catch (err) {
      return res.status(500).send('Error parsing token');
      //return res.send(500, 'Error parsing token');                                      // Deprecated
    }
  } else {
    return res.send(401);
  }
}

function createJwtToken(user) {
  var payload = {
    user: user,
    iat: new Date().getTime(),
    exp: moment().add('days', 7).valueOf()
  };
  return jwt.encode(payload, tokenSecret);
}

app.post('/auth/signup', function(req, res, next) {
  var user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    subscribedActivities: [],
    doneActivities: []
  });
  user.save(function(err) {
    if (err) return next(err);
    res.send(200);
  });
});

app.post('/auth/login', function(req, res, next) {
  User.findOne({ email: req.body.email }, function(err, user) {
    if (!user) return res.send(401, 'User does not exist');
    user.comparePassword(req.body.password, function(err, isMatch) {
      if (!isMatch) return res.send(401, 'Invalid email and/or password');
      var token = createJwtToken(user);
      res.send({ token: token });
    });
  });
});

app.post('/auth/facebook', function(req, res, next) {
  console.log('I"m in auth/facebook');
  var profile = req.body.profile;
  var signedRequest = req.body.signedRequest;
  var encodedSignature = signedRequest.split('.')[0];
  var payload = signedRequest.split('.')[1];

  var appSecret = 'b6ade547a86b0c809a3703226229a47d';

  var expectedSignature = crypto.createHmac('sha256', appSecret).update(payload).digest('base64');
  expectedSignature = expectedSignature.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  if (encodedSignature !== expectedSignature) {
    return res.send(400, 'Invalid Request Signature');
  }

  User.findOne({ facebook: profile.id }, function(err, existingUser) {
    if (existingUser) {
      var token = createJwtToken(existingUser);
      return res.send(token);
    }
    var user = new User({
      name: profile.first_name,
      gender: profile.gender,
      age: profile.age_range,
      facebook: {
        id: profile.id,
        email: profile.email
      },
      subscribedActivities: [],
      doneActivities: []
    });
    user.save(function(err) {
      if (err) return next(err);
      var token = createJwtToken(user);
      res.send(token);
    });
  });
});

app.post('/auth/google', function(req, res, next) {
  var profile = req.body.profile;
  User.findOne({ google: profile.id }, function(err, existingUser) {
    if (existingUser) {
      var token = createJwtToken(existingUser);
      return res.send(token);
    }
    var user = new User({
      name: profile.displayName,
      google: {
        id: profile.id,
        email: profile.emails[0].value
      },
      subscribedActivities: [],
      doneActivities: []
    });
    user.save(function(err) {
      if (err) return next(err);
      var token = createJwtToken(user);
      res.send(token);
    });
  });
});

app.get('/api/users', function(req, res, next) {
  if (!req.query.email) {
    return res.send(400, { message: 'Email parameter is required.' });
  }

  User.findOne({ email: req.query.email }, function(err, user) {
    if (err) return next(err);
    res.send({ available: !user });
  });
});

app.get('/api/profile/:id', ensureAuthenticated, function(req, res, next) {
  console.log(req.params.id);
  User.findById(req.params.id, function(err, profile) {
    if (err) return next(err);
    res.send(profile);
  });
});

app.get('/api/activities', function(req, res, next) {
  var query = Activity.find();
  
  if (req.query.genre && req.query.limit) {
    query.where({genre: req.query.genre}).limit(req.query.limit);
  } else if (req.query.genre) {
    query.where({ genre: req.query.genre }).limit(9 * req.query.page).sort(req.query.sortOrder);
  } else if (req.query.limit) {
    query.limit(req.query.limit);
  } else {
    if (req.query.sortOrder === 'dateOfActivity') {
      console.log(new Date().valueOf());
      query.where('dateOfActivity').gte(new Date().valueOf()).sort('-dateOfActivity').limit(9 * req.query.page);
    } else if (req.query.sortOrder === 'timeAdded') {
      query.sort('timeAdded').limit(9 * req.query.page);
    } else if (req.query.sortOrder === 'popularity') {
      query.sort('-subscriptions').limit(9 * req.query.page);
    } else {
      query.limit(9 * req.query.page);
    }
  }
  
  query.exec(function(err, activities) {
    if (err) return next(err);
    res.send(activities);
  });
});

app.get('/api/activities/:id', function(req, res, next) {
  Activity.findById(req.params.id, function(err, activity) {
    if (err) return next(err);
    res.send(activity);
  });
});

app.post('/api/activities', function(req, res, next) {
  var activity = new Activity({
    _id: req.body.id,
    title: req.body.title,
    description: req.body.description,
    genre: req.body.genre,
    dateOfActivity: req.body.dateOfActivity,
    endDateOfActivity: req.body.endDateOfActivity,
    timeOfActivity: req.body.timeOfActivity,
    timeAdded: new Date,
    city: req.body.city,
    location: req.body.location,
    address: req.body.address,
    phone:  req.body.phone,
    sourceWebsite: req.body.sourceWebsite,
    locationWebsite: req.body.locationWebsite,
    neighborhood: req.body.neighborhood,
    country: req.body.country,
    /*mapLocation: req.body.mapLocation,*/
    status: req.body.status,
    poster: req.body.poster,
    photoCredit: req.body.photoCredit,
    photoCreditLink: req.body.photoCreditLink,
    currency: req.body.currency,
    price: req.body.price,
    facebookLink: req.body.facebookLink,
    zomatoLink: req.body.zomatoLink,
    twitterLink: req.body.twitterLink,
    payment: req.body.payment,
    bookRide: req.body.bookRide,
    goodies: req.body.payment,
    moreInfo: req.body.moreInfo,
    moreInfoLink: req.body.moreInfoLink,
    sourceName: req.body.sourceName,
    sourceDescription: req.body.sourceDescription,
    addedBy: req.body.addedBy,
    corner: req.body.corner,
    cornerPic: req.body.cornerPic,
    cornerText: req.body.cornerText,
    media: req.body.media
  },
  activity.poster('image', req.files.image, function(err) {
    if (err) next(err);
  }));
  
  activity.save(function(err) {
    if (err) {
      return next(err);
    }
    res.send(200);
  });
});

app.post('/api/subscribe', ensureAuthenticated, function(req, res, next) {
  User.findById(req.user._id, function(err, user) {
    if (err) return next(err);
    user.subscribedActivities.push(req.body.activityId);
    if (user.subscriptions) {
      user.subscriptions += 1;
    } else {
      user.subscriptions = 1;
    }
    user.save(function(err) {
      if (err) return next(err);
    });
  });
  Activity.findById(req.body.activityId, function(err, activity) {
    if (err) return next(err);
    activity.subscribers.push(req.user._id);
    if (activity.subscriptions) {
      activity.subscriptions += 1;
    } else {
      activity.subscriptions = 1;
    }
    activity.save(function(err) {
      if (err) return next(err);
      res.send(200);
    });
  });
});

app.post('/api/unsubscribe', ensureAuthenticated, function(req, res, next) {
  User.findById(req.user._id, function(err, user) {
    if (err) return next(err);
    var index = user.subscribedActivities.indexOf(req.body.activityId);
    user.subscribedActivities.splice(index, 1);
    user.subscriptions -= 1;
    user.save(function(err) {
      if (err) return next(err);
    });
  });
  Activity.findById(req.body.activityId, function(err, activity) {
    if (err) return next(err);
    var index = activity.subscribers.indexOf(req.user._id);
    activity.subscribers.splice(index, 1);
    activity.subscriptions -= 1;
    activity.save(function(err) {
      if (err) return next(err);
      res.send(200);
    });
  });
});

app.post('/api/markDone', ensureAuthenticated, function(req, res, next) {
  User.findById(req.user._id, function(err, user) {
    if (err) return next(err);
    user.doneActivities.push(req.body.activityId);
    if (user.completions) {
      user.completions += 1;
    } else {
      user.completions = 1;
    }
    user.save(function(err) {
    if (err) return next(err);
    });
  });
  Activity.findById(req.body.activityId, function(err, activity) {
    if (err) return next(err);
    activity.doneIt.push(req.user._id);
    if (activity.completions) {
      activity.completions += 1;
    } else {
      activity.completions = 1;
    }
    activity.save(function(err) {
      if (err) return next(err);
      res.send(200);
    });
  });
});

app.post('/api/markUndone', ensureAuthenticated, function(req, res, next) {
  User.findById(req.user._id, function(err, user) {
    if (err) return next(err);
    var index = user.doneActivities.indexOf(req.body.activityId);
    user.doneActivities.splice(index, 1);
    user.completions -= 1;
    user.save(function(err) {
      if (err) return next(err);
    });
  });
  Activity.findById(req.body.activityId, function(err, activity) {
    if (err) return next(err);
    var index = activity.doneIt.indexOf(req.user._id);
    activity.doneIt.splice(index, 1);
    activity.completions -= 1;
    activity.save(function(err) {
      if (err) return next(err);
      res.send(200);
    });
  });
});

app.post('/api/tips', ensureAuthenticated, function(req, res, next) {
  Activity.findById(req.body.activityId, function(err, activity) {
    if (err) return next(err);
    activity.tips.push({
      text: req.body.tips.splice(-1),
      tipper: req.user._id
    });
    activity.save(function(err) {
      if (err) return next(err);
      res.send(200);
    });
  });
});

app.get('*', function(req, res) {
  res.redirect('/#' + req.originalUrl);
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.send(500, { message: err.message });
});

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

/*agenda.define('send email alert', function(job, done) {
  Activity.findOne({ name: job.attrs.data }).populate('subscribers').exec(function(err, activity) {
    var emails = activity.subscribers.map(function(user) {
      if (user.facebook) {
        return user.facebook.email;
      } else if (user.google) {
        return user.google.email
      } else {
        return user.email
      }
    });

    var upcomingActivity = activity.episodes.filter(function(episode) {
      return new Date(timeOfActivity) > new Date();
    })[0];

    var smtpTransport = nodemailer.createTransport('SMTP', {
      service: 'SendGrid',
      auth: { user: 'bhuvanaurora', pass: 'joyage_sendGrid_password' }
    });

    var mailOptions = {
      from: 'Joyage ✔ <contact@joyage.in>',
      to: emails.join(','),
      subject: activity.title + ' is starting soon!',
      text: activity.title + ' starts in less than 2 hours at ' + activity.location + '.\n\n' +
        ' Joyage '
    };

    smtpTransport.sendMail(mailOptions, function(error, response) {
      console.log('Message sent: ' + response.message);
      smtpTransport.close();
      done();
    });
  });
});*/

/*agenda.start();

agenda.on('start', function(job) {
  console.log("Job %s starting", job.attrs.name);
});

agenda.on('complete', function(job) {
  console.log("Job %s finished", job.attrs.name);
});*/

//Activity.query();

if (false === true) {
  var email = new sendgrid.Email ({
    to: 'bhuvan.aurora@gmail.com',
    toname: 'Bhuvan Arora',
    from: 'contact@joyage.in',
    fromname: 'Joyage',
    subject: 'Joyage test mail',
    text: 'Congratulations, email works'
  });
  sendgrid.send(email, function(err, json) {
    if (err) return console.error(err);
    //console.log(json);
  });
}