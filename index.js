var VersionOne = require('./lib/VersionOne').VersionOne,
	config = require('./config/config'),
	client = require('socket.io-client'),
	socket, // = client.connect('http://localhost:3000'),
	socketOptions = {
        "transports" : [ "websocket" ],
        "try multiple transports" : false,
        "reconnect" : false,
		'force new connection': true,
        "connect timeout" : 5000
    },
    v1 = new VersionOne(config.hostname, config.instance, config.username, config.password, config.port, config.protocol, config.mockData);

	
var socketHost = 'http://localhost:3000';

var reconnect = function() {
	console.log('RECONNECT');
	socket.removeAllListeners();
	setTimeout(connect, 1000);
};

var connect = function() {

	console.log('Connecting to: ' + socketHost);
	socket = client.connect(socketHost);

	socket.on('connect', function(){
		// join the room
		console.log('VersionOne Backlog Provider Running');
		socket.emit('room', config.room);	

//When a scopes request event is fired, fire a scopesResponse
	socket.on('scopesRequest', function() {

		v1.getScopes({
			success: function(results) {
				var scopes = [],
					v1Scopes = JSON.parse(results);

				if (v1Scopes.Assets && v1Scopes.Assets.length > 0) {
					for (var i = 0; i < v1Scopes.Assets.length; i++) {
						var Asset = v1Scopes.Assets[i];

						scopes.push({
							scopeId: Asset.id,
							name: Asset.Attributes['SecurityScope.Name'].value
						});
					}
				}

				socket.emit('scopesResponse', scopes);
			},
			failure: function(response, body) {
				socket.emit('scopesResponse', null);
			}
		});

	});

	//return a list of statuses
	socket.on('statusRequest', function() {

		v1.getStatuses({
			success: function(body) {
				var results = JSON.parse(body);
				var statuses = [];

				for (var i = 0; i < results.Assets.length; i++) {
					var status = {};

					statuses.push({
						name: results.Assets[i].Attributes.Name.value,
						id: results.Assets[i].id
					})
				}
				socket.emit('statusResponse', statuses);
			},
			failure: function(response, body) {
				socket.emit('statusResponse', null);
			}
		});

	});

	//When a backlog request event is fired, fire a backlogResponse
	socket.on('backlogRequest', function(scope) {
		v1.query({
			select: [],
			from: 'Story',
			where: {
				'Status.Name': config.status,
				'Scope.Name': scope.name
			},
			success: function(results) {

				var backlogs = [],
					v1Backlogs;
				if (v1.mockData) {
					backlogs = JSON.parse(results);
				} else {
					v1Backlogs = JSON.parse(results);
					if (v1Backlogs.Assets && v1Backlogs.Assets.length > 0) {

						for (var i = 0; i < v1Backlogs.Assets.length; i++) {
							var Asset = v1Backlogs.Assets[i];
							console.log(Asset);
							backlogs.push({
								assetId: Asset.id,
								id: Asset.Attributes.Number.value,
								href: v1.buildBacklogUrl(Asset.id),
								title: Asset.Attributes.Name.value,
								description: Asset.Attributes.Description.value
							});
						}
					}
				}
				socket.emit('backlogResponse', backlogs);
			},
			failure: function(response, body) {
				socket.emit('backlogResponse', null);
			}
		});
	});


	/**
	* When a backlog is saved.
	*/
	socket.on('backlogReadyRequest', function(backlogData) {

		// update and respond.
		v1.update(backlogData.backlogId, backlogData.estimate, backlogData.status, function(error, response, body) {
			if (error) {
				socket.emit('backlogSaveResponse', false);
			} else {
				socket.emit('backlogSaveResponse', true);
			}
		});
		
	});

	socket.on('changeStatus', function(statusData) {

		v1.updateStatus(statusData.backlogId, statusData.statusName, function(error, response, body) {

			if (error) {
				socket.emit('changeStatusResponse', false);
			} else {
				socket.emit('changeStatusResponse', true);
			}
		});

	});		
	});
		
	socket.on('error', function(err){
		console.log("socket.io-client 'error'", err);
		reconnect();
	});

	socket.on('connect_failed', function(){
		console.log("socket.io-client 'connect_failed'");
		reconnect();
	});

	socket.on('disconnect', function(){
		console.log("socket.io-client 'disconnect'");
		reconnect();
	});
	
	
}

connect();