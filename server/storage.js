var redis = require('redis');

function RedisClient(broadcast, clients) {
	create_client = redis.createClient();
	pub_client = redis.createClient();
	sub_client = redis.createClient();
	
	function conError(err) {
		console.log("Error: " + err);
	}
	
	pub_client.on('error', conError);
	sub_client.on('error', conError);
	create_client.on('error', conError);

	sub_client.on('message', function(channel, key) {
		create_client.hgetall(key, function(err, obj) {
			if(err) msg = "Error!"
			var msg = obj.user_id + ": " + obj.msg;
			broadcast(clients, msg);				
		});
	});
}
	
RedisClient.prototype.new_message = function(sock, message) {
	create_client.incr('messages', function(obj, id) {
		create_client.hmset('message:'+id, {user_id: sock.id, msg: message}, function(obj, res) {
			pub_client.publish('chat:room-1', 'message:'+id);
		});
	});
}

RedisClient.prototype.subscribe = function(channel) {
	sub_client.subscribe('chat:room-1');	
}	

module.exports.createClient = function(broadcast, clients) {
	return new RedisClient(broadcast, clients);	
}




