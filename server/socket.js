var socket_io = require('socket.io'),
				http = require('http'),
				fs = require('fs'),
				html_data;
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
	console.log("Client connected");
});