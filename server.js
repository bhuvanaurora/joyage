#!/usr/bin/env node

// ------------------------------------------- Index -------------------------------------------------- //

/*
 * 1. Loading config files
 * 2. Loading modules
 * 3. Schemas
 * 4. Authentication middleware
 * 5. Authentication
 * 6. APIs
 * 7. Emails
 */

// ------------------------------------ Loading config file ------------------------------------------- //

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'prod';
}
if (process.env.NODE_ENV === "dev") {
  var config = require('./config.dev.json');
  process.env.PORT = 3000;
} else {
  var config = require('./config.prod.json');
  process.env.PORT = 8080;
}
console.log(process.env.NODE_ENV);

// ---------------------------------- Loading modules ------------------------------------------------- //

var path = require('path');
var util = require('util');
var http = require('http');
var httpProxy = require('http-proxy');
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var multipart = require('connect-multiparty');
var router = express.Router();

var crypto = require('crypto');
var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var jwt = require('jwt-simple');
var moment = require('moment');

var async = require('async');
var request = require('request');
var xml2js = require('xml2js');
var textSearch = require('mongoose-text-search');

var agenda = require('agenda')({ db: {address: config.db} });
var sugar = require('sugar');
var nodemailer = require('nodemailer');
var sendgrid = require('sendgrid')(config.sendgrid.id, config.sendgrid.password);
var _ = require('lodash');
var cors = require('express-cors');
var argv = require('optimist').argv;

var tokenSecret = config.tokenSecret;

// ------------------------------------- Schemas ---------------------------------------------------- //

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
  mapLat: { type: Number, default: 12.9667 },
  mapLon: { type: Number, default: 77.5667 },
  corner: String,
  cornerPic: String,
  cornerText: String,
  preview: Boolean,
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

//activitySchema.plugin(textSearch);
//activitySchema.index({ genre: 'text' });

var userSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  //email: { type: String, lowercase: true, trim: true, sparse: true },
  //password: String,
  gender: String,
  age: String,
  curator: Boolean,
  p2p: Boolean,
  facebookId: String,
  facebook: {
    id: String,
    email: String,
    profileLink: String
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
  requests: [String],
  invitation_to: [String],
  invitations_sent: { type: Number, default: 0 },
  inviteString: String,
  completions: { type: Number, default: 0 }
});

var invitesSchema = new mongoose.Schema({
  _id: String,
  invitations_accepted: { type: Number, default: 0 }
});

/*userSchema.pre('save', function(next) {
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
});*/

/*userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};*/

var User = mongoose.model('User', userSchema);
var Activity = mongoose.model('Activity', activitySchema);
var Invites = mongoose.model('Invites', invitesSchema);

mongoose.connect(config.db);
//mongoose.connect("mongodb://bhuvan:joyage_database_password@ds035280.mongolab.com:35280/joyage_database");

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));
app.use(multipart({
  uploadDir: './tmp'
}));

// Robots.txt
app.use(function (req, res, next) {
    if ('/robots.txt' == req.url) {
        res.type('text/plain')
        res.send("User-agent: *\nDisallow: /images/");
    } else {
        next();
    }
});
// Humans.txt
app.use(function (req, res, next) {
    if ('/humans.txt' == req.url) {
        res.type('text/plain')
        res.send("<b>Developers</b>\nBhuvan Arora\nbhuvan.aurora@gmail.com");
    } else {
        next();
    }
});

// ----------------------------------------- Authentication middleware -------------------------------------- //

