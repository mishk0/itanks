#!/usr/bin/env node

var _ = require('lodash');
var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    response.end(404, '');
});

var port = process.env.PORT ||  1337;

server.listen(port, function() {
    console.log('SERVER IS STARTED on port:', port);
});

var SOCKET_SEND_INTERVAL = 2000;
var GAME_LOGIN_UPDATE_INTERVAL = 5;

var MAP_STATE = {
    EMPTY: 0,
    DESTR: 1,
    INDES: 2
};

var TANK_SPEED = 400;
var BULLET_SPEED = 1000;
var GUN_RECOIL = 1000;

var PLAYERS = [];
var BULLETS = [];

var DEFAULT_PLAYER = {
    hp: 1,
    direction: 0,
    position: [0, 0],
    inMove: true,
    lastShootTS: 0,
    recoilTime: GUN_RECOIL,
    bulletSpeed: BULLET_SPEED,
    speed: TANK_SPEED,
    socket: null
};

var MAP = require('../maps/map1.js');

for (var i = 0; i < 26; ++i) {
    for (var j = 0; j < 26; ++j) {
        var cell = MAP[i][j];

        if (cell === MAP_STATE.DESTR) {
            MAP[i][j] = [cell, 2];
        }
    }
}

wsServer = new WebSocketServer({
    httpServer: server
});

wsServer.on('request', function(request) {
    if (request.resource === '/game') {
        console.log('CONNECTION ACCEPTED');

        var connection = request.accept(null, request.origin);

        var player = _.clone(DEFAULT_PLAYER);
        player.socket = connection;

        PLAYERS.push(player);

        broadcastExcept({
            event: 'playerJoint',
            data: {
                name: 'Test User'
            }
        }, player);

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
                        player.direction = data.direction;
                        player.inMove = data.isMove;
                        break;

                    case 'shoot':
                        var now = new Date().getTime();

                        if (player.lastShootTS + player.recoilTime > now) {
                            player.lastShootTS = now;

                            BULLETS.push({
                                position: player.position,
                                direction: player.direction,
                                speed: player.bulletSpeed
                            });
                        }
                        break;
                }
            }
        });

        connection.on('close', function() {
            var i = PLAYERS.indexOf(player);

            if (i !== -1) {
                PLAYERS.splice(i, 1);
            }

            console.log('SOCKET DISCONNECT');
        });

    } else {
        request.reject();
    }
});

/*
 * World Logic update.
 */
setInterval(function() {
    PLAYERS.forEach(function(player) {
        if (player.inMove) {
            player.position = updatePosition(player);
        }
    });

    BULLETS.forEach(function(bullet) {
        bullet.position = updatePosition(bullet);
    });

}, GAME_LOGIN_UPDATE_INTERVAL);


function updatePosition(object) {
    var curPos = object.position;
    var toPos = _.clone(curPos);

    switch (object.direction) {
        case 0:
            toPos[0] += object.speed;
            break;

        case 1:
            toPos[1] += object.speed;
            break;

        case 2:
            toPos[0] -= object.speed;
            break;

        case 3:
            toPos[1] -= object.speed;
            break;
    }

    return toPos;
}

/*
 * Send updates to users.
 */
setInterval(function() {
    var players = PLAYERS.map(function(player) {
         return player.position;
    });

    var bullets = BULLETS.map(function(bullet) {
        return bullet.position;
    });

    var data = {
        event: 'updateMapState',
        data: {
            map: MAP,
            players: players,
            bullets: bullets
        }
    };

    broadcast(data);

}, SOCKET_SEND_INTERVAL);

/**
 * Отправляет сообщение всем игрокам.
 * @param data
 */
function broadcast(data) {
    broadcastExcept(data);
}

/**
 * Отправляет сообщение всем игрокам за исключением одного.
 * @param {Object} data
 * @param {Player} [except]
 */
function broadcastExcept(data, except) {
    var json;

    try {
        json = JSON.stringify(data);
    } catch(e) {
        console.log('BROADCAST stringify failed', e);
    }

    PLAYERS.forEach(function(player) {
        if (player !== except) {
            player.socket.send(json);
        }
    });
}
