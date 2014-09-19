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
var _ = require('lodash');

var tokenSecret = 'your unique secret';

var activitySchema = new mongoose.Schema({
  _id: Number,
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
  twitterLink: String(),
  zomatoLink: String(),
  payment: String,
  moreInfo: String,
  moreInfoLink: String,
  operatingDays: [String],
  operatingTime: [String],
  addedBy: String,
  subscribers: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  }]
});

var userSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  email: { type: String, unique: true, lowercase: true, trim: true },
  password: String,
  facebook: {
    id: String,
    email: String
  },
  google: {
    id: String,
    email: String
  }
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

function ensureAuthenticated(req, res, next) {
  if (req.headers.authorization) {
    var token = req.headers.authorization.split(' ')[1];
    try {
      var decoded = jwt.decode(token, tokenSecret);
      if (decoded.exp <= Date.now()) {
        res.send(400, 'Access token has expired');
      } else {
        req.user = decoded.user;
        return next();
      }
    } catch (err) {
      return res.send(500, 'Error parsing token');
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
    password: req.body.password
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
      name: profile.name,
      facebook: {
        id: profile.id,
        email: profile.email
      }
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
      }
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



app.get('/api/activities', function(req, res, next) {
  var query = Activity.find();
  if (req.query.genre) {
    query.where({ genre: req.query.genre });
  } else if (req.query.alphabet) {
    query.where({ name: new RegExp('^' + '[' + req.query.alphabet + ']', 'i') });
  } else {
    query.limit(12);
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
    _id: (new Date).getTime(),
    title: req.body.title,
    description: req.body.description,
    genre: req.body.genre,
    dateOfActivity: req.body.dateOfActivity,
    endDateOfActivity: req.body.endDateOfActivity,
    timeOfActivity: req.body.timeOfActivity,
    city: req.body.city,
    location: req.body.location,
    address: req.body.address,
    phone:  req.body.phone,
    sourceWebsite: req.body.sourceWebsite,
    locationWebsite: req.body.locationWebsite,
    neighborhood: req.body.neighborhood,
    country: req.body.country,
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
    moreInfo: req.body.moreInfo,
    moreInfoLink: req.body.moreInfoLink,
    sourceName: req.body.sourceName,
    sourceDescription: req.body.sourceDescription,
    addedBy: req.body.addedBy
  });
  
  activity.save(function(err) {
    if (err) {
      return next(err);
    }
    res.send(200);
  });
});

app.post('/api/subscribe', ensureAuthenticated, function(req, res, next) {
  Activity.findById(req.body.activityId, function(err, activity) {
    if (err) return next(err);
    activity.subscribers.push(req.user._id);
    activity.save(function(err) {
      if (err) return next(err);
      res.send(200);
    });
  });
});

app.post('/api/unsubscribe', ensureAuthenticated, function(req, res, next) {
  Activity.findById(req.body.activityId, function(err, activity) {
    if (err) return next(err);
    var index = activity.subscribers.indexOf(req.user._id);
    activity.subscribers.splice(index, 1);
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




agenda.define('send email alert', function(job, done) {
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

    var upcomingEpisode = activity.episodes.filter(function(episode) {
      return new Date(episode.firstAired) > new Date();
    })[0];

    var smtpTransport = nodemailer.createTransport('SMTP', {
      service: 'SendGrid',
      auth: { user: 'hslogin', pass: 'hspassword00' }
    });

    var mailOptions = {
      from: 'Fred Foo ✔ <foo@blurdybloop.com>',
      to: emails.join(','),
      subject: activity.name + ' is starting soon!',
      text: activity.name + ' starts in less than 2 hours on ' + activity.network + '.\n\n' +
        'Episode ' + upcomingEpisode.episodeNumber + ' Overview\n\n' + upcomingEpisode.overview
    };

    smtpTransport.sendMail(mailOptions, function(error, response) {
      console.log('Message sent: ' + response.message);
      smtpTransport.close();
      done();
    });
  });
});

//agenda.start();

agenda.on('start', function(job) {
  console.log("Job %s starting", job.attrs.name);
});

agenda.on('complete', function(job) {
  console.log("Job %s finished", job.attrs.name);
});