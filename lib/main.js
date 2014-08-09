/**
 * Created by admin on 09.08.14.
 */


var img = new Image();
img.src = 'images/tank.png';

var Player = function(imageSrc) {
    var img = new Image();
    img.src = imageSrc;

    this.pos = [0,0];
    this.image = img;
    this.speed = 200;
    this.size = [30, 30];
};

Player.prototype.update = function(dt) {
    this.render(it.ctx);
}

Player.prototype.render = function(ctx) {
    var sizeX = this.size[0];
    var sizeY = this.size[1];
    ctx.save();
    ctx.translate(this.pos[0] + sizeX/2, this.pos[1] + sizeY/2);
    switch (this.dir) {
        case 'top':
            ctx.rotate(0);
            break;
        case 'bottom':
            ctx.rotate(Math.PI);
            break;
        case 'left':
            ctx.rotate(Math.PI*3/2);
            break;
        case 'right':
            ctx.rotate(Math.PI/2);
            break;
    }
    ctx.drawImage(this.image, -sizeX/2, -sizeY/2, sizeX, sizeY);
    ctx.restore();
}

var player = new Player('images/tank.png');

(function(){
    window.it = {};
    it.AREA_WIDTH = 500;
    it.AREA_HEIGHT = 500;
    it.bullets = [];
    it.enemies = [];
    it.gameTime = 0;



    it.timestampNode = document.querySelector('.timestamp')


    document.querySelector('.play-btn').addEventListener('click', function() {
        it.start();
    });

})()


it.main = function() {
    var now = Date.now();
    var dt = (now - it.lastTime) / 1000.0;
    it.update(dt);
    it.lastTime = now;
    requestAnimationFrame(it.main);

};
var canvas = it.canvas = document.createElement('canvas');
canvas.width = it.AREA_WIDTH;
canvas.height = it.AREA_HEIGHT;

document.body.appendChild(canvas);
ctx = canvas.getContext('2d');


it.start = function() {
    it.lastTime = Date.now();
    it.main();
}

it.update = function(dt) {
    it.gameTime += dt;
    it.timestampNode.innerHTML = parseInt(it.gameTime) + ' секунд';
    it.ctx.fillRect(0, 0, it.AREA_WIDTH, it.AREA_HEIGHT);
    player.update(dt);
};


var socket = it.socket = new WebSocket("ws://172.16.220.124:1337/game");


socket.onopen = function() {
    console.log('SOCKET OPENED');

    socket.send(JSON.stringify({
        action: 'login',
        data: {
            name: 'Vasya',
            tankType: 0
        }
    }));
};

socket.onmessage = function(message) {
    var data = JSON.parse(message.data)
    if (data.event === "updateMapState") {
        renderPlayers(data.data.players);
    }

};

socket.onclose = function() {
    console.log('SOCKET CLOSED');
};

function renderPlayers(data) {
    ctx.fillRect(0, 0, 500, 500);
    var dataLength = data.length

    for (var i = 0; i < dataLength; i++) {
        renderPlayer(data[i])
    }
}

function renderPlayer(data) {

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
    ctx.drawImage(img, -T.tankSize[0]/2, -T.tankSize[1]/2, T.tankSize[0], T.tankSize[1]);
    ctx.restore();

}



// Draw everything

//
//it.renderEntities = function(list) {
//    for(var i=0; i<list.length; i++) {
//        it.renderEntity(list[i]);
//    }
//}
//
//it.renderEntity = function(entity) {
//    it.ctx.save();
//    it.ctx.translate(entity.pos[0], entity.pos[1]);
//    entity.render(it.ctx);
//    it.ctx.restore();
//}

//it.handleInput = function(dt) {
//    if(input.isDown('DOWN') || input.isDown('s')) {
//        player.pos[1] += player.speed * dt;
//        player.dir = 'bottom';
//    }
//
//    if(input.isDown('UP') || input.isDown('w')) {
//        player.pos[1] -= player.speed * dt;
//        player.dir = 'top';
//    }
//
//    if(input.isDown('LEFT') || input.isDown('a')) {
//        player.pos[0] -= player.speed * dt;
//        player.dir = 'left';
//    }
//
//    if(input.isDown('RIGHT') || input.isDown('d')) {
//        player.pos[0] += player.speed * dt;
//        player.dir = 'right';
//    }
//
//    if(input.isDown('SPACE') &&
//        !isGameOver &&
//        Date.now() - lastFire > 100) {
//        var x = player.pos[0] + player.sprite.size[0] / 2;
//        var y = player.pos[1] + player.sprite.size[1] / 2;
//
//        bullets.push({ pos: [x, y],
//            dir: 'forward',
//            sprite: new Sprite('img/sprites.png', [0, 39], [18, 8]) });
//        bullets.push({ pos: [x, y],
//            dir: 'up',
//            sprite: new Sprite('img/sprites.png', [0, 50], [9, 5]) });
//        bullets.push({ pos: [x, y],
//            dir: 'down',
//            sprite: new Sprite('img/sprites.png', [0, 60], [9, 5]) });
//
//
//        lastFire = Date.now();
//    }
//}


