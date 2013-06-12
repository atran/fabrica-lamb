
/**
* dependencies
*/

var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , mongoose = require('mongoose')
  , io = require('socket.io').listen(server)
  , fs = require('fs')
  , jade = require('jade')
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
  io.set('log level', 1);
});


/**
* routes
*/

app.get('/', function(req, res) {
  res.render('index', { title: 'Lamb' });
});

app.get('/api/templates', function(req, res) {
  var dir = 'views/partials/';
  var tmpls = [];
  fs.readdir(dir, function(err, files) {
    if (err) {}
    var c = 0;
    files.forEach(function(file) {
      c++;
      fs.readFile(dir+file, 'utf8', function(err,jde) {
        if (err) {}
        //strip extension
        file = file.replace(/\.[^/.]+$/, "");
        var html = jade.compile(jde)();
        tmpls.push( { name: file, content: html } );
        if (0 === --c) {
          res.json(tmpls);
        }
      })
    })
  })
});

// Record routes
app.get('/record', function(req, res) {
  res.render('recorder');
});

app.get('/saved', function(req, res) {
  res.render('saved');
});

app.get('/error', function(req, res) {
  res.render('error');
});

app.post('/api/audiopts', function(req, res) {
  var tmp_path = req.files.video_file.path,
      target_path = 'tmp/' + req.files.video_file.name,
      new_wav_name = 'au' + crypto.randomBytes(4).readUInt32LE(0) + '.wav';

  // TODO: have to implement temporary file deletion
  fs.rename(tmp_path, target_path, function(err) {
    if (err) { handle_error(res, err); }
    fs.unlink(tmp_path, function(err){
      // if (err) { handle_error(res, err); }
      convert_to_audio(target_path, new_wav_name, res); 
    });
  });

  // TODO: use underscore to extend object
  // instead of doing this lazily
  var audiopt = new AudioPt({
    name:       req.body.name,
    loc:        [ parseFloat(req.body.lng),
                  parseFloat(req.body.lat) ],
    sound_url:  new_wav_name,
    tags:       req.body.tags.split(',') 
  });

  audiopt.save(function(err, pt) {
    if (err) { handle_error(res, err); }
  })
})


// Listen routes
app.get('/listen', function(req, res) {
  res.render('player');
});

app.get('/api/audiopts', function(req, res) {
  CONVERSION_FACTOR_DEG_TO_KM = 111.12;

  lat  = req.query.lat;
  lng  = req.query.lat;

  tags = req.query.tags.length > 0
         ? req.query.tags.split(',')
         : false

  if (tags) {
    geo_query = {
      loc:  { '$near': [ lat, lng ] },
      tags: { '$in': tags }
    }
  } else {
    geo_query = {
      loc:  { '$near': [ lat, lng ] }      
    }
  }

  AudioPt.find(geo_query, function(err, docs) {
    res.json(docs);
  });

})



/**
* sockets
*/
io.sockets.on('connection', function(socket) {

});


/**
* helpers
*/

var handle_error = function(res, err) {
  console.log(err);
  return res.redirect('/error');            
}

// convert to wav
var convert_to_audio = function(path, filename, res) {
  var proc = new ffmpeg({ source: path })
  .toFormat('wav')
  .saveToFile('public/audio/' + filename, function(stdout, stderr){
    console.log('saved as ' + filename);
    res.redirect('/saved');            
  });
}
