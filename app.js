
/**
* dependencies
*/

var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , mongoose = require('mongoose')
  , io = require('socket.io').listen(server)
  , fs = require('fs')
  , crypto = require('crypto')
  , ffmpeg = require('fluent-ffmpeg');

server.listen(3000);


/**
* db
*/
mongoose.connect('mongodb://localhost/lamb');
var db = mongoose.connection;
var audioPtSchema = mongoose.Schema({
  name: String,
  loc: [],
  sound_url: String,
  tags: []
})
// mmm, geospatial indexing
audioPtSchema.index({ loc: '2d' });

var AudioPt = mongoose.model('AudioPoint', audioPtSchema);


/**
* config server
*/
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));

  app.use(sass.middleware({
    src: __dirname + '/preprocessors/sass'
  , dest: __dirname + '/public/css'
  , debug: true
  , error: function(e){
    console.log(e);
  }
  }));

  io.set('log level', 1);
});


/**
* routes
*/
app.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

app.post('/api/videos', function(req, res) {
  var tmp_path = req.files.video_file.path,
      target_path = 'tmp/' + req.files.video_file.name,
      new_wav_name = 'au' + crypto.randomBytes(4).readUInt32LE(0) + '.wav';

  // TODO: have to implement temporary file deletion
  fs.rename(tmp_path, target_path, function(err) {
    fs.unlink(tmp_path, function(err){ 
      convert_to_audio(target_path, new_wav_name);
    });
  });

  // TODO: use underscore to extend object
  // instead of doing this lazily
  var audiopt = new AudioPt({
    name:       req.body.name,
    loc:        [ parseFloat(req.body.lng),
                  parseFloat(req.body.lat) ],
    sound_url:  new_wav_name,
    tags:       [ 'tran', 'whatever' ]
  });

  audiopt.save(function(err, pt) {
    if (err) {
      console.log('could not save to db');
      console.log(err);
    } else {
      console.log(pt);
    }
  })
})


/**
* sockets
*/
io.sockets.on('connection', function(socket) {

});


/**
* helpers
*/
// convert to wav
var convert_to_audio = function(path, filename) {
  var proc = new ffmpeg({ source: path })
  .toFormat('wav')
  .saveToFile('public/audio/' + filename, function(stdout, stderr){
    console.log('saved as ' + filename);
  });
}

// get km distance between two points
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}


