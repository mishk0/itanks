
var _ = require('lodash');
var GameObject = require('./gameobject');

var TANK_SIZE = [18, 18];
var BASE_TANK_SPEED = 0.2;
var BASE_TANK_RECOIL = 1000;

var TANK_TYPES = [
    {
        hp: 1,
        speed: BASE_TANK_SPEED * 1.5,
        recoil: BASE_TANK_RECOIL / 1.5
    },
    {
        hp: 2,
        speed: BASE_TANK_SPEED,
        recoil: BASE_TANK_RECOIL
    },
    {
        hp: 3,
        speed: BASE_TANK_SPEED / 1.5,
        recoil: BASE_TANK_RECOIL * 1.5
    }
];

/**
 * @param {Object} initParams
 * @param {number} initParams.tankType
 * @constructor
 */
function Tank(initParams) {
    GameObject.apply(this, {
        size: TANK_SIZE
    });

    var tankProto = TANK_TYPES[initParams.tankType];

    if (!tankProto) {
        throw new Error('DEBUG TANK TYPE');
    }

    this.tankType = initParams.tankType;

    _.extend(this, TANK_TYPES[tankType]);
}

Tank.prototype = Object.create(GameObject.prototype);

module.exports = Tank;
