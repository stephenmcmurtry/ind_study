var express = require('express');
var socketio = require('socket.io');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var feed = require('./routes/feed');
var story = require('./routes/story');
var about = require('./routes/about');

// Start web server and socket.io server
var app = express();
var io = socketio();
app.io = io;
var server = require('http').Server(app);

server.listen();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Prepare the router to send us to web pages
app.use('/', routes);
app.use('/users', users);
app.use('/feed', feed);
app.use('/stories', story);
app.use('/about', about);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Connect to MongoDB
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://stephenmcmurtry:smudge1@ds023448.mlab.com:23448/micro_stories';

MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to database.");
    db.close();
});

io.on('connection', function (socket) {

    // Story Feed methods - Get list of all stories from DB and send to front with socket.io

    var getStories = function(db, data, callback) {
        var cursor =db.collection('stories').find( );
        cursor.each(function(err, doc) {
            assert.equal(err, null);
            if (doc != null) {
                socket.emit('story', JSON.stringify(doc));
                // console.log(doc);
            } else {
                callback();
            }
        });
    };

    socket.on('getStories', function(data) {
        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            getStories(db, data, function() {
                db.close();
            });
        });
    });

    // Story Page methods - get specified story from Mongo and send to front with socket.io

    var getStory = function(db, data, callback) {
        var obj_id = require('mongodb').ObjectID(data);
        db.collection('stories').findOne({_id: obj_id}, function(err, doc) {
            if (doc){
                socket.emit('story', JSON.stringify(doc));
            } else {
                console.log('no data for this object ID');
            }});
        };

    socket.on('getStory', function(data) {
        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            getStory(db, data, function() {
                db.close();
            });
        });
    });
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;