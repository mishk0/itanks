
var Player = require('./entries/player');

function GameLogic() {}

/**
 * @param {WebSocket} socket
 */
GameLogic.prototype.onConnect = function(socket) {
    new Player({
        socket: socket
    });
};

GameLogic.prototype.updateWorld = function() {
    BULLETS = BULLETS.filter(function(bullet) {
        updatePosition(bullet);

        return checkTerrainCollision(bullet);
    });

    PLAYERS.forEach(function(player) {
        if (player.joint && !player.dead) {

            if (player.inMove) {
                currentPosition = _.clone(player.position);

                updatePosition(player);

                if (!checkEnvironmentCollision(player)) {

                    switch(player.direction) {
                        case 0:
                            player.position[1] = Math.floor(currentPosition[1] - TANK_DIMENSION_2) + TANK_DIMENSION_2;
                            break;

                        case 1:
                            player.position[0] = Math.ceil(currentPosition[0] + TANK_DIMENSION_2) - TANK_DIMENSION_2;
                            break;

                        case 2:
                            player.position[1] = Math.ceil(currentPosition[1] + TANK_DIMENSION_2) - TANK_DIMENSION_2;
                            break;

                        case 3:
                            player.position[0] = Math.floor(currentPosition[0] - TANK_DIMENSION_2) + TANK_DIMENSION_2;
                            break;
                    }

                }

                var playerCollision;
                if (playerCollision = checkPlayerCollision(player)) {

                    switch(player.direction) {
                        case 0:
                            player.position[1] = playerCollision.position[1] + TANK_DIMENSION + 0.01;
                            break;

                        case 1:
                            player.position[0] = playerCollision.position[0] - TANK_DIMENSION - 0.01;
                            break;

                        case 2:
                            player.position[1] = playerCollision.position[1] - TANK_DIMENSION - 0.01;
                            break;

                        case 3:
                            player.position[0] = playerCollision.position[0] + TANK_DIMENSION + 0.01;
                            break;
                    }
                }
            }

            var bulletCollision;
            if (bulletCollision = checkBulletCollision(player)) {
                BULLETS.splice(BULLETS.indexOf(bulletCollision), 1);

                player.hp--;

                if (player.hp > 0) {
                    broadcast({
                        event: 'hit',
                        data: {
                            position: bulletCollision.position
                        }
                    });

                    send(player, {
                        event: 'updateHealth',
                        data: {
                            hp: player.hp
                        }
                    })
                } else {
                    player.death++;
                    player.dead = true;

                    setTimeout(function() {
                        respawnPlayer(player);

                    }, PLAYER_RESPAWN_INTERVAL);

                    PLAYERS.some(function(player) {
                        if (player.id === bulletCollision.by) {
                            player.kills++;
                            return true;
                        }
                    });

                    send(player, {
                        event: 'updateHealth',
                        data: {
                            hp: 0
                        }
                    });

                    broadcast({
                        event: 'playerDeath',
                        data: {
                            dead: player.id,
                            killer: bulletCollision.by
                        }
                    });
                }
            }
        }
    });
};

GameLogic.prototype.sendUpdates = function() {
    var players = PLAYERS.filter(jointFilter).filter(notDead).map(function(player) {
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
};


/* ---------- OLD ---------- */

function checkTerrainCollision(bullet) {
    for (var y = 0; y < MAP_DIMENSION ; ++y) {
        for (var x = 0; x < MAP_DIMENSION ; ++x) {

            var cell = MAP[y][x];

            if (cell === MAP_CELL_TYPE.HARD || (Array.isArray(cell) && cell[1] > 0)) {

                if (checkCollision(bullet, {
                    position: [x + 0.5, y + 0.5],
                    width: 1
                })) {

                    var cellsToDamage = [[x, y]];

                    if (bullet.direction === 0 || bullet.direction === 2) {
                        cellsToDamage.push([x - 1, y]);
                        cellsToDamage.push([x + 1, y]);
                    } else {
                        cellsToDamage.push([x, y - 1]);
                        cellsToDamage.push([x, y + 1]);
                    }

                    var toBroadcast = [];

                    for (var c = 0; c < cellsToDamage.length; ++c) {

                        var cellPos = cellsToDamage[c];
                        var x_ = cellPos[0];
                        var y_ = cellPos[1];

                        if (x_ < 0 || x_ >= MAP_DIMENSION ||
                            y_ < 0 || y_ >= MAP_DIMENSION) {
                            continue;
                        }

                        var cell_ = MAP[y_][x_];

                        if (cell_ === MAP_CELL_TYPE.EMPTY ||
                            (Array.isArray(cell_) && cell_[1] === 0)) {
                            break;
                        }

                        if (cell_ !== MAP_CELL_TYPE.HARD) {
                            cell_[1]--;

                            toBroadcast.push({
                                positions: cellPos,
                                cell: cell_
                            });
                        }

                        broadcast({
                            event: 'hit',
                            data: {
                                position: bullet.position
                            }
                        });
                    }

                    broadcast({
                        event: 'terrainDamage',
                        data: toBroadcast
                    });

                    return;
                }
            }
        }
    }

    return true;
}

/**
 * Ищет коллизии со стенами.
 * @param {Object} obj
 * @return {boolean}
 */
function checkEnvironmentCollision(obj) {
    var posX = obj.position[0];
    var posY = obj.position[1];

    var posX1 = posX - 0.8;
    var posX2 = posX + 0.8;

    var posY1 = posY - 0.8;
    var posY2 = posY + 0.8;

    if (posX1 < 0 || posX2 > MAP_DIMENSION ||
        posY1 < 0 || posY2 > MAP_DIMENSION) {
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
                if (!Array.isArray(cell) || cell[1] !== 0) {
                    return;
                }
            }
        }
    }

    return true;
}

function checkPlayerCollision(player) {
    for (var i = 0; i < PLAYERS.length; ++i) {
        var otherPlayer = PLAYERS[i];

        if (!otherPlayer.dead && otherPlayer.joint) {
            if (checkCollision(player, otherPlayer)) {
                return otherPlayer;
            }
        }
    }
}

function checkBulletCollision(player) {
    for (var i = 0; i < BULLETS.length; ++i) {
        var bullet = BULLETS[i];

        if (bullet.by !== player.id) {
            if (checkCollision(player, bullet)) {
                return bullet
            }
        }
    }
}

function setRandomRespawnPosition(player) {
    player.position = _.clone(RESPAWNS_POSITIONS[Math.floor(Math.random() * RESPAWNS_POSITIONS.length)]);
}

setInterval(function() {
    var timeBack = new Date().getTime() - 10000;
    BULLETS = BULLETS.filter(function(bullet) {
        return bullet.ts > timeBack;
    });
}, 2000);

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
