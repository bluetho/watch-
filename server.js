var express = require('express');
const favicon = require('express-favicon');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.use("/scripts", express.static(__dirname + '/sites/'));
app.use(favicon(__dirname + '/images/favicon.png'));

users = [];
connections = [];

server.listen(process.env.PORT || 3000);
console.log("Server has started")

app.get('/', function(req, res){
  res.sendFile(__dirname + '/sites/index.html')
});

//Connect
io.sockets.on('connection', function(socket){
    connections.push(socket);
    console.log('Connected: %s sockets Connected', connections.length);

    //Disconnect
    socket.on('disconnect', function(data){
      users.splice(users.indexOf(socket.username), 1);
      updateUsernames();
      connections.splice(connections.indexOf(socket), 1);
      console.log('Disconnected: %s sockets connected', connections.length)
    });

    //New User
    socket.on('new user', function(data){
      if(data != ""){
          socket.username = data;
          users.push(socket.username);
          updateUsernames();
      }
    });

    //Update the Usernamelist
    function updateUsernames(){
      io.sockets.emit('get users', users)
    }

    //Start or resume a video
    socket.on('start video socket', function(data){
        io.sockets.emit('start video', data);
    });

    //Stop a video
    socket.on('stop video socket', function(){
        io.sockets.emit('stop video');
    });

    //Change the Video
    socket.on('change video socket', function(data){
        io.sockets.emit('change video', data);
    });

    //Sync the diffrent users
    socket.on('sync video socket', function(vid, counter){
        io.sockets.emit('sync video', vid, counter);
    })

    //Send Messages
    socket.on('send message', function(data){
      if(data != ""){
          io.sockets.emit('new message', {msg: data, user: socket.username });
      }
    });
})
