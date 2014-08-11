/**
 * Прототип игрового объекта.
 * @param {Object} [initParams]
 * @param {Array} [initParams.position=[0,0]] координаты объекта [x, y]
 * @param {Array} [initParams.size=[0,0]] размерность [width, height]
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

/**
 * Проверяет столкновение по одной оси.
 * @param axis
 * @param object1
 * @param object2
 * @returns {boolean}
 */
function checkCollisionByAxis(axis, object1, object2) {
    var pos1 = object1.position[axis] - object1.size[axis] / 2;
    var pos2 = object2.position[axis] - object2.size[axis] / 2;

    var delta = pos2 - pos1;

    return (delta > 0 && delta < object1.width || delta < 0 && -delta < object2.width);
}

module.exports = GameObject;
