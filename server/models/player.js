
var Tank = require('./tank');

/**
 * @param {Object} initParams
 * @param {WebSocket} initParams.socket
 * @constructor
 */
function Player(initParams) {
    this.id = require('../uniqid').generate();
    this.isLogined = false;
    this.tank = null;

    this.socket = initParams.socket;
}

/**
 * @param {Object} loginParams
 * @param {string} loginParams.name
 */
Player.prototype.login = function(loginParams) {
    this.name = loginParams.name;
    this.isLogined = true;
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

module.exports = Player;