function ensureAuthenticated(req, res, next) {
  if (req.headers.authorization) {
    var token = req.headers.authorization.split(' ')[1];
    try {
      var decoded = jwt.decode(token, tokenSecret);
      if (decoded.exp <= Date.now()) {
        res.status(400).send('Access token has expired');
      } else {
        req.user = decoded.user;
        return next();
      }
    } catch (err) {
      return res.status(500).send('Error parsing token');
    }
  } else {
    res.set('Content-Type', 'application/json');
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

// ------------------------------------------------- Authentication --------------------------------------- //

/*app.post('/auth/signup', function(req, res, next) {
  var user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    curator: false,
    p2p: false,
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
});*/

app.post('/auth/facebook', function(req, res, next) {
  var profile = req.body.profile;
  var signedRequest = req.body.signedRequest;
  var encodedSignature = signedRequest.split('.')[0];
  var payload = signedRequest.split('.')[1];
  var appSecret = config.facebook.appSecret;
  
  var expectedSignature = crypto.createHmac('sha256', appSecret).update(payload).digest('base64');
  expectedSignature = expectedSignature.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  if (encodedSignature !== expectedSignature) {
    return res.send(400, 'Invalid Request Signature');
  }

  /*var inviteString = req.params.rs;
  Invites.findOne({ _id: inviteString }, function(err, invite) {
    console.log(invite);
    if( invite.invitations_sent < 10 ){
    } else {
      res.send("Can't signup");
    }
  });*/
  User.findOne({ facebookId: profile.id }, function(err, existingUser) {
    if (existingUser) {
      var token = createJwtToken(existingUser);
      return res.send(token);
    }
    var user = new User({
      name: profile.first_name,
      gender: profile.gender,
      age: profile.age_range,
      curator: false,
      p2p: false,
      facebookId: profile.id,
      facebook: {
        id: profile.id,
        email: profile.email,
        profileLink: profile.link
      },
      subscribedActivities: [],
      doneActivities: [],
      requests: [],
      invitation_to: [],
      invitations_sent: 0,
      inviteString: ""
    });
    user.save(function(err) {
      if (err) return next(err);
      var token = createJwtToken(user);
      res.send(token);
    });
    //res.send(200);
  });
});

/*app.post('/auth/google', function(req, res, next) {
  var profile = req.body.profile;
  User.findOne({ google: profile.id }, function(err, existingUser) {
    if (existingUser) {
      var token = createJwtToken(existingUser);
      return res.send(token);
    }
    var user = new User({
      name: profile.displayName,
      curator: false,
      p2p: false,
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
});*/

// ------------------------------------------------------ APIs -----------------------------------------------------//

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
  User.findById(req.params.id, function(err, profile) {
    if (err) return next(err);
    res.send(profile);
  });
});

app.put('/api/profile/:id', ensureAuthenticated, function(req, res, next) {
  User.findById(req.params.id, function(err, profile) {
    if (err) return next(err);
    profile.facebook.requests.push(req.body.facebook.requests);
    profile.facebook.invitation_to.push(req.body.facebook.invitation_to);
    profile.facebook.invitations_sent += req.body.facebook.invitations_sent;
    profile.facebook.inviteString = req.body.facebook.inviteString;
    profile.save(function(err) {
      if (err) return next(err);
      res.status(200).end();
    });
  });
});

app.post('/api/invites', ensureAuthenticated, function(req, res, next) {
  var invites = new Invites({
    _id: req.body.id
  });
  invites.save(function(err) {
    if (err) return next(err);
    res.status(200).end();
  });
});

app.get('/api/invites/:rs', ensureAuthenticated, function(req, res, next) {
  Invites.findById(req.params.rs, function(err, invites) {
    if (err) return next(err);
    res.send(invites);
  })
});

app.put('/api/invites', function(req, res, next) {
  console.log('Put');
  Invites.findById(req.body._id, function(err, invites) {
    if (err) next(err);
    invites.invitations_accepted += 1;
    invites.save(function(err) {
      if (err) next(err);
      res.status(200).end;
    })
  })
});

