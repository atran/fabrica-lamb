
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
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
}); );

// all environments
var io = require('socket.io').listen(app.listen(port));app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
