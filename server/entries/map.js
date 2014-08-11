
var MAP_CELL_TYPE = {
    EMPTY: 0,
    NORMAL: 1,
    HARD: 2,
    RESPAWN: 99
};

module.exports = {
    /**
     * @param {number} mapNumber
     * @return {Object}
     */
    loadMap: function(mapNumber) {

        var map = require('../../maps/map_' + mapNumber + '.js');
        var respawns = [];

        var ROWS_COUNT = map.length;
        var COLS_COUNT = map[0].length;

        for (var y = 0; y < ROWS_COUNT; ++y) {
            for (var x = 0; y < COLS_COUNT; ++x) {

                var cell = map[y][x];

                if (cell === MAP_CELL_TYPE.NORMAL) {
                    map[y][x] = [cell, 2];

                } else if (cell === MAP_CELL_TYPE.RESPAWN) {
                    respawns.push([x + 1, y + 1]);

                    map[y][x] = MAP_CELL_TYPE.EMPTY;
                }
            }
        }

        return {
            map: map,
            respawns: respawns
        }
    }
};
