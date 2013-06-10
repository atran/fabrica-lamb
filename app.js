
/**
 * Module dependencies.
 */

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

server.listen(8080);

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
})

// socket
io.sockets.on('connection', function(socket) {

});

