var socket_io = require('socket.io'),
	http = require('http'),
	fs = require('fs'),
	redis = require('./storage'),
	html_data;
var clients = [];


function broadcast(clients, message) {
	for(var i = 0; i < clients.length; i++) 
		clients[i].emit('new_message', message);						
}
// set up the redis client (first parameter is a callback for whenever there is a new message available)
redis.createClient(broadcast, clients)

// read in the html data to serve å
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
	redis.subscribe('chat:room-1')
	socket.on('message', function(data, fn) {
		fn("\"" + data + "\"" + " received");
		redis.new_message(socket, data);
	
	});
});



