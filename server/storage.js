var redis = require('redis');
	
// create a redis client for both pub and sub
var create_client = redis.createClient();
var pub_client = redis.createClient();
var sub_client = redis.createClient();
function conError(err) {
	console.log("Error: " + err);
}
pub_client.on('error', conError);
sub_client.on('error', conError);
create_client.on('error', conError);

function createClient(broadcast, clients) {
	sub_client.on('message', function(channel, key) {
		create_client.hgetall(key, function(err, obj) {
			if(err) msg = "Error!"
			var msg = obj.user_id + ": " + obj.msg;
			broadcast(clients, msg);				
		});
	});
}
function new_message(sock, message) {
	create_client.incr('messages', function(obj, id) {
		create_client.hmset('message:'+id, {user_id: sock.id, msg: message}, function(obj, res) {
			pub_client.publish('chat:room-1', 'message:'+id);
		});
	});
}
	
function subscribe(channel) {
	sub_client.subscribe('chat:room-1');	
}

exports.createClient = createClient
exports.subscribe = subscribe
exports.new_message = new_message



