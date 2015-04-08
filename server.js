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
  var s3_config = require('./s3_config.json');
  process.env.PORT = 3000;
} else {
  var config = require('./config.prod.json');
  var s3_config = require('./s3_config.json');
  process.env.PORT = 8080;
}
console.log(process.env.NODE_ENV);

// ---------------------------------- Loading modules ------------------------------------------------- //

var path = require('path');
var gm = require('gm');
var util = require('util');
var http = require('http');
var httpProxy = require('http-proxy');
var express = require('express');
var timeout = require('connect-timeout');
var bodyParser = require('body-parser');
var logger = require('morgan');
var multipart = require('connect-multiparty');
var router = express.Router();
var session = require('cookie-session');
var cookieParser = require('cookie-parser');
var bson = require('bson');

var crypto = require('crypto');
var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var jwt = require('jwt-simple');
var moment = require('moment');

var async = require('async');
var request = require('request');
var xml2js = require('xml2js');
var searchPlugin = require('mongoose-search-plugin');
var textSearch = require('mongoose-text-search');

var agenda = require('agenda')({ db: {address: config.db} });
var sugar = require('sugar');
var nodemailer = require('nodemailer');
var sendgrid = require('sendgrid')(config.sendgrid.id, config.sendgrid.password);
var _ = require('lodash');
var cors = require('express-cors');
var argv = require('optimist').argv;
var mime = require('mime');


var fs = require('fs');
var AWS = require('aws-sdk');
AWS.config = s3_config;
var s3 = new AWS.S3();
var buf = new Buffer('');

var tokenSecret = config.tokenSecret;

// ------------------------------------- Schemas ---------------------------------------------------- //

var activitySchema = new mongoose.Schema({
  _id: String,
  title: String,
  dateOfActivity: String,
  endDateOfActivity: String,
  timeOfActivity: String,
  city: String,
  business: String,
  businessId: String,
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
    tipperfbId: String,
    tipper: {
      type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }
  }],
  tipper: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  }],
  tipsNumber: { type: Number, default: 0 },
  selfies: [{
    url: String,
    fbId: String
  }],
  selfie_sub: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  }],
  selfiesNumber: {type: Number, default: 0},
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
  }],
  mediaImage: String,
  venueImage: String,
  venueDescription: String
});


var businessSchema = new mongoose.Schema({
  business: String,
  city: String,
  country: String,
  noOfAct: { type: Number, default: 0 },
  noOfBooks: { type: Number, default: 0 },
  noOfDones: { type: Number, default: 0 },
  noOfSelfies: { type: Number, default: 0 },
  noOfTips: { type: Number, default: 0 }
});


/*var searchPluginOptions = {
  keywordsPath: '_keywords', // path for keywords, `_keywords` as default
  relevancePath: '_relevance', // path for relevance number, '_relevance' as default
  fields: [], // array of fields to use as keywords (can be String or [String] types),
  stemmer: 'PorterStemmer', // natural stemmer, PorterStemmer as default
  distance: 'JaroWinklerDistance' // distance algorithm, JaroWinklerDistance as default
};

activitySchema.plugin(searchPlugin(searchPluginOptions));

var searchModel = mongoose.model('SearchModel', activitySchema);

searchModel.search('Twist', {title: 1}, {
  limit: 10
}, function(err, data) {
  console.log(data.results);
  console.log(data.totalCount);
});*/

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
  joinedOn: String,
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
  completions: { type: Number, default: 0 },
  tipsCount: { type: Number, default: 0 },
  selfies: [String],
  selfieCount: { type: Number, default: 0 }
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
var Business = mongoose.model('Business', businessSchema);

mongoose.connect(config.db);
//mongoose.connect("mongodb://bhuvan:joyage_database_password@ds035280.mongolab.com:35280/joyage_database");
//mongoose.connect("mongodb://bhuvan:joyage_database_password@ds051630.mongolab.com:51630/joyage_test_database");

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(multipart({
  uploadDir: './tmp'
}));

app.use(cookieParser('$#!secretkeyforjoyage()*'));
app.use(session({secret:'$%^jshdvf~98678*'}));

