/**
 * Created by admin on 09.08.14.
 */
(function(){
    window.it = {};
    it.AREA_WIDTH = 500;
    it.AREA_HEIGHT = 500;
    it.bullets = [];
    it.enemies = [];
    it.gameTime = 0;
    it.timestampNode = document.querySelector('.timestamp')
    var canvas = it.canvas = document.createElement('canvas');
    canvas.width = it.AREA_WIDTH;
    canvas.height = it.AREA_HEIGHT;

    document.body.appendChild(canvas);
    it.ctx = canvas.getContext('2d');

    document.querySelector('.play-btn').addEventListener('click', function() {
        it.start();
    });

})()


it.main = function() {
    var now = Date.now();
    var dt = (now - it.lastTime) / 1000.0;

    it.update(dt);
    it.render();

    it.lastTime = now;
    requestAnimationFrame(it.main);


};

it.start = function() {
    it.lastTime = Date.now();
    it.main();
}

it.update = function(dt) {
    it.gameTime += dt;
    it.timestampNode.innerHTML = parseInt(it.gameTime) + ' секунд';
//    handleInput(dt);
//    updateEntities(dt);

    // It gets harder over time by adding enemies using this
    // equation: 1-.993^gameTime
//    if(Math.random() < 1 - Math.pow(.993, it.gameTime)) {
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
it.render = function() {
    it.ctx.fillRect(0, 0, it.AREA_WIDTH, it.AREA_HEIGHT);

    it.renderEntities(it.bullets);
    it.renderEntities(it.enemies);
};

it.renderEntities = function() {

}