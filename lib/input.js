T.sendPosition = function(key, inMove) {
    var direction;
    var shoot;
    console.log(key)
    switch(key) {
        case 37:
            direction = 3;
            break;
        case 38:
            direction = 0;
            break;
        case 39:
            direction = 1;
            break;
        case 40:
            direction = 2;
            break;
        case 32:
            shoot = true;
            break
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

