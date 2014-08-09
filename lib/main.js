if (window && !window.T) {
    window.T = {};
}

/**
 * Загружает ресурсы текстур
 * @returns {Vow.Promise}
 */

T.loadResources = function() {
    var pathPrefix = 'images/';

    var resources = ['tank_yellow.png', 'tank_green.png', 'tank_blue.png', 'tank_red.png', 'brick.png', 'cement.png'];

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

    T.ctx.strokeStyle = "rgb(0, 255, 0)";
    T.ctx.strokeRect(x * T.cellWidth * T.scale, y * T.cellHeight * T.scale, T.cellWidth * T.scale, T.cellHeight * T.scale);

    T.ctx.font = '8px Consolas';
    T.ctx.fillStyle = "rgb(0, 255, 0)";
    T.ctx.fillText(x + ',' + y, x * T.cellWidth * T.scale, y * T.cellHeight * T.scale + 16);
};

T.updateMap = function(map) {
    T.mapData = map;
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

T.renderPlayers = function(data) {
    var dataLength = data.length

    for (var i = 0; i < dataLength; i++) {
        T.renderPlayer(data[i])
    }
};

T.renderPlayer = function(data) {
    var playerInfo = _.find(T.players, {id: data.id});

    var ctx = T.ctx;
    var position = data.position;
    ctx.save();
    ctx.translate((position[0] - 1) * T.cellWidth + (T.tankSize[0] + 6)/2, (position[1] - 1) * T.cellWidth + (T.tankSize[1] + 6)/2);
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
    ctx.drawImage(T.textures['tank_' + playerInfo.color], -T.tankSize[0]/2, -T.tankSize[1]/2, T.tankSize[0], T.tankSize[1]);
    ctx.restore();

    var $playerNode = T.$getPlayerNode(playerInfo);
    $playerNode.find('.player-x .value').text(position[0].toFixed(2));
    $playerNode.find('.player-y .value').text(position[1].toFixed(2));
};

T.updatePlayerList = function(players) {
    T.players = [];

    var $template = $('.player-list-item-template');
    var $playerList = $('.player-list').empty();

    _.forEach(players, function(player) {
        T.addPlayer(player, $template, $playerList);
    });
};

T.addPlayer = function(player, $template, $playerList) {
    T.players.push(player);

    if (!$template) {
        $template = $('.player-list-item-template');
    }

    if (!$playerList) {
        $playerList = $('.player-list');
    }

    var $player = $template.clone().removeClass('player-list-item-template');

    $player.attr('data-id', player.id);
    $player.find('.player-name').text(player.name);
    $player.find('.player-color').css('background-color', player.color);
    $player.find('.player-kills .value').text(player.kills);
    $player.find('.player-deaths .value').text(player.deaths);

    $playerList.append($player.show());
};

T.removePlayer = function(playerToRemove) {
    T.players = _.reject(T.players, function(player) {
        return player.id === playerToRemove.id;
    });

    $('.player-list-item[data-id=' + playerToRemove.id + ']').remove();
};

T.showLoader = function() {
    $('.loader').removeClass('g-hidden');
};

T.hideLoader = function() {
    $('.loader').addClass('g-hidden');
};

T.renderCanvas = function() {
    var canvas = T.canvas = document.createElement('canvas');
    canvas.width = T.AREA_WIDTH;
    canvas.height = T.AREA_HEIGHT;

    document.querySelector('.b-game__area').appendChild(canvas);
    T.ctx = canvas.getContext('2d');
};

T.getForcedName = function() {
    var parsed = /\?.*name=([^&]*)/.exec(location.href);
    if (parsed && parsed.length === 2) {
        return parsed[1];
    }

    return null;
};

T.getPort = function() {
    var parsed = /\?.*port=([^&]*)/.exec(location.href);
    if (parsed && parsed.length === 2) {
        return parsed[1];
    }

    return null;
};

T.$getPlayerNode = function(playerInfo) {
    return $('.player-list-item[data-id="' + playerInfo.id + '"]');
};

T.startGame = function() {
    $('form').hide();
    T.renderCanvas();
    T.bindEvents();
};

/**
 * Перерисовка событий на канвасе
 * @type {object}
 */
T.render = function(data) {
    T.updateMap(T.mapData);
    T.renderPlayers(data.players);
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

    T.tankSize = [ T.scale*T.cellWidth*1.7, T.scale*T.cellWidth*1.7 ];

    T.loadResources().then(function() {
        var port = T.getPort();
        var url = "ws://172.16.220.124:" + (port || "1337") + "/game";
        var socket = T.socket = new WebSocket(url);

        socket.onopen = function() {
            console.log('SOCKET OPENED');

            var login = T.getForcedName();
            if (login) {
                var pack = JSON.stringify({
                    action: 'login',
                    data: {
                        name: login || 'la-la-la2',
                        tankType: 1
                    }
                });

                console.log('SENDING LOGIN MESSAGE', pack);
                T.socket.send(pack);
            }
        };

        socket.onmessage = function(message) {
            message = JSON.parse(message.data);
            switch(message.event) {
            case 'map':
                T.hideLoader();
                T.updateMap(message.data);
                break;

            case 'playerList':
                T.updatePlayerList(message.data);
                break;

            case 'updateMapState':
                T.render(message.data);
                break;

            case 'playerJoined':
                T.addPlayer(message.data);
                break;

            case 'playerLeft':
                T.removePlayer(message.data);
                break;
            }

            console.log('MESSAGE:', message.data);
        };

        socket.onclose = function() {
            console.log('SOCKET CLOSED');
        };
    });

    jQuery(function($) {
        var login = T.getForcedName();
        if (login) {
            T.startGame();
            return;
        }

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
            T.startGame();

            return false;
        });
    });

})();