// Robots.txt
app.use(function (req, res, next) {
    if ('/robots.txt' == req.url) {
        res.type('text/plain');
        res.send("User-agent: *\nDisallow: /images/");
    } else {
        next();
    }
});
// Humans.txt
app.use(function (req, res, next) {
    if ('/humans.txt' == req.url) {
        res.type('text/plain');
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
    return res.status(401).end();
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


        //---- Native Authentication ----//


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


        //---- Facebook Authentication ----//

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

  User.findOne({ facebookId: profile.id }, function(err, existingUser) {

    if (existingUser) {
      var token = createJwtToken(existingUser);
      req.session.loginTime = Date.now();
      req.session.invitePage = 1;
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
      joinedOn: Date.now(),
      subscribedActivities: [],
      doneActivities: [],
      requests: [],
      invitation_to: [],
      invitations_sent: 0,
      inviteString: "",
      tipsCount: 0,
      selfies: [],
      selfieCount: 0
    });

    user.save(function(err) {
      if (err) return next(err);
      var token = createJwtToken(user);
      req.session.loginTime = Date.now();
      req.session.invitePage = 1;
      res.send(token);
    });

    //res.send(200);

  });
});


        //---- Google Authentication ----//


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


// --------------------------------- Temporary API ----------------------------------- //


app.post('/mob_api/user', function(req, res, next) {

  if (!req.body.userId && !req.body.fbId) {
    return res.send(400, { message: 'userId / fbId parameter is required.' });
  }

  if (req.body.userId) {
    User.findOne({ _id: req.body.userId }, function (err, user) {
      if (err) return next(err);
      res.send(user);
    });
  } else if (req.body.fbId) {
    User.findOne({ facebookId: req.body.fbId }, function (err, user) {
      if (err) return next(err);
      res.send(user);
    })
  }

});


app.get('/api/profile/:id', ensureAuthenticated, function(req, res, next) {
  
  User.findById(req.params.id, function(err, profile) {
    if (err) return next(err);
    res.send(profile);
  });

});


app.get('/api/authprofile/:id', function(req, res, next) {

  //console.log(req.params.id);
  
  var query = User.findOne({ 'facebookId': req.params.id });
  
  query.exec(function(err, profile) {
    if (err) next(err);
    //console.log(profile);
    res.send(profile);
  });

});


app.put('/api/profile/:id', ensureAuthenticated, function(req, res, next) {
  
  User.findById(req.params.id, function(err, profile) {
  
    if (err) return next(err);
  
    profile.requests.push(req.body.requests);
    profile.invitation_to.push(req.body.invitation_to);
    profile.invitations_sent += req.body.invitations_sent;
    profile.inviteString = req.body.inviteString;
    profile.save(function(err) {
      if (err) return next(err);
      res.status(200).end();
    });

  });

});


          //---- Invites APIs ----//


app.post('/api/invites', ensureAuthenticated, function(req, res, next) {
  
  var invites = new Invites({
    _id: req.body.id
  });
  
  invites.save(function(err) {
    if (err) return next(err);
    res.status(200).end();
  });

});

app.get('/api/invites/:id', function(req, res, next) {
  
  Invites.findById(req.params.id, function(err, invites) {
    if (err) return next(err);
    res.send(invites);
  })

});


app.put('/api/invites/:id', function(req, res, next) {

  Invites.findById(req.params.id, function(err, invites) {

    if (err) next(err);

    invites.invitations_accepted += 1;

    invites.save(function(err) {
      if (err) next(err);
      res.status(200).end;
    });

  });

});


        //---- Phone App Activities APIs ----//


var converter = require('json-2-csv');

app.get('/api/ios_activities', function(req, res, next) {
  var query = Activity.find();
  query.sort('tineAdded');
  var genres = "";
  var act = [];
  query.exec(function(err, activities) {
    if (err) return next(err);
    for (var i=0; i<2; i++) {
      converter.json2csv(activities[i], function(err, csv) {
        if (err) throw(err);
        act = csv;
      });
      console.log(act);
      /*for (var j=0; j<activities.genre.size(); j++) {
        if (j !== 0) {
          genres = genres.concat(",");
        }
        genres = genres.concat(activities.genre[j]);
      }*/
    }
    res.send(act);
  });
});


app.get('/api/and_activities', function(req, res, next) {

  var query = Activity.find();
  query.sort('timeAdded');
  
  query.exec(function(err, activities) {
    if (err) next(err);
    res.send(activities);
  });

});


        //---- Sessions API ----//


app.get('/api/session', function(req, res, next) {

  if (req.session) {

    if (Date.now() - req.session.loginTime > 7200000) {               // Session expires in 2 hours
      return res.status(200).json({
        'session': 'expired'
      });
    } else {
      return res.status(200).json({
        'session': 'OK'
      });
    }

  }

});


app.get('/api/sessionI', function(req, res, next) {

  req.session.invitePage += 1;

  return res.status(200).json({
    'invitePage': req.session.invitePage
  });

});