app.get('/api/activities', function(req, res, next) {
  var query = Activity.find();
  /*Activity.textSearch('Bars', function (err, output) {
    //if (err) return next(err);
    var inspect = require('util').inspect;
    console.log(inspect(output, { depth: null }));
  });*/
  
  if (req.query.genre && req.query.limit) {
    query.where({genre: req.query.genre}).limit(req.query.limit);
  } else if (req.query.genre) {
    if (req.query.sortOrder === 'timeAdded') {                                                                                          // Default category sort
      query.where({ genre: req.query.genre }).where({ preview: {$ne: false} }).sort('timeAdded').skip(9 * (req.query.page-1)).limit(9);
    } else if (req.query.sortOrder === 'popularity') {                                                                                  // Popularity category sort
      query.where({ genre: req.query.genre }).where({ preview: {$ne: false} }).sort('-subscriptions').skip(9 * (req.query.page-1)).limit(9);
    } else if (req.query.sortOrder === 'dateOfActivity') {                                                                              // Upcoming category sort
      //query.where({ genre: req.query.genre }).where('dateOfActivity').gte(new Date().valueOf()).sort('-dateOfActivity').skip(9 * (req.query.page-1)).limit(9);
      query.where({ 'dateOfActivity': {'$exists': false} }).where({ preview: {$ne: false} }).where({ genre: req.query.genre }).sort({ 'dateOfActivity': -1 }).skip(9 * (req.query.page-1)).limit(9); 
    } else {
      query.where({ genre: req.query.genre }).where({ preview: {$ne: false} }).skip(9 * (req.query.page-1)).limit(9);
    }
  } else if (req.query.limit) {                                                                                                         // Suggested activities
    query.where({ preview: {$ne: false} }).where({ 'dateOfActivity': {'$exists': false} }).limit(req.query.limit);
  } else {
    if (req.query.sortOrder === 'dateOfActivity') {                                                                                     // Upcoming sort
      query.where('dateOfActivity').where({ preview: {$ne: false} }).gte(new Date().valueOf()).sort('-dateOfActivity').skip(9 * (req.query.page-1)).limit(9);
    } else if (req.query.sortOrder === 'timeAdded') {                                                                                   // Default sort order
      query.sort('timeAdded').where({ preview: {$ne: false} }).skip(9 * (req.query.page-1)).limit(9);
    } else if (req.query.sortOrder === 'popularity') {                                                                                  // Popularity sort
      query.sort('-subscriptions').where({ preview: {$ne: false} }).skip(9 * (req.query.page-1)).limit(9);
    } else {
      query.skip(9 * (req.query.page-1)).where({ preview: {$ne: false} }).limit(9);
    }
  }
  
  if (req.query.preview) {                                                                                                              // Admin console preview
    query.where({ preview: req.query.preview });
  }
  
  var date = new Date().getTime();
  act = [];
  var j = 0;
  query.exec(function(err, activities) {
    if (err) return next(err);
    if (!req.query.limit) {
      for (i=0; i<activities.length; i++) {
        if (date <= Date.parse(activities[i].dateOfActivity)) {
          act[j] = activities[i];
          ++j;
        } else if (!activities[i].dateOfActivity) {
          act[j] = activities[i];
          ++j;
        } else if (activities[i].dateOfActivity === "") {
          act[j] = activities[i];
          ++j;
        } 
      }
      res.send(act);
    } else {
      res.send(activities);
    }
  });
});

app.get('/api/activities/:id', function(req, res, next) {
  Activity.findById(req.params.id, function(err, activity) {
    if (err) return next(err);
    res.send(activity);
  });
});

var fs = require('fs');
var image = '';

app.post('/upload', function(req, res, next) {
  var filePath = path.join(__dirname, req.files.file.path);
  fs.readFile(filePath, function(err, data) {
    var writePath = path.join(__dirname, '/public/images', req.files.file.name);
    fs.writeFile(writePath, data, function(err) {
      if (err) throw(err);
      image = data;
      console.log('data:'+ data);
      res.status(200).json({
        data: data,
        imageurl: req.files.file.name
      });
    })
  })
});

app.post('/api/activities', ensureAuthenticated, function(req, res, next) {
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
    mapLat: req.body.mapLat,
    mapLon: req.body.mapLon,
    status: req.body.status,
    poster: req.body.poster,
    //poster: image,
    photoCredit: req.body.photoCredit,
    photoCreditLink: req.body.photoCreditLink,
    currency: req.body.currency,
    price: req.body.price,
    facebookLink: req.body.facebookLink,
    zomatoLink: req.body.zomatoLink,
    twitterLink: req.body.twitterLink,
    payment: req.body.payment,
    bookRide: req.body.bookRide,
    goodies: req.body.goodies,
    moreInfo: req.body.moreInfo,
    moreInfoLink: req.body.moreInfoLink,
    sourceName: req.body.sourceName,
    sourceDescription: req.body.sourceDescription,
    addedBy: req.body.addedBy,
    corner: req.body.corner,
    cornerPic: req.body.cornerPic,
    cornerText: req.body.cornerText,
    media: req.body.media,
    preview: false
  });
  
  activity.save(function(err) {
    if (err) return next(err);
    res.status(200).end();
  });
});

