#!/usr/bin/env node

var _ = require('lodash');
var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    response.end(404, '');
});

var port = process.env.PORT || 1337;

server.listen(port, function() {
    console.log('SERVER IS STARTED on port:', port);
});

var COLORS = ['blue', 'green', 'red', 'yellow'];
var PLAYER_COLORS = ['blue', 'green', 'red', 'yellow'];

var SOCKET_SEND_INTERVAL = 60;
var GAME_LOGIN_UPDATE_INTERVAL = 5;

var MAP_CELL_TYPE = {
    EMPTY: 0,
    NORMAL: 1,
    HARD: 2,
    RESPAWN: 99
};

var FIELD_DIMENSION = 26;

var TANK_SPEED = 0.025;
var BULLET_SPEED = 0.05;
var GUN_RECOIL = 1000;

var PLAYERS = [];
var BULLETS = [];

var DEFAULT_PLAYER = {
    id: null,
    hp: 1,
    direction: 0,
    position: [0, 0],
    color: null,
    inMove: false,
    lastShootTS: 0,
    recoilTime: GUN_RECOIL,
    bulletSpeed: BULLET_SPEED,
    speed: TANK_SPEED,
    socket: null,
    joint: false,
    kills: 0,
    deaths: 0
};

/**
 * Добавляем ботов.
 */
for (var c = 0; c < 5 && false; ++c) {
    PLAYERS.push(_.extend({}, DEFAULT_PLAYER, {
        id: String(Math.random()).substr(2),
        name: 'bot',
        direction: Math.floor(Math.random() * 4),
        position: [12, 12],
        color: 'yellow',
        inMove: true,
        joint: true,
        isBot: true
    }));
}

setInterval(function() {
    PLAYERS.forEach(function(player) {
        if (player.isBot) {
            player.direction = Math.floor(Math.random() * 4);
        }
    });
}, 1000);

var MAP = require('../maps/map1.js');
var RESPAWNS_POSITIONS = [];

for (var x = 0; x < FIELD_DIMENSION; ++x) {
    for (var y = 0; y < FIELD_DIMENSION; ++y) {
        var cell = MAP[y][x];

        if (cell === MAP_CELL_TYPE.NORMAL) {
            MAP[y][x] = [cell, 2];

        } else if (cell === MAP_CELL_TYPE.RESPAWN) {
            RESPAWNS_POSITIONS.push([x + 1, y + 1]);

            MAP[y][x] = MAP_CELL_TYPE.EMPTY;
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
            position: _.clone(RESPAWNS_POSITIONS[Math.floor(Math.random() * RESPAWNS_POSITIONS.length)]),
            socket: connection
        });

        PLAYERS.push(player);

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
                    player.color = PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];
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
                                kills: player.kills,
                                deaths: player.deaths
                            };
                        })
                    });

                    broadcastExcept(player, {
                        event: 'playerJoined',
                        data: {
                            id: player.id,
                            name: player.name,
                            color: player.color,
                            kills: player.kills,
                            deaths: player.deaths
                        }
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

                    if (player.lastShootTS + player.recoilTime < now) {
                        player.lastShootTS = now;

                        BULLETS.push({
                            position: _.clone(player.position),
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

            if (player.joint) {
                broadcast({
                    event: 'playerLeft',
                    data: {
                        id: player.id
                    }
                });
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
            currentPosition = _.clone(player.position);

            updatePosition(player);

            if (true && !checkCollision(player)) {

                switch (player.direction) {
                    case 0:
                        player.position[1] = Math.floor(currentPosition[1] - 0.8) + 0.8;
                        break;

                    case 1:
                        player.position[0] = Math.ceil(currentPosition[0] + 0.8) - 0.8;
                        break;

                    case 2:
                        player.position[1] = Math.ceil(currentPosition[1] + 0.8) - 0.8;
                        break;

                    case 3:
                        player.position[0] = Math.floor(currentPosition[0] - 0.8) + 0.8;
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

    var posX1 = posX - 0.8;
    var posX2 = posX + 0.8;

    var posY1 = posY - 0.8;
    var posY2 = posY + 0.8;

    if (posX1 < 0 || posX2 > FIELD_DIMENSION ||
        posY1 < 0 || posY2 > FIELD_DIMENSION) {
        return false;
    }

    var cellX1 = Math.floor(posX1);
    var cellX2 = Math.ceil(posX2);

    var cellY1 = Math.floor(posY1);
    var cellY2 = Math.ceil(posY2);

    for (var x = cellX1; x < cellX2; ++x) {
        for (var y = cellY1; y < cellY2; ++y) {
            var cell = MAP[y][x];

            if (cell !== MAP_CELL_TYPE.EMPTY) {
                console.log(x, y);

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
        return {
            position: bullet.position,
            direction: bullet.direction
        };
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
    broadcastExcept(null, data);
}

/**
 * Отправляет сообщение всем игрокам за исключением одного.
 * @param {Object} data
 * @param {Player} [except]
 */
function broadcastExcept(except, data) {
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
