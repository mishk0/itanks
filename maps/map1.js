(function() {
    if (window && !window.T) {
        var T = window.T = {};
    }
    var _ = T.EMPTY;
    var x = T.BRICK;
    var O = T.CEMENT;

    T.MapWidht = 26;
    T.MapHeight = 26;

    T.Map = [
        [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],

        [_, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _],
        [_, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _],
        [_, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _],
        [_, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _],
        [_, _, x, x, _, _, x, x, _, _, x, x, O, O, x, x, _, _, x, x, _, _, x, x, _, _],
        [_, _, x, x, _, _, x, x, _, _, x, x, O, O, x, x, _, _, x, x, _, _, x, x, _, _],
        [_, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _],

        [_, _, x, x, _, _, x, x, _, _, _, _, _, _, _, _, _, _, x, x, _, _, x, x, _, _],
        [_, _, x, x, _, _, x, x, _, _, _, _, _, _, _, _, _, _, x, x, _, _, x, x, _, _],

        [_, _, _, _, _, _, _, _, _, _, x, x, _, _, x, x, _, _, _, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _, _, _, x, x, _, _, x, x, _, _, _, _, _, _, _, _, _, _],

        [x, x, _, _, x, x, x, x, _, _, _, _, _, _, _, _, _, _, x, x, x, x, _, _, x, x],
        [O, O, _, _, x, x, x, x, _, _, _, _, _, _, _, _, _, _, x, x, x, x, _, _, O, O],

        [_, _, _, _, _, _, _, _, _, _, x, x, _, _, x, x, _, _, _, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _, _, _, x, x, x, x, x, x, _, _, _, _, _, _, _, _, _, _],
        [_, _, x, x, _, _, x, x, _, _, x, x, x, x, x, x, _, _, x, x, _, _, x, x, _, _],

        [_, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _],
        [_, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _],
        [_, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _],
        [_, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _, x, x, _, _],

        [_, _, x, x, _, _, x, x, _, _, _, _, _, _, _, _, _, _, x, x, _, _, x, x, _, _],
        [_, _, x, x, _, _, x, x, _, _, _, _, _, _, _, _, _, _, x, x, _, _, x, x, _, _],
        [_, _, x, x, _, _, x, x, _, _, _, x, x, x, x, _, _, _, x, x, _, _, x, x, _, _],
        [_, _, x, x, _, _, x, x, _, _, _, x, _, _, x, _, _, _, x, x, _, _, x, x, _, _],
        [_, _, x, x, _, _, x, x, _, _, _, x, _, _, x, _, _, _, x, x, _, _, x, x, _, _]
    ];

    // для ноды
    if (module) {
        module.exports = T.Map;
    }
});
