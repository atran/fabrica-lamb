
/**
* Module dependencies.
*/

var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , fs = require('fs')
  , ffmpeg = require('fluent-ffmpeg');

server.listen(3000);

// config
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  io.set('log level', 1);
});

// routes 
app.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

app.post('/api/videos', function(req, res) {
  console.log(req.body)
  console.log(JSON.stringify(req.files));
  
  var tmp_path = req.files.video_file.path;
  var target_path = 'tmp/' + req.files.video_file.name;

  fs.rename(tmp_path, target_path, function(err) {
    fs.unlink(tmp_path, function(err){ 
      convert_to_audio(target_path);
    });
  })
  
})

var convert_to_audio = function(path) {
  var proc = new ffmpeg({ source: path })
  .toFormat('wav')
  .saveToFile('public/audio/xx.wav', function(stdout, stderr){
    console.log('saved as wav');
  });

}

// socket
io.sockets.on('connection', function(socket) {

});

