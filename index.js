var VersionOne = require('./lib/VersionOne').VersionOne,
    v1,
    hostname = "VersionOneHostName",
    instance = "VersionOne",
    username = "admin",
    password = "admin",
    port = "80",
    protocol = "http";

var client = require('socket.io-client');

var socket = client.connect('http://localhost:3000');

// join the room
socket.emit('room', 'TeamRoom');


//When a backlog request event is fired, fire a backlogResponse
socket.on('backlogRequest', function() {

	v1 = new VersionOne(hostname, instance, username, password, port, protocol);

	v1.query({
		select: ['Name', 'Number', 'Status.Name', 'Scope.Name', 'Estimate'],
		from: 'Story',
		where: {
			'Status.Name': 'Prepared',
			'Scope.Name': 'My Project Name'
		},
		success: function(results) {

			var backlogs = [];
			if (results && results.length > 0) {
				for (var i = 0; i < results.length; i++) {
					backlogs.push({
						id: results[i].Number,
						title: results[i].Name
					});
				}
			}

			socket.emit('backlogResponse', backlogs);
		},
		failure: function(response, body) {
			socket.emit('backlogResponse', []);
		}
	});
	
});
console.log('VersionOne Backlog Provider Running');





