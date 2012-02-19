var socket_io = require('socket.io'),
	http = require('http'),
	redis = require('redis'),
	fs = require('fs'),
	html_data;
// create a redis client for both pub and sub
var pub_client = redis.createClient();
var sub_client = redis.createClient();
var clients = [];
// read in the html data to serve 
fs.readFile('index.html', function(err, data) {
	if(err) throw err;
	html_data = data;
});

// create a server for socket.io to listen on
var server = http.createServer(function(request, response) {
	response.writeHead(200);
	// serve the client
	response.end(html_data);
});
server.listen(8000);

console.log("Server running on 127.0.0.1:8000");

var io = socket_io.listen(server);
io.sockets.on('connection', function(socket) {
	clients.push(socket);
	console.log("Client connected");
	sub_client.subscribe('room-1');
	pub_client.publish('room-1', socket.id + " has joined the room!");
	
	socket.on('message', function(data, fn) {
		fn("\"" + data + "\"" + " received");
		pub_client.publish('room-1', data);
	});
});

pub_client.on('error', function(err) {
	console.log("Error: " + err);
});
sub_client.on('error', function(err) {
	console.log("Error: " + err);
});
sub_client.on('message', function(channel, message) {
	for(var i = 0; i < clients.length; i++) {
		// send the message through every socket
		clients[i].emit('new_message', message);
	}
});
