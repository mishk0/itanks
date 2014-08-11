
var _ = require('lodash');
var GameObject = require('./gameobject');

var TANK_SIZE = [1.6, 1.6];
var BASE_TANK_SPEED = 0.025;
var BASE_TANK_RECOIL = 1000;

var TANK_TYPES = [
    {
        hp: 1,
        speed: BASE_TANK_SPEED * 1.5,
        recoil: BASE_TANK_RECOIL / 1.7
    },
    {
        hp: 2,
        speed: BASE_TANK_SPEED,
        recoil: BASE_TANK_RECOIL
    },
    {
        hp: 3,
        speed: BASE_TANK_SPEED * 0.7,
        recoil: BASE_TANK_RECOIL / 0.7
    }
];

var DEFAULT_PLAYER = {
    hp: null,
    maxHP: null,
    direction: 0,
    position: [0, 0],
    color: null,
    inMove: false,
    lastShootTS: 0,
    recoilTime: GUN_RECOIL,
    bulletSpeed: BULLET_SPEED,
    speed: TANK_SPEED,

    width: TANK_DIMENSION,
    dead: false
};

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

Tank.prototype.tryShoot = function() {
    var now = new Date().getTime();

    if (!player.dead && (player.lastShootTS + player.recoilTime < now)) {
        player.lastShootTS = now;

        var bullet = {
            objType: 'bullet',
            position: _.clone(player.position),
            direction: player.direction,
            speed: player.bulletSpeed,
            width: BULLET_DIMENSION,
            ts: now,
            id: getUniqId(),
            by: player.id
        };

        switch(bullet.direction) {
            case 0:
                bullet.position[1] -= TANK_DIMENSION_2 - 0.1;
                break;
            case 1:
                bullet.position[0] += TANK_DIMENSION_2 + 0.1;
                break;
            case 2:
                bullet.position[1] += TANK_DIMENSION_2 + 0.1;
                break;
            case 3:
                bullet.position[0] -= TANK_DIMENSION_2 - 0.1;
                break;
        }

        BULLETS.push(bullet);
    }
};

Tank.prototype.respawn = function(callback) {
    var that = this;

    setRandomRespawnPosition(this);

    if (checkPlayerCollision(this)) {
        setTimeout(function() {
            that.respawn(callback);
        }, 200);
        return;
    }

    this.hp = this.maxHp;
    this.dead = false;

    send(this, {
        event: 'updateHealth',
        data: {
            hp: this.hp
        }
    });

    callback && callback();
};

module.exports = Tank;
