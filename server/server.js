
var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});
server.listen(1337, function() {

});

var TANK_SPEED = 400;
var BULLET_SPEED = 1000;

var PLAYERS = [];
var BULLETS = [];
var MAP = require('../maps/1.json');

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

wsServer.on('request', function(request) {
    if (request.resource === '/game') {
        console.log('CONNECTION ACCEPTED');

        var connection = request.accept(null, request.origin);

        var player = {
            hp: 1,
            movementState: {},
            pos: {
                x: 0,
                y: 0
            }
        };

        PLAYERS.push(player);

        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                var data;

                try {
                    data = JSON.parse(message.utf8Data);
                } catch(e) {
                    console.log('MESSAGE BAD JSON', message.utf8Data);
                    return;
                }

                switch (data.action) {
                    case 'updatestate':
                        player.movementState = data.state;
                        break;
                }
            }
        });

        connection.on('close', function() {
            console.log('SOCKET DISCONNECT');
        });

    } else {
        request.reject();
    }
});

setInterval(function() {
    PLAYERS.forEach({

    });
}, 5);
