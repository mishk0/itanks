if (window && !window.T) {
    window.T = {};
}

T.loadResources = function() {
    var pathPrefix = 'images/';

    var resources = ['tank1.png', 'tank2.png', 'tank3.png', 'brick.png', 'cement.png'];

    var promises = _.map(resources, function(file) {
        var deferred = new vow.Deferred();

        var image = new Image();
        image.src = pathPrefix + file;
        image.onload = function() {
            deferred.resolve(image);
            T.textures[file.split('.')[0]] = image;
            console.log('Image ' + image.src + ' loaded successfully');
        };

        image.onerror = function() {
            deferred.reject('Image ' + image.src + ' not loaded!');
            console.error('Image ' + image.src + ' not loaded!');
        };

        return deferred.promise();
    });

    return vow.all(promises);
};


T.main = function() {
    var now = Date.now();
    var dt = (now - T.lastTime) / 1000.0;

    T.update(dt);
    T.render();

    T.lastTime = now;
    requestAnimationFrame(T.main);
};

T.start = function() {
    T.lastTime = Date.now();
    T.main();
}

T.update = function(dt) {
    T.gameTime += dt;
    T.timestampNode.innerHTML = parseInt(T.gameTime) + ' секунд';
//    handleInput(dt);
//    updateEntities(dt);

    // It gets harder over time by adding enemies using this
    // equation: 1-.993^gameTime
//    if(Math.random() < 1 - Math.pow(.993, T.gameTime)) {
//        enemies.push({
//            pos: [canvas.width,
//                Math.random() * (canvas.height - 39)],
//            sprite: new Sprite('img/sprites.png', [0, 78], [80, 39],
//                6, [0, 1, 2, 3, 2, 1])
//        });
//    }
//
//    checkCollisions();
//
//    scoreEl.innerHTML = score;
};

// Draw everything
T.render = function() {
    T.ctx.fillRect(0, 0, T.AREA_WIDTH, T.AREA_HEIGHT);

    T.renderEntities(T.bullets);
    T.renderEntities(T.enemies);
};

T.renderEntities = function() {

};

/**
 * Рисует ячейку карты
 * @param {Number|Array} cell
 * @param {Number} x
 * @param {Number} y
 */
T.renderCell = function(cell, x, y) {
    // просто клетка, без состояния
    var texture = null;
    var type = cell;
    var state;
    if (_.isArray(cell)) {
        type = cell[0];
        state = cell[1];
    }

    switch (type) {
    case T.EMPTY:
        break;

    case T.BRICK:
        texture = T.textures['brick'];
        break;

    case T.CEMENT:
        texture = T.textures['cement'];
        break;
    }

    T.ctx.globalAlpha = 1;
    if (state && state === T.BROKEN) {
        T.ctx.globalAlpha = 0.5;
    }

    if (!texture) {
        //works with shapes but not with images
        T.ctx.fillStyle = "rgb(0, 0, 0)";
        T.ctx.fillRect(x * T.cellWidth * T.scale, y * T.cellHeight * T.scale, T.cellWidth * T.scale, T.cellHeight * T.scale);
    } else {
        T.ctx.drawImage(texture, x * T.cellWidth * T.scale, y * T.cellHeight * T.scale, T.cellWidth * T.scale, T.cellHeight * T.scale);
    }
};

T.updateMap = function(map) {
    for (var i = 0; i < map.length; i++) {
        var row = map[i];
        for (var j = 0; j < row.length; j++) {
            var cell = row[j];

            // тут нет ошибки, x - это j, y - это j
            T.renderCell(cell, j, i);
        }
    }
};

/**
 * Created by admin on 09.08.14.
 */
(function(){
    T.AREA_WIDTH = 1200;
    T.AREA_HEIGHT = 1200;
    T.bullets = [];
    T.enemies = [];
    // кеш для загруженных тектсур
    T.textures = {};
    T.gameTime = 0;
    T.timestampNode = document.querySelector('.timestamp')
    var canvas = T.canvas = document.createElement('canvas');
    canvas.width = T.AREA_WIDTH;
    canvas.height = T.AREA_HEIGHT;

    document.body.appendChild(canvas);
    T.ctx = canvas.getContext('2d');
    T.scale = 1.8;
    T.cellWidth = 16;
    T.cellHeight = 16;

    T.loadResources().then(function() {
        var socket = T.socket = new WebSocket("ws://172.16.220.124:1337/game");

        socket.onopen = function() {
            console.log('SOCKET OPENED');
        };

        socket.onmessage = function(message) {
            message = JSON.parse(message.data);
            if (message.event === 'updateMapState') {
                T.updateMap(message.data.map);
            }

            console.log('MESSAGE:', message.data);
        };

        socket.onclose = function() {
            console.log('SOCKET CLOSED');
        };

        // подключаемся к серверу
    });

})();
