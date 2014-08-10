/* ------------------------------------------------------------------------- */

T.sendDirection = function(direction, inMove) {
    if (direction !== undefined) {
        T.socket.send(JSON.stringify({
            action: 'updateState',
            data: {
                direction: direction,
                inMove: inMove
            }
        }));
    }
};

T.inputState = {
    order: [],
    lastDirection: 0
};

/* ------------------------------------------------------------------------- */

T.sendPosition = function(key, isPressed) {
    var shoot;

    console.log('KEYCODE', key);
    switch (key) {

        case 37: // left
        case 65: // a
            if (isPressed) {
                add(3);
            } else {
                remove(3);
            }
            break;

        case 38: // up
        case 87: // w
            if (isPressed) {
                add(0);
            } else {
                remove(0);
            }
            break;

        case 39: // right
        case 68: // d
            if (isPressed) {
                add(1);
            } else {
                remove(1);
            }
            break;

        case 40: // bottom
        case 83: // s
            if (isPressed) {
                add(2);
            } else {
                remove(2);
            }
            break;

        case 32: // space
            shoot = true;
            break;
    }

    if (T.inputState.order.length) {
        var direction = T.inputState.order[T.inputState.order.length - 1];

        T.inputState.lastDirection = direction;

        T.sendDirection(direction, true);
    } else {
        T.sendDirection(T.inputState.lastDirection, false);
    }

    if (shoot) {
        T.socket.send(JSON.stringify({
            action: 'shoot'
        }));
    }
};

/* ------------------------------------------------------------------------- */

function add(direction) {
    remove(direction);

    T.inputState.order.push(direction);
}

/* ------------------------------------------------------------------------- */

function remove(direction) {
    T.inputState.order = T.inputState.order.filter(function(key) {
        return key !== direction;
    });
}

/* ------------------------------------------------------------------------- */

T.bindEvents = function() {
    $(document)
        .on('keydown', function(e) {
            T.sendPosition(e.keyCode, true);
        })
        .on('keyup', function(e) {
            T.sendPosition(e.keyCode, false);
        });
};

/* ------------------------------------------------------------------------- */
