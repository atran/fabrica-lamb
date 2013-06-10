
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , port = 3000;

var app = express();

// livereload
var watch = require('node-watch');

var filter = function(pattern, fun){
  return function(filename){
    if(pattern.test(filename)){fun(filename);}
  }
}
watch('./', filter(/\.jade|\.js|\.css$/i, function() {
  io.sockets.emit('reload') //send a message to all clients
}))

// all environments
var io = require('socket.io').listen(app.listen(port));app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

// routes 
app.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

app.post('/api/videos', function(req, res) {
  console.log(JSON.stringify(req));
})


var files = {};

socket.on('start', function(data) {
  var name = data['name'];
  files[name] = {
    filesize   : data['size'],
    data       : "",
    downloaded : 0
  }
  var place = 0;
  try {
    var stat = fs.statSync('temp/' + name);
    if (stat.isFile()) {
      files[name]['downloaded'] = stat.size
      place = stat.size / 524288
    }
  } catch (er){}

  fs.open('temp/' + name, 'a', 0755, function(err, fd){
    if (err) {
      console.log(err)
    } 
    else {
      files[name]['handler'] = fd;
      socket.emit('moreData',{
        place  : place,
        percent: 0,
      });
    }
  });

});

socket.on('upload', function(data) {
  var name = data['name'];
  files[name]['downloaded'] += data['data'].length;
  files[name]['data'] += data['data'];

  // fully downloaded
  if (files[name]['downloaded'] == files[name]['filesize']) {
    fs.write(files[name]['handler'], files[name]['data'], null, 'Binary')
  }
  // if data buffer > 10 MB
  else if (files[name]['data'].length > 10485760) {
    fs.write(files[name]['handler'], files[name]['data'], null, 'Binary', function(err, written){
      files[name]['data'] = "";
      var place = files[name]['downloaded'] / 524288;
      var percent = (files[name]['downloaded'] / files[name]['filesize']) * 100;
      socket.emit('moreData', {
        place: place,
        percent: percent
      })
    })
  }
  else {
    var place = files[name]['downloaded'] / 524288;
    var percent = (files[name]['downloaded'] / files[name]['filesize']) * 100;
    socket.emit('moreData', {
      place: place,
      percent: percent
    })
  }
  
})

// Start server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
