T.sendPosition = function(key, inMove) {
    var direction;
    var shoot;

    console.log('KEYCODE', key);
    switch (key) {
    // left
    case 37:
    // a
    case 65:
        direction = 3;
        break;
    // up
    case 38:
    // w
    case 87:
        direction = 0;
        break;
    // right
    case 39:
    // d
    case 68:
        direction = 1;
        break;
    // bottom
    case 40:
    // s
    case 83:
        direction = 2;
        break;
    // space
    case 32:
        shoot = true;
        break;

    }
    if (direction !== undefined) {
        T.socket.send(JSON.stringify({
            action: 'updateState',
            data: {
                direction: direction,
                inMove: inMove
            }
        }));
    }

    if (shoot) {
        T.socket.send(JSON.stringify({
            action: 'shoot'
        }));
    }

};

T.bindEvents = function() {
    document.addEventListener('keydown', function(e) {
        T.sendPosition(e.keyCode, true);

        // e
        if (e.keyCode === 69) {
            var player = T.players[0];
            T.animations = T.animations || [];
            T.animations.push({
                id: player.id,
                position: player.position,
                // время начала анимации
                startTimestamp: Date.now(),
                name: 'explosion'
            });
        }
    });

    document.addEventListener('keyup', function(e) {
        T.sendPosition(e.keyCode, false);
    });
};

