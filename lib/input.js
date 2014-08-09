//(function() {
//    var pressedKeys = {};
//    var lastPressed;
//
//    function setKey(event, status) {
//        var code = event.keyCode;
//        var key;
//
//        switch(code) {
//            case 32:
//                key = 'SPACE'; break;
//            case 37:
//                key = 'LEFT'; break;
//            case 38:
//                key = 'UP'; break;
//            case 39:
//                key = 'RIGHT'; break;
//            case 40:
//                key = 'DOWN'; break;
//            default:
//                // Convert ASCII codes to letters
//                key = String.fromCharCode(code);
//                lastPressed = key
//        }
//
//        pressedKeys[key] = status;
//    }
//
//    document.addEventListener('keydown', function(e) {
//        if (e.keyCode === lastPressed) {
//            setKey(e, true);
//            isPressed = true;
//        }
//    });
//
//    document.addEventListener('keyup', function(e) {
//        setKey(e, false);
//    });
//
//    window.addEventListener('blur', function() {
//        pressedKeys = {};
//    });
//
//    window.input = {
//        isDown: function(key) {
//            return pressedKeys[key.toUpperCase()];
//        }
//    };
//})();


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
        socket.send(JSON.stringify({
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