app.put('/api/activities/:id', ensureAuthenticated, function(req, res, next) {
  Activity.findById(req.params.id, function(err, activity) {
    if (err) return next(err);
    console.log(req.body.title);
    activity.title = req.body.title;
    activity.description = req.body.description;
    activity.genre = req.body.genre;
    activity.dateOfActivity = req.body.dateOfActivity;
    activity.endDateOfActivity = req.body.endDateOfActivity;
    activity.timeOfActivity = req.body.timeOfActivity;
    activity.city = req.body.city;
    activity.neighborhood = req.body.neighborhood;
    activity.location = req.body.location;
    activity.address = req.body.address;
    activity.phone = req.body.phone;
    activity.country = req.body.country;
    activity.sourceWebsite = req.body.sourceWebsite;
    activity.locationWebsite = req.body.locationWebsite;
    activity.poster = req.body.poster;
    activity.photoCredit = req.body.photoCredit;
    activity.photoCreditLink = req.body.photoCreditLink;
    activity.currency = req.body.currency;
    activity.price = req.body.price;
    activity.facebookLink = req.body.facebookLink;
    activity.twitterLink = req.body.twitterLink;
    activity.zomatoLink = req.body.zomatoLink;
    activity.payment = req.body.payment;
    activity.bookRide = req.body.bookRide;
    activity.goodies = req.body.goodies;
    activity.moreInfo = req.body.moreInfo;
    activity.moreInfoLink = req.body.moreInfoLink;
    activity.sourceName = req.body.sourceName;
    activity.sourceDescription = req.body.sourceDescription;
    activity.corner = req.body.corner;
    activity.cornerPic = req.body.cornerPic;
    activity.cornerText = req.body.cornerText;
    activity.media = req.body.media;
    
    activity.save(function(err) {
      if (err) return next(err);
      res.send(200);
    });
  });
});

app.post('/sendInvites', ensureAuthenticated, function(req, res, next) {
  User.findById(req.body.id, function(err, user) {
    if (err) return next(err);
    console.log(req.body.id);
    console.log(req.body.response);
    console.log(req.body.response.to.length);

    /*user.inviteSent += 1;
    user.invites.push(req.body.response.to);

    user.save(function(err) {
      if (err) return next(err);
      res.status(200).end();
    })*/
    res.status(200).end();
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

app.post('/api/acceptActivity', ensureAuthenticated, function(req, res, next) {
  User.findById(req.body.userId, function(err, user) {
    if (err) return next(err);
    if (user.p2p === true) {
      Activity.findById(req.body.activityId, function(err, activity) {
        if (err) return next(err);
        activity.preview = true;
        activity.save(function(err) {
          if (err) return next(err);
          console.log("Activity pushed into production");
          res.send(200);
        });
      });
    } else {
      console.log('Permission denied');
      res.send(400);
    }
  });
  
});

app.post('/api/deleteActivity', ensureAuthenticated, function(req, res, next) {
  Activity.findById(req.body.activityId, function(err, activity) {
    if (err) return next(err);
    activity.remove(function(err) {
      if (err) return next(err);
      console.log("Activity deleted");
      res.send(200);
    });
  });
});

app.get('/api/editActivity/:id', ensureAuthenticated, function(req, res, next) {
  Activity.findById(req.params.id, function(err, activity) {
    if (err) return next(err);
    res.send(activity);
  });
});


app.get('*', function(req, res) {
  res.redirect('/#/' + req.originalUrl);
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send({ message: err.message });
});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

// -------------------------------------------------- Emails --------------------------------------------------------//

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