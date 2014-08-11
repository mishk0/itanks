
var GameObject = require('./gameobject');

/**
 * @param {Object} initParams
 * @param {string} initParams.player
 * @constructor
 */
function Bullet(initParams) {
    GameObject.apply(this, {
        position: initParams.player.position,
        size: [4, 4]
    });

    this.player = initParams.player;
}

Bullet.prototype = Object.create(GameObject.prototype);

module.exports = Bullet;
