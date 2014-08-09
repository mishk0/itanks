
function sendPosition(key, inMove) {
    var direction;

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

}

document.addEventListener('keydown', function(e) {
    sendPosition(e.keyCode, true)
});

document.addEventListener('keyup', function(e) {
    sendPosition(e.keyCode, false)
});