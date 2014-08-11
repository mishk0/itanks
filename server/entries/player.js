
var Tank = require('./tank');

var PLAYER_COLORS = ['blue', 'green', 'red', 'yellow', 'brown', 'orange', 'purple'];



/**
 * @param {Object} initParams
 * @param {WebSocket} initParams.socket
 * @constructor
 */
function Player(initParams) {
    this.id = require('../uniqid').generate();
    this.stats = {
        kills: 0,
        deaths: 0
    };
    this.isLoged = false;
    this.tank = null;

    this.socket = initParams.socket;

    this._addEventListeners();
}

/**
 * @param {Object} loginParams
 * @param {string} loginParams.name
 */
Player.prototype.login = function(loginParams) {
    this.name = loginParams.name;
    this.isLoged = true;
};

/**
 * Создает пользователю новый танк.
 * @param {number} tankType
 */
Player.prototype.createTank = function(tankType) {
    this.tank = new Tank({
        tankType: tankType
    });
};

//Player.prototype.destroyTank = function() {
//    this.tank
//};

/**
 * Устанавливает обработчики событий.
 * @private
 */
Player.prototype._addEventListeners = function() {
    var that = this;

    this.socket.on('message', function(message) {
        if (message.type !== 'utf8') {
            return;
        }

        var action;
        var data;

        try {
            var messageData = JSON.parse(message.utf8Data);

            action = messageData.action;
            data = messageData.data;
        } catch(e) {
            console.log('MESSAGE HAS BAD JSON', message.utf8Data);
            return;
        }

        switch (action) {
            case 'login':

                that._login(data);

                break;

            case 'updateState':
                player.direction = data.direction;
                player.inMove = data.inMove;
                break;

            case 'shoot':
                that.tank.tryShoot();
                break;

            default:
                console.log('UNSUPPORTED INCOMMING MESSAGE', messageData.action, data);
        }
    });

    this.socket.on('close', function() {

        if (player.joint) {
            broadcast({
                event: 'playerLeft',
                data: {
                    id: player.id
                }
            });
        }
    });
};

Player.prototype._login = function(data) {

    player.id = getUniqId();
    player.color = PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];
    player.joint = true;
    player.name = data.name;
    player.tankType = 1;

    if (!isNaN(data.tankType)) {
        player.tankType = data.tankType;
    }

    _.extend(player, TANK_VARIATIONS[player.tankType]);

    respawnPlayer(player, function() {

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
            event: 'details',
            data: {
                map: MAP,
                hp: player.hp
            }
        });
    });
};

module.exports = Player;