app.get('/api/sessionO', function(req, res, next) {

  req.session.invitePage = 1;

  return res.status(200).json({
    'invitePage': req.session.invitePage
  });

});


      //---- Businesses APIs ----//

app.get('/api/businesses', ensureAuthenticated, function(req, res, next) {

    var query = Business.find();

    query.exec(function (err, businesses) {
      if (err) return next(err);
      res.send(businesses);
    });

});


app.get('/api/businesses/:business', ensureAuthenticated, function(req, res, next) {

  Business.findById(req.params.business, function(err, business) {
    if (err) return next(err);
    res.send(business);
  });

});



app.post('/api/businesses', ensureAuthenticated, function(req, res, next) {

  var query = Business.findOne();

  query.where({ business: req.body.business });
  query.exec(function(err, bus) {
    if (err) return next(err);

    if (bus) {

      res.status(200).send({ message: 'Business exists' });

    } else {

      var business = new Business({
        business: req.body.business,
        city: req.body.city,
        country: req.body.country
      });

      business.save(function(err) {
        if (err) return next(err);
        res.status(200).send({ message: 'Business added' });
      })

    }
  });

});


       //---- Sorted list of Activities API ----//


app.get('/api/activities', ensureAuthenticated, function(req, res, next) {
  
  var query = Activity.find();
  /*Activity.textSearch('Bars', function (err, output) {
    //if (err) return next(err);
    var inspect = require('util').inspect;
    console.log(inspect(output, { depth: null }));
  });*/

  if (req.query.preview === 'false') {                                                                                                             // Admin console preview
    query.where({ preview: 'false' });
  } else if (req.query.business) {

    query.where({ business: req.query.business }).where({ preview: {$ne: false} }).sort('-timeAdded');

  } else {

    if (req.query.genre && req.query.limit)
    {
      query.where({ genre: req.query.genre }).where({ city: req.query.city }).limit(req.query.limit);
    }
    else if (req.query.genre)
    {
      if (req.query.sortOrder === 'timeAdded')
      {                                                                                          // Default category sort
        query.where({ genre: req.query.genre }).where({ city: req.query.city }).where({ preview: {$ne: false} }).sort('-timeAdded').skip(15 * (req.query.page-1)).limit(15);
      }
      else if (req.query.sortOrder === 'popularity')
      {                                                                                  // Popularity category sort
        query.where({ genre: req.query.genre }).where({ city: req.query.city }).where({ preview: {$ne: false} }).sort('-subscriptions').sort('-timeAdded').skip(15 * (req.query.page-1)).limit(15);
      }
      else if (req.query.sortOrder === 'dateOfActivity')
      {                                                                              // Upcoming category sort
        //query.where({ genre: req.query.genre }).where('dateOfActivity').gte(new Date().valueOf()).sort('-dateOfActivity').skip(9 * (req.query.page-1)).limit(9);
        query.where({ 'dateOfActivity': {'$exists': false} }).where({ city: req.query.city }).where({ preview: {$ne: false} }).where({ genre: req.query.genre }).sort({ 'dateOfActivity': -1 }).skip(15 * (req.query.page-1)).limit(15);
      }
      /*else
      {
        query.where({ genre: req.query.genre }).where({ preview: {$ne: false} }).skip(15 * (req.query.page-1)).limit(15);
      }*/
    }
    else if (req.query.limit)
    {                                                                                                         // Suggested activities
      query.where({ preview: {$ne: false} }).where({ city: req.query.city }).where({ 'dateOfActivity': {'$exists': false} }).limit(req.query.limit);
    }
    else
    {
      if (req.query.sortOrder === 'dateOfActivity')
      {                                                                                     // Upcoming sort
        query.where('dateOfActivity').where({ city: req.query.city }).where({ preview: {$ne: false} }).gte(new Date().valueOf()).sort('-dateOfActivity').skip(15 * (req.query.page-1)).limit(15);
      }
      else if (req.query.sortOrder === 'timeAdded')
      {                                                                                   // Default sort order
        query.sort('-timeAdded').where({ city: req.query.city }).where({ preview: {$ne: false} }).skip(15 * (req.query.page-1)).limit(15);
      }
      else if (req.query.sortOrder === 'popularity')
      {                                                                                  // Popularity sort
        query.sort('-subscriptions').where({ city: req.query.city }).where({ preview: {$ne: false} }).skip(15 * (req.query.page-1)).limit(15);
      }
      else
      {
        query.sort('-timeAdded').skip(15 * (req.query.page-1)).where({ city: req.query.city }).where({ preview: {$ne: false} }).limit(15);
      }
    }

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


        //---- Activity by ID ----//


app.get('/api/activities/:id', ensureAuthenticated, function(req, res, next) {
  
  Activity.findById(req.params.id, function(err, activity) {
    if (err) return next(err);
    res.send(activity);
  });

});


       //---- Image upload APIs ----//


app.post('/upload', function(req, res, next) {
  
  var filePath = path.join(__dirname, req.files.file.path);
  
  gm(filePath)
      .resize(900, 500)
      .stream(function(err, stdout, stderr) {
        var buf = new Buffer('');
        var imageName = Date.now() + req.files.file.name;
        stdout.on('data', function(data) {
          buf = Buffer.concat([buf, data]);
        });
        stdout.on('end', function(data) {
          var data = {
            Bucket: "joyage-images",
            Key: imageName,
            Body: buf,
            ContentType: mime.lookup(req.files.file.name)
          };
          s3.putObject(data, function(err, res) {
            if (err) throw(err);
          });
          res.status(200).json({
            imageurl: imageName
          });
          console.log('Image uploaded');
        });
      });

});


app.post('/uploadCornerPic', function(req, res, next) {
  
  var filePath = path.join(__dirname, req.files.file.path);
  
  gm(filePath)
      .resize(200, 200)
      .stream(function(err, stdout, stderr) {
        var buf = new Buffer('');
        var imageName = 'corner_' + Date.now() + req.files.file.name;
        stdout.on('data', function(data) {
          buf = Buffer.concat([buf, data]);
        });
        stdout.on('end', function(data) {
          var data = {
            Bucket: "joyage-images",
            Key: imageName,
            Body: buf,
            ContentType: mime.lookup(req.files.file.name)
          };
          s3.putObject(data, function(err, res) {
            if (err) throw(err);
          });
          res.status(200).json({
            imageurl: imageName
          });
          console.log('Corner Pic uploaded');
        });
      });

});


app.post('/uploadMediaImage', function(req, res, next) {

  var filePath = path.join(__dirname, req.files.file.path);

  gm(filePath)
      .resize(600, 350)
      .stream(function(err, stdout, stderr) {
        var buf = new Buffer('');
        var imageName = 'media_' + Date.now() + req.files.file.name;
        stdout.on('data', function(data) {
          buf = Buffer.concat([buf, data]);
        });
        stdout.on('end', function(data) {
          var data = {
            Bucket: "joyage-images",
            Key: imageName,
            Body: buf,
            ContentType: mime.lookup(req.files.file.name)
          };
          s3.putObject(data, function(err, res) {
            if (err) throw(err);
          });
          res.status(200).json({
            imageurl: imageName
          });
          console.log('Media Image uploaded');
        });
      });

});


app.post('/uploadVenueImage', function(req, res, next) {

  var filePath = path.join(__dirname, req.files.file.path);

  gm(filePath)
      .resize(600,400)
      .stream(function(err, stdout, stderr) {
        var buf = new Buffer('');
        var imageName = 'venue_' + Date.now() + req.files.file.name;
        stdout.on('data', function(data) {
          buf = Buffer.concat([buf, data]);
        });
        stdout.on('end', function(data) {
          var data = {
            Bucket: "joyage-images",
            Key: imageName,
            Body: buf,
            ContentType: mime.lookup(req.files.file.name)
          };
          s3.putObject(data, function(err, res) {
            if (err) throw(err);
          });
          res.status(200).json({
            imageurl: imageName
          });
          console.log('Venue Image uploaded');
        });
      });

});


app.post('/uploadSelfie', function(req, res, next) {

    var filePath = path.join(__dirname, req.files.file.path);

    gm(filePath)
        .resize(200, 200)
        .stream(function (err, stdout, stderr) {
          var buf = new Buffer('');
          var imageName = 'selfie_' + Date.now() + req.files.file.name;
          stdout.on('data', function (data) {
            buf = Buffer.concat([buf, data]);
          });
          stdout.on('end', function (data) {
            var data = {
              Bucket: "joyage-images",
              Key: imageName,
              Body: buf,
              ContentType: mime.lookup(req.files.file.name)
            };
            s3.putObject(data, function (err, res) {
              if (err) throw(err);
              else console.log('Selfie uploaded successfully');
            });
            console.log('Selfie uploaded');
            res.status(200).json({
              imageurl: imageName
            }).end();
          });
        });

});


        //---- Add Activity ----//


app.post('/api/activities', ensureAuthenticated, function(req, res, next) {

  var query = Business.findOne();

  query.where({ business: req.body.business });
  query.exec(function(err, busi) {
    if (err) return next(err);

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
      business: req.body.business,
      businessId: busi._id,
      location: req.body.location,
      address: req.body.address,
      phone: req.body.phone,
      venueImage: req.body.venueImage,
      venueDescription: req.body.venueDescription,
      sourceWebsite: req.body.sourceWebsite,
      locationWebsite: req.body.locationWebsite,
      neighborhood: req.body.neighborhood,
      country: req.body.country,
      mapLat: req.body.mapLat,
      mapLon: req.body.mapLon,
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
      goodies: req.body.goodies,
      moreInfo: req.body.moreInfo,
      moreInfoLink: req.body.moreInfoLink,
      sourceName: req.body.sourceName,
      sourceDescription: req.body.sourceDescription,
      addedBy: req.body.addedBy,
      corner: req.body.corner,
      cornerPic: req.body.cornerPic,
      cornerText: req.body.cornerText,
      mediaImage: req.body.mediaImage,
      media: req.body.media,
      selfie: [],
      selfie_sub: [],
      preview: false
    });

    activity.save(function (err) {
      if (err) return next(err);
      res.status(200).send({message: 'Activity added'});
    });

  });
  
});


          //---- Edit Activity ----//


app.put('/api/activities/:id', ensureAuthenticated, function(req, res, next) {

  Activity.findById(req.params.id, function (err, activity) {

    if (err) return next(err);

    activity.title = req.body.title;
    activity.description = req.body.description;
    activity.genre = req.body.genre;
    activity.dateOfActivity = req.body.dateOfActivity;
    activity.endDateOfActivity = req.body.endDateOfActivity;
    activity.timeOfActivity = req.body.timeOfActivity;
    activity.city = req.body.city;
    activity.neighborhood = req.body.neighborhood;
    activity.location = req.body.location;
    activity.mapLat = req.body.mapLat;
    activity.mapLon = req.body.mapLon;
    activity.address = req.body.address;
    activity.phone = req.body.phone;
    activity.country = req.body.country;
    activity.venueImage = req.body.venueImage;
    activity.venueDescription = req.body.venueDescription;
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
    activity.mediaImage = req.body.mediaImage;

    activity.save(function (err) {
      if (err) return next(err);
      res.status(200).end();
    });

  });

});


//---- Activity review and staging APIs ----//


app.post('/api/acceptActivity', ensureAuthenticated, function(req, res, next) {

  User.findById(req.body.userId, function(err, user) {

    if (err) return next(err);

    if (user.p2p === true) {

      Activity.findById(req.body.activityId, function(err, activity) {

        if (err) return next(err);

        Business.findById(activity.businessId, function(err, business) {

          if (err) return next(err);

          business.noOfAct += 1;

          business.save(function (err) {
            if (err) return next(err);
          });

        });

        activity.preview = true;

        activity.save(function(err) {
          if (err) return next(err);
          console.log("Activity pushed into production");
          res.status(200).end();
        });

      });
    } else {
      console.log('Permission denied');
      res.status(400).end();
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


        //---- Send Invites ----//


app.post('/sendInvites', ensureAuthenticated, function(req, res, next) {

  User.findById(req.body.id, function(err, user) {

    if (err) return next(err);

    /*console.log(req.body.id);
    console.log(req.body.response);
    console.log(req.body.response.to.length);*/

    user.inviteSent += 1;
    user.invites.push(req.body.response.to);

    user.save(function(err) {
      if (err) return next(err);
      res.status(200).end();
    });

  });
});


            //---- Web Subscribe and Done APIs ----//


app.post('/api/subscribe', ensureAuthenticated, function(req, res, next) {

  User.findById(req.user._id, function(err, user) {

    if (err) return next(err);

    Activity.findById(req.body.activityId, function(err, activity) {

      if (err) return next(err);

      if (activity.subscribers.indexOf(req.user._id) != -1) {

        res.status(409).send({ message: 'Already bookmarked' });

      } else {

        Business.findById(activity.businessId, function(err, business) {

          if (err) return next(err);

          business.noOfBooks += 1;

          business.save(function (err) {
            if (err) return next(err);
          });

        });

        user.subscribedActivities.push(req.body.activityId);

        if (user.subscriptions) {
          user.subscriptions += 1;
        } else {
          user.subscriptions = 1;
        }

        user.save(function(err) {
          if (err) return next(err);
        });

        activity.subscribers.push(req.user._id);

        if (activity.subscriptions) {
          activity.subscriptions += 1;
        } else {
          activity.subscriptions = 1;
        }

        activity.save(function(err) {
          if (err) return next(err);
          res.status(200).send({ message: 'Bookmarked' });
        });

      }

    });

  });

});


app.post('/api/unsubscribe', ensureAuthenticated, function(req, res, next) {

  User.findById(req.user._id, function(err, user) {

    if (err) return next(err);

    Activity.findById(req.body.activityId, function(err, activity) {

      if (err) return next(err);

      var userIndex = user.subscribedActivities.indexOf(req.body.activityId);
      var index = activity.subscribers.indexOf(req.user._id);

      if (userIndex == -1 || index == -1) {

        res.status(409).send({ message: 'Not bookmarked' });

      } else {

        Business.findById(activity.businessId, function(err, business) {

          if (err) return next(err);

          business.noOfBooks -= 1;

          business.save(function (err) {
            if (err) return next(err);
          });

        });

        user.subscribedActivities.splice(userIndex, 1);
        user.subscriptions -= 1;

        user.save(function (err) {
          if (err) return next(err);
        });


        activity.subscribers.splice(index, 1);
        activity.subscriptions -= 1;

        activity.save(function (err) {
          if (err) return next(err);
          res.status(200).send({ message: 'Un-bookmarked' });
        });

      }

    });

  });

});


app.post('/api/markDone', ensureAuthenticated, function(req, res, next) {

  User.findById(req.user._id, function(err, user) {

    if (err) return next(err);

    Activity.findById(req.body.activityId, function(err, activity) {

      if (err) return next(err);

      if (activity.doneIt.indexOf(req.user._id) != -1) {

        res.status(409).send({ message: 'Marked as done already' });

      } else {

        Business.findById(activity.businessId, function(err, business) {

          if (err) return next(err);

          business.noOfDones += 1;

          business.save(function (err) {
            if (err) return next(err);
          });

        });

        user.doneActivities.push(req.body.activityId);

        if (user.completions) {
          user.completions += 1;
        } else {
          user.completions = 1;
        }

        user.save(function(err) {
          if (err) return next(err);
        });

        activity.doneIt.push(req.user._id);

        if (activity.completions) {
          activity.completions += 1;
        } else {
          activity.completions = 1;
        }

        activity.save(function (err) {
          if (err) return next(err);
          res.status(200).send({ message: 'Marked as done' });
        });

      }

    });

  });

});


app.post('/api/markUndone', ensureAuthenticated, function(req, res, next) {

  User.findById(req.user._id, function(err, user) {

    if (err) return next(err);

    Activity.findById(req.body.activityId, function(err, activity) {

      if (err) return next(err);

      var userIndex = user.doneActivities.indexOf(req.body.activityId);
      var index = activity.doneIt.indexOf(req.user._id);

      if (userIndex == -1 || user == -1) {

        res.status(409).send({ message: 'Not marked as done' });

      } else {

        Business.findById(activity.businessId, function(err, business) {

          if (err) return next(err);

          business.noOfDones -= 1;

          business.save(function (err) {
            if (err) return next(err);
          });

        });

        user.doneActivities.splice(userIndex, 1);
        user.completions -= 1;

        user.save(function (err) {
          if (err) return next(err);
        });

        activity.doneIt.splice(index, 1);
        activity.completions -= 1;

        activity.save(function (err) {
          if (err) return next(err);
          res.status(200).end();
        });

      }

    });

  });

});


              //---- Phone app Subscribe and Done APIs ----//


app.post('/mob_api/subscribe', function(req, res, next) {

  User.findById(req.body.userId, function(err, user) {

    if (err) return next(err);

    Activity.findById(req.body.activityId, function(err, activity) {

      if (err) return next(err);

      if (activity.subscribers.indexOf(req.body.userId) != -1) {

        // To ensure an activity is bookmarked only once even in case of external access
        res.status(409).send({ message: 'Already bookmarked' });

      } else {

        Business.findById(activity.businessId, function(err, business) {

          if (err) return next(err);

          business.noOfBooks += 1;

          business.save(function (err) {
            if (err) return next(err);
          });

        });

        user.subscribedActivities.push(req.body.activityId);

        if (user.subscriptions) {
          user.subscriptions += 1;
        } else {
          user.subscriptions = 1;
        }

        user.save(function (err) {
          if (err) return next(err);
        });

        activity.subscribers.push(req.body.userId);

        if (activity.subscriptions) {
          activity.subscriptions += 1;
        } else {
          activity.subscriptions = 1;
        }

        activity.save(function (err) {
          if (err) return next(err);
          res.status(200).send({ message: 'Bookmarked' });
        })

      }

    });

  });

});


app.post('/mob_api/unsubscribe', function(req, res, next) {

  User.findById(req.body.userId, function(err, user) {

    if (err) return next(err);

    Activity.findById(req.body.activityId, function(err, activity) {

      if (err) return next(err);

      var userIndex = user.subscribedActivities.indexOf(req.body.activityId);
      var index = activity.subscribers.indexOf(req.body.userId);

      if (userIndex == -1 || index == -1) {

        // To ensure an activity is un-bookmarked only once even in case of external access
        res.status(409).send({ message: 'Not bookmarked' });

      } else {

        Business.findById(activity.businessId, function(err, business) {

          if (err) return next(err);

          business.noOfBooks -= 1;

          business.save(function (err) {
            if (err) return next(err);
          });

        });

        user.subscribedActivities.splice(userIndex, 1);
        user.subscriptions -= 1;

        user.save(function (err) {
          if (err) return next(err);
        });

        activity.subscribers.splice(index, 1);
        activity.subscriptions -= 1;

        activity.save(function (err) {
          if (err) return next(err);
          res.status(200).send({ message: 'Un-Bookmarked' });
        });

      }

    });

  });

});


app.post('/mob_api/markDone', function(req, res, next) {

  User.findById(req.body.userId, function(err, user) {

    if (err) return next(err);

    Activity.findById(req.body.activityId, function (err, activity) {

      if (err) return next(err);

      if (activity.doneIt.indexOf(req.body.userId) != -1) {

        // To ensure an activity is marked as done only once even in case of external access
        res.status(409).send({ message: 'Already marked as done' });

      } else {

        Business.findById(activity.businessId, function(err, business) {

          if (err) return next(err);

          business.noOfDones += 1;

          business.save(function (err) {
            if (err) return next(err);
          });

        });

        user.doneActivities.push(req.body.activityId);

        if (user.completions) {
          user.completions += 1;
        } else {
          user.completions = 1;
        }

        user.save(function (err) {
          if (err) return next(err);
        });

        activity.doneIt.push(req.body.userId);

        if (activity.completions) {
          activity.completions += 1;
        } else {
          activity.completions = 1;
        }

        activity.save(function (err) {
          if (err) return next(err);
          res.status(200).send({ message: 'Marked as done' });
        });

      }

    });

  });

});


app.post('/mob_api/markUndone', function(req, res, next) {

  User.findById(req.body.userId, function(err, user) {

    if (err) return next(err);

    Activity.findById(req.body.activityId, function (err, activity) {

      if (err) return next(err);

      var userIndex = user.doneActivities.indexOf(req.body.activityId);
      var index = activity.doneIt.indexOf(req.body.userId);

      if (userIndex == -1 || index == -1) {

        // To ensure an activity is marked as un-done only once even in case of external access
        res.status(409).send({ message: 'Already not marked as done' });

      } else {

        Business.findById(activity.businessId, function(err, business) {

          if (err) return next(err);

          business.noOfDones -= 1;

          business.save(function (err) {
            if (err) return next(err);
          });

        });

        user.doneActivities.splice(userIndex, 1);
        user.completions -= 1;

        user.save(function (err) {
          if (err) return next(err);
        });


        activity.doneIt.splice(index, 1);
        activity.completions -= 1;

        activity.save(function (err) {
          if (err) return next(err);
          res.status(200).send({message: 'Marked as Un-Done'});
        });

      }

    });

  });

});


              //---- Web Add Selfie API ----//


app.post('/api/selfies', ensureAuthenticated, function(req, res, next) {

  User.findById(req.user._id, function(err, user) {

    if (err) next(err);

    Activity.findById(req.body.activityId, function(err, activity) {

      if (err) return next(err);

      if (activity.selfie_sub.indexOf(req.user._id) != -1) {

        // To ensure a user gets to add only one selfie even through external means
        res.status(409).send({ message: 'Only one selfie allowed per user' });

      } else {

        Business.findById(activity.businessId, function(err, business) {

          if (err) return next(err);

          business.noOfSelfies += 1;

          business.save(function (err) {
            if (err) return next(err);
          });

        });

        activity.selfies.push({
          url: req.body.selfies,
          fbId: req.user.facebookId
        });

        activity.selfie_sub.push(req.user._id);

        activity.selfiesNumber += 1;

        user.selfies.push(req.body.selfies);

        if (user.selfieCount) {
          user.selfieCount += 1;
        } else {
          user.selfieCount = 1;
        }

        activity.save(function (err) {
          if (err) return next(err);
        });

        user.save(function (err) {
          if (err) next(err);
          res.status(200).send({ message: 'Selfie added' });
        })

      }

    });

  });

});


        //---- Phone app Add Selfie API ----//

app.post('/mob_api/selfies', function(req, res, next) {

  User.findById(req.body.userId, function(err, user) {

    if (err) next(err);

    Activity.findById(req.body.activityId, function(err, activity) {

      if (err) return next(err);

      if (activity.selfie_sub.indexOf(req.body.userId) != -1) {

        // To ensure a user gets to add only one selfie even through external means
        res.status(409).send({ message: 'Only one selfie allowed per user' });

      } else {

        Business.findById(activity.businessId, function(err, business) {

          if (err) return next(err);

          business.noOfSelfies += 1;

          business.save(function (err) {
            if (err) return next(err);
          });

        });

        activity.selfies.push({
          url: req.body.selfies,
          fbId: user.facebookId
        });

        activity.selfie_sub.push(req.body.userId);

        activity.selfiesNumber += 1;

        user.selfies.push(req.body.selfies);

        if (user.selfieCount) {
          user.selfieCount += 1;
        } else {
          user.selfieCount = 1;
        }

        activity.save(function (err) {
          if (err) return next(err);
        });

        user.save(function (err) {
          if (err) next(err);
          res.status(200).send({ message: 'Selfie added' });
        })

      }

    });

  });

});


        //---- Web Add tips API ----//


app.post('/api/tips', ensureAuthenticated, function(req, res, next) {

  User.findById(req.user._id, function(err, user) {

    if (err) return next(err);

    Activity.findById(req.body.activityId, function(err, activity) {

      if (err) return next(err);

      if (activity.tipper.indexOf(req.user._id) != -1) {

        res.status(409).send({ message: 'Only one tip allowed per user' });

      } else {

        Business.findById(activity.businessId, function(err, business) {

          if (err) return next(err);

          business.noOfTips += 1;

          business.save(function (err) {
            if (err) return next(err);
          });

        });

        activity.tips.push({
          text: req.body.tips.splice(-1),
          tipperfbId: req.user.facebookId,
          tipper: req.user._id
        });

        activity.tipsNumber += 1;

        activity.tipper.push(req.user._id);

        if (user.tipsCount) {
          user.tipsCount += 1;
        } else {
          user.tipsCount = 1;
        }

        activity.save(function(err) {
          if (err) return next(err);
        });

        user.save(function(err) {
          if (err) return next(err);
          res.status(200).send({ message: 'Tip added' });
        });

      }

    });

  });

});


        //---- Phone app Add tips API ----//


app.post('/mob_api/tips', function(req, res, next) {

  User.findById(req.body.userId, function(err, user) {

    if (err) return next(err);

      Activity.findById(req.body.activityId, function(err, activity) {

        if (err) return next(err);

        if (activity.tipper.indexOf(req.body.userId) != -1) {

          res.status(409).send({ message: 'Only one tip allowed per user' });

        } else {

          if (req.body.tips == '') {

            res.status(400).send({ message: 'Enter tip text' });

          } else {

            Business.findById(activity.businessId, function (err, business) {

              if (err) return next(err);

              business.noOfTips += 1;

              business.save(function (err) {
                if (err) return next(err);
              });

            });

            activity.tips.push({
              text: req.body.tips,
              tipperfbId: user.facebookId,
              tipper: req.body.userId
            });

            activity.tipsNumber += 1;

            activity.tipper.push(req.body.userId);

            if (user.tipsCount) {
              user.tipsCount += 1;
            } else {
              user.tipsCount = 1;
            }

            activity.save(function (err) {
              if (err) return next(err);
            });

            user.save(function (err) {
              if (err) return next(err);
              res.status(200).send({message: 'Tip added'});
            });

          }

        }

      });

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


var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});


/*var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (var i=0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', function(worker, code, signal) {
    console.log('worker' + worker.process.pid + 'died');
  });
} else {
  var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
  });
}*/


/*var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});*/

//server.timeout = 1000;

/*.use(timeout(2 * 60 * 1000));
app.use(haltOnTimedout);

function haltOnTimedout(req, res, next){
  if (!req.timedout) next();
}*/

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
