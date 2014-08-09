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

            switch(message.event) {
            case 'map':
                T.hideLoader();
                T.updateMap(message.data.map);
                break;

            case 'playerList':
                T.updatePlayerList(message.data);
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

            return false;
        });
    });

})();
