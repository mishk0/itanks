if (window && !window.T) {
    window.T = {};
}

/**
 * Загружает ресурсы текстур
 * @returns {Vow.Promise}
 */

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

T.main = function() {
    var now = Date.now();
    var dt = (now - T.lastTime) / 1000.0;
    T.update(dt);
    T.lastTime = now;
    requestAnimationFrame(T.main);
};

T.update = function(dt) {
    T.gameTime += dt;
    T.timestampNode.innerHTML = parseInt(T.gameTime) + ' секунд';
    T.ctx.fillRect(0, 0, T.AREA_WIDTH, T.AREA_HEIGHT);
    player.update(dt);
};

T.renderPlayers = function(data) {
    T.updateMap(T.mapData);
    var dataLength = data.length

    for (var i = 0; i < dataLength; i++) {
        T.renderPlayer(data[i])
    }
}

T.renderPlayer = function(data) {
    var ctx = T.ctx
    var position = data.position;
    ctx.save();
    ctx.translate(position[0] + T.tankSize[0]/2, position[1] + T.tankSize[1]/2);
    switch (data.direction) {
        case 0:
            ctx.rotate(0);
            break;
        case 2:
            ctx.rotate(Math.PI);
            break;
        case 3:
            ctx.rotate(Math.PI*3/2);
            break;
        case 1:
            ctx.rotate(Math.PI/2);
            break;
    }
    ctx.drawImage(T.textures.tank1, -T.tankSize[0]/2, -T.tankSize[1]/2, T.tankSize[0], T.tankSize[1]);
    ctx.restore();

}

T.updatePlayerList = function(players) {
    T.players = players;

    var $template = $('.player-list-item-template');
    var $playerList = $('.player-list').empty();

    _.forEach(players, function(player) {
        var $player = $template.clone().removeClass('player-list-item-template');

        $player.attr('data-id', player.id);
        $player.find('.player-name').text(player.name);
        $player.find('.player-color').css('background-color', player.color);
        $player.find('.player-kills .value').text(player.kills);
        $player.find('.player-deaths .value').text(player.deaths);

        $playerList.append($player.show());
    });
};

T.showLoader = function() {
    $('.loader').removeClass('g-hidden');
};

T.hideLoader = function() {
    $('.loader').addClass('g-hidden');
};


(function(){
    T.cellCount = 26;
    T.cellWidth = 20;
    T.cellHeight = 20;
    T.AREA_WIDTH = T.cellCount * T.cellWidth;
    T.AREA_HEIGHT = T.cellCount * T.cellHeight;
    T.bullets = [];
    T.enemies = [];
    // кеш для загруженных тектсур
    T.textures = {};
    T.gameTime = 0;
    T.timestampNode = document.querySelector('.timestamp')

    T.scale = 1;

    T.tankSize = [ T.cellWidth*2, T.cellWidth*2 ];

    T.loadResources().then(function() {
        var socket = T.socket = new WebSocket("ws://172.16.220.124:1337/game");

        socket.onopen = function() {
            console.log('SOCKET OPENED');
        };

        socket.onmessage = function(message) {
            message = JSON.parse(message.data);

            switch(message.event) {
            case 'map':
                T.hideLoader();
                T.updateMap(message.data);
                T.mapData = message.data;
                break;

            case 'playerList':
                T.updatePlayerList(message.data);
                break;

            case 'updateMapState':
                T.renderPlayers(message.data.players);
                break;
            }

            console.log('MESSAGE:', message.data);
        };

        socket.onclose = function() {
            console.log('SOCKET CLOSED');
        };

        // подключаемся к серверу
    });

    jQuery(function($) {
        $('form').submit(function(e) {
            var $form = $(this);

            var $login = $form.find('[name="login"]');
            var login = $login.val();
            var tankType = Number($form[0].tankType.value);

            if (!login) {
                T.hideLoader();
                $login.addClass('error').focus().one('keydown', function() {
                    $login.removeClass('error');
                });
                return false;
            }

            // отправляем приветственный пакет
            if (!T.socket) {
                console.error('Сокет не открыт! Не могу отправить данные игрока.');
            }

            T.showLoader();

            var pack = JSON.stringify({
                action: 'login',
                data: {
                    name: login,
                    tankType: tankType
                }
            });
            console.log('SENDING LOGIN MESSAGE', pack);
            T.socket.send(pack);

            $(this).hide();

            var canvas = T.canvas = document.createElement('canvas');
            canvas.width = T.AREA_WIDTH;
            canvas.height = T.AREA_HEIGHT;

            document.body.appendChild(canvas);
            T.ctx = canvas.getContext('2d');

            return false;
        });
    });

})();