
var GameObject = require('./gameobject');

var BULLET_SPEED = 0.05;
var BULLET_SIZE = [0.35, 0.5];

/**
 * @param {Object} initParams
 * @param {number} initParams.direction
 * @param {Array} initParams.position
 * @param {string} initParams.player
 * @constructor
 */
function Bullet(initParams) {
    GameObject.apply(this, {
        direction: initParams.direction,
        position: _.clone(initParams.position),
        size: BULLET_SIZE
    });

    this.speed = BULLET_SPEED;
    this.player = initParams.player;
}

Bullet.prototype = Object.create(GameObject.prototype);

module.exports = Bullet;
