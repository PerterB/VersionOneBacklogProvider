var VersionOne = require('./lib/VersionOne').VersionOne,
	config = require('./config/config'),
	client = require('socket.io-client'),
	socket = client.connect('http://localhost:3000'),
    v1 = new VersionOne(config.hostname, config.instance, config.username, config.password, config.port, config.protocol);
	
// join the room
socket.emit('room', config.room);

//When a backlog request event is fired, fire a backlogResponse
socket.on('backlogRequest', function() {
	v1.query({
		select: [],
		from: 'Story',
		where: {
			'Status.Name': config.status,
			'Scope.Name': config.scope
		},
		success: function(results) {
		
			var backlogs = [],
				v1Backlogs = JSON.parse(results);
			
			if (v1Backlogs.Assets && v1Backlogs.Assets.length > 0) {
				for (var i = 0; i < v1Backlogs.Assets.length; i++) {
					var Asset = v1Backlogs.Assets[i];
					
					backlogs.push({
						assetId: Asset.id,
						id: Asset.Attributes.Number.value,
						href: v1.buildBacklogUrl(Asset.id),
						title: Asset.Attributes.Name.value,
						description: Asset.Attributes.Description.value
					});
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
console.log('VersionOne Backlog Provider Running');





