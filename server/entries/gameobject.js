/**
 * Прототип игрового объекта.
 * @param {Object} [initParams]
 * @param {Array} [initParams.position=[0,0]] координаты объекта [x, y]
 * @param {Array} [initParams.size=[0,0]] размерность [width, height]
 * @param {boolean} [initParams.inMove=false] находится ли в движении
 * @param {Number} [initParams.direction=0] направление (0 - верх, 1 - право, 2 - низ, 3 - лево).
 * @param {Number} [initParams.speed=0] скорость движения
 * @constructor
 */
function GameObject(initParams) {
    initParams = initParams || {};

    this.position = _.clone(initParams.position || [0, 0]);
    this.size = _.clone(initParams.size || [0, 0]);
}

/**
 * Проверка на столкновение объектов.
 * @param {Object} object
 * @return {GameObject}
 */
GameObject.prototype.checkCollision = function(object) {
    if (this === object) {
        return false;
    }

    return checkCollisionByAxis(0, this, object) && checkCollisionByAxis(1, this, object);
};

GameObject.prototype.updatePosition = function() {
    var isNegative = this.direction === 0 || this.direction === 3;

    this.position[1 - this.direction % 2] += this.speed * isNegative ? -1 : 1;
};

/**
 * Проверяет столкновение по одной оси.
 * @param axis
 * @param object1
 * @param object2
 * @returns {boolean}
 */
function checkCollisionByAxis(axis, object1, object2) {

    var size1;
    if (object1.direction === 0 || object1.direction === 2) {
        size1 = object1.size[axis];
    } else {
        size1 = object1.size[1 - axis];
    }

    var size2;
    if (object2.direction === 0 || object2.direction === 2) {
        size2 = object2.size[axis];
    } else {
        size2 = object2.size[1 - axis];
    }

    var pos1 = object1.position[axis] - size1 / 2;
    var pos2 = object2.position[axis] - size2 / 2;

    var delta = pos2 - pos1;

    return (delta > 0 && delta < object1.width || delta < 0 && -delta < object2.width);
}

module.exports = GameObject;
