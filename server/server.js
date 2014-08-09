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

var SOCKET_SEND_INTERVAL = 60;
var GAME_LOGIN_UPDATE_INTERVAL = 5;

var MAP_CELL_TYPE = {
    EMPTY: 0,
    NORMAL: 1,
    HARD: 2
};

var FIELD_DIMENSION = 26;

var TANK_SPEED = 0.2;
var BULLET_SPEED = 0.4;
var GUN_RECOIL = 1000;

var PLAYERS = [];
var BULLETS = [];

var DEFAULT_PLAYER = {
    id: null,
    hp: 1,
    direction: 0,
    position: [0, 0],
    inMove: false,
    lastShootTS: 0,
    recoilTime: GUN_RECOIL,
    bulletSpeed: BULLET_SPEED,
    speed: TANK_SPEED,
    socket: null,
    joint: false
};

/**
 * Добавляем ботов.
 */
for (var c = 0; c < 5; ++c) {
    PLAYERS.push(_.extend({}, {
        id: String(Math.random()).substr(2),
        name: 'bot',
        direction: Math.floor(Math.random() * 4),
        position: generateRandomIntegerPosition(),
        color: 'red',
        inMove: true,
        joint: true,
        isBot: true
    }));
}

setInterval(function() {
    PLAYERS.forEach(function(player) {
        if (player.isBot) {
            position = Math.floor(Math.random() * 4);
        }
    });
}, 1000);

var MAP = require('../maps/map1.js');

for (var i = 0; i < FIELD_DIMENSION; ++i) {
    for (var j = 0; j < FIELD_DIMENSION; ++j) {
        var cell = MAP[i][j];

        if (cell === MAP_CELL_TYPE.NORMAL) {
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

        var player = _.extend({}, DEFAULT_PLAYER, {
            position: generateRandomIntegerPosition(),
            socket: connection
        });

        PLAYERS.push(player);

        broadcastExcept({
            event: 'playerJoint',
            data: {
                name: 'Test User'
            }
        }, player);

        connection.on('message', function(message) {
            if (message.type !== 'utf8') {
                return;
            }

            var messageData;

            try {
                messageData = JSON.parse(message.utf8Data);
            } catch(e) {
                console.log('MESSAGE BAD JSON', message.utf8Data);
                return;
            }

            var data = messageData.data;

            switch (messageData.action) {
                case 'login':
                    player.id = String(Math.random()).substr(2);
                    player.color = 'red';
                    player.joint = true;
                    player.name = data.name;
                    player.tankType = data.tankType;

                    send(player, {
                        event: 'playerList',
                        data: PLAYERS.filter(jointFilter).map(function(player) {
                            return {
                                id: player.id,
                                name: player.name,
                                color: player.color,
                                kills: 0,
                                deaths: 0
                            };
                        })
                    });

                    send(player, {
                        event: 'map',
                        data: MAP
                    });

                    break;

                case 'updateState':
                    player.direction = data.direction;
                    player.inMove = data.inMove;
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

                default:
                    console.log('UNSUPPORTED INCOMMING MESSAGE', messageData.action, data);
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

function generateRandomIntegerPosition() {
    return [Math.floor(Math.random() * FIELD_DIMENSION), Math.floor(Math.random() * FIELD_DIMENSION)];
}

/*
 * World Logic update.
 */
setInterval(function() {
    PLAYERS.forEach(function(player) {
        if (player.joint && player.inMove) {
            currentPosition = player.position;

            updatePosition(player);

            if (!checkCollision(player)) {
                switch (player.direction) {
                    case 0:
                        player.position[0] = Math.ceil(currentPosition[0] + 0.9) - 0.9;
                        break;

                    case 1:
                        player.position[1] = Math.ceil(currentPosition[1] + 0.9) - 0.9;
                        break;

                    case 2:
                        player.position[0] = Math.ceil(currentPosition[0] - 0.9) + 0.9;
                        break;

                    case 3:
                        player.position[1] = Math.ceil(currentPosition[1] - 0.9) + 0.9;
                        break;
                }

            }
        }
    });

    BULLETS.forEach(function(bullet) {
        updatePosition(bullet);
    });

}, GAME_LOGIN_UPDATE_INTERVAL);


/**
 * Ищет коллизии со стенами.
 * @param {Object} obj
 * @return {boolean}
 */
function checkCollision(obj) {
    var posX = obj.position[0];
    var posY = obj.position[1];

    var posX1 = posX - 0.9;
    var posX2 = posX + 0.9;

    var posY1 = posY - 0.9;
    var posY2 = posY + 0.9;

    var x1 = Math.floor(posX1);
    var x2 = Math.ceil(posX2);

    var y1 = Math.floor(posY1);
    var y2 = Math.ceil(posY2);

    if (x1 < 0 || x2 >= FIELD_DIMENSION ||
        y1 < 0 || y2 >= FIELD_DIMENSION) {
        return false;
    }

    for (var x = x1; x <= x2; ++x) {
        for (var y = y1; y <= y2; ++y) {
            var cell = MAP[x][y];

            if (cell !== MAP_CELL_TYPE.EMPTY) {
                return;
            }
        }
    }

    return true;
}

function updatePosition(object) {
    switch (object.direction) {
        case 0:
            object.position[1] -= object.speed;
            break;

        case 1:
            object.position[0] += object.speed;
            break;

        case 2:
            object.position[1] += object.speed;
            break;

        case 3:
            object.position[0] -= object.speed;
            break;
    }
}

function jointFilter(obj) {
    return obj.joint;
}

/*
 * Send updates to users.
 */
setInterval(function() {
    var players = PLAYERS.filter(jointFilter).map(function(player) {
         return {
             id: player.id,
             position: player.position,
             direction: player.direction
         };
    });

    var bullets = BULLETS.map(function(bullet) {
        return bullet.position;
    });

    var data = {
        event: 'updateMapState',
        data: {
            players: players,
            bullets: bullets
        }
    };

    broadcast(data);

}, SOCKET_SEND_INTERVAL);

/**
 * Отправить сообщение одному пользователю.
 * @param {PLAYER} player
 * @param {Object} data
 */
function send(player, data) {
    var json;

    try {
        json = JSON.stringify(data);
    } catch(e) {
        console.log('BROADCAST stringify failed', e);
        return;
    }

    if (player.socket) {
        player.socket.send(json);
    }
}

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
        return;
    }

    PLAYERS.forEach(function(player) {
        if (player.joint && player !== except) {
            if (player.socket) {
                player.socket.send(json);
            }
        }
    });
}
