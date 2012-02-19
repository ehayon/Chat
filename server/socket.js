var socket_io = require('socket.io'),
	http = require('http'),
	redis = require('redis'),
	fs = require('fs'),
	html_data;
// create a redis client for both pub and sub
var create_client = redis.createClient();
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

var port = process.argv[2];
if(port == null) throw new Error("Please enter a port to run the http server on")

// start the server
server.listen(port);

console.log("Server running on 127.0.0.1:" + port);

var io = socket_io.listen(server);
io.sockets.on('connection', function(socket) {
	clients.push(socket);
	console.log("Client connected");
	sub_client.subscribe('room-1');	
	socket.on('message', function(data, fn) {
		fn("\"" + data + "\"" + " received");
		new_message(socket, data);
	
	});
});

pub_client.on('error', function(err) {
	console.log("Error: " + err);
});
sub_client.on('error', function(err) {
	console.log("Error: " + err);
});
sub_client.on('message', function(channel, key) {
	create_client.hgetall(key, function(err, obj) {
		if(err) msg = "Error!"
		var msg = obj.user_id + ": " + obj.msg;
		broadcast(clients, msg);				
	});
		// send the message through every socket
	
});
function new_message(sock, message) {
	create_client.incr('messages', function(obj, id) {
		create_client.hmset('message:'+id, {user_id: sock.id, msg: message}, function(obj, res) {
			pub_client.publish('room-1', 'message:'+id);
		});
	});
}
function broadcast(clients, message) {
	for(var i = 0; i < clients.length; i++) {
		// send the message through every socket
		clients[i].emit('new_message', message);					
	}
	
